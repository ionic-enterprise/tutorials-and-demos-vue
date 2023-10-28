import { Authenticator, BasicAuthenticationService, OIDCAuthenticationService } from '@/services';
import { AuthVendor } from '@/models';
import { Preferences } from '@capacitor/preferences';

let authService: Authenticator | undefined;
let oidcAuthService: OIDCAuthenticationService | undefined;
let basicAuthService: BasicAuthenticationService | undefined;
const key = 'AuthVendor';

const setupAuthService = (vendor: AuthVendor): void => {
  switch (vendor) {
    case 'Basic':
      if (!basicAuthService) {
        basicAuthService = new BasicAuthenticationService();
      }
      authService = basicAuthService;
      break;

    case 'Auth0':
    case 'AWS':
    case 'Azure':
      if (!oidcAuthService) {
        oidcAuthService = new OIDCAuthenticationService();
      }
      oidcAuthService.setAuthProvider(vendor);
      authService = oidcAuthService;
      break;

    default:
      console.error('Invalid auth provider: ' + vendor);
      break;
  }
};

const initializeAuthService = async (): Promise<void> => {
  if (!authService) {
    const { value } = await Preferences.get({ key });
    if (value) {
      setupAuthService(value as AuthVendor);
    }
  }
};

const login = async (provider: AuthVendor, username?: string, password?: string): Promise<void> => {
  setupAuthService(provider);
  await Preferences.set({ key, value: provider });
  await (provider === 'Basic' ? authService?.login(username, password) : authService?.login());
};

const logout = async (): Promise<void> => {
  await initializeAuthService();
  await authService?.logout();
  authService = undefined;
};

const getAccessToken = async (): Promise<string | undefined> => {
  await initializeAuthService();
  return await authService?.getAccessToken();
};

const isAuthenticated = async (): Promise<boolean> => {
  await initializeAuthService();
  return authService ? await authService.isAuthenticated() : false;
};

export const useAuth = (): any => {
  return {
    getAccessToken,
    isAuthenticated,
    login,
    logout,
  };
};
