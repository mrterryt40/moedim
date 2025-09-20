import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

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

@Controller('marketplace')
@UseGuards(JwtAuthGuard)
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // Product Management
  @Post('products')
  async createProduct(
    @GetUser() user: any,
    @Body() createProductDto: CreateProductDto
  ) {
    return this.marketplaceService.createProduct(user.id, createProductDto);
  }

  @Get('products')
  async getProducts(
    @Query('category') category?: string,
    @Query('subcategory') subcategory?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('tags') tags?: string,
    @Query('isDigital') isDigital?: string,
    @Query('sellerId') sellerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'price' | 'rating' | 'created' | 'popular',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    const filters = {
      category,
      subcategory,
      search,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      tags: tags ? tags.split(',') : undefined,
      isDigital: isDigital ? isDigital === 'true' : undefined,
      sellerId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      sortBy,
      sortOrder
    };

    return this.marketplaceService.getProducts(filters);
  }

  @Get('products/:id')
  async getProductById(
    @GetUser() user: any,
    @Param('id') productId: string
  ) {
    return this.marketplaceService.getProductById(productId, user.id);
  }

  @Get('products/public/:id')
  async getProductByIdPublic(@Param('id') productId: string) {
    return this.marketplaceService.getProductById(productId);
  }

  // Order Management
  @Post('orders')
  async createOrder(
    @GetUser() user: any,
    @Body() createOrderDto: CreateOrderDto
  ) {
    return this.marketplaceService.createOrder(user.id, createOrderDto);
  }

  @Get('orders/buyer')
  async getUserOrders(
    @GetUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;

    return this.marketplaceService.getUserOrders(user.id, pageNum, limitNum);
  }

  @Get('orders/seller')
  async getSellerOrders(
    @GetUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;

    return this.marketplaceService.getSellerOrders(user.id, pageNum, limitNum);
  }

  @Put('orders/:id/status')
  async updateOrderStatus(
    @GetUser() user: any,
    @Param('id') orderId: string,
    @Body() body: { status: string }
  ) {
    return this.marketplaceService.updateOrderStatus(orderId, user.id, body.status);
  }

  // Review System
  @Post('reviews')
  async createReview(
    @GetUser() user: any,
    @Body() createReviewDto: CreateReviewDto
  ) {
    return this.marketplaceService.createReview(user.id, createReviewDto);
  }

  // Wishlist
  @Post('wishlist/:productId')
  async addToWishlist(
    @GetUser() user: any,
    @Param('productId') productId: string
  ) {
    return this.marketplaceService.addToWishlist(user.id, productId);
  }

  @Delete('wishlist/:productId')
  async removeFromWishlist(
    @GetUser() user: any,
    @Param('productId') productId: string
  ) {
    return this.marketplaceService.removeFromWishlist(user.id, productId);
  }

  @Get('wishlist')
  async getUserWishlist(@GetUser() user: any) {
    return this.marketplaceService.getUserWishlist(user.id);
  }

  // Analytics and Statistics
  @Get('stats')
  async getMarketplaceStats() {
    return this.marketplaceService.getMarketplaceStats();
  }

  @Get('dashboard/seller')
  async getSellerDashboard(@GetUser() user: any) {
    return this.marketplaceService.getSellerDashboard(user.id);
  }

  // Product Categories and Discovery
  @Get('categories')
  async getCategories() {
    return [
      {
        id: 'digital',
        name: 'Digital Products',
        description: 'Software, eBooks, courses, and digital content',
        subcategories: [
          { id: 'ebooks', name: 'eBooks' },
          { id: 'courses', name: 'Online Courses' },
          { id: 'software', name: 'Software & Apps' },
          { id: 'graphics', name: 'Graphics & Design' },
          { id: 'audio', name: 'Audio & Music' },
          { id: 'video', name: 'Videos & Tutorials' }
        ]
      },
      {
        id: 'physical',
        name: 'Physical Products',
        description: 'Books, artwork, crafts, and physical items',
        subcategories: [
          { id: 'books', name: 'Books' },
          { id: 'artwork', name: 'Artwork & Prints' },
          { id: 'crafts', name: 'Handmade Crafts' },
          { id: 'jewelry', name: 'Jewelry' },
          { id: 'clothing', name: 'Clothing & Accessories' },
          { id: 'home', name: 'Home & Decor' }
        ]
      },
      {
        id: 'service',
        name: 'Services',
        description: 'Tutoring, consulting, and professional services',
        subcategories: [
          { id: 'tutoring', name: 'Hebrew Tutoring' },
          { id: 'consulting', name: 'Religious Consulting' },
          { id: 'coaching', name: 'Life Coaching' },
          { id: 'translation', name: 'Translation Services' },
          { id: 'writing', name: 'Writing & Editing' },
          { id: 'design', name: 'Design Services' }
        ]
      },
      {
        id: 'book',
        name: 'Religious Books',
        description: 'Torah commentaries, prayer books, and religious texts',
        subcategories: [
          { id: 'torah', name: 'Torah & Commentaries' },
          { id: 'talmud', name: 'Talmud & Mishnah' },
          { id: 'prayers', name: 'Prayer Books' },
          { id: 'kabbalah', name: 'Kabbalah & Mysticism' },
          { id: 'holidays', name: 'Holiday Books' },
          { id: 'children', name: 'Children\'s Books' }
        ]
      },
      {
        id: 'course',
        name: 'Learning Courses',
        description: 'Hebrew language, Torah study, and skill courses',
        subcategories: [
          { id: 'hebrew-language', name: 'Hebrew Language' },
          { id: 'torah-study', name: 'Torah Study' },
          { id: 'talmud-study', name: 'Talmud Study' },
          { id: 'israelite-history', name: 'Israelite History' },
          { id: 'practical-skills', name: 'Practical Skills' },
          { id: 'spiritual-growth', name: 'Spiritual Growth' }
        ]
      },
      {
        id: 'artwork',
        name: 'Israelite Art',
        description: 'Religious artwork, calligraphy, and ceremonial items',
        subcategories: [
          { id: 'calligraphy', name: 'Hebrew Calligraphy' },
          { id: 'paintings', name: 'Paintings' },
          { id: 'sculptures', name: 'Sculptures' },
          { id: 'ceremonial', name: 'Ceremonial Items' },
          { id: 'jewelry', name: 'Israelite Jewelry' },
          { id: 'mezuzah', name: 'Mezuzahs & Cases' }
        ]
      }
    ];
  }

  @Get('featured')
  async getFeaturedProducts() {
    // Get products with high ratings and recent sales
    return this.marketplaceService.getProducts({
      sortBy: 'rating',
      sortOrder: 'desc',
      limit: 12
    });
  }

  @Get('trending')
  async getTrendingProducts() {
    // Get products with recent high sales volume
    return this.marketplaceService.getProducts({
      sortBy: 'popular',
      sortOrder: 'desc',
      limit: 12
    });
  }

  @Get('search/suggestions')
  async getSearchSuggestions(@Query('q') query: string) {
    if (!query || query.length < 2) {
      return { suggestions: [] };
    }

    // Simple implementation - in production, you might want to use a search engine
    const products = await this.marketplaceService.getProducts({
      search: query,
      limit: 10
    });

    const suggestions = products.products.map(product => ({
      type: 'product',
      text: product.name,
      category: product.category,
      id: product.id
    }));

    // Add category suggestions
    const categories = await this.getCategories();
    const categorySuggestions = categories
      .filter(cat => cat.name.toLowerCase().includes(query.toLowerCase()))
      .map(cat => ({
        type: 'category',
        text: cat.name,
        category: cat.id
      }));

    return {
      suggestions: [...suggestions, ...categorySuggestions].slice(0, 10)
    };
  }

  // Payment Integration Endpoints
  @Post('payment/stripe/intent')
  async createStripePaymentIntent(
    @GetUser() user: any,
    @Body() body: { orderId: string }
  ) {
    // Implementation would integrate with Stripe API
    // For now, return a mock response
    return {
      clientSecret: 'pi_mock_client_secret',
      paymentIntentId: 'pi_mock_payment_intent'
    };
  }

  @Post('payment/paypal/create')
  async createPayPalOrder(
    @GetUser() user: any,
    @Body() body: { orderId: string }
  ) {
    // Implementation would integrate with PayPal API
    // For now, return a mock response
    return {
      orderID: 'paypal_mock_order_id',
      approvalUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=mock_token'
    };
  }

  @Post('payment/coins/verify')
  async verifyCoinPayment(
    @GetUser() user: any,
    @Body() body: { orderId: string; transactionHash: string }
  ) {
    // This would verify the blockchain transaction
    // Implementation depends on the blockchain integration
    return {
      verified: true,
      transactionHash: body.transactionHash
    };
  }
}