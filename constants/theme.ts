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

// Extended brand colors with additional shades
const brandColors = {
  primary: "#3C5CA4", // AWOKE blue - main brand color
  primaryLight: "#5B78BA", // Lighter blue for hover states
  primaryDark: "#2A4681", // Darker blue for pressed states
  secondary: "#F47920", // Orange accent
  secondaryLight: "#FF934E", // Lighter orange
  secondaryDark: "#D15E0A", // Darker orange
  tertiary: "#265C42", // Green accent
  tertiaryLight: "#377A5C", // Lighter green
  tertiaryDark: "#1A4430", // Darker green
};

// Base colors for light and dark mode with additional transparency options
const baseColors = {
  white: "#FFFFFF",
  black: "#000000",
  transparentBlack: "rgba(0, 0, 0, 0.7)",
  transparentWhite: "rgba(255, 255, 255, 0.7)",
  transparentBlackLight: "rgba(0, 0, 0, 0.3)",
  transparentBlackMedium: "rgba(0, 0, 0, 0.5)",
  transparentWhiteLight: "rgba(255, 255, 255, 0.3)",
  transparentWhiteMedium: "rgba(255, 255, 255, 0.5)",
};

// Enhanced status/feedback colors with additional shades and backgrounds
const statusColors = {
  // Success colors
  success: "#4CAF50",
  successLight: "#81C784",
  successDark: "#388E3C",
  successBackground: "#E8F5E9",
  successBackgroundDark: "#1B3720",
  successBorder: "#C8E6C9",
  successBorderDark: "#2E7D32",
  successText: "#1B5E20",
  successTextDark: "#A5D6A7",

  // Warning colors
  warning: "#FFC107",
  warningLight: "#FFD54F",
  warningDark: "#FFA000",
  warningBackground: "#FFF8E1",
  warningBackgroundDark: "#33290D",
  warningBorder: "#FFECB3",
  warningBorderDark: "#FFB300",
  warningText: "#7A5800",
  warningTextDark: "#FFE082",

  // Error colors
  error: "#FF3B30",
  errorLight: "#FF6B6B",
  errorDark: "#D32F2F",
  errorBackground: "#FFEBEE",
  errorBackgroundDark: "#331515",
  errorBorder: "#FFCDD2",
  errorBorderDark: "#C62828",
  errorText: "#B71C1C",
  errorTextDark: "#EF9A9A",

  // Info colors
  info: "#2196F3",
  infoLight: "#64B5F6",
  infoDark: "#1976D2",
  infoBackground: "#E3F2FD",
  infoBackgroundDark: "#0D253A",
  infoBorder: "#BBDEFB",
  infoBorderDark: "#1565C0",
  infoText: "#0D47A1",
  infoTextDark: "#90CAF9",

  // Pending/neutral colors
  pending: "#9E9E9E",
  pendingLight: "#BDBDBD",
  pendingDark: "#757575",
  pendingBackground: "#F5F5F5",
  pendingBackgroundDark: "#292929",
  pendingBorder: "#E0E0E0",
  pendingBorderDark: "#616161",
  pendingText: "#424242",
  pendingTextDark: "#E0E0E0",
};

// Enhanced gradients collection
const gradients = {
  primaryGradient: ["#3C5CA4", "#264177"],
  primaryGradientAlt: ["#5B78BA", "#3C5CA4"],
  secondaryGradient: ["#F47920", "#D15E0A"],
  tertiaryGradient: ["#377A5C", "#1A4430"],
  successGradient: ["#4CAF50", "#388E3C"],
  warningGradient: ["#FFC107", "#FFA000"],
  errorGradient: ["#FF3B30", "#D32F2F"],
  infoGradient: ["#2196F3", "#1976D2"],
  darkGradient: ["#2C2C2C", "#121212"],
  lightGradient: ["#FFFFFF", "#F2F4F7"],
};

