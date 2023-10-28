import { AuthVendor } from '@/models';
import {
  Auth0Provider,
  AuthConnect,
  AuthResult,
  AzureProvider,
  CognitoProvider,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { isPlatform } from '@ionic/vue';
import { Authenticator } from './authenticator';
import { useSessionVault } from '@/composables/session-vault';

const isMobile = isPlatform('hybrid');

// NOTE: All of our auth providers are configured to use almost identical values for redirectUri and logoutUrl.
//       For mobile, these URIs all use the msauth scheme. This is done to be consistent with the Azure AD
//       requirements. For production applications that are not using Azure, it is recommended to use
//       a scheme that is unique to your application. For example, if your app is named "acprovider",
//       you could use "com.yourcompany.acprovider://auth-action-complete" as your redirectUri and logoutUrl.
const auth0Options: ProviderOptions = {
  // audience value is required for auth0's config. If it doesn't exist, the jwt payload will be empty
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl: 'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: isMobile ? 'msauth://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  redirectUri: isMobile ? 'msauth://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  scope: 'openid email picture profile offline_access',
};

const cognitoOptions: ProviderOptions = {
  clientId: '64p9c53l5thd5dikra675suvq9',
  discoveryUrl: 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_YU8VQe29z/.well-known/openid-configuration',
  logoutUrl: isMobile ? 'msauth://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  redirectUri: isMobile ? 'msauth://auth-action-complete' : 'http://localhost:8100/auth-action-complete',
  scope: 'openid email profile',
  audience: '',
};

const azureOptions: ProviderOptions = {
  clientId: 'ed8cb65d-7bb2-4107-bc36-557fb680b994',
  scope:
    'openid offline_access email profile https://dtjacdemo.onmicrosoft.com/ed8cb65d-7bb2-4107-bc36-557fb680b994/demo.read',
  discoveryUrl:
    'https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_acdemo2',
  redirectUri: isMobile
    ? 'msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D'
    : 'http://localhost:8100/auth-action-complete',
  logoutUrl: isMobile
    ? 'msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D'
    : 'http://localhost:8100/auth-action-complete',
  audience: '',
};

export class OIDCAuthenticationService implements Authenticator {
  private authResultKey = 'auth-result';
  private provider: Auth0Provider | AzureProvider | CognitoProvider | null = null;
  private options: ProviderOptions | null = null;
  private initializing: Promise<void> | undefined;

  constructor() {
    this.initialize();
  }

  setAuthProvider(vendor: AuthVendor): void {
    switch (vendor) {
      case 'Auth0':
        this.provider = new Auth0Provider();
        this.options = auth0Options;
        break;

      case 'AWS':
        this.provider = new CognitoProvider();
        this.options = cognitoOptions;
        break;

      case 'Azure':
        this.provider = new AzureProvider();
        this.options = azureOptions;
        break;

      default:
        console.error('Invalid auth vendor: ' + vendor);
        break;
    }
  }

  async login(): Promise<void> {
    if (!this.provider || !this.options) {
      console.log('be sure to run setAuthProvider before calling login');
      return;
    }
    const { setValue } = useSessionVault();
    await this.initialize();
    try {
      const res = await AuthConnect.login(this.provider, this.options);
      setValue(this.authResultKey, res);
    } catch (err: any) {
      // eslint-disable-next-line
      console.log('login error:', err);
      const message: string = err.errorMessage;
      if (this.options === azureOptions && message !== undefined && message.includes('AADB2C90118')) {
        // This is to handle the password reset case for Azure AD and is only applicable to Azure  AD
        // The address you pass back is the custom user flow (policy) endpoint
        const res = await AuthConnect.login(this.provider, {
          ...this.options,
          discoveryUrl:
            'https://vikingsquad.b2clogin.com/vikingsquad.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_password_reset',
        });
        setValue(this.authResultKey, res);
      } else {
        throw new Error(err.error);
      }
    }
  }

  async logout(): Promise<void> {
    if (!this.provider) {
      console.log('be sure to run setAuthProvider before calling logout');
      return;
    }
    await this.initialize();
    const authResult =
      (await this.getAuthResult()) ||
      (await AuthConnect.buildAuthResult(this.provider, this.options as ProviderOptions, {}));
    if (authResult) {
      const { clear } = useSessionVault();
      await AuthConnect.logout(this.provider, authResult);
      await clear();
    }
  }

  async getAccessToken(): Promise<string | undefined> {
    await this.initialize();
    const authResult = await this.getAuthResult();
    return authResult?.accessToken;
  }

  async isAuthenticated(): Promise<boolean> {
    await this.initialize();
    return !!(await this.getAuthResult());
  }

  private initialize(): Promise<void> {
    if (!this.initializing) {
      this.initializing = new Promise((resolve) => {
        this.performInit().then(() => resolve());
      });
    }
    return this.initializing;
  }

  private async performInit(): Promise<void> {
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
  }

  private async getAuthResult(): Promise<AuthResult | undefined> {
    const { getValue } = useSessionVault();
    let authResult = (await getValue(this.authResultKey)) as AuthResult | undefined;
    if (authResult && (await AuthConnect.isAccessTokenExpired(authResult))) {
      authResult = await this.performRefresh(authResult);
    }
    return authResult;
  }

  private async performRefresh(authResult: AuthResult): Promise<AuthResult | undefined> {
    const { clear, setValue } = useSessionVault();
    let newAuthResult: AuthResult | undefined;

    if (!this.provider) {
      console.log('be sure to run setAuthProvider');
      return;
    }

    if (await AuthConnect.isRefreshTokenAvailable(authResult)) {
      try {
        newAuthResult = await AuthConnect.refreshSession(this.provider, authResult);
        setValue(this.authResultKey, newAuthResult);
      } catch (err) {
        await clear();
      }
    } else {
      await clear();
    }

    return newAuthResult;
  }
}
