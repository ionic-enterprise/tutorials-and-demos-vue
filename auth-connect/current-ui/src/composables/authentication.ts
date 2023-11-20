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
  return getSession();
};

const saveAuthResult = async (authResult: AuthResult | null): Promise<void> => {
  if (authResult) {
    await setSession(authResult);
  } else {
    await clearSession();
  }
};

const isReady: Promise<void> = AuthConnect.setup({
  platform: isNative ? 'capacitor' : 'web',
  logLevel: 'DEBUG',
  ios: {
    webView: 'private',
  },
  web: {
    uiMode: 'current',
    authFlow: 'PKCE',
  },
});

export const useAuthentication = () => ({
  handleAuthCallback: async (): Promise<void> => {
    await isReady;
    const params = new URLSearchParams(window.location.search);
    if (params.size > 0) {
      const queryEntries = Object.fromEntries(params.entries());
      authResult = await AuthConnect.handleLoginCallback(queryEntries, authOptions);
    } else {
      authResult = null;
    }
    await saveAuthResult(authResult);
  },
  isAuthenticated: async (): Promise<boolean> => {
    const authResult = await getAuthResult();
    return !!authResult && (await AuthConnect.isAccessTokenAvailable(authResult));
  },
  login: async (): Promise<void> => {
    await isReady;
    authResult = await AuthConnect.login(provider, authOptions);
    await saveAuthResult(authResult);
  },
  logout: async (): Promise<void> => {
    await isReady;
    const authResult = await getAuthResult();
    if (authResult) {
      await AuthConnect.logout(provider, authResult);
      saveAuthResult(null);
    }
  },
});
