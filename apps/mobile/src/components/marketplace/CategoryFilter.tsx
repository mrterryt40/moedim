import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Typography } from '../ui/Typography';
import { designTokens } from '../../theme/tokens';

interface Category {
  id: string;
  name: string;
  hebrewName?: string;
  icon: string;
  count: number;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
}) => {
  const isSelected = (categoryId: string) => selectedCategory === categoryId;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All Categories Button */}
        <Pressable
          style={[
            styles.categoryItem,
            selectedCategory === null && styles.selectedCategory
          ]}
          onPress={() => onCategorySelect(null)}
        >
          <View style={[
            styles.categoryIcon,
            { backgroundColor: designTokens.colors.neutral.gray200 },
            selectedCategory === null && { backgroundColor: designTokens.colors.primary.indigo }
          ]}>
            <Typography style={[
              styles.iconText,
              selectedCategory === null && styles.selectedIconText
            ]}>
              🏪
            </Typography>
          </View>
          <Typography variant="caption" style={[
            styles.categoryName,
            selectedCategory === null && styles.selectedCategoryName
          ]}>
            All
          </Typography>
        </Pressable>

        {/* Category Items */}
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryItem,
              isSelected(category.id) && styles.selectedCategory
            ]}
            onPress={() => onCategorySelect(category.id)}
          >
            <View style={[
              styles.categoryIcon,
              { backgroundColor: isSelected(category.id) ? category.color : designTokens.colors.neutral.gray200 }
            ]}>
              <Typography style={[
                styles.iconText,
                isSelected(category.id) && styles.selectedIconText
              ]}>
                {category.icon}
              </Typography>
            </View>

            <View style={styles.categoryTextContainer}>
              <Typography variant="caption" style={[
                styles.categoryName,
                isSelected(category.id) && styles.selectedCategoryName
              ]}>
                {category.name}
              </Typography>
              {category.hebrewName && (
                <Typography variant="caption" style={[
                  styles.hebrewCategoryName,
                  isSelected(category.id) && styles.selectedHebrewCategoryName
                ]}>
                  {category.hebrewName}
                </Typography>
              )}
            </View>

            {/* Item Count Badge */}
            <View style={[
              styles.countBadge,
              isSelected(category.id) && styles.selectedCountBadge
            ]}>
              <Typography variant="caption" style={[
                styles.countText,
                isSelected(category.id) && styles.selectedCountText
              ]}>
                {category.count}
              </Typography>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: designTokens.spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: designTokens.spacing.md,
    gap: designTokens.spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    minWidth: 80,
    paddingVertical: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.sm,
    borderRadius: designTokens.borderRadius.lg,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  selectedCategory: {
    backgroundColor: designTokens.colors.neutral.gray50,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: designTokens.spacing.xs,
  },
  iconText: {
    fontSize: 24,
  },
  selectedIconText: {
    // Icon color change handled by emoji itself
  },
  categoryTextContainer: {
    alignItems: 'center',
    minHeight: 32,
  },
  categoryName: {
    textAlign: 'center',
    color: designTokens.colors.neutral.gray700,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  selectedCategoryName: {
    color: designTokens.colors.primary.indigo,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  hebrewCategoryName: {
    textAlign: 'center',
    color: designTokens.colors.neutral.gray500,
    fontSize: designTokens.typography.fontSize.xs,
    marginTop: 1,
  },
  selectedHebrewCategoryName: {
    color: designTokens.colors.secondary.gold,
  },
  countBadge: {
    position: 'absolute',
    top: designTokens.spacing.xs,
    right: designTokens.spacing.xs,
    backgroundColor: designTokens.colors.neutral.gray300,
    paddingHorizontal: designTokens.spacing.xs,
    paddingVertical: 2,
    borderRadius: designTokens.borderRadius.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  selectedCountBadge: {
    backgroundColor: designTokens.colors.primary.indigo,
  },
  countText: {
    color: designTokens.colors.neutral.gray700,
    fontSize: designTokens.typography.fontSize.xs,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  selectedCountText: {
    color: designTokens.colors.neutral.white,
  },
});