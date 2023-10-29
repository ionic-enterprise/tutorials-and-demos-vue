import { Capacitor } from '@capacitor/core';
import { BrowserVault, IdentityVaultConfig, Vault } from '@ionic-enterprise/identity-vault';

export const useVaultFactory = () => {
  const createVault = (config: IdentityVaultConfig): Vault | BrowserVault =>
    Capacitor.isNativePlatform() ? new Vault(config) : new BrowserVault({ ...config, unlockVaultOnLoad: true });

  return { createVault };
};
