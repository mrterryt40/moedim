// Mo'edim Complete UI Design System & Components
// Implementing the Israelite platform branding and design

export const designTokens = {
  colors: {
    // Primary Brand Colors (from Mo'edim Branding Guide)
    primary: {
      indigo: '#1C1C3C',      // Foundation, night sky
      indigoLight: '#2A2A4A',
      indigoDark: '#151529',
    },
    secondary: {
      gold: '#D4AF37',        // Kingship, prosperity
      goldLight: '#E6C659',
      goldDark: '#B8941F',
    },
    accent: {
      crimson: '#8B1E3F',     // Passion, sacrifice
      crimsonLight: '#A53855',
      crimsonDark: '#751832',
      emerald: '#1D6B4C',     // Renewal, life, agriculture
      emeraldLight: '#2A8B66',
      emeraldDark: '#175A3F',
    },
    neutral: {
      cream: '#F9F6EF',       // Background, parchment
      creamLight: '#FEFDFB',
      creamDark: '#F1EDE3',
      white: '#FFFFFF',
      gray100: '#F7F7F7',
      gray200: '#E5E5E5',
      gray300: '#D1D1D1',
      gray500: '#6B7280',
      gray600: '#4B5563',
      gray700: '#374151',
      gray900: '#111827',
    },

    // Semantic Colors
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',

    // Torah Study Specific
    torah: {
      hebrew: '#1C1C3C',
      english: '#374151',
      commentary: '#6B7280',
      verse: '#8B1E3F',
    }
  },

  typography: {
    // Font Families (from branding guide)
    fontFamily: {
      serif: 'Cinzel',          // Headlines - classical covenant feel
      sans: 'Inter',            // Body text - modern readability
      hebrew: 'Frank Ruehl CLM', // Hebrew text - authenticity
    },

    // Font Sizes
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },

    // Font Weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      hebrew: 2.0,  // Extra spacing for Hebrew text
    }
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    }
  }
};