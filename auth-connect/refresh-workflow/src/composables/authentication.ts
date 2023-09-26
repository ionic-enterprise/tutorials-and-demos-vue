import { Auth0Provider, AuthConnect, AuthResult, ProviderOptions } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';
import { useSession } from '@/composables/session';

const isNative = isPlatform('hybrid');
const provider = new Auth0Provider();
const authOptions: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isNative ? 'msauth://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  redirectUri: isNative ? 'msauth://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  scope: 'openid offline_access email picture profile',
};
let authResult: AuthResult | null = null;

const { clearSession, getSession, setSession } = useSession();

const getAuthResult = async (): Promise<AuthResult | null> => {
  let authResult = await getSession();
  if (authResult && (await AuthConnect.isAccessTokenExpired(authResult))) {
    authResult = await refreshAuthResult(authResult);
  }
  return authResult;
};

const refreshAuthResult = async (authResult: AuthResult): Promise<AuthResult | null> => {
  let newAuthResult: AuthResult | null = null;
  if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
    try {
      newAuthResult = await AuthConnect.refreshSession(provider, authResult);
    } catch (err) {
      null;
    }
  }
  return newAuthResult;
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
    uiMode: 'popup',
    authFlow: 'implicit',
  },
});

export const useAuthentication = () => ({
  isAuthenticated: async (): Promise<boolean> => {
    const authResult = await getAuthResult();
    return !!authResult;
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
