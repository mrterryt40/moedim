import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { designTokens } from '../../theme/tokens';

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

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  showQuickAdd?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  showQuickAdd = true,
}) => {
  const getDiscountPercentage = () => {
    if (!product.discountedPrice) return 0;
    return Math.round(((product.price - product.discountedPrice) / product.price) * 100);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'books':
      case 'torah scrolls':
        return designTokens.colors.primary.indigo;
      case 'ritual items':
      case 'israelite goods':
        return designTokens.colors.secondary.gold;
      case 'food & wine':
      case 'kosher products':
        return designTokens.colors.accent.emerald;
      case 'clothing & jewelry':
        return designTokens.colors.accent.crimson;
      default:
        return designTokens.colors.neutral.gray500;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Typography key={i} style={[styles.star, i <= rating && styles.filledStar]}>
          ★
        </Typography>
      );
    }
    return stars;
  };

  return (
    <Pressable onPress={() => onPress?.(product)}>
      <Card variant="default" style={styles.container}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Typography variant="caption" style={styles.placeholderText}>
                📦
              </Typography>
            </View>
          )}

          {/* Badges */}
          <View style={styles.badges}>
            {product.isKosher && (
              <View style={[styles.badge, { backgroundColor: designTokens.colors.accent.emerald }]}>
                <Typography variant="caption" style={styles.badgeText}>
                  ✓ Kosher
                </Typography>
              </View>
            )}
            {product.isCertified && (
              <View style={[styles.badge, { backgroundColor: designTokens.colors.secondary.gold }]}>
                <Typography variant="caption" style={styles.badgeText}>
                  🏆 Certified
                </Typography>
              </View>
            )}
            {!product.inStock && (
              <View style={[styles.badge, { backgroundColor: designTokens.colors.neutral.gray500 }]}>
                <Typography variant="caption" style={styles.badgeText}>
                  Out of Stock
                </Typography>
              </View>
            )}
          </View>

          {/* Discount Badge */}
          {product.discountedPrice && (
            <View style={styles.discountBadge}>
              <Typography variant="caption" style={styles.discountText}>
                -{getDiscountPercentage()}%
              </Typography>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Category */}
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(product.category) }]}>
            <Typography variant="caption" style={styles.categoryText}>
              {product.category}
            </Typography>
          </View>

          {/* Product Name */}
          <Typography variant="h3" style={styles.productName} numberOfLines={2}>
            {product.name}
          </Typography>
          {product.hebrewName && (
            <Typography variant="hebrew" style={styles.hebrewName} numberOfLines={1}>
              {product.hebrewName}
            </Typography>
          )}

          {/* Description */}
          <Typography variant="body" style={styles.description} numberOfLines={2}>
            {product.description}
          </Typography>

          {/* Rating and Reviews */}
          <View style={styles.ratingSection}>
            <View style={styles.stars}>
              {renderStars(product.rating)}
            </View>
            <Typography variant="caption" style={styles.reviewCount}>
              ({product.reviewCount})
            </Typography>
          </View>

          {/* Seller Info */}
          <View style={styles.sellerSection}>
            <Typography variant="caption" style={styles.sellerLabel}>
              Sold by:
            </Typography>
            <Typography variant="caption" style={styles.sellerName}>
              {product.seller.name}
              {product.seller.isVerified && (
                <Typography style={styles.verifiedIcon}> ✓</Typography>
              )}
            </Typography>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              {product.discountedPrice ? (
                <>
                  <Typography variant="h3" style={styles.discountedPrice}>
                    ${product.discountedPrice}
                  </Typography>
                  <Typography variant="body" style={styles.originalPrice}>
                    ${product.price}
                  </Typography>
                </>
              ) : (
                <Typography variant="h3" style={styles.price}>
                  ${product.price}
                </Typography>
              )}
            </View>

            {/* Stock Info */}
            {product.stockCount && product.stockCount < 10 && (
              <Typography variant="caption" style={styles.lowStock}>
                Only {product.stockCount} left
              </Typography>
            )}
          </View>

          {/* Quick Add Button */}
          {showQuickAdd && product.inStock && (
            <Button
              variant="primary"
              size="small"
              onPress={() => onAddToCart?.(product)}
              style={styles.addToCartButton}
            >
              Add to Cart
            </Button>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <View style={styles.tagsSection}>
              {product.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Typography variant="caption" style={styles.tagText}>
                    {tag}
                  </Typography>
                </View>
              ))}
              {product.tags.length > 3 && (
                <Typography variant="caption" style={styles.moreTags}>
                  +{product.tags.length - 3} more
                </Typography>
              )}
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: designTokens.spacing.sm,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: designTokens.colors.neutral.gray100,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: designTokens.colors.neutral.gray200,
  },
  placeholderText: {
    fontSize: 48,
    color: designTokens.colors.neutral.gray400,
  },
  badges: {
    position: 'absolute',
    top: designTokens.spacing.sm,
    left: designTokens.spacing.sm,
    flexDirection: 'column',
    gap: designTokens.spacing.xs,
  },
  badge: {
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.md,
  },
  badgeText: {
    color: designTokens.colors.neutral.white,
    fontWeight: designTokens.typography.fontWeight.bold,
    fontSize: designTokens.typography.fontSize.xs,
  },
  discountBadge: {
    position: 'absolute',
    top: designTokens.spacing.sm,
    right: designTokens.spacing.sm,
    backgroundColor: designTokens.colors.accent.crimson,
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.md,
  },
  discountText: {
    color: designTokens.colors.neutral.white,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  productInfo: {
    padding: designTokens.spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.sm,
    marginBottom: designTokens.spacing.sm,
  },
  categoryText: {
    color: designTokens.colors.neutral.white,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  productName: {
    color: designTokens.colors.neutral.gray800,
    marginBottom: designTokens.spacing.xs,
  },
  hebrewName: {
    color: designTokens.colors.secondary.gold,
    fontSize: designTokens.typography.fontSize.base,
    marginBottom: designTokens.spacing.sm,
  },
  description: {
    color: designTokens.colors.neutral.gray600,
    lineHeight: designTokens.typography.lineHeight.relaxed * designTokens.typography.fontSize.base,
    marginBottom: designTokens.spacing.sm,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm,
  },
  stars: {
    flexDirection: 'row',
    marginRight: designTokens.spacing.sm,
  },
  star: {
    color: designTokens.colors.neutral.gray300,
    fontSize: designTokens.typography.fontSize.sm,
  },
  filledStar: {
    color: designTokens.colors.secondary.gold,
  },
  reviewCount: {
    color: designTokens.colors.neutral.gray500,
  },
  sellerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm,
  },
  sellerLabel: {
    color: designTokens.colors.neutral.gray500,
    marginRight: designTokens.spacing.xs,
  },
  sellerName: {
    color: designTokens.colors.neutral.gray700,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  verifiedIcon: {
    color: designTokens.colors.accent.emerald,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: designTokens.spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    color: designTokens.colors.primary.indigo,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  discountedPrice: {
    color: designTokens.colors.accent.crimson,
    fontWeight: designTokens.typography.fontWeight.bold,
    marginRight: designTokens.spacing.sm,
  },
  originalPrice: {
    color: designTokens.colors.neutral.gray500,
    textDecorationLine: 'line-through',
  },
  lowStock: {
    color: designTokens.colors.accent.crimson,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  addToCartButton: {
    marginBottom: designTokens.spacing.md,
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },
  tag: {
    backgroundColor: designTokens.colors.neutral.gray100,
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.sm,
  },
  tagText: {
    color: designTokens.colors.neutral.gray600,
    fontSize: designTokens.typography.fontSize.xs,
  },
  moreTags: {
    color: designTokens.colors.neutral.gray500,
    fontStyle: 'italic',
  },
});