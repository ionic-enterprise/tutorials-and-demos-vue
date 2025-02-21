import { useSessionVault } from '@/composables/session-vault';
import { Capacitor } from '@capacitor/core';
import { Auth0Provider, AuthConnect, AuthResult, ProviderOptions } from '@ionic-enterprise/auth';

const isMobile = Capacitor.isNativePlatform();
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

const performRefresh = async (authResult: AuthResult): Promise<AuthResult | undefined> => {
  let newAuthResult: AuthResult | undefined;
  const { clearSession, setSession } = useSessionVault();

  if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
    try {
      newAuthResult = await AuthConnect.refreshSession(provider, authResult);
      setSession(newAuthResult);
    } catch {
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

export const useAuth = () => {
  return {
    initializeAuth: async (): Promise<void> =>
      AuthConnect.setup({
        platform: isMobile ? 'capacitor' : 'web',
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
      return !!(await getAuthResult());
    },
    getAccessToken: async (): Promise<string | void> => {
      const authResult = await getAuthResult();
      return authResult?.accessToken;
    },
    login: async (): Promise<void> => {
      const authResult = await AuthConnect.login(provider, options);
      const { setSession } = useSessionVault();
      setSession(authResult);
    },
    logout: async () => {
      const { clearSession, getSession } = useSessionVault();
      const authResult = await getSession();
      if (authResult) {
        await AuthConnect.logout(provider, authResult);
        await clearSession();
      }
    },
  };
};
