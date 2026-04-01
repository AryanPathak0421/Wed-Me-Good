// Centralized theme configuration - Single source of truth for all colors
export const themeConfig = {
  // Core color palette
  colors: {
    // Primary brand colors (Pink/Rose)
    primary: {
      50: '#fdf3f3',
      100: '#fbe9e9',
      200: '#f7d5d5',
      300: '#efb4b4',
      400: '#e18989',
      500: '#d16262', // Main Designer Pink
      600: '#be4d4d',
      700: '#9f3d3d',
      800: '#833434',
      900: '#6f2f2f',
      950: '#3b1515',
    },
    lilac: {
      light: '#BE9B9B', // Dusty Rose from image
      dark: '#5D3E3E',  // Plum Brown from image
      floral: '#E2D1D1',
    },
    
    // Secondary colors (Amber/Gold)
    secondary: {
      50: '#fffcf0',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308', // Elegant Gold
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
      950: '#422006',
    },
    
    // Accent colors (Emerald/Green)
    accent: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // Main accent
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
    
    // Neutral colors (Gray scale)
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Semantic color mappings
  semantic: {
    // Background colors
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      accent: '#fdf2f8',
      gradient: {
        primary: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        hero: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
        card: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
      },
    },
    
    // Text colors
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
      muted: '#d1d5db',
      accent: '#ec4899',
      link: '#ec4899',
      linkHover: '#db2777',
    },
    
    // Border colors
    border: {
      primary: '#e5e7eb',
      secondary: '#d1d5db',
      accent: '#fbcfe8',
      focus: '#ec4899',
      error: '#ef4444',
    },
    
    // Interactive states
    interactive: {
      hover: '#f9fafb',
      active: '#f3f4f6',
      focus: '#fdf2f8',
      disabled: '#f3f4f6',
    },
    
    // Component-specific colors
    card: {
      background: '#ffffff',
      border: '#e5e7eb',
      shadow: 'rgba(0, 0, 0, 0.05)',
      hover: '#f9fafb',
    },
    
    button: {
      primary: {
        background: '#ec4899',
        backgroundHover: '#db2777',
        text: '#ffffff',
        border: '#ec4899',
      },
      secondary: {
        background: '#f59e0b',
        backgroundHover: '#d97706',
        text: '#ffffff',
        border: '#f59e0b',
      },
      outline: {
        background: 'transparent',
        backgroundHover: '#fdf2f8',
        text: '#ec4899',
        border: '#fbcfe8',
        borderHover: '#ec4899',
      },
      ghost: {
        background: 'transparent',
        backgroundHover: '#fdf2f8',
        text: '#ec4899',
        border: 'transparent',
      },
    },
    
    input: {
      background: '#ffffff',
      border: '#d1d5db',
      borderFocus: '#ec4899',
      text: '#111827',
      placeholder: '#9ca3af',
    },
    
    navigation: {
      background: '#ffffff',
      border: '#e5e7eb',
      text: '#4b5563',
      textActive: '#ec4899',
      backgroundActive: '#fdf2f8',
      backgroundHover: '#f9fafb',
    },
  },
};

// Theme variants
export const themes = {
  light: {
    name: 'light',
    ...themeConfig,
  },
  
  dark: {
    name: 'dark',
    colors: {
      ...themeConfig.colors,
    },
    semantic: {
      ...themeConfig.semantic,
      background: {
        primary: '#111827',
        secondary: '#1f2937',
        tertiary: '#374151',
        accent: '#500724',
        gradient: {
          primary: 'linear-gradient(135deg, #500724 0%, #451a03 100%)',
          hero: 'linear-gradient(135deg, #be185d 0%, #b45309 100%)',
          card: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
        },
      },
      text: {
        primary: '#f9fafb',
        secondary: '#d1d5db',
        tertiary: '#9ca3af',
        inverse: '#111827',
        muted: '#6b7280',
        accent: '#f9a8d4',
        link: '#f9a8d4',
        linkHover: '#fce7f3',
      },
      card: {
        background: '#1f2937',
        border: '#374151',
        shadow: 'rgba(0, 0, 0, 0.3)',
        hover: '#374151',
      },
      navigation: {
        background: '#1f2937',
        border: '#374151',
        text: '#d1d5db',
        textActive: '#f9a8d4',
        backgroundActive: '#500724',
        backgroundHover: '#374151',
      },
    },
  },
};

export const defaultTheme = themes.light;

// CSS variable names mapping
export const cssVariables = {
  primary: {
    50: '--color-primary-50',
    100: '--color-primary-100',
    200: '--color-primary-200',
    300: '--color-primary-300',
    400: '--color-primary-400',
    500: '--color-primary-500',
    600: '--color-primary-600',
    700: '--color-primary-700',
    800: '--color-primary-800',
    900: '--color-primary-900',
    950: '--color-primary-950',
  },
  secondary: {
    50: '--color-secondary-50',
    100: '--color-secondary-100',
    200: '--color-secondary-200',
    300: '--color-secondary-300',
    400: '--color-secondary-400',
    500: '--color-secondary-500',
    600: '--color-secondary-600',
    700: '--color-secondary-700',
    800: '--color-secondary-800',
    900: '--color-secondary-900',
    950: '--color-secondary-950',
  },
  accent: {
    50: '--color-accent-50',
    100: '--color-accent-100',
    200: '--color-accent-200',
    300: '--color-accent-300',
    400: '--color-accent-400',
    500: '--color-accent-500',
    600: '--color-accent-600',
    700: '--color-accent-700',
    800: '--color-accent-800',
    900: '--color-accent-900',
    950: '--color-accent-950',
  },
  background: {
    primary: '--color-bg-primary',
    secondary: '--color-bg-secondary',
    tertiary: '--color-bg-tertiary',
  },
  text: {
    primary: '--color-text-primary',
    secondary: '--color-text-secondary',
    tertiary: '--color-text-tertiary',
    inverse: '--color-text-inverse',
  },
  card: {
    background: '--color-card-bg',
    border: '--color-card-border',
    shadow: '--color-card-shadow',
  },
  status: {
    success: '--color-success',
    warning: '--color-warning',
    error: '--color-error',
    info: '--color-info',
  },
};