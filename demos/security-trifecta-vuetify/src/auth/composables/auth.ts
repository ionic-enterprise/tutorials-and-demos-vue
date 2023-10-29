import { useSessionVault } from '@/composables/session-vault';
import { Capacitor } from '@capacitor/core';
import { AuthConnect, AuthResult, CognitoProvider, ProviderOptions, TokenType } from '@ionic-enterprise/auth';

const { clear, getValue, setValue } = useSessionVault();

const isMobile = Capacitor.getPlatform() !== 'web';
const url = isMobile ? 'msauth://auth-action-complete' : 'http://localhost:8100/login';

const options: ProviderOptions = {
  clientId: '64p9c53l5thd5dikra675suvq9',
  discoveryUrl: 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_YU8VQe29z/.well-known/openid-configuration',
  logoutUrl: url,
  redirectUri: url,
  scope: 'openid email profile',
  audience: '',
};

const provider = new CognitoProvider();

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
      authFlow: 'PKCE',
    },
  });
};

const performRefresh = async (authResult: AuthResult): Promise<AuthResult | undefined> => {
  let newAuthResult: AuthResult | undefined;

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
