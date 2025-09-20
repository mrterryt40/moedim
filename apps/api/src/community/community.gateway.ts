import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommunityService } from './community.service';
import { JwtService } from '@nestjs/jwt';
import { Inject, forwardRef } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  },
  namespace: '/community'
})
export class CommunityGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, AuthenticatedSocket>();

  constructor(
    @Inject(forwardRef(() => CommunityService))
    private readonly communityService: CommunityService,
    private readonly jwtService: JwtService
  ) {}

  afterInit(server: Server) {
    // Set this gateway instance in the community service
    this.communityService.setGateway(this);
    console.log('Community WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.username = payload.username;

      this.userSockets.set(client.userId, client);

      // Join user to their circle rooms
      const userCircles = await this.communityService.getUserCircles(client.userId);
      for (const circle of userCircles) {
        client.join(`circle:${circle.id}`);
      }

      console.log(`User ${client.username} (${client.userId}) connected to community gateway`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.userSockets.delete(client.userId);
      console.log(`User ${client.username} (${client.userId}) disconnected from community gateway`);
    }
  }

  @SubscribeMessage('join-circle')
  async handleJoinCircle(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { circleId: string }
  ) {
    try {
      if (!client.userId) return;

      // Verify user is member of circle
      const members = await this.communityService.getCircleMembers(data.circleId, client.userId);
      const isMember = members.some(member => member.id === client.userId);

      if (isMember) {
        client.join(`circle:${data.circleId}`);
        client.emit('joined-circle', { circleId: data.circleId });
      } else {
        client.emit('error', { message: 'You are not a member of this circle' });
      }
    } catch (error) {
      client.emit('error', { message: 'Failed to join circle' });
    }
  }

  @SubscribeMessage('leave-circle')
  async handleLeaveCircle(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { circleId: string }
  ) {
    client.leave(`circle:${data.circleId}`);
    client.emit('left-circle', { circleId: data.circleId });
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { circleId: string; content: string; messageType?: 'text' | 'image' | 'audio' }
  ) {
    try {
      if (!client.userId) return;

      // Send message through service
      const message = await this.communityService.sendMessage(client.userId, data.circleId, {
        content: data.content,
        messageType: data.messageType || 'text'
      });

      // Broadcast to all circle members
      this.server.to(`circle:${data.circleId}`).emit('new-message', {
        id: message.id,
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt,
        user: {
          id: message.user.id,
          username: message.user.username
        },
        circleId: data.circleId
      });

    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing-start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { circleId: string }
  ) {
    if (!client.userId) return;

    client.to(`circle:${data.circleId}`).emit('user-typing', {
      userId: client.userId,
      username: client.username,
      circleId: data.circleId,
      isTyping: true
    });
  }

  @SubscribeMessage('typing-stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { circleId: string }
  ) {
    if (!client.userId) return;

    client.to(`circle:${data.circleId}`).emit('user-typing', {
      userId: client.userId,
      username: client.username,
      circleId: data.circleId,
      isTyping: false
    });
  }

  // Utility method to send notifications to specific users
  async sendNotificationToUser(userId: string, notification: any) {
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.emit('notification', notification);
    }
  }

  // Utility method to broadcast circle updates
  async broadcastCircleUpdate(circleId: string, update: any) {
    this.server.to(`circle:${circleId}`).emit('circle-update', update);
  }

  // Method to notify circle members when someone joins/leaves
  async notifyCircleMembers(circleId: string, event: 'member-joined' | 'member-left', memberInfo: any) {
    this.server.to(`circle:${circleId}`).emit(event, {
      circleId,
      member: memberInfo,
      timestamp: new Date()
    });
  }
}