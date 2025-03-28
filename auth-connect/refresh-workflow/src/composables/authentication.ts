import { useSession } from '@/composables/session';
import { Capacitor } from '@capacitor/core';
import { Auth0Provider, AuthConnect, AuthResult, ProviderOptions } from '@ionic-enterprise/auth';

const isNative = Capacitor.isNativePlatform();
const provider = new Auth0Provider();
const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative ? 'io.ionic.acdemo://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative ? 'io.ionic.acdemo://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};
let authResult: AuthResult | null = null;

const { clearSession, getSession, setSession } = useSession();

const getAuthResult = async (): Promise<AuthResult | null> => {
  let authResult = await getSession();
  if (
    authResult &&
    (await AuthConnect.isAccessTokenAvailable(authResult)) &&
    (await AuthConnect.isAccessTokenExpired(authResult))
  ) {
    authResult = await refreshAuthResult(authResult);
  }
  return authResult;
};

const refreshAuthResult = async (authResult: AuthResult): Promise<AuthResult | null> => {
  let newAuthResult: AuthResult | null = null;
  if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
    try {
      newAuthResult = await AuthConnect.refreshSession(provider, authResult);
    } catch {}
  }
  await saveAuthResult(newAuthResult);
  return newAuthResult;
};

const saveAuthResult = async (authResult: AuthResult | null): Promise<void> => {
  if (authResult) {
    await setSession(authResult);
  } else {
    await clearSession();
  }
};

export const useAuthentication = () => ({
  initializeAuthentication: async (): Promise<void> =>
    AuthConnect.setup({
      platform: isNative ? 'capacitor' : 'web',
      logLevel: 'DEBUG',
      ios: {
        webView: 'private',
      },
      web: {
        uiMode: 'popup',
        authFlow: 'PKCE',
      },
    }),
  isAuthenticated: async (): Promise<boolean> => {
    const authResult = await getAuthResult();
    return !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult));
  },
  login: async (): Promise<void> => {
    authResult = await AuthConnect.login(provider, authOptions);
    await saveAuthResult(authResult);
  },
  logout: async (): Promise<void> => {
    const authResult = await getAuthResult();
    if (authResult) {
      await AuthConnect.logout(provider, authResult);
      saveAuthResult(null);
    }
  },
});
