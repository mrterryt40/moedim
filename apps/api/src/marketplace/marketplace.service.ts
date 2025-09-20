import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { BlockchainService } from '../blockchain/blockchain.service';

interface CreateProductDto {
  name: string;
  description: string;
  category: 'digital' | 'physical' | 'service' | 'book' | 'course' | 'artwork';
  subcategory?: string;
  price: number;
  coinPrice?: number;
  images?: string[];
  tags?: string[];
  isDigital: boolean;
  digitalContent?: {
    type: 'pdf' | 'audio' | 'video' | 'software' | 'ebook';
    fileUrl?: string;
    accessInstructions?: string;
  };
  shippingRequired?: boolean;
  shippingCost?: number;
  inventory?: number;
  specifications?: Record<string, any>;
}

interface CreateOrderDto {
  productId: string;
  quantity: number;
  paymentMethod: 'coins' | 'stripe' | 'paypal';
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentDetails?: {
    stripeTokenId?: string;
    paypalOrderId?: string;
  };
}

interface CreateReviewDto {
  productId: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
}

@Injectable()
export class MarketplaceService {
  private prisma = new PrismaClient();

  constructor(
    @Inject(BlockchainService)
    private readonly blockchainService?: BlockchainService
  ) {}

  // Product Management
  async createProduct(sellerId: string, productData: CreateProductDto) {
    const {
      name,
      description,
      category,
      subcategory,
      price,
      coinPrice,
      images = [],
      tags = [],
      isDigital,
      digitalContent,
      shippingRequired = !isDigital,
      shippingCost = 0,
      inventory,
      specifications = {}
    } = productData;

    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Product name is required');
    }

    if (price < 0 || (coinPrice && coinPrice < 0)) {
      throw new BadRequestException('Prices must be non-negative');
    }

