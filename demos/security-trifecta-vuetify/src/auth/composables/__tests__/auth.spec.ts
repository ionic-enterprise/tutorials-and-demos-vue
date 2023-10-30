import { useSessionVault } from '@/composables/session-vault';
import { Capacitor } from '@capacitor/core';
import { Auth0Provider, AuthConnect, TokenType } from '@ionic-enterprise/auth';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../auth';

vi.mock('@capacitor/core');
vi.mock('@ionic-enterprise/auth');
vi.mock('@/composables/session-vault');
vi.mock('@/composables/vault-factory');

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
    Capacitor.getPlatform = vi.fn().mockReturnValue('iOS');
  });

  it('initializes once', async () => {
    const { isAuthenticated, login, logout } = useAuth();
    await isAuthenticated();
    await login();
    await isAuthenticated();
    await logout();
    expect(AuthConnect.setup).toHaveBeenCalledTimes(1);
    expect(AuthConnect.setup).toHaveBeenCalledWith({
      platform: 'capacitor',
      logLevel: 'DEBUG',
      ios: {
        webView: 'private',
      },
      web: {
        uiMode: 'popup',
        authFlow: 'implicit',
      },
    });
  });

  describe('is authenticated', () => {
    describe('if there is no auth result', () => {
      beforeEach(() => {
        const { getValue } = useSessionVault();
        (getValue as Mock).mockResolvedValue(undefined);
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
        const { getValue } = useSessionVault();
        (getValue as Mock).mockResolvedValue(testAuthResult);
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
              const { setValue } = useSessionVault();
              await isAuthenticated();
              expect(setValue).toHaveBeenCalledTimes(1);
              expect(setValue).toHaveBeenCalledWith('auth-result', refreshedAuthResult);
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
              const { clear } = useSessionVault();
              await isAuthenticated();
              expect(clear).toHaveBeenCalledTimes(1);
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
            const { clear } = useSessionVault();
            await isAuthenticated();
            expect(clear).toHaveBeenCalledTimes(1);
          });

          it('resolves false', async () => {
            const { isAuthenticated } = useAuth();
            expect(await isAuthenticated()).toBe(false);
          });
        });
      });
    });
  });

  describe('get user email', () => {
    beforeEach(() => {
      (AuthConnect.decodeToken as Mock).mockResolvedValue({ email: 'test@testy.com' });
    });

    it('gets the auth result', async () => {
      const { getValue } = useSessionVault();
      const { getUserEmail } = useAuth();
      await getUserEmail();
      expect(getValue).toHaveBeenCalledTimes(1);
    });

    describe('when there is no auth result', () => {
      beforeEach(() => {
        const { getValue } = useSessionVault();
        (getValue as Mock).mockResolvedValue(undefined);
      });

      it('resolves undefined', async () => {
        const { getUserEmail } = useAuth();
        expect(await getUserEmail()).toBeUndefined();
      });
    });

    describe('when there is an auth result', () => {
      beforeEach(() => {
        const { getValue } = useSessionVault();
        (getValue as Mock).mockResolvedValue({ name: 'this is an auth result (not really)' });
      });

      it('calls the decodeToken', async () => {
        const { getUserEmail } = useAuth();
        await getUserEmail();
        expect(AuthConnect.decodeToken).toHaveBeenCalledTimes(1);
        expect(AuthConnect.decodeToken).toHaveBeenCalledWith(TokenType.id, {
          name: 'this is an auth result (not really)',
        });
      });

      it('resolves the email value', async () => {
        const { getUserEmail } = useAuth();
        expect(await getUserEmail()).toEqual('test@testy.com');
      });
    });
  });

  describe('get access token', () => {
    describe('if there is no auth result', () => {
      beforeEach(() => {
        const { getValue } = useSessionVault();
        (getValue as Mock).mockResolvedValue(undefined);
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
        const { getValue } = useSessionVault();
        (getValue as Mock).mockResolvedValue(testAuthResult);
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
              const { setValue } = useSessionVault();
              await getAccessToken();
              expect(setValue).toHaveBeenCalledTimes(1);
              expect(setValue).toHaveBeenCalledWith('auth-result', refreshedAuthResult);
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
              const { clear } = useSessionVault();
              await getAccessToken();
              expect(clear).toHaveBeenCalledTimes(1);
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
            const { clear } = useSessionVault();
            await getAccessToken();
            expect(clear).toHaveBeenCalledTimes(1);
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
        redirectUri: 'msauth://auth-action-complete',
        logoutUrl: 'msauth://auth-action-complete',
      });
    });

    it('sets the auth result value', async () => {
      const { login } = useAuth();
      const { setValue } = useSessionVault();
      (AuthConnect.login as Mock).mockResolvedValue(testAuthResult);
      await login();
      expect(setValue).toHaveBeenCalledTimes(1);
      expect(setValue).toHaveBeenCalledWith('auth-result', testAuthResult);
    });
  });

  describe('logout', () => {
    it('gets the current auth result', async () => {
      const { logout } = useAuth();
      const { getValue } = useSessionVault();
      await logout();
      expect(getValue).toHaveBeenCalledTimes(1);
      expect(getValue).toHaveBeenCalledWith('auth-result');
    });

    describe('if there is no auth result', () => {
      beforeEach(() => {
        const { getValue } = useSessionVault();
        (getValue as Mock).mockResolvedValue(undefined);
      });

      it('does not call logout ', async () => {
        const { logout } = useAuth();
        await logout();
        expect(AuthConnect.logout).not.toHaveBeenCalled();
      });
    });

    describe('if there is an auth result', () => {
      beforeEach(() => {
        const { getValue } = useSessionVault();
        (getValue as Mock).mockResolvedValue(testAuthResult);
      });

      it('does not call logout ', async () => {
        const { logout } = useAuth();
        await logout();
        expect(AuthConnect.logout).toHaveBeenCalledTimes(1);
        expect(AuthConnect.logout).toHaveBeenCalledWith(expect.any(Auth0Provider), testAuthResult);
      });

      it('clears the auth result', async () => {
        const { logout } = useAuth();
        const { clear } = useSessionVault();
        await logout();
        expect(clear).toHaveBeenCalledTimes(1);
      });
    });
  });
});
