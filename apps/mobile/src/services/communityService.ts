// Mo'edim Community Service
// Handles circles, messaging, and community interactions

import { apiService } from './api';
import type {
  Community,
  CommunityMessage,
  CommunityMember,
  PaginatedResponse,
  ApiResponse
} from '../types';

class CommunityService {
  // Get all circles/communities
  async getCircles(): Promise<Community[]> {
    try {
      const response = await apiService.get<Community[]>('/community/circles', true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch circles');
    } catch (error) {
      console.error('Get circles error:', error);
      throw error;
    }
  }

  // Create new circle
  async createCircle(circleData: {
    name: string;
    description: string;
    isPrivate: boolean;
  }): Promise<Community> {
    try {
      const response = await apiService.post<Community>('/community/circles', circleData, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create circle');
    } catch (error) {
      console.error('Create circle error:', error);
      throw error;
    }
  }

  // Join circle
  async joinCircle(circleId: string): Promise<void> {
    try {
      const response = await apiService.post(`/community/circles/${circleId}/join`, {}, true);
      if (!response.success) {
        throw new Error(response.message || 'Failed to join circle');
      }
    } catch (error) {
      console.error('Join circle error:', error);
      throw error;
    }
  }

  // Leave circle
  async leaveCircle(circleId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/community/circles/${circleId}/leave`, true);
      if (!response.success) {
        throw new Error(response.message || 'Failed to leave circle');
      }
    } catch (error) {
      console.error('Leave circle error:', error);
      throw error;
    }
  }

  // Get circle messages
  async getMessages(circleId: string, options: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<CommunityMessage>> {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());

      const endpoint = `/community/circles/${circleId}/messages${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiService.get<PaginatedResponse<CommunityMessage>>(endpoint, true);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch messages');
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  }

  // Send message
  async sendMessage(circleId: string, messageData: {
    content: string;
    messageType?: 'text' | 'image' | 'audio';
  }): Promise<CommunityMessage> {
    try {
      const response = await apiService.post<CommunityMessage>(`/community/circles/${circleId}/messages`, messageData, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to send message');
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  // Get circle members
  async getMembers(circleId: string): Promise<CommunityMember[]> {
    try {
      const response = await apiService.get<CommunityMember[]>(`/community/circles/${circleId}/members`, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch members');
    } catch (error) {
      console.error('Get members error:', error);
      throw error;
    }
  }

  // Update circle
  async updateCircle(circleId: string, updates: Partial<Community>): Promise<Community> {
    try {
      const response = await apiService.put<Community>(`/community/circles/${circleId}`, updates, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to update circle');
    } catch (error) {
      console.error('Update circle error:', error);
      throw error;
    }
  }

  // Search communities
  async searchCommunities(query: string): Promise<Community[]> {
    try {
      const response = await apiService.get<Community[]>(`/community/search?q=${encodeURIComponent(query)}`, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to search communities');
    } catch (error) {
      console.error('Search communities error:', error);
      throw error;
    }
  }

  // Get popular circles
  async getPopularCircles(): Promise<Community[]> {
    try {
      const response = await apiService.get<Community[]>('/community/popular', true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch popular circles');
    } catch (error) {
      console.error('Get popular circles error:', error);
      throw error;
    }
  }

  // Get circle info
  async getCircleInfo(circleId: string): Promise<Community> {
    try {
      const response = await apiService.get<Community>(`/community/circles/${circleId}/info`, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch circle info');
    } catch (error) {
      console.error('Get circle info error:', error);
      throw error;
    }
  }

  // Get user activity
  async getMyActivity(): Promise<{
    messages: number;
    circlesJoined: number;
    recentActivity: any[];
  }> {
    try {
      const response = await apiService.get<{
        messages: number;
        circlesJoined: number;
        recentActivity: any[];
      }>('/community/my-activity', true);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch activity');
    } catch (error) {
      console.error('Get activity error:', error);
      throw error;
    }
  }

  // Get circle suggestions
  async getCircleSuggestions(): Promise<Community[]> {
    try {
      const response = await apiService.get<Community[]>('/community/circle-suggestions', true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch suggestions');
    } catch (error) {
      console.error('Get suggestions error:', error);
      throw error;
    }
  }

  // Promote member
  async promoteMember(circleId: string, userId: string, role: 'moderator' | 'member'): Promise<void> {
    try {
      const response = await apiService.post(`/community/circles/${circleId}/promote`, {
        userId,
        role
      }, true);
      if (!response.success) {
        throw new Error(response.message || 'Failed to promote member');
      }
    } catch (error) {
      console.error('Promote member error:', error);
      throw error;
    }
  }
}

export const communityService = new CommunityService();
export { CommunityService };