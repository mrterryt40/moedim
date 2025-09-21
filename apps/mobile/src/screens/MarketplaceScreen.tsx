import React, { useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Typography } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { ProductCard } from '../components/marketplace/ProductCard';
import { CategoryFilter } from '../components/marketplace/CategoryFilter';
import { designTokens } from '../theme/tokens';
import { marketplaceService } from '../services';

interface Product {
  id: string;
  name: string;
  hebrewName?: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  imageUrl?: string;
  seller: {
    name: string;
    rating: number;
    isVerified: boolean;
  };
  tags: string[];
  inStock: boolean;
  stockCount?: number;
  isKosher?: boolean;
  isCertified?: boolean;
  rating: number;
  reviewCount: number;
}

interface Category {
  id: string;
  name: string;
  hebrewName?: string;
  icon: string;
  count: number;
  color: string;
}

interface CartItem {
  productId: string;
  quantity: number;
}

export const MarketplaceScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery, sortBy]);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);

      // Try to fetch real data from API
      const [productsResponse, categoriesResponse] = await Promise.allSettled([
        marketplaceService.getProducts({ limit: 20 }),
        marketplaceService.getCategories()
      ]);

      let products: Product[] = [];
      let categories: Category[] = [];

      // Handle products response
      if (productsResponse.status === 'fulfilled') {
        products = productsResponse.value.data.map(product => ({
          id: product.id,
          name: product.name,
          hebrewName: product.hebrewName,
          description: product.description,
          price: product.price,
          discountedPrice: product.salePrice,
          category: product.category,
          imageUrl: product.images?.[0],
          seller: {
            name: product.seller?.name || 'Unknown Seller',
            rating: product.seller?.rating || 5,
            isVerified: product.seller?.verified || false,
          },
          tags: product.tags || [],
          inStock: product.inStock,
          stockCount: product.stock,
          isKosher: product.kosher,
          isCertified: product.certified,
          rating: product.rating || 5,
          reviewCount: product.reviewCount || 0,
        }));
      }

      // Handle categories response
      if (categoriesResponse.status === 'fulfilled') {
        categories = categoriesResponse.value.map((cat, index) => ({
          id: cat.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: cat,
          icon: ['📜', '🕯️', '📚', '🍷', '👕'][index % 5],
          count: Math.floor(Math.random() * 50) + 5,
          color: [
            designTokens.colors.primary.indigo,
            designTokens.colors.secondary.gold,
            designTokens.colors.accent.emerald,
            designTokens.colors.accent.crimson,
            designTokens.colors.primary.indigoLight,
          ][index % 5],
        }));
      }

      // Fall back to mock data if API fails or returns no data
      if (products.length === 0) {
        products = [
        {
          id: '1',
          name: 'Torah Scroll (Sefer Torah)',
          hebrewName: 'ספר תורה',
          description: 'Hand-written Torah scroll on parchment by certified sofer. Traditional craftsmanship following ancient methods.',
          price: 15000,
          discountedPrice: 12000,
          category: 'Torah Scrolls',
          seller: {
            name: 'Jerusalem Scribes',
            rating: 5,
            isVerified: true,
          },
          tags: ['handwritten', 'kosher', 'certified', 'traditional'],
          inStock: true,
          stockCount: 2,
          isKosher: true,
          isCertified: true,
          rating: 5,
          reviewCount: 23,
        },
        {
          id: '2',
          name: 'Silver Kiddush Cup',
          hebrewName: 'כוס קידוש',
          description: 'Beautiful sterling silver Kiddush cup with Israelite motifs. Perfect for Sabbath and feast celebrations.',
          price: 150,
          category: 'Ritual Items',
          seller: {
            name: 'Holy Land Artisans',
            rating: 4,
            isVerified: true,
          },
          tags: ['silver', 'sabbath', 'ritual', 'handcrafted'],
          inStock: true,
          stockCount: 12,
          isKosher: true,
          isCertified: true,
          rating: 4,
          reviewCount: 67,
        },
        {
          id: '3',
          name: 'Mezuzah with Kosher Scroll',
          hebrewName: 'מזוזה',
          description: 'Handcrafted mezuzah case with kosher parchment scroll written by certified sofer.',
          price: 85,
          discountedPrice: 65,
          category: 'Ritual Items',
          seller: {
            name: 'Zion Judaica',
            rating: 5,
            isVerified: true,
          },
          tags: ['mezuzah', 'kosher', 'parchment', 'doorpost'],
          inStock: true,
          stockCount: 25,
          isKosher: true,
          isCertified: true,
          rating: 5,
          reviewCount: 134,
        },
        {
          id: '4',
          name: 'Passover Haggadah',
          hebrewName: 'הגדה של פסח',
          description: 'Traditional Passover Haggadah with Hebrew text and English translation. Beautiful illustrations.',
          price: 25,
          category: 'Books',
          seller: {
            name: 'Torah Publishers',
            rating: 4,
            isVerified: true,
          },
          tags: ['passover', 'haggadah', 'hebrew', 'english'],
          inStock: true,
          stockCount: 50,
          isKosher: true,
          rating: 4,
          reviewCount: 89,
        },
        {
          id: '5',
          name: 'Kosher Wine - Covenant Red',
          hebrewName: 'יין כשר',
          description: 'Premium kosher red wine from the valleys of Israel. Perfect for Sabbath and feast celebrations.',
          price: 45,
          category: 'Food & Wine',
          seller: {
            name: 'Covenant Vineyards',
            rating: 5,
            isVerified: true,
          },
          tags: ['kosher', 'wine', 'israel', 'sabbath'],
          inStock: true,
          stockCount: 8,
          isKosher: true,
          isCertified: true,
          rating: 5,
          reviewCount: 156,
        },
        {
          id: '6',
          name: 'Tallit with Traditional Tzitzit',
          hebrewName: 'טלית',
          description: 'Traditional wool tallit with hand-tied tzitzit. Made according to biblical commandments.',
          price: 120,
          category: 'Clothing & Jewelry',
          seller: {
            name: 'Sacred Garments',
            rating: 4,
            isVerified: true,
          },
          tags: ['tallit', 'tzitzit', 'wool', 'prayer'],
          inStock: true,
          stockCount: 15,
          isKosher: true,
          isCertified: true,
          rating: 4,
          reviewCount: 78,
        },
        ];
      }

      if (categories.length === 0) {
        categories = [
        {
          id: 'torah-scrolls',
          name: 'Torah Scrolls',
          hebrewName: 'ספרי תורה',
          icon: '📜',
          count: 5,
          color: designTokens.colors.primary.indigo,
        },
        {
          id: 'ritual-items',
          name: 'Ritual Items',
          hebrewName: 'כלי קודש',
          icon: '🕯️',
          count: 23,
          color: designTokens.colors.secondary.gold,
        },
        {
          id: 'books',
          name: 'Books',
          hebrewName: 'ספרים',
          icon: '📚',
          count: 45,
          color: designTokens.colors.primary.indigo,
        },
        {
          id: 'food-wine',
          name: 'Food & Wine',
          hebrewName: 'מזון ויין',
          icon: '🍷',
          count: 67,
          color: designTokens.colors.accent.emerald,
        },
        {
          id: 'clothing-jewelry',
          name: 'Clothing & Jewelry',
          hebrewName: 'בגדים ותכשיטים',
          icon: '👕',
          count: 34,
          color: designTokens.colors.accent.crimson,
        },
        ];
      }

      setProducts(products);
      setCategories(categories);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      Alert.alert('Error', 'Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.category.toLowerCase().replace(/[^a-z0-9]/g, '-') === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const priceA = a.discountedPrice || a.price;
          const priceB = b.discountedPrice || b.price;
          return priceA - priceB;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const handleProductPress = (product: Product) => {
    Alert.alert(
      product.name,
      `${product.description}\n\nPrice: $${product.discountedPrice || product.price}\nSeller: ${product.seller.name}\nRating: ${product.rating}/5 (${product.reviewCount} reviews)\n\nTags: ${product.tags.join(', ')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add to Cart', onPress: () => handleAddToCart(product) }
      ]
    );
  };

  const handleAddToCart = (product: Product) => {
    if (!product.inStock) {
      Alert.alert('Out of Stock', 'This item is currently out of stock.');
      return;
    }

    const existingItem = cartItems.find(item => item.productId === product.id);

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { productId: product.id, quantity: 1 }]);
    }

    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart.`,
      [{ text: 'OK' }]
    );
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={designTokens.colors.primary.indigo} />
          <Typography variant="body" style={styles.loadingText}>
            Loading marketplace...
          </Typography>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      {/* Header */}
      <AnimatedCard variant="default" delay={0}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Typography variant="h1" style={styles.title}>
              Israelite Marketplace
            </Typography>
            <Typography variant="body" style={styles.subtitle}>
              Authentic products for Torah-observant living
            </Typography>
          </View>

          {/* Cart Icon */}
          {cartItems.length > 0 && (
            <View style={styles.cartSection}>
              <View style={styles.cartIcon}>
                <Typography style={styles.cartEmoji}>🛒</Typography>
                <View style={styles.cartBadge}>
                  <Typography variant="caption" style={styles.cartBadgeText}>
                    {getTotalCartItems()}
                  </Typography>
                </View>
              </View>
            </View>
          )}
        </View>
      </AnimatedCard>

      {/* Search Bar */}
      <AnimatedCard variant="default" delay={100}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={designTokens.colors.neutral.gray500}
          />
          <Typography style={styles.searchIcon}>🔍</Typography>
        </View>
      </AnimatedCard>

      {/* Category Filter */}
      <AnimatedCard variant="default" delay={200}>
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </AnimatedCard>

      {/* Sort Options */}
      <AnimatedCard variant="default" delay={300}>
        <View style={styles.sortContainer}>
          <Typography variant="caption" style={styles.sortLabel}>
            Sort by:
          </Typography>
          <View style={styles.sortButtons}>
            {[
              { key: 'name', label: 'Name' },
              { key: 'price', label: 'Price' },
              { key: 'rating', label: 'Rating' },
            ].map((option) => (
              <Button
                key={option.key}
                variant={sortBy === option.key ? 'primary' : 'secondary'}
                size="small"
                onPress={() => setSortBy(option.key as any)}
                style={styles.sortButton}
              >
                {option.label}
              </Button>
            ))}
          </View>
        </View>
      </AnimatedCard>

      {/* Products List */}
      <View style={styles.productsContainer}>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <AnimatedCard variant="default" delay={400 + index * 50}>
              <ProductCard
                product={item}
                onPress={handleProductPress}
                onAddToCart={handleAddToCart}
                showQuickAdd={true}
              />
            </AnimatedCard>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Typography variant="h3" style={styles.emptyTitle}>
                No Products Found
              </Typography>
              <Typography variant="body" style={styles.emptyText}>
                Try adjusting your search or category filter.
              </Typography>
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: designTokens.colors.neutral.cream,
  },
  loadingText: {
    marginTop: designTokens.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    color: designTokens.colors.primary.indigo,
    marginBottom: designTokens.spacing.xs,
  },
  subtitle: {
    color: designTokens.colors.neutral.gray600,
  },
  cartSection: {
    marginLeft: designTokens.spacing.md,
  },
  cartIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartEmoji: {
    fontSize: 32,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: designTokens.colors.accent.crimson,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: designTokens.colors.neutral.white,
    fontWeight: designTokens.typography.fontWeight.bold,
    fontSize: designTokens.typography.fontSize.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designTokens.colors.neutral.white,
    borderRadius: designTokens.borderRadius.lg,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.sm,
    borderWidth: 1,
    borderColor: designTokens.colors.neutral.gray200,
  },
  searchInput: {
    flex: 1,
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.neutral.gray800,
    paddingVertical: designTokens.spacing.xs,
  },
  searchIcon: {
    fontSize: 20,
    color: designTokens.colors.neutral.gray500,
    marginLeft: designTokens.spacing.sm,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: designTokens.spacing.sm,
  },
  sortLabel: {
    color: designTokens.colors.neutral.gray600,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
  },
  sortButton: {
    paddingHorizontal: designTokens.spacing.md,
  },
  productsContainer: {
    flex: 1,
  },
  productsContent: {
    paddingBottom: designTokens.spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing.xl,
  },
  emptyTitle: {
    color: designTokens.colors.neutral.gray600,
    marginBottom: designTokens.spacing.sm,
  },
  emptyText: {
    color: designTokens.colors.neutral.gray500,
    textAlign: 'center',
  },
});