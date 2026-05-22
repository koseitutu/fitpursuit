import { Colors, ThemeColors } from "@/constants/Colors";
import { useAppStore } from "@/store/useAppStore";

interface UseThemeReturn {
  colors: ThemeColors;
  isDark: boolean;
  toggle: () => void;
}

export function useTheme(): UseThemeReturn {
  const themeMode = useAppStore((state) => state.themeMode);
  const toggle = useAppStore((state) => state.toggleTheme);

  const isDark = themeMode === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  return { colors, isDark, toggle };
}
