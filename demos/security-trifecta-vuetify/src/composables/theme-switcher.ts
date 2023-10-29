import { useStorage } from '@/composables/storage';
import { useTheme } from 'vuetify/lib/framework.mjs';

const dark = 'dark';
const light = 'light';

export const useThemeSwitcher = () => {
  const theme = useTheme();

  return {
    load: async () => {
      const { getValue } = useStorage();
      const prefTheme = (await getValue('theme')) || light;
      theme.global.name.value = prefTheme;
    },

    toggle: async () => {
      const { setValue } = useStorage();
      theme.global.name.value = theme.global.name.value === light ? dark : light;
      await setValue('theme', theme.global.name.value);
    },
  };
};
