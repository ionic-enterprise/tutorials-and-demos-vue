import { useSessionVault } from '@/composables/session-vault';
import { Auth0Provider, AuthConnect, AuthResult, ProviderOptions } from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';

const isMobile = isPlatform('hybrid');
const url = isMobile ? 'io.ionic.acdemo://auth-action-complete' : 'http://localhost:8100/auth-action-complete';

const options: ProviderOptions = {
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  scope: 'openid email picture profile offline_access',
  logoutUrl: url,
  redirectUri: url,
};

const provider = new Auth0Provider();

let initializing: Promise<void> | undefined;

const performInit = async (): Promise<void> => {
  await AuthConnect.setup({
    platform: isMobile ? 'capacitor' : 'web',
    logLevel: 'DEBUG',
    ios: {
      webView: 'private',
    },
    web: {
      uiMode: 'popup',
      authFlow: 'PKCE',
    },
  });
};

const performRefresh = async (authResult: AuthResult): Promise<AuthResult | undefined> => {
  let newAuthResult: AuthResult | undefined;
  const { clearSession, setSession } = useSessionVault();

  if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
    try {
      newAuthResult = await AuthConnect.refreshSession(provider, authResult);
      setSession(newAuthResult);
    } catch (err) {
      await clearSession();
    }
  } else {
    await clearSession();
  }

  return newAuthResult;
};

const getAuthResult = async (): Promise<AuthResult | null | undefined> => {
  const { getSession } = useSessionVault();
  let authResult = await getSession();
  if (authResult && (await AuthConnect.isAccessTokenExpired(authResult))) {
    authResult = await performRefresh(authResult);
  }
  return authResult;
};

const initialize = async (): Promise<void> => {
  if (!initializing) {
    initializing = new Promise((resolve) => {
      performInit().then(() => resolve());
    });
  }
  return initializing;
};

export const useAuth = () => {
  return {
    isAuthenticated: async (): Promise<boolean> => {
      await initialize();
      return !!(await getAuthResult());
    },
    getAccessToken: async (): Promise<string | void> => {
      await initialize();
      const authResult = await getAuthResult();
      return authResult?.accessToken;
    },
    login: async (): Promise<void> => {
      await initialize();
      const authResult = await AuthConnect.login(provider, options);
      const { setSession } = useSessionVault();
      setSession(authResult);
    },
    logout: async () => {
      await initialize();
      const { clearSession, getSession } = useSessionVault();
      const authResult = await getSession();
      if (authResult) {
        await AuthConnect.logout(provider, authResult);
        await clearSession();
      }
    },
  };
};
