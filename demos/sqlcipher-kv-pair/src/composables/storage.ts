import { Capacitor } from '@capacitor/core';
import { useWebKVStore } from './web-kv-store';
import { useMobileKVStore } from './mobile-kv-store';

export const useStorage = () => {
  const isMobile = Capacitor.isNativePlatform();

  if (isMobile) {
    return useMobileKVStore();
  } else {
    return useWebKVStore();
  }
};
