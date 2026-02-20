/**
 * Dark Mode Utility Classes
 * 
 * This file contains common dark mode class combinations
 * that can be reused across components.
 */

// Background colors
export const darkBg = {
  primary: 'dark:bg-gray-900',
  secondary: 'dark:bg-gray-800',
  tertiary: 'dark:bg-gray-700',
  card: 'dark:bg-gray-800',
};

// Text colors
export const darkText = {
  primary: 'dark:text-gray-100',
  secondary: 'dark:text-gray-300',
  tertiary: 'dark:text-gray-400',
  muted: 'dark:text-gray-500',
};

// Border colors
export const darkBorder = {
  light: 'dark:border-gray-700',
  medium: 'dark:border-gray-600',
};

// Common combinations
export const darkMode = {
  page: `${darkBg.primary} ${darkText.primary}`,
  card: `${darkBg.card} ${darkText.primary} ${darkBorder.light}`,
  input: `${darkBg.tertiary} ${darkText.primary} dark:border-gray-600`,
  button: {
    primary: 'dark:bg-amber-600 dark:hover:bg-amber-700',
    secondary: 'dark:bg-gray-700 dark:hover:bg-gray-600',
  },
};