// Enhanced light theme palette
const lightTheme = {
  // Backgrounds with more variation
  background: "#F9FAFC",
  backgroundAlt: "#F0F2F5",
  surfacePrimary: "#FFFFFF",
  surfaceSecondary: "#F2F4F7",
  surfaceTertiary: "#EBEEF2",
  surfaceAccent: "#EFF3FF", // Light blue tint for accent surfaces

  // Text with more variation
  textPrimary: "#121212",
  textSecondary: "#4A4A4A",
  textTertiary: "#717171",
  textDisabled: "#AEAEAE",
  textInverted: "#FFFFFF",
  textAccent: brandColors.primary,
  textLink: "#0066CC",
  textLinkHover: "#004D99",

  // Elements with more variety
  divider: "#E5E8EC",
  dividerStrong: "#D1D5DB",
  border: "#D1D5DB",
  borderLight: "#E5E8EC",
  borderFocus: brandColors.primary,
  shadow: "rgba(0, 0, 0, 0.1)",
  shadowStrong: "rgba(0, 0, 0, 0.2)",

  // Enhanced buttons
  buttonPrimary: brandColors.primary,
  buttonPrimaryHover: brandColors.primaryLight,
  buttonPrimaryPressed: brandColors.primaryDark,
  buttonSecondary: "#EBEEF2",
  buttonSecondaryHover: "#D9DEE6",
  buttonSecondaryPressed: "#C7CCD4",
  buttonTertiary: "transparent",
  buttonDisabled: "#E0E0E0",
  buttonTextDisabled: "#9E9E9E",

  // Status buttons
  buttonSuccess: statusColors.success,
  buttonSuccessHover: statusColors.successLight,
  buttonSuccessPressed: statusColors.successDark,
  buttonWarning: statusColors.warning,
  buttonWarningHover: statusColors.warningLight,
  buttonWarningPressed: statusColors.warningDark,
  buttonError: statusColors.error,
  buttonErrorHover: statusColors.errorLight,
  buttonErrorPressed: statusColors.errorDark,
  buttonInfo: statusColors.info,
  buttonInfoHover: statusColors.infoLight,
  buttonInfoPressed: statusColors.infoDark,

  // Enhanced input fields
  inputBackground: "#FFFFFF",
  inputBackgroundFocused: "#F9FAFC",
  inputBorder: "#D1D5DB",
  inputBorderHover: "#B1B5BB",
  inputBorderFocus: brandColors.primary,
  inputPlaceholder: "#AEAEAE",
  inputDisabled: "#F2F4F7",

  // Status inputs
  inputErrorBorder: statusColors.error,
  inputErrorBackground: statusColors.errorBackground,
  inputSuccessBorder: statusColors.success,
  inputSuccessBackground: statusColors.successBackground,
  inputWarningBorder: statusColors.warning,
  inputWarningBackground: statusColors.warningBackground,

  // Enhanced icons
  iconPrimary: "#121212",
  iconSecondary: "#717171",
  iconTertiary: "#AEAEAE",
  iconAccent: brandColors.primary,
  iconSuccess: statusColors.success,
  iconWarning: statusColors.warning,
  iconError: statusColors.error,
  iconInfo: statusColors.info,

  // Enhanced Charts and Data Visualization
  chartPrimary: brandColors.primary,
  chartSecondary: brandColors.secondary,
  chartTertiary: brandColors.tertiary,
  chartSuccess: statusColors.success,
  chartWarning: statusColors.warning,
  chartError: statusColors.error,
  chartInfo: statusColors.info,
  chartGray: "#9E9E9E",
  chartLightGray: "#BDBDBD",
  chartBackground: "#F9FAFC",
  chartGrid: "#E5E8EC",
  chartLabel: "#717171",

  // Enhanced overlay and modal
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
  modalBackground: "#FFFFFF",
  modalShadow: "rgba(0, 0, 0, 0.15)",

  // Highlights and selections
  highlight: "rgba(60, 92, 164, 0.1)", // Light blue based on primary
  selection: "rgba(60, 92, 164, 0.2)", // Slightly stronger highlight

  // Toggle and checkbox
  switchTrackOff: "#D1D5DB",
  switchTrackOn: "rgba(60, 92, 164, 0.5)",
  switchThumbOff: "#FFFFFF",
  switchThumbOn: brandColors.primary,
  checkboxBorder: "#D1D5DB",
  checkboxFill: brandColors.primary,

  // Status surfaces and elements
  surfaceSuccess: statusColors.successBackground,
  surfaceWarning: statusColors.warningBackground,
  surfaceError: statusColors.errorBackground,
  surfaceInfo: statusColors.infoBackground,
  borderSuccess: statusColors.successBorder,
  borderWarning: statusColors.warningBorder,
  borderError: statusColors.errorBorder,
  borderInfo: statusColors.infoBorder,
  textSuccess: statusColors.successText,
  textWarning: statusColors.warningText,
  textError: statusColors.errorText,
  textInfo: statusColors.infoText,

  // Alert and notification styles
  alertSuccessBackground: statusColors.successBackground,
  alertSuccessBorder: statusColors.successBorder,
  alertSuccessIcon: statusColors.success,
  alertSuccessText: statusColors.successText,

  alertWarningBackground: statusColors.warningBackground,
  alertWarningBorder: statusColors.warningBorder,
  alertWarningIcon: statusColors.warning,
  alertWarningText: statusColors.warningText,

  alertErrorBackground: statusColors.errorBackground,
  alertErrorBorder: statusColors.errorBorder,
  alertErrorIcon: statusColors.error,
  alertErrorText: statusColors.errorText,

  alertInfoBackground: statusColors.infoBackground,
  alertInfoBorder: statusColors.infoBorder,
  alertInfoIcon: statusColors.info,
  alertInfoText: statusColors.infoText,

  // Toast notification styles
  toastSuccessBackground: statusColors.success,
  toastWarningBackground: statusColors.warning,
  toastErrorBackground: statusColors.error,
  toastInfoBackground: statusColors.info,
  toastText: "#FFFFFF",
};

