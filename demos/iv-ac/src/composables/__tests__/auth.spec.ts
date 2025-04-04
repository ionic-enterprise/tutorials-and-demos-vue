import { useAuth } from '@/composables/auth';
import { useSessionVault } from '@/composables/session-vault';
import { Auth0Provider, AuthConnect } from '@ionic-enterprise/auth';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/composables/session-vault');
vi.mock('@/composables/vault-factory');
vi.mock('@capacitor/preferences');
vi.mock('@ionic-enterprise/auth');
vi.mock('@capacitor/core', async () => {
  const actual = (await vi.importActual('@capacitor/core')) as any;
  return { ...actual, Capacitor: { isNativePlatform: vi.fn().mockReturnValue(true) } };
});

describe('useAuth', () => {
  const refreshedAuthResult = {
    accessToken: 'refreshed-access-token',
    refreshToken: 'refreshed-refresh-token',
    idToken: 'refreshed-id-token',
  };
  const testAuthResult = {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    idToken: 'test-id-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('calls the setup', async () => {
      const { initializeAuth } = useAuth();
      await initializeAuth();
      expect(AuthConnect.setup).toHaveBeenCalledTimes(1);
      expect(AuthConnect.setup).toHaveBeenCalledWith({
        platform: 'capacitor',
        logLevel: 'DEBUG',
        ios: {
          webView: 'private',
        },
        web: {
          uiMode: 'popup',
          authFlow: 'PKCE',
        },
      });
    });
  });

  describe('is authenticated', () => {
    describe('if there is no auth result', () => {
      beforeEach(() => {
        const { getSession } = useSessionVault();
        (getSession as Mock).mockResolvedValue(undefined);
      });

      it('does not check for an expired access token', async () => {
        const { isAuthenticated } = useAuth();
        await isAuthenticated();
        expect(AuthConnect.isAccessTokenExpired).not.toHaveBeenCalled();
      });

      it('resolves false ', async () => {
        const { isAuthenticated } = useAuth();
        expect(await isAuthenticated()).toBe(false);
      });
    });

    describe('if there is an auth result', () => {
      beforeEach(() => {
        const { getSession } = useSessionVault();
        (getSession as Mock).mockResolvedValue(testAuthResult);
      });

      describe('if the access token is not expired', () => {
        beforeEach(() => {
          (AuthConnect.isAccessTokenExpired as Mock).mockResolvedValue(false);
        });

        it('resolves true', async () => {
          const { isAuthenticated } = useAuth();
          expect(await isAuthenticated()).toBe(true);
        });
      });

      describe('if the access token is expired', () => {
        beforeEach(() => {
          (AuthConnect.isAccessTokenExpired as Mock).mockResolvedValue(true);
        });

        describe('if a refresh token exists', () => {
          beforeEach(() => {
            (AuthConnect.isRefreshTokenAvailable as Mock).mockResolvedValue(true);
          });

          it('attempts a refresh', async () => {
            const { isAuthenticated } = useAuth();
            await isAuthenticated();
            expect(AuthConnect.refreshSession).toHaveBeenCalledTimes(1);
            expect(AuthConnect.refreshSession).toHaveBeenCalledWith(expect.any(Auth0Provider), testAuthResult);
          });

          describe('when the refresh is successful', () => {
            beforeEach(() => {
              (AuthConnect.refreshSession as Mock).mockResolvedValue(refreshedAuthResult);
            });

            it('saves the new auth result', async () => {
              const { isAuthenticated } = useAuth();
              const { setSession } = useSessionVault();
              await isAuthenticated();
              expect(setSession).toHaveBeenCalledTimes(1);
              expect(setSession).toHaveBeenCalledWith(refreshedAuthResult);
            });

            it('resolves true', async () => {
              const { isAuthenticated } = useAuth();
              expect(await isAuthenticated()).toBe(true);
            });
          });

          describe('when the refresh fails', () => {
            beforeEach(() => {
              (AuthConnect.refreshSession as Mock).mockRejectedValue(new Error('refresh failed'));
            });

            it('clears the vault', async () => {
              const { isAuthenticated } = useAuth();
              const { clearSession } = useSessionVault();
              await isAuthenticated();
              expect(clearSession).toHaveBeenCalledTimes(1);
            });

            it('resolves false', async () => {
              const { isAuthenticated } = useAuth();
              expect(await isAuthenticated()).toBe(false);
            });
          });
        });

        describe('if a refresh token does not exist', () => {
          beforeEach(() => {
            (AuthConnect.isRefreshTokenAvailable as Mock).mockResolvedValue(false);
          });

          it('it does not attempt a refresh', async () => {
            const { isAuthenticated } = useAuth();
            await isAuthenticated();
            expect(AuthConnect.refreshSession).not.toHaveBeenCalled();
          });

          it('clears the vault', async () => {
            const { isAuthenticated } = useAuth();
            const { clearSession } = useSessionVault();
            await isAuthenticated();
            expect(clearSession).toHaveBeenCalledTimes(1);
          });

          it('resolves false', async () => {
            const { isAuthenticated } = useAuth();
            expect(await isAuthenticated()).toBe(false);
          });
        });
      });
    });
  });

  describe('get access token', () => {
    describe('if there is no auth result', () => {
      beforeEach(() => {
        const { getSession } = useSessionVault();
        (getSession as Mock).mockResolvedValue(undefined);
      });

      it('does not check for an expired access token', async () => {
        const { getAccessToken } = useAuth();
        await getAccessToken();
        expect(AuthConnect.isAccessTokenExpired).not.toHaveBeenCalled();
      });

      it('resolves undefined ', async () => {
        const { getAccessToken } = useAuth();
        expect(await getAccessToken()).toBeUndefined();
      });
    });

    describe('if there is an auth result', () => {
      beforeEach(() => {
        const { getSession } = useSessionVault();
        (getSession as Mock).mockResolvedValue(testAuthResult);
      });

      describe('if the access token is not expired', () => {
        beforeEach(() => {
          (AuthConnect.isAccessTokenExpired as Mock).mockResolvedValue(false);
        });

        it('resolves the access token', async () => {
          const { getAccessToken } = useAuth();
          expect(await getAccessToken()).toBe(testAuthResult.accessToken);
        });
      });

      describe('if the access token is expired', () => {
        beforeEach(() => {
          (AuthConnect.isAccessTokenExpired as Mock).mockResolvedValue(true);
        });

        describe('if a refresh token exists', () => {
          beforeEach(() => {
            (AuthConnect.isRefreshTokenAvailable as Mock).mockResolvedValue(true);
          });

          it('attempts a refresh', async () => {
            const { getAccessToken } = useAuth();
            await getAccessToken();
            expect(AuthConnect.refreshSession).toHaveBeenCalledTimes(1);
            expect(AuthConnect.refreshSession).toHaveBeenCalledWith(expect.any(Auth0Provider), testAuthResult);
          });

          describe('when the refresh is successful', () => {
            beforeEach(() => {
              (AuthConnect.refreshSession as Mock).mockResolvedValue(refreshedAuthResult);
            });

            it('saves the new auth result', async () => {
              const { getAccessToken } = useAuth();
              const { setSession } = useSessionVault();
              await getAccessToken();
              expect(setSession).toHaveBeenCalledTimes(1);
              expect(setSession).toHaveBeenCalledWith(refreshedAuthResult);
            });

            it('resolves the new token', async () => {
              const { getAccessToken } = useAuth();
              expect(await getAccessToken()).toEqual(refreshedAuthResult.accessToken);
            });
          });

          describe('when the refresh fails', () => {
            beforeEach(() => {
              (AuthConnect.refreshSession as Mock).mockRejectedValue(new Error('refresh failed'));
            });

            it('clears the vault', async () => {
              const { getAccessToken } = useAuth();
              const { clearSession } = useSessionVault();
              await getAccessToken();
              expect(clearSession).toHaveBeenCalledTimes(1);
            });

            it('resolves undefined', async () => {
              const { getAccessToken } = useAuth();
              expect(await getAccessToken()).toBeUndefined();
            });
          });
        });

        describe('if a refresh token does not exist', () => {
          beforeEach(() => {
            (AuthConnect.isRefreshTokenAvailable as Mock).mockResolvedValue(false);
          });

          it('it does not attempt a refresh', async () => {
            const { getAccessToken } = useAuth();
            await getAccessToken();
            expect(AuthConnect.refreshSession).not.toHaveBeenCalled();
          });

          it('clears the vault', async () => {
            const { getAccessToken } = useAuth();
            const { clearSession } = useSessionVault();
            await getAccessToken();
            expect(clearSession).toHaveBeenCalledTimes(1);
          });

          it('resolves undefined', async () => {
            const { getAccessToken } = useAuth();
            expect(await getAccessToken()).toBeUndefined();
          });
        });
      });
    });
  });

  describe('login', () => {
    it('performs a login', async () => {
      const { login } = useAuth();
      await login();
      expect(AuthConnect.login).toHaveBeenCalledTimes(1);
      expect(AuthConnect.login).toHaveBeenCalledWith(expect.any(Auth0Provider), {
        audience: 'https://io.ionic.demo.ac',
        clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
        discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
        scope: 'openid email picture profile offline_access',
        redirectUri: 'io.ionic.acdemo://auth-action-complete',
        logoutUrl: 'io.ionic.acdemo://auth-action-complete',
      });
    });

    it('sets the auth result value', async () => {
      const { login } = useAuth();
      const { setSession } = useSessionVault();
      (AuthConnect.login as Mock).mockResolvedValue(testAuthResult);
      await login();
      expect(setSession).toHaveBeenCalledTimes(1);
      expect(setSession).toHaveBeenCalledWith(testAuthResult);
    });
  });

  describe('logout', () => {
    it('gets the current auth result', async () => {
      const { logout } = useAuth();
      const { getSession } = useSessionVault();
      await logout();
      expect(getSession).toHaveBeenCalledTimes(1);
    });

    describe('if there is no auth result', () => {
      beforeEach(() => {
        const { getSession } = useSessionVault();
        (getSession as Mock).mockResolvedValue(undefined);
      });

      it('does not call logout ', async () => {
        const { logout } = useAuth();
        await logout();
        expect(AuthConnect.logout).not.toHaveBeenCalled();
      });
    });

    describe('if there is an auth result', () => {
      beforeEach(() => {
        const { getSession } = useSessionVault();
        (getSession as Mock).mockResolvedValue(testAuthResult);
      });

      it('calls logout ', async () => {
        const { logout } = useAuth();
        await logout();
        expect(AuthConnect.logout).toHaveBeenCalledTimes(1);
        expect(AuthConnect.logout).toHaveBeenCalledWith(expect.any(Auth0Provider), testAuthResult);
      });

      it('clears the auth result', async () => {
        const { logout } = useAuth();
        const { clearSession } = useSessionVault();
        await logout();
        expect(clearSession).toHaveBeenCalledTimes(1);
      });
    });
  });
});
