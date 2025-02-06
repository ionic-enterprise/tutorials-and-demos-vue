import { Capacitor } from '@capacitor/core';
import { useWebKVStore } from './web-kv-store';
import { useMobileKVStore } from './mobile-kv-store';

export const useInboxStorage = () => {
  const isMobile = Capacitor.isNativePlatform();

  if (isMobile) {
    return useMobileKVStore('inbox');
  } else {
    return useWebKVStore('inbox');
  }
};
