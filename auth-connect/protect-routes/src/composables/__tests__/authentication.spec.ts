import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useAuthentication } from '../authentication';
import { AuthConnect } from '@ionic-enterprise/auth';
import { useSession } from '@/composables/session';

vi.mock('@/composables/session');
vi.mock('@ionic-enterprise/auth');

describe('useAuthentication', () => {
  const testAuthResult: any = {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    idToken: 'test-id-token',
  };

  it('runs', () => {
    expect(useAuthentication()).toBeTruthy();
  });

  describe('get access token', async () => {
    it('resolves undefined if the user is not logged in', () => {
      const { getAccessToken } = useAuthentication();
      const { getSession } = useSession();
      (getSession as Mock).mockResolvedValue(null);
      expect(getAccessToken()).resolves.toBeUndefined();
    });

    it('resolves the access token if the user is logged in', () => {
      const { getAccessToken } = useAuthentication();
      const { getSession } = useSession();
      (getSession as Mock).mockResolvedValue(testAuthResult);
      expect(getAccessToken()).resolves.toBe('test-access-token');
    });
  });

  describe('is authenticated', () => {
    it('resolves false if there is no stored auth result', async () => {
      const { isAuthenticated } = useAuthentication();
      const { getSession } = useSession();
      (getSession as Mock).mockResolvedValue(null);
      expect(await isAuthenticated()).toBe(false);
      expect(AuthConnect.isAccessTokenAvailable).not.toHaveBeenCalled();
    });

    it('resolves false if there is a stored auth result but no access token is available', async () => {
      (AuthConnect.isAccessTokenAvailable as Mock).mockResolvedValue(false);
      const { isAuthenticated } = useAuthentication();
      const { getSession } = useSession();
      (getSession as Mock).mockResolvedValue(testAuthResult);
      expect(await isAuthenticated()).toBe(false);
      expect(AuthConnect.isAccessTokenAvailable).toHaveBeenCalledOnce();
      expect(AuthConnect.isAccessTokenAvailable).toHaveBeenCalledWith(testAuthResult);
    });

    it('resolves true if there is a stored auth result with an access token', async () => {
      (AuthConnect.isAccessTokenAvailable as Mock).mockResolvedValue(true);
      const { isAuthenticated } = useAuthentication();
      const { getSession } = useSession();
      (getSession as Mock).mockResolvedValue(testAuthResult);
      expect(await isAuthenticated()).toBe(true);
      expect(AuthConnect.isAccessTokenAvailable).toHaveBeenCalledOnce();
      expect(AuthConnect.isAccessTokenAvailable).toHaveBeenCalledWith(testAuthResult);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      (AuthConnect.login as Mock).mockResolvedValue(testAuthResult);
    });
    it('calls the login', async () => {
      const { login } = useAuthentication();
      await login();
      expect(AuthConnect.login).toHaveBeenCalledOnce();
    });

    it('saves the result of the login', async () => {
      const { setSession } = useSession();
      const { login } = useAuthentication();
      await login();
      expect(setSession).toHaveBeenCalledOnce();
      expect(setSession).toHaveBeenCalledWith(testAuthResult);
    });
  });

  describe('logout', () => {
    describe('when authenticated', () => {
      beforeEach(() => {
        const { getSession } = useSession();
        (getSession as Mock).mockResolvedValue(testAuthResult);
      });

      it('calls the logout', async () => {
        const { logout } = useAuthentication();
        await logout();
        expect(AuthConnect.logout).toHaveBeenCalledOnce();
      });

      it('clears the session', async () => {
        const { clearSession } = useSession();
        const { logout } = useAuthentication();
        await logout();
        expect(clearSession).toHaveBeenCalledOnce();
      });
    });

    describe('when not authenticated', () => {
      beforeEach(() => {
        const { getSession } = useSession();
        (getSession as Mock).mockResolvedValue(null);
      });

      it('does nothing', async () => {
        const { clearSession } = useSession();
        const { logout } = useAuthentication();
        await logout();
        expect(AuthConnect.logout).not.toHaveBeenCalled();
        expect(clearSession).not.toHaveBeenCalled();
      });
    });
  });
});
