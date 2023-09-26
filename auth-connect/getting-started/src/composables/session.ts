import { Preferences } from '@capacitor/preferences';
import { AuthResult } from '@ionic-enterprise/auth';

const key = 'session';

export const useSession = () => ({
  clearSession: (): Promise<void> => {
    return Preferences.remove({ key });
  },
  getSession: async (): Promise<AuthResult | null> => {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  },
  setSession: (value: AuthResult): Promise<void> => {
    return Preferences.set({ key, value: JSON.stringify(value) });
  },
});
