import { Authenticator } from './authenticator';
import { useBackendAPI } from '@/composables/backend-api';
import { useSessionVault } from '@/composables/session-vault';

export class BasicAuthenticationService implements Authenticator {
  private key = 'auth-token';

  constructor() {
    null;
  }

  async login(email: string, password: string): Promise<void> {
    const { client } = useBackendAPI();
    const { setValue } = useSessionVault();
    const response = await client.post('/login', { username: email, password });
    const { success, ...session } = response.data;

    if (success) {
      setValue(this.key, session.token);
    } else {
      return Promise.reject(new Error('Login Failed'));
    }
  }

  async logout(): Promise<void> {
    const { clear } = useSessionVault();
    const { client } = useBackendAPI();
    await client.post('/logout', {});
    await clear();
  }

  getAccessToken(): Promise<string | undefined> {
    const { getValue } = useSessionVault();
    return getValue(this.key);
  }

  async isAuthenticated(): Promise<boolean> {
    return !!(await this.getAccessToken());
  }
}
