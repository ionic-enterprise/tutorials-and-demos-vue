import { Capacitor } from '@capacitor/core';
import { BrowserVault, Vault } from '@ionic-enterprise/identity-vault';

export const useVaultFactory = () => {
  const createVault = (): Vault | BrowserVault => (Capacitor.isNativePlatform() ? new Vault() : new BrowserVault());

  return { createVault };
};
