// src/theme/index.ts
import { extendTheme, StyleFunctionProps } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899', // Primary Pink
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
    accent: {
      500: '#8b5cf6', // Secondary Purple
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: mode('gray.50', 'gray.900')(props),
        color: mode('gray.800', 'whiteAlpha.900')(props),
        WebkitFontSmoothing: 'antialiased',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Card: {
      baseStyle: (props: StyleFunctionProps) => ({
        container: {
          bg: mode('white', 'gray.800')(props),
          borderRadius: 'xl',
          boxShadow: mode('sm', 'dark-lg')(props),
          border: '1px solid',
          borderColor: mode('gray.100', 'gray.700')(props),
          overflow: 'hidden',
        },
      }),
    },
    Input: {
      variants: {
        outline: (props: StyleFunctionProps) => ({
          field: {
            bg: mode('white', 'gray.900')(props),
            borderColor: mode('gray.200', 'gray.700')(props),
            _focus: {
              borderColor: 'brand.500',
              boxShadow: `0 0 0 1px var(--chakra-colors-brand-500)`,
            },
          },
        }),
      },
      defaultProps: {
        focusBorderColor: 'brand.500',
      },
    },
    Badge: {
      baseStyle: {
        textTransform: 'capitalize',
        borderRadius: 'md',
      },
    },
  },
});

export default theme;