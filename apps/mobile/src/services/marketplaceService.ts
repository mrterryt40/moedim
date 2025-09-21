// Mo'edim Marketplace Service
// Handles products, orders, payments, and marketplace functionality

import { apiService } from './api';
import type {
  Product,
  Order,
  Review,
  PaymentIntent,
  PaginatedResponse,
  SearchQuery,
  FilterOptions,
  ApiResponse
} from '../types';

class MarketplaceService {
  // ==============================================
  // PRODUCT METHODS
  // ==============================================

  // Get all products with pagination and filters
  async getProducts(options: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    featured?: boolean;
    trending?: boolean;
  } = {}): Promise<PaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams();

      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.category) params.append('category', options.category);
      if (options.search) params.append('search', options.search);
      if (options.featured) params.append('featured', 'true');
      if (options.trending) params.append('trending', 'true');

      const endpoint = `/marketplace/products${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiService.get<PaginatedResponse<Product>>(endpoint);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch products');
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  // Get single product by ID
  async getProduct(id: string): Promise<Product> {
    try {
      const response = await apiService.get<Product>(`/marketplace/products/${id}`);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Product not found');
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  }

  // Get public product details (no auth required)
  async getPublicProduct(id: string): Promise<Product> {
    try {
      const response = await apiService.get<Product>(`/marketplace/products/public/${id}`);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Product not found');
    } catch (error) {
      console.error('Get public product error:', error);
      throw error;
    }
  }

  // Create new product (seller)
  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const response = await apiService.post<Product>('/marketplace/products', productData, true);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create product');
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  }

  // Get featured products
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response = await apiService.get<Product[]>('/marketplace/featured');

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch featured products');
    } catch (error) {
      console.error('Get featured products error:', error);
      throw error;
    }
  }

  // Get trending products
  async getTrendingProducts(): Promise<Product[]> {
    try {
      const response = await apiService.get<Product[]>('/marketplace/trending');

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch trending products');
    } catch (error) {
      console.error('Get trending products error:', error);
      throw error;
    }
  }

  // Get product categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await apiService.get<string[]>('/marketplace/categories');

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch categories');
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  // Search suggestions
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const response = await apiService.get<string[]>(`/marketplace/search/suggestions?q=${encodeURIComponent(query)}`);

      if (response.success && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Get search suggestions error:', error);
      return [];
    }
  }

  // ==============================================
  // ORDER METHODS
  // ==============================================

  // Create order
  async createOrder(orderData: {
    productId: string;
    quantity: number;
    paymentMethod: 'stripe' | 'paypal' | 'coins';
  }): Promise<Order> {
    try {
      const response = await apiService.post<Order>('/marketplace/orders', orderData, true);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create order');
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  // Get buyer orders
  async getBuyerOrders(): Promise<Order[]> {
    try {
      const response = await apiService.get<Order[]>('/marketplace/orders/buyer', true);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch orders');
    } catch (error) {
      console.error('Get buyer orders error:', error);
      throw error;
    }
  }

  // Get seller orders
  async getSellerOrders(): Promise<Order[]> {
    try {
      const response = await apiService.get<Order[]>('/marketplace/orders/seller', true);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch seller orders');
    } catch (error) {
      console.error('Get seller orders error:', error);
      throw error;
    }
  }

  // Update order status (seller)
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      const response = await apiService.put<Order>(`/marketplace/orders/${orderId}/status`, { status }, true);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to update order status');
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  // ==============================================
  // PAYMENT METHODS
  // ==============================================

  // Create Stripe payment intent
  async createStripePaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent> {
    try {
      const response = await apiService.post<PaymentIntent>('/marketplace/payment/stripe/intent', {
        amount,
        currency
      }, true);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create payment intent');
    } catch (error) {
      console.error('Create Stripe payment intent error:', error);
      throw error;
    }
  }

  // Create PayPal payment
  async createPayPalPayment(amount: number): Promise<{ approvalUrl: string; paymentId: string }> {
    try {
      const response = await apiService.post<{ approvalUrl: string; paymentId: string }>('/marketplace/payment/paypal/create', {
        amount
      }, true);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create PayPal payment');
    } catch (error) {
      console.error('Create PayPal payment error:', error);
      throw error;
    }
  }

  // Verify coin payment
  async verifyCoinPayment(orderId: string, transactionHash: string): Promise<boolean> {
    try {
      const response = await apiService.post<{ verified: boolean }>('/marketplace/payment/coins/verify', {
        orderId,
        transactionHash
      }, true);

      if (response.success && response.data) {
        return response.data.verified;
      }

      throw new Error(response.message || 'Failed to verify coin payment');
    } catch (error) {
      console.error('Verify coin payment error:', error);
      throw error;
    }
  }

  // ==============================================
  // REVIEW METHODS
  // ==============================================

  // Create product review
  async createReview(reviewData: {
    productId: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    try {
      const response = await apiService.post<Review>('/marketplace/reviews', reviewData, true);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create review');
    } catch (error) {
      console.error('Create review error:', error);
      throw error;
    }
  }

  // ==============================================
  // WISHLIST METHODS
  // ==============================================

  // Add to wishlist
  async addToWishlist(productId: string): Promise<void> {
    try {
      const response = await apiService.post(`/marketplace/wishlist/${productId}`, {}, true);

      if (!response.success) {
        throw new Error(response.message || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Add to wishlist error:', error);
      throw error;
    }
  }

  // Remove from wishlist
  async removeFromWishlist(productId: string): Promise<void> {
    try {
      const response = await apiService.delete(`/marketplace/wishlist/${productId}`, true);

      if (!response.success) {
        throw new Error(response.message || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      throw error;
    }
  }

  // Get wishlist
  async getWishlist(): Promise<Product[]> {
    try {
      const response = await apiService.get<Product[]>('/marketplace/wishlist', true);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch wishlist');
    } catch (error) {
      console.error('Get wishlist error:', error);
      throw error;
    }
  }

  // ==============================================
  // SELLER DASHBOARD METHODS
  // ==============================================

  // Get seller dashboard stats
  async getSellerDashboard(): Promise<{
    totalSales: number;
    totalProducts: number;
    pendingOrders: number;
    revenue: number;
  }> {
    try {
      const response = await apiService.get<{
        totalSales: number;
        totalProducts: number;
        pendingOrders: number;
        revenue: number;
      }>('/marketplace/dashboard/seller', true);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch seller dashboard');
    } catch (error) {
      console.error('Get seller dashboard error:', error);
      throw error;
    }
  }

  // Get marketplace stats
  async getMarketplaceStats(): Promise<{
    totalProducts: number;
    totalSellers: number;
    totalSales: number;
    topCategories: { name: string; count: number }[];
  }> {
    try {
      const response = await apiService.get<{
        totalProducts: number;
        totalSellers: number;
        totalSales: number;
        topCategories: { name: string; count: number }[];
      }>('/marketplace/stats');

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch marketplace stats');
    } catch (error) {
      console.error('Get marketplace stats error:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const marketplaceService = new MarketplaceService();

// Export for convenience
export { MarketplaceService };