/*
 Copyright 2025 Apavayan <info@apavayan.com>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const brandColors = {
  primary: "#3C5CA4", // AWOKE blue - main brand color
  secondary: "#F47920", // Orange accent
  tertiary: "#265C42", // Green accent
};

// Base colors for light and dark mode
const baseColors = {
  white: "#FFFFFF",
  black: "#000000",
  transparentBlack: "rgba(0, 0, 0, 0.7)",
  transparentWhite: "rgba(255, 255, 255, 0.7)",
};

// Status/feedback colors
const statusColors = {
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#FF3B30",
  info: "#2196F3",
  pending: "#9E9E9E",
};

// Gradients - can be used with linear gradient components
const gradients = {
  primaryGradient: ["#3C5CA4", "#264177"],
  successGradient: ["#4CAF50", "#388E3C"],
  warningGradient: ["#FFC107", "#FFA000"],
  errorGradient: ["#FF3B30", "#D32F2F"],
};

// Light theme palette
const lightTheme = {
  // Backgrounds
  background: "#F9FAFC",
  surfacePrimary: "#FFFFFF",
  surfaceSecondary: "#F2F4F7",
  surfaceTertiary: "#EBEEF2",

  // Text
  textPrimary: "#121212",
  textSecondary: "#4A4A4A",
  textTertiary: "#717171",
  textDisabled: "#AEAEAE",
  textInverted: "#FFFFFF",

  // Elements
  divider: "#E5E8EC",
  border: "#D1D5DB",
  borderFocus: brandColors.primary,
  shadow: "rgba(0, 0, 0, 0.1)",

  // Buttons
  buttonPrimary: brandColors.primary,
  buttonSecondary: "#EBEEF2",
  buttonDisabled: "#E0E0E0",

  // Input fields
  inputBackground: "#FFFFFF",
  inputBorder: "#D1D5DB",
  inputBorderFocus: brandColors.primary,
  inputPlaceholder: "#AEAEAE",

  // Icons
  iconPrimary: "#121212",
  iconSecondary: "#717171",
  iconTertiary: "#AEAEAE",
  iconAccent: brandColors.primary,

  // Charts and Data Visualization
  chartPrimary: brandColors.primary,
  chartSecondary: brandColors.secondary,
  chartTertiary: brandColors.tertiary,
  chartSuccess: statusColors.success,
  chartWarning: statusColors.warning,
  chartError: statusColors.error,
  chartGray: "#9E9E9E",

  // Overlay and modal
  overlay: "rgba(0, 0, 0, 0.5)",
  modalBackground: "#FFFFFF",
};

// Dark theme palette
const darkTheme = {
  // Backgrounds
  background: "#121212",
  surfacePrimary: "#1E1E1E",
  surfaceSecondary: "#2C2C2C",
  surfaceTertiary: "#3A3A3A",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#E0E0E0",
  textTertiary: "#A0A0A0",
  textDisabled: "#6C6C6C",
  textInverted: "#121212",

  // Elements
  divider: "#3A3A3A",
  border: "#4A4A4A",
  borderFocus: brandColors.primary,
  shadow: "rgba(0, 0, 0, 0.25)",

  // Buttons
  buttonPrimary: brandColors.primary,
  buttonSecondary: "#3A3A3A",
  buttonDisabled: "#4A4A4A",

  // Input fields
  inputBackground: "#2C2C2C",
  inputBorder: "#4A4A4A",
  inputBorderFocus: brandColors.primary,
  inputPlaceholder: "#6C6C6C",

  // Icons
  iconPrimary: "#FFFFFF",
  iconSecondary: "#A0A0A0",
  iconTertiary: "#6C6C6C",
  iconAccent: brandColors.primary,

  // Charts and Data Visualization
  chartPrimary: brandColors.primary,
  chartSecondary: brandColors.secondary,
  chartTertiary: brandColors.tertiary,
  chartSuccess: statusColors.success,
  chartWarning: statusColors.warning,
  chartError: statusColors.error,
  chartGray: "#9E9E9E",

  // Overlay and modal
  overlay: "rgba(0, 0, 0, 0.75)",
  modalBackground: "#1E1E1E",
};

// Typography - font sizes and weights
const typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
  },
  fontWeights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing system for consistent margins and padding
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 500,
  circle: 9999,
};

// Shadows
const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 10,
  },
};

// Animation durations
const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// For backward compatibility with existing code
const tintColorLight = brandColors.primary;
const tintColorDark = baseColors.white;

export const Colors = {
  light: {
    text: lightTheme.textPrimary,
    background: lightTheme.background,
    tint: tintColorLight,
    icon: lightTheme.iconSecondary,
    tabIconDefault: lightTheme.iconTertiary,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: darkTheme.textPrimary,
    background: darkTheme.background,
    tint: tintColorDark,
    icon: darkTheme.iconSecondary,
    tabIconDefault: darkTheme.iconTertiary,
    tabIconSelected: tintColorDark,
  },
};

// Export the theme function that selects between light and dark mode
export const getTheme = (colorScheme = "light") => {
  const colors = colorScheme === "dark" ? darkTheme : lightTheme;

  return {
    colors,
    brandColors,
    baseColors,
    statusColors,
    gradients,
    typography,
    spacing,
    borderRadius,
    shadows,
    animation,
  };
};

export {
  brandColors,
  baseColors,
  statusColors,
  gradients,
  lightTheme,
  darkTheme,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
};
