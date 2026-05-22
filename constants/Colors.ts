const shared = {
  primary: "#00E5FF",
  accent: "#FF6B35",
  success: "#00C896",
  error: "#FF4757",
  warning: "#FFD93D",
};

const dark = {
  ...shared,
  background: "#0A0E1A",
  surface: "#141824",
  textPrimary: "#FFFFFF",
  textSecondary: "#8A8FA8",
  border: "#1E2438",
};

const light = {
  ...shared,
  background: "#F5F7FA",
  surface: "#FFFFFF",
  textPrimary: "#1A1D2E",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
};

export const Colors = {
  dark,
  light,
  shared,
} as const;

export type ThemeColors = typeof dark;
