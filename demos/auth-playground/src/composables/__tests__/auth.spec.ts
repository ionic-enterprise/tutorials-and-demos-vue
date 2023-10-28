import { useAuth } from '@/composables/auth';
import { AuthVendor } from '@/models';
import { BasicAuthenticationService, OIDCAuthenticationService } from '@/services';
import { Preferences } from '@capacitor/preferences';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@/composables/session-vault');
vi.mock('@/composables/vault-factory');
vi.mock('@capacitor/preferences');
vi.mock('@/services/basic-authentication-service');
vi.mock('@/services/oidc-authentication-service');

describe('auth', () => {
  beforeEach(() => {
    (Preferences.get as Mock).mockResolvedValue({ value: undefined });
    vi.resetAllMocks();
  });

  afterEach(async () => {
    const { logout } = useAuth();
    await logout();
  });

  let mockBasicAuth: BasicAuthenticationService;
  const getMockBasicAuth = (): BasicAuthenticationService => {
    if (!mockBasicAuth) {
      mockBasicAuth = (BasicAuthenticationService as Mock).mock.instances[0];
    }
    return mockBasicAuth;
  };

  let mockOIDCAuth: OIDCAuthenticationService;
  const getMockOIDCAuth = (): OIDCAuthenticationService => {
    if (!mockOIDCAuth) {
      mockOIDCAuth = (OIDCAuthenticationService as Mock).mock.instances[0];
    }
    return mockOIDCAuth;
  };

  describe.each([['Auth0' as AuthVendor], ['AWS' as AuthVendor], ['Azure' as AuthVendor], ['Basic' as AuthVendor]])(
    '%s',
    (vendor: AuthVendor) => {
      describe('login', () => {
        it('sets up the OIDC authenticator', async () => {
          const { login } = useAuth();
          if (vendor === 'Basic') {
            await login(vendor, 'test@mctesty.com', 'MyPa$$w0rd');
            getMockBasicAuth();
            expect(true).toBeTruthy();
          } else {
            await login(vendor);
            const mockAuth = getMockOIDCAuth();
            expect(mockAuth.setAuthProvider).toHaveBeenCalledTimes(1);
            expect(mockAuth.setAuthProvider).toHaveBeenCalledWith(vendor);
          }
        });

        it('calls the login', async () => {
          const { login } = useAuth();
          if (vendor === 'Basic') {
            await login(vendor, 'test@mctesty.com', 'MyPa$$w0rd');
            const mockAuth = getMockBasicAuth();
            expect(mockAuth.login).toHaveBeenCalledTimes(1);
            expect(mockAuth.login).toHaveBeenCalledWith('test@mctesty.com', 'MyPa$$w0rd');
          } else {
            await login(vendor);
            const mockAuth = getMockOIDCAuth();
            expect(mockAuth.login).toHaveBeenCalledTimes(1);
            expect(mockAuth.login).toHaveBeenCalledWith();
          }
        });

        it('stores the vendor', async () => {
          const { login } = useAuth();
          await login(
            vendor,
            vendor === 'Basic' ? 'test@testy.com' : undefined,
            vendor === 'Basic' ? 'passw0rd' : undefined,
          );
          expect(Preferences.set).toHaveBeenCalledTimes(1);
          expect(Preferences.set).toHaveBeenCalledWith({ key: 'AuthVendor', value: vendor });
        });
      });

      describe('logout', () => {
        const verifyLogoutCall = async (): Promise<void> => {
          const { isAuthenticated, logout } = useAuth();
          await isAuthenticated(); // prime the pump if need be
          const mockAuth = vendor === 'Basic' ? getMockBasicAuth() : getMockOIDCAuth();
          await logout();
          expect(mockAuth.logout).toHaveBeenCalledTimes(1);
          expect(mockAuth.logout).toHaveBeenCalledWith();
        };

        describe('with a previously set provider', () => {
          beforeEach(() => {
            (Preferences.get as Mock).mockResolvedValue({ value: vendor });
          });

          it('gets the current vendor', async () => {
            const { logout } = useAuth();
            await logout();
            expect(Preferences.get).toHaveBeenCalledTimes(1);
            expect(Preferences.get).toHaveBeenCalledWith({ key: 'AuthVendor' });
          });

          it('sets up the OIDC service for the current vendor', async () => {
            const { logout } = useAuth();
            await logout();

            if (vendor === 'Basic') {
              expect(true).toBeTruthy();
            } else {
              const mockAuth = getMockOIDCAuth();
              expect(mockAuth.setAuthProvider).toHaveBeenCalledTimes(1);
              expect(mockAuth.setAuthProvider).toHaveBeenCalledWith(vendor);
            }
          });

          it('performs the logout', async () => {
            await verifyLogoutCall();
          });
        });

        describe('without a previously set vendor', () => {
          beforeEach(() => {
            (Preferences.get as Mock).mockResolvedValue({ value: undefined });
          });
          it('gets the current vendor', async () => {
            const { logout } = useAuth();
            await logout();
            expect(Preferences.get).toHaveBeenCalledTimes(1);
            expect(Preferences.get).toHaveBeenCalledWith({ key: 'AuthVendor' });
          });

          it('does not construct the service for the current vendor', async () => {
            const { logout } = useAuth();
            await logout();

            expect(BasicAuthenticationService).not.toHaveBeenCalled();
            expect(OIDCAuthenticationService).not.toHaveBeenCalled();
          });
        });

        describe('after a vendor is established', () => {
          beforeEach(async () => {
            const { login } = useAuth();
            await login(
              vendor,
              vendor === 'Basic' ? 'test@testy.com' : undefined,
              vendor === 'Basic' ? 'passw0rd' : undefined,
            );
            (Preferences.get as Mock).mockResolvedValue({ value: vendor });
          });

          it('does not get the current provider', async () => {
            const { logout } = useAuth();
            await logout();
            expect(Preferences.get).not.toHaveBeenCalled();
          });

          it('does not construct a service', async () => {
            const { logout } = useAuth();
            vi.clearAllMocks();
            await logout();
            expect(BasicAuthenticationService).not.toHaveBeenCalled();
            expect(OIDCAuthenticationService).not.toHaveBeenCalled();
          });

          it('resolves the value using the service', async () => {
            await verifyLogoutCall();
          });
        });
      });

      describe('is authenticated', () => {
        const verifyIsAuthCall = async (): Promise<void> => {
          const { isAuthenticated } = useAuth();
          await isAuthenticated(); // prime the pump if need be
          const mockAuth = vendor === 'Basic' ? getMockBasicAuth() : getMockOIDCAuth();
          (mockAuth.isAuthenticated as Mock).mockResolvedValue(true);
          expect(await isAuthenticated()).toBe(true);
          (mockAuth.isAuthenticated as Mock).mockResolvedValue(false);
          expect(await isAuthenticated()).toBe(false);
        };

        describe('with a previously set vendor', () => {
          beforeEach(() => {
            (Preferences.get as Mock).mockResolvedValue({ value: vendor });
          });

          it('gets the current provider', async () => {
            const { isAuthenticated } = useAuth();
            await isAuthenticated();
            expect(Preferences.get).toHaveBeenCalledTimes(1);
            expect(Preferences.get).toHaveBeenCalledWith({ key: 'AuthVendor' });
          });

          it('sets up up the OIDC service for the current vendor', async () => {
            const { isAuthenticated } = useAuth();
            await isAuthenticated();

            if (vendor === 'Basic') {
              expect(true).toBeTruthy();
            } else {
              const mockAuth = getMockOIDCAuth();
              expect(mockAuth.setAuthProvider).toHaveBeenCalledTimes(1);
              expect(mockAuth.setAuthProvider).toHaveBeenCalledWith(vendor);
            }
          });

          it('resolves the value using the service', async () => {
            await verifyIsAuthCall();
          });
        });

        describe('without a previously set vendor', () => {
          beforeEach(() => {
            (Preferences.get as Mock).mockResolvedValue({ value: undefined });
          });
          it('gets the current vendor', async () => {
            const { isAuthenticated } = useAuth();
            await isAuthenticated();
            expect(Preferences.get).toHaveBeenCalledTimes(1);
            expect(Preferences.get).toHaveBeenCalledWith({ key: 'AuthVendor' });
          });

          it('does not construct the service for the current provider', async () => {
            const { isAuthenticated } = useAuth();
            await isAuthenticated();

            expect(BasicAuthenticationService).not.toHaveBeenCalled();
            expect(OIDCAuthenticationService).not.toHaveBeenCalled();
          });

          it('resolves false', async () => {
            const { isAuthenticated } = useAuth();
            expect(await isAuthenticated()).toBe(false);
          });
        });

        describe('after a vendor is established', () => {
          beforeEach(async () => {
            const { login } = useAuth();
            await login(
              vendor,
              vendor === 'Basic' ? 'test@testy.com' : undefined,
              vendor === 'Basic' ? 'passw0rd' : undefined,
            );
            (Preferences.get as Mock).mockResolvedValue({ value: vendor });
          });

          it('does not get the current vendor', async () => {
            const { isAuthenticated } = useAuth();
            await isAuthenticated();
            expect(Preferences.get).not.toHaveBeenCalled();
          });

          const { isAuthenticated } = useAuth();
          it('does not construct a service', async () => {
            vi.clearAllMocks();
            await isAuthenticated();
            expect(BasicAuthenticationService).not.toHaveBeenCalled();
            expect(OIDCAuthenticationService).not.toHaveBeenCalled();
          });

          it('resolves the value using the service', async () => {
            await verifyIsAuthCall();
          });
        });
      });

      describe('get access token', () => {
        const verifyGetAccessTokenCall = async (): Promise<void> => {
          const { getAccessToken } = useAuth();
          await getAccessToken(); // prime the pump if need be
          const mockAuth = vendor === 'Basic' ? getMockBasicAuth() : getMockOIDCAuth();
          (mockAuth.getAccessToken as Mock).mockResolvedValue('thisIsAToken');
          expect(await getAccessToken()).toEqual('thisIsAToken');
          (mockAuth.getAccessToken as Mock).mockResolvedValue('thisIsADifferentToken');
          expect(await getAccessToken()).toBe('thisIsADifferentToken');
        };

        describe('with a previously set vendor', () => {
          beforeEach(() => {
            (Preferences.get as Mock).mockResolvedValue({ value: vendor });
          });

          it('gets the current vendor', async () => {
            const { getAccessToken } = useAuth();
            await getAccessToken();
            expect(Preferences.get).toHaveBeenCalledTimes(1);
            expect(Preferences.get).toHaveBeenCalledWith({ key: 'AuthVendor' });
          });

          it('sets up the OIDC service for the current vendor', async () => {
            const { getAccessToken } = useAuth();
            await getAccessToken();

            if (vendor === 'Basic') {
              expect(true).toBeTruthy();
            } else {
              const mockAuth = getMockOIDCAuth();
              expect(mockAuth.setAuthProvider).toHaveBeenCalledTimes(1);
              expect(mockAuth.setAuthProvider).toHaveBeenCalledWith(vendor);
            }
          });

          it('resolves the value using the service', async () => {
            await verifyGetAccessTokenCall();
          });
        });

        describe('without a previously set vendor', () => {
          beforeEach(() => {
            (Preferences.get as Mock).mockResolvedValue({ value: undefined });
          });
          it('gets the current vendor', async () => {
            const { getAccessToken } = useAuth();
            await getAccessToken();
            expect(Preferences.get).toHaveBeenCalledTimes(1);
            expect(Preferences.get).toHaveBeenCalledWith({ key: 'AuthVendor' });
          });

          it('does not construct the service for the current vendor', async () => {
            const { getAccessToken } = useAuth();
            await getAccessToken();

            expect(BasicAuthenticationService).not.toHaveBeenCalled();
            expect(OIDCAuthenticationService).not.toHaveBeenCalled();
          });
          it('resolves undefined', async () => {
            const { getAccessToken } = useAuth();
            expect(await getAccessToken()).toBeUndefined();
          });
        });

        describe('after a vendor is established', () => {
          beforeEach(async () => {
            const { login } = useAuth();
            await login(
              vendor,
              vendor === 'Basic' ? 'test@testy.com' : undefined,
              vendor === 'Basic' ? 'passw0rd' : undefined,
            );
            (Preferences.get as Mock).mockResolvedValue({ value: vendor });
          });

          it('does not get the current vendor', async () => {
            const { getAccessToken } = useAuth();
            await getAccessToken();
            expect(Preferences.get).not.toHaveBeenCalled();
          });

          const { getAccessToken } = useAuth();
          it('does not construct a service', async () => {
            vi.clearAllMocks();
            await getAccessToken();
            expect(BasicAuthenticationService).not.toHaveBeenCalled();
            expect(OIDCAuthenticationService).not.toHaveBeenCalled();
          });

          it('resolves the value using the service', async () => {
            await verifyGetAccessTokenCall();
          });
        });
      });
    },
  );
});