    // Verify seller has appropriate permissions
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
      select: { id: true, isVerified: true, merchantStatus: true }
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const product = await this.prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        category,
        subcategory,
        price,
        coinPrice,
        images,
        tags,
        isDigital,
        digitalContent: digitalContent ? JSON.stringify(digitalContent) : null,
        shippingRequired,
        shippingCost,
        inventory: inventory || (isDigital ? 9999 : 0),
        specifications: JSON.stringify(specifications),
        sellerId,
        status: 'active'
      }
    });

    return product;
  }

  async getProducts(filters: {
    category?: string;
    subcategory?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    isDigital?: boolean;
    sellerId?: string;
    page?: number;
    limit?: number;
    sortBy?: 'price' | 'rating' | 'created' | 'popular';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      category,
      subcategory,
      search,
      minPrice,
      maxPrice,
      tags,
      isDigital,
      sellerId,
      page = 1,
      limit = 20,
      sortBy = 'created',
      sortOrder = 'desc'
    } = filters;

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'active'
    };

    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (isDigital !== undefined) where.isDigital = isDigital;
    if (sellerId) where.sellerId = sellerId;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // Build order clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy.price = sortOrder;
        break;
      case 'rating':
        orderBy.averageRating = sortOrder;
        break;
      case 'popular':
        orderBy.totalSales = sortOrder;
        break;
      default:
        orderBy.createdAt = sortOrder;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              merchantStatus: true,
              isVerified: true
            }
          },
          _count: {
            select: { reviews: true }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      products: products.map(product => ({
        ...product,
        digitalContent: product.digitalContent ? JSON.parse(product.digitalContent) : null,
        specifications: product.specifications ? JSON.parse(product.specifications) : {},
        reviewCount: product._count.reviews
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getProductById(productId: string, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            merchantStatus: true,
            isVerified: true,
            createdAt: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            reviews: true,
            orders: true
          }
        }
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user has purchased this product (for digital content access)
    let hasPurchased = false;
    if (userId) {
      const purchase = await this.prisma.order.findFirst({
        where: {
          userId,
          productId,
          status: 'completed'
        }
      });
      hasPurchased = !!purchase;
    }

    return {
      ...product,
      digitalContent: product.digitalContent ? JSON.parse(product.digitalContent) : null,
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      reviewCount: product._count.reviews,
      totalSales: product._count.orders,
      hasPurchased
    };
  }

  // Order Management
  async createOrder(userId: string, orderData: CreateOrderDto) {
    const { productId, quantity, paymentMethod, shippingAddress, paymentDetails } = orderData;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== 'active') {
      throw new BadRequestException('Product is not available for purchase');
    }

    if (!product.isDigital && product.inventory < quantity) {
      throw new BadRequestException('Insufficient inventory');
    }

    if (product.sellerId === userId) {
      throw new BadRequestException('Cannot purchase your own product');
    }

    // Calculate total cost
    let totalPrice = product.price * quantity;
    let totalCoinPrice = (product.coinPrice || 0) * quantity;

    if (product.shippingRequired && shippingAddress) {
      totalPrice += product.shippingCost || 0;
    }

    // Process payment based on method
    let paymentStatus = 'pending';
    let transactionId: string | null = null;

    if (paymentMethod === 'coins') {
      if (!this.blockchainService) {
        throw new BadRequestException('Coin payments not available');
      }

      if (totalCoinPrice <= 0) {
        throw new BadRequestException('Product does not accept coin payments');
      }

      // Check user's coin balance
      const userWallet = await this.blockchainService.getWallet(userId);
      if (userWallet.balance < totalCoinPrice) {
        throw new BadRequestException('Insufficient coin balance');
      }

      // Transfer coins from buyer to seller
      const transfer = await this.blockchainService.transferCoins(
        userId,
        product.sellerId,
        totalCoinPrice,
        `Purchase: ${product.name}`
      );

      transactionId = transfer.transactionHash;
      paymentStatus = 'completed';
    }

    // Create order
    const order = await this.prisma.order.create({
      data: {
        userId,
        productId,
        sellerId: product.sellerId,
        quantity,
        totalPrice,
        totalCoinPrice,
        paymentMethod,
        paymentStatus,
        transactionId,
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
        status: paymentStatus === 'completed' ? 'processing' : 'pending'
      }
    });

    // Update product inventory for physical products
    if (!product.isDigital) {
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          inventory: { decrement: quantity },
          totalSales: { increment: quantity }
        }
      });
    }

    // For digital products, mark as ready for download
    if (product.isDigital && paymentStatus === 'completed') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'completed' }
      });
    }

    return {
      ...order,
      product: {
        name: product.name,
        isDigital: product.isDigital,
        digitalContent: product.digitalContent ? JSON.parse(product.digitalContent) : null
      }
    };
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              isDigital: true,
              digitalContent: true
            }
          },
          seller: {
            select: {
              id: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      this.prisma.order.count({ where: { userId } })
    ]);

    return {
      orders: orders.map(order => ({
        ...order,
        shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
        product: {
          ...order.product,
          digitalContent: order.product.digitalContent ? JSON.parse(order.product.digitalContent) : null
        }
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getSellerOrders(sellerId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { sellerId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true
            }
          },
          user: {
            select: {
              id: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      this.prisma.order.count({ where: { sellerId } })
    ]);

    return {
      orders: orders.map(order => ({
        ...order,
        shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateOrderStatus(orderId: string, sellerId: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.sellerId !== sellerId) {
      throw new ForbiddenException('Only the seller can update order status');
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  }

  // Review System
  async createReview(userId: string, reviewData: CreateReviewDto) {
    const { productId, rating, title, content, images = [] } = reviewData;

    // Check if user has purchased the product
    const purchase = await this.prisma.order.findFirst({
      where: {
        userId,
        productId,
        status: 'completed'
      }
    });

    if (!purchase) {
      throw new BadRequestException('You can only review products you have purchased');
    }

    // Check if user has already reviewed this product
    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        title,
        content,
        images
      }
    });

    // Update product average rating
    await this.updateProductRating(productId);

    return review;
  }

  private async updateProductRating(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    if (reviews.length > 0) {
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

      await this.prisma.product.update({
        where: { id: productId },
        data: { averageRating }
      });
    }
  }

  // Analytics and Statistics
  async getMarketplaceStats() {
    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      totalCoinRevenue,
      activeProducts,
      topCategories
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: 'completed' }
      }),
      this.prisma.order.aggregate({
        _sum: { totalCoinPrice: true },
        where: { status: 'completed' }
      }),
      this.prisma.product.count({ where: { status: 'active' } }),
      this.prisma.product.groupBy({
        by: ['category'],
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 5
      })
    ]);

    return {
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      totalCoinRevenue: totalCoinRevenue._sum.totalCoinPrice || 0,
      activeProducts,
      topCategories: topCategories.map(cat => ({
        category: cat.category,
        count: cat._count._all
      }))
    };
  }

  async getSellerDashboard(sellerId: string) {
    const [
      sellerProducts,
      sellerOrders,
      totalRevenue,
      totalCoinRevenue,
      recentOrders
    ] = await Promise.all([
      this.prisma.product.count({ where: { sellerId } }),
      this.prisma.order.count({ where: { sellerId } }),
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { sellerId, status: 'completed' }
      }),
      this.prisma.order.aggregate({
        _sum: { totalCoinPrice: true },
        where: { sellerId, status: 'completed' }
      }),
      this.prisma.order.findMany({
        where: { sellerId },
        include: {
          product: { select: { name: true } },
          user: { select: { username: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return {
      totalProducts: sellerProducts,
      totalOrders: sellerOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      totalCoinRevenue: totalCoinRevenue._sum.totalCoinPrice || 0,
      recentOrders
    };
  }

  // Wishlist functionality
  async addToWishlist(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      await this.prisma.wishlist.create({
        data: { userId, productId }
      });
    } catch (error) {
      // Handle unique constraint violation (already in wishlist)
      throw new BadRequestException('Product already in wishlist');
    }

    return { message: 'Product added to wishlist' };
  }

  async removeFromWishlist(userId: string, productId: string) {
    await this.prisma.wishlist.delete({
      where: {
        userId_productId: { userId, productId }
      }
    });

    return { message: 'Product removed from wishlist' };
  }

  async getUserWishlist(userId: string) {
    const wishlist = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            seller: {
              select: { username: true }
            }
          }
        }
      }
    });

    return wishlist.map(item => ({
      ...item.product,
      specifications: item.product.specifications ? JSON.parse(item.product.specifications) : {}
    }));
  }
}