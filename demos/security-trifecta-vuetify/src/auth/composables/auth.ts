import { useSessionVault } from '@/composables/session-vault';
import { Capacitor } from '@capacitor/core';
import { Auth0Provider, AuthConnect, AuthResult, ProviderOptions, TokenType } from '@ionic-enterprise/auth';

const isMobile = Capacitor.getPlatform() !== 'web';
const url = isMobile ? 'io.ionic.acdemo://auth-action-complete' : 'http://localhost:8100/login';

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
const authResultKey = 'auth-result';

const performInit = async (): Promise<void> => {
  await AuthConnect.setup({
    platform: isMobile ? 'capacitor' : 'web',
    logLevel: 'DEBUG',
    ios: {
      webView: 'private',
    },
    web: {
      uiMode: 'popup',
      authFlow: 'implicit',
    },
  });
};

const performRefresh = async (authResult: AuthResult): Promise<AuthResult | undefined> => {
  let newAuthResult: AuthResult | undefined;
  const { clear, setValue } = useSessionVault();

  if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
    try {
      newAuthResult = await AuthConnect.refreshSession(provider, authResult);
      setValue(authResultKey, newAuthResult);
    } catch (err) {
      await clear();
    }
  } else {
    await clear();
  }

  return newAuthResult;
};

const getAuthResult = async (): Promise<AuthResult | undefined> => {
  const { getValue } = useSessionVault();
  let authResult = (await getValue(authResultKey)) as AuthResult | undefined;
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
  const { clear, getValue, setValue } = useSessionVault();
  return {
    isAuthenticated: async (): Promise<boolean> => {
      await initialize();
      return !!(await getAuthResult());
    },
    getAccessToken: async (): Promise<string | void> => {
      await initialize();
      const authResult = (await getAuthResult()) as AuthResult | undefined;
      return authResult?.accessToken;
    },
    getUserEmail: async (): Promise<string | void> => {
      const authResult = (await getValue(authResultKey)) as AuthResult | undefined;
      if (authResult) {
        const { email } = (await AuthConnect.decodeToken(TokenType.id, authResult)) as any;
        return email;
      }
    },
    login: async (): Promise<void> => {
      await initialize();
      const authResult = await AuthConnect.login(provider, options);
      setValue(authResultKey, authResult);
    },
    logout: async () => {
      await initialize();
      const authResult = (await getValue(authResultKey)) as AuthResult;
      if (authResult) {
        await AuthConnect.logout(provider, authResult);
        await clear();
      }
    },
  };
};
