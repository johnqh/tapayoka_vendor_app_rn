import { useTheme } from '@react-navigation/native';
import { lightAppColors, darkAppColors } from '@/config/theme';
import type { AppColors } from '@/config/theme';

export function useAppColors(): AppColors {
  const { dark } = useTheme();
  return dark ? darkAppColors : lightAppColors;
}