// Enhanced dark theme palette
const darkTheme = {
  // Enhanced backgrounds
  background: "#121212",
  backgroundAlt: "#1A1A1A",
  surfacePrimary: "#1E1E1E",
  surfaceSecondary: "#2C2C2C",
  surfaceTertiary: "#3A3A3A",
  surfaceAccent: "#283552", // Dark blue tint for accent surfaces

  // Enhanced text
  textPrimary: "#FFFFFF",
  textSecondary: "#E0E0E0",
  textTertiary: "#A0A0A0",
  textDisabled: "#6C6C6C",
  textInverted: "#121212",
  textAccent: "#7B96D7", // Lighter shade of primary for better contrast on dark
  textLink: "#78AEFF",
  textLinkHover: "#99C1FF",

  // Enhanced elements
  divider: "#3A3A3A",
  dividerStrong: "#4A4A4A",
  border: "#4A4A4A",
  borderLight: "#3A3A3A",
  borderFocus: "#7B96D7", // Lighter blue for focus state
  shadow: "rgba(0, 0, 0, 0.25)",
  shadowStrong: "rgba(0, 0, 0, 0.4)",

  // Enhanced buttons
  buttonPrimary: "#5B78BA", // Lighter blue for better visibility
  buttonPrimaryHover: "#7B96D7",
  buttonPrimaryPressed: "#3C5CA4",
  buttonSecondary: "#3A3A3A",
  buttonSecondaryHover: "#4A4A4A",
  buttonSecondaryPressed: "#2C2C2C",
  buttonTertiary: "transparent",
  buttonDisabled: "#4A4A4A",
  buttonTextDisabled: "#6C6C6C",

  // Status buttons
  buttonSuccess: statusColors.successLight,
  buttonSuccessHover: statusColors.success,
  buttonSuccessPressed: statusColors.successDark,
  buttonWarning: statusColors.warningLight,
  buttonWarningHover: statusColors.warning,
  buttonWarningPressed: statusColors.warningDark,
  buttonError: statusColors.errorLight,
  buttonErrorHover: statusColors.error,
  buttonErrorPressed: statusColors.errorDark,
  buttonInfo: statusColors.infoLight,
  buttonInfoHover: statusColors.info,
  buttonInfoPressed: statusColors.infoDark,

  // Enhanced input fields
  inputBackground: "#2C2C2C",
  inputBackgroundFocused: "#3A3A3A",
  inputBorder: "#4A4A4A",
  inputBorderHover: "#5A5A5A",
  inputBorderFocus: "#7B96D7", // Lighter blue for focus
  inputPlaceholder: "#6C6C6C",
  inputDisabled: "#1E1E1E",

  // Status inputs
  inputErrorBorder: statusColors.errorLight,
  inputErrorBackground: statusColors.errorBackgroundDark,
  inputSuccessBorder: statusColors.successLight,
  inputSuccessBackground: statusColors.successBackgroundDark,
  inputWarningBorder: statusColors.warningLight,
  inputWarningBackground: statusColors.warningBackgroundDark,

  // Enhanced icons
  iconPrimary: "#FFFFFF",
  iconSecondary: "#A0A0A0",
  iconTertiary: "#6C6C6C",
  iconAccent: "#7B96D7", // Lighter blue for better visibility
  iconSuccess: statusColors.successLight,
  iconWarning: statusColors.warningLight,
  iconError: statusColors.errorLight,
  iconInfo: statusColors.infoLight,

  // Enhanced Charts and Data Visualization
  chartPrimary: "#7B96D7", // Lighter blue for better visibility
  chartSecondary: "#FF934E", // Lighter orange
  chartTertiary: "#377A5C", // Lighter green
  chartSuccess: statusColors.successLight,
  chartWarning: statusColors.warningLight,
  chartError: statusColors.errorLight,
  chartInfo: statusColors.infoLight,
  chartGray: "#A0A0A0",
  chartLightGray: "#6C6C6C",
  chartBackground: "#1E1E1E",
  chartGrid: "#3A3A3A",
  chartLabel: "#E0E0E0",

  // Enhanced overlay and modal
  overlay: "rgba(0, 0, 0, 0.75)",
  overlayLight: "rgba(0, 0, 0, 0.5)",
  modalBackground: "#1E1E1E",
  modalShadow: "rgba(0, 0, 0, 0.4)",

  // Highlights and selections
  highlight: "rgba(123, 150, 215, 0.2)", // Subtle highlight for dark mode
  selection: "rgba(123, 150, 215, 0.3)", // Selection color

  // Toggle and checkbox
  switchTrackOff: "#4A4A4A",
  switchTrackOn: "rgba(123, 150, 215, 0.5)",
  switchThumbOff: "#A0A0A0",
  switchThumbOn: "#7B96D7", // Lighter blue for better visibility
  checkboxBorder: "#4A4A4A",
  checkboxFill: "#7B96D7", // Lighter blue for better visibility

  // Status surfaces and elements
  surfaceSuccess: statusColors.successBackgroundDark,
  surfaceWarning: statusColors.warningBackgroundDark,
  surfaceError: statusColors.errorBackgroundDark,
  surfaceInfo: statusColors.infoBackgroundDark,
  borderSuccess: statusColors.successBorderDark,
  borderWarning: statusColors.warningBorderDark,
  borderError: statusColors.errorBorderDark,
  borderInfo: statusColors.infoBorderDark,
  textSuccess: statusColors.successTextDark,
  textWarning: statusColors.warningTextDark,
  textError: statusColors.errorTextDark,
  textInfo: statusColors.infoTextDark,

  // Alert and notification styles
  alertSuccessBackground: statusColors.successBackgroundDark,
  alertSuccessBorder: statusColors.successBorderDark,
  alertSuccessIcon: statusColors.successLight,
  alertSuccessText: statusColors.successTextDark,

  alertWarningBackground: statusColors.warningBackgroundDark,
  alertWarningBorder: statusColors.warningBorderDark,
  alertWarningIcon: statusColors.warningLight,
  alertWarningText: statusColors.warningTextDark,

  alertErrorBackground: statusColors.errorBackgroundDark,
  alertErrorBorder: statusColors.errorBorderDark,
  alertErrorIcon: statusColors.errorLight,
  alertErrorText: statusColors.errorTextDark,

  alertInfoBackground: statusColors.infoBackgroundDark,
  alertInfoBorder: statusColors.infoBorderDark,
  alertInfoIcon: statusColors.infoLight,
  alertInfoText: statusColors.infoTextDark,

  // Toast notification styles
  toastSuccessBackground: statusColors.successDark,
  toastWarningBackground: statusColors.warningDark,
  toastErrorBackground: statusColors.errorDark,
  toastInfoBackground: statusColors.infoDark,
  toastText: "#FFFFFF",
};

// Typography - enhanced with more options
const typography = {
  fontFamily: {
    primary: "System",
    monospace: "Menlo",
  },
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
    display1: 36,
    display2: 32,
    caption: 11,
  },
  fontWeights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extraBold: "800",
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    extraWide: 1,
  },
};

// Enhanced spacing system
const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Enhanced border radius
const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 500,
  circle: 9999,
};

// Enhanced shadows
const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
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
  xxl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 15,
  },
  inner: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

// Enhanced animation durations and easing
const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  extraSlow: 600,
  easing: {
    default: "cubic-bezier(0.4, 0.0, 0.2, 1)",
    accelerate: "cubic-bezier(0.4, 0.0, 1, 1)",
    decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)",
    sharp: "cubic-bezier(0.4, 0.0, 0.6, 1)",
  },
};

// Z-index system
const zIndex = {
  base: 0,
  above: 1,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  drawer: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
};

// Media query breakpoints
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
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
    zIndex,
    breakpoints,
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
  zIndex,
  breakpoints,
};
