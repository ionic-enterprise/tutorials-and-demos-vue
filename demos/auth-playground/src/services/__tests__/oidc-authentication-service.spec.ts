import { AuthVendor } from '@/models';
import { OIDCAuthenticationService } from '@/services';
import { Auth0Provider, AuthConnect, AzureProvider, CognitoProvider, ProviderOptions } from '@ionic-enterprise/auth';
import { useSessionVault } from '@/composables/session-vault';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@ionic-enterprise/auth');
vi.mock('@ionic/vue', async () => {
  const actual = (await vi.importActual('@ionic/vue')) as any;
  return { ...actual, isPlatform: vi.fn().mockReturnValue(true) };
});
vi.mock('@/composables/session-vault');
vi.mock('@/composables/vault-factory');

describe.each([['Auth0'], ['AWS'], ['Azure']])('Authentication Service for %s', (vendor: string) => {
  let authService: OIDCAuthenticationService;
  let expectedOptions: ProviderOptions;
  let expectedProviderType: typeof Auth0Provider | typeof AzureProvider | typeof CognitoProvider;

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

  const builtAuthResult = {
    accessToken: 'built-access-token',
    refreshToken: 'built-refresh-token',
    idToken: 'built-id-token',
  };

  const auth0Options: ProviderOptions = {
    audience: 'https://io.ionic.demo.ac',
    clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
    discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
    logoutUrl: 'msauth://auth-action-complete',
    redirectUri: 'msauth://auth-action-complete',
    scope: 'openid email picture profile offline_access',
  };

  const cognitoOptions: ProviderOptions = {
    clientId: '64p9c53l5thd5dikra675suvq9',
    discoveryUrl: 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_YU8VQe29z/.well-known/openid-configuration',
    logoutUrl: 'msauth://auth-action-complete',
    redirectUri: 'msauth://auth-action-complete',
    scope: 'openid email profile',
    audience: '',
  };

  const azureOptions: ProviderOptions = {
    clientId: 'ed8cb65d-7bb2-4107-bc36-557fb680b994',
    scope:
      'openid offline_access email profile https://dtjacdemo.onmicrosoft.com/ed8cb65d-7bb2-4107-bc36-557fb680b994/demo.read',
    discoveryUrl:
      'https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_acdemo2',
    redirectUri: 'msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D',
    logoutUrl: 'msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D',
    audience: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new OIDCAuthenticationService();
    authService.setAuthProvider(vendor as AuthVendor);
    if (vendor === 'Auth0') {
      expectedOptions = auth0Options;
      expectedProviderType = Auth0Provider;
    } else if (vendor === 'AWS') {
      expectedOptions = cognitoOptions;
      expectedProviderType = CognitoProvider;
    } else {
      expectedOptions = azureOptions;
      expectedProviderType = AzureProvider;
    }
  });

  it('performs initialization exactly once', async () => {
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
    await authService.login();
    await authService.isAuthenticated();
    await authService.getAccessToken();
    await authService.logout();
    expect(AuthConnect.setup).toHaveBeenCalledTimes(1);
  });

  describe('login', () => {
    it('calls the auth connect login', async () => {
      await authService.login();
      expect(AuthConnect.login).toHaveBeenCalledTimes(1);
      expect(AuthConnect.login).toHaveBeenCalledWith(expect.any(expectedProviderType), expectedOptions);
    });

    it('saves the auth result', async () => {
      const { setValue } = useSessionVault();
      (AuthConnect.login as Mock).mockResolvedValue(testAuthResult);
      await authService.login();
      expect(setValue).toHaveBeenCalledTimes(1);
      expect(setValue).toHaveBeenCalledWith('auth-result', testAuthResult);
    });
  });

  describe('get access token', () => {
    describe('if there is no auth result', () => {
      beforeEach(() => {
        const { getValue } = useSessionVault();
        (getValue as Mock).mockResolvedValue(undefined);
      });

      it('does not check for an expired access token', async () => {
        await authService.getAccessToken();
        expect(AuthConnect.isAccessTokenExpired).not.toHaveBeenCalled();
      });

      it('resolves undefined ', async () => {
        expect(await authService.getAccessToken()).toBeUndefined();
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
          expect(await authService.getAccessToken()).toBe(testAuthResult.accessToken);
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
            await authService.getAccessToken();
            expect(AuthConnect.refreshSession).toHaveBeenCalledTimes(1);
            expect(AuthConnect.refreshSession).toHaveBeenCalledWith(expect.any(expectedProviderType), testAuthResult);
          });

          describe('when the refresh is successful', () => {
            beforeEach(() => {
              (AuthConnect.refreshSession as Mock).mockResolvedValue(refreshedAuthResult);
            });

            it('saves the new auth result', async () => {
              const { setValue } = useSessionVault();
              await authService.getAccessToken();
              expect(setValue).toHaveBeenCalledTimes(1);
              expect(setValue).toHaveBeenCalledWith('auth-result', refreshedAuthResult);
            });

            it('resolves the new token', async () => {
              expect(await authService.getAccessToken()).toEqual(refreshedAuthResult.accessToken);
            });
          });

          describe('when the refresh fails', () => {
            beforeEach(() => {
              (AuthConnect.refreshSession as Mock).mockRejectedValue(new Error('refresh failed'));
            });

            it('clears the vault', async () => {
              const { clear } = useSessionVault();
              await authService.getAccessToken();
              expect(clear).toHaveBeenCalledTimes(1);
            });

            it('resolves undefined', async () => {
              expect(await authService.getAccessToken()).toBeUndefined();
            });
          });
        });

        describe('if a refresh token does not exist', () => {
          beforeEach(() => {
            (AuthConnect.isRefreshTokenAvailable as Mock).mockResolvedValue(false);
          });

          it('it does not attempt a refresh', async () => {
            await authService.getAccessToken();
            expect(AuthConnect.refreshSession).not.toHaveBeenCalled();
          });

          it('clears the vault', async () => {
            const { clear } = useSessionVault();
            await authService.getAccessToken();
            expect(clear).toHaveBeenCalledTimes(1);
          });

          it('resolves undefined', async () => {
            expect(await authService.getAccessToken()).toBeUndefined();
          });
        });
      });
    });
  });

  describe('is authenticated', () => {
    describe('if there is no auth result', () => {
      beforeEach(() => {
        const { getValue } = useSessionVault();
        (getValue as Mock).mockResolvedValue(undefined);
      });

      it('does not check for an expired access token', async () => {
        await authService.isAuthenticated();
        expect(AuthConnect.isAccessTokenExpired).not.toHaveBeenCalled();
      });

      it('resolves false ', async () => {
        expect(await authService.isAuthenticated()).toBe(false);
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
          expect(await authService.isAuthenticated()).toBe(true);
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
            await authService.isAuthenticated();
            expect(AuthConnect.refreshSession).toHaveBeenCalledTimes(1);
            expect(AuthConnect.refreshSession).toHaveBeenCalledWith(expect.any(expectedProviderType), testAuthResult);
          });

          describe('when the refresh is successful', () => {
            beforeEach(() => {
              (AuthConnect.refreshSession as Mock).mockResolvedValue(refreshedAuthResult);
            });

            it('saves the new auth result', async () => {
              const { setValue } = useSessionVault();
              await authService.isAuthenticated();
              expect(setValue).toHaveBeenCalledTimes(1);
              expect(setValue).toHaveBeenCalledWith('auth-result', refreshedAuthResult);
            });

            it('resolves true', async () => {
              expect(await authService.isAuthenticated()).toBe(true);
            });
          });

          describe('when the refresh fails', () => {
            beforeEach(() => {
              (AuthConnect.refreshSession as Mock).mockRejectedValue(new Error('refresh failed'));
            });

            it('clears the vault', async () => {
              const { clear } = useSessionVault();
              await authService.isAuthenticated();
              expect(clear).toHaveBeenCalledTimes(1);
            });

            it('resolves false', async () => {
              expect(await authService.isAuthenticated()).toBe(false);
            });
          });
        });

        describe('if a refresh token does not exist', () => {
          beforeEach(() => {
            (AuthConnect.isRefreshTokenAvailable as Mock).mockResolvedValue(false);
          });

          it('it does not attempt a refresh', async () => {
            await authService.isAuthenticated();
            expect(AuthConnect.refreshSession).not.toHaveBeenCalled();
          });

          it('clears the vault', async () => {
            const { clear } = useSessionVault();
            await authService.isAuthenticated();
            expect(clear).toHaveBeenCalledTimes(1);
          });

          it('resolves false', async () => {
            expect(await authService.isAuthenticated()).toBe(false);
          });
        });
      });
    });
  });

  describe('logout', () => {
    it('gets the current auth result', async () => {
      const { getValue } = useSessionVault();
      await authService.logout();
      expect(getValue).toHaveBeenCalledTimes(1);
      expect(getValue).toHaveBeenCalledWith('auth-result');
    });

    describe('if there is no auth result', () => {
      beforeEach(() => {
        const { getValue } = useSessionVault();
        (AuthConnect.buildAuthResult as Mock).mockResolvedValue(builtAuthResult);
        (getValue as Mock).mockResolvedValue(undefined);
      });

      it('builds an auth result', async () => {
        await authService.logout();
        expect(AuthConnect.buildAuthResult).toHaveBeenCalledOnce();
        expect(AuthConnect.buildAuthResult).toHaveBeenCalledWith(expect.any(expectedProviderType), expectedOptions, {});
      });

      it('calls logout with the built auth result', async () => {
        await authService.logout();
        expect(AuthConnect.logout).toHaveBeenCalledOnce();
        expect(AuthConnect.logout).toHaveBeenCalledWith(expect.any(expectedProviderType), builtAuthResult);
      });

      it('clears the auth result', async () => {
        const { clear } = useSessionVault();
        await authService.logout();
        expect(clear).toHaveBeenCalledTimes(1);
      });
    });

    describe('if there is an auth result', () => {
      beforeEach(() => {
        const { getValue } = useSessionVault();
        (AuthConnect.isAccessTokenExpired as Mock).mockResolvedValue(false);
        (getValue as Mock).mockResolvedValue(testAuthResult);
      });

      it('calls logout ', async () => {
        await authService.logout();
        expect(AuthConnect.logout).toHaveBeenCalledTimes(1);
        expect(AuthConnect.logout).toHaveBeenCalledWith(expect.any(expectedProviderType), testAuthResult);
      });

      it('clears the auth result', async () => {
        const { clear } = useSessionVault();
        await authService.logout();
        expect(clear).toHaveBeenCalledTimes(1);
      });
    });
  });
});
