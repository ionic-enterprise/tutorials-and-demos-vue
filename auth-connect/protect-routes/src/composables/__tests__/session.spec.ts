import { GetOptions, Preferences } from '@capacitor/preferences';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSession } from '@/composables/session';

vi.mock('@capacitor/preferences');

describe('useSession', () => {
  const testAuthResult: any = {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    idToken: 'test-id-token',
  };

  it('runs', () => {
    expect(useSession()).toBeTruthy();
  });

  describe('clearSession', () => {
    it('removes the session', async () => {
      const { clearSession } = useSession();
      await clearSession();
      expect(Preferences.remove).toHaveBeenCalledOnce();
      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'session' });
    });
  });

  describe('get session', () => {
    beforeEach(() => {
      (Preferences.get as Mock).mockImplementation(async (opt: GetOptions) => {
        let value = null;
        switch (opt.key) {
          case 'session':
            value = JSON.stringify(testAuthResult);
            break;
          default:
            value = null;
        }
        return Promise.resolve({ value });
      });
    });

    it('gets the session', async () => {
      const { getSession } = useSession();
      await getSession();
      expect(Preferences.get).toHaveBeenCalledOnce();
      expect(Preferences.get).toHaveBeenCalledWith({ key: 'session' });
    });

    it('resolves the session', async () => {
      const { getSession } = useSession();
      expect(await getSession()).toEqual(testAuthResult);
    });

    it('handles the session not being set', async () => {
      (Preferences.get as Mock).mockResolvedValue({ value: null });
      const { getSession } = useSession();
      expect(await getSession()).toEqual(null);
    });
  });

  describe('set session', () => {
    it('sets the session', async () => {
      const { setSession } = useSession();
      await setSession(testAuthResult);
      expect(Preferences.set).toHaveBeenCalledOnce();
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'session', value: JSON.stringify(testAuthResult) });
    });
  });
});
