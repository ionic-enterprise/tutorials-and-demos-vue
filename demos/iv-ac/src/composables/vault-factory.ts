import { BrowserVault, Vault } from '@ionic-enterprise/identity-vault';
import { isPlatform } from '@ionic/vue';

export const useVaultFactory = (): any => {
  const createVault = (): Vault | BrowserVault => (isPlatform('hybrid') ? new Vault() : new BrowserVault());

  return { createVault };
};
