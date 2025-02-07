import { useAuthentication } from '@/composables/authentication';
import { useSessionVault } from '@/composables/session-vault';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/composables/session-vault');

describe('', () => {
  const { isAuthenticated, login, logout } = useAuthentication();

  describe('login', () => {
    it('stores a fake session', async () => {
      const { storeSession } = useSessionVault();
      await login();
      expect(storeSession).toHaveBeenCalledOnce();
      expect(storeSession).toHaveBeenCalledWith({
        email: 'test@ionic.io',
        firstName: 'Tessa',
        lastName: 'Testsmith',
        accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
        refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
      });
    });
  });

  describe('is authenticated', () => {
    it('gets the currently stored session', async () => {
      const { getSession } = useSessionVault();
      await isAuthenticated();
      expect(getSession).toHaveBeenCalledOnce();
    });

    it('resolves false if there is no session', async () => {
      const { session } = useSessionVault();
      session.value = null;
      await expect(isAuthenticated()).resolves.toBe(false);
    });

    it('resolves true if there is a session', async () => {
      const { session } = useSessionVault();
      session.value = {
        email: 'test@ionic.io',
        firstName: 'Dude',
        lastName: 'Abides',
        accessToken: 'f00fiif93',
        refreshToken: '99r9r328324sndf',
      };
      await expect(isAuthenticated()).resolves.toBe(true);
    });
  });

  describe('logout', () => {
    it('clears the session', async () => {
      const { clearSession } = useSessionVault();
      await logout();
      expect(clearSession).toHaveBeenCalledOnce();
    });
  });
});
