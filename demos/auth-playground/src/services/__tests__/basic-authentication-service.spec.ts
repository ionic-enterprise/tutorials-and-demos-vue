import { User } from '@/models';
import { useBackendAPI } from '@/composables/backend-api';
import { useSessionVault } from '@/composables/session-vault';
import { BasicAuthenticationService } from '@/services';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@/composables/backend-api');
vi.mock('@/composables/session-vault');
vi.mock('@/composables/vault-factory');

describe('Basic Authentication Service', () => {
  let authService: BasicAuthenticationService;
  beforeEach(() => {
    authService = new BasicAuthenticationService();
    vi.clearAllMocks();
  });

  describe('login', () => {
    const { client } = useBackendAPI();
    let user: User;
    beforeEach(() => {
      user = {
        id: 314159,
        firstName: 'Testy',
        lastName: 'McTest',
        email: 'test@test.com',
      };
      (client.post as any).mockResolvedValue({
        data: {
          success: true,
          user,
          token: '123456789',
        },
      });
    });

    it('posts to the login endpoint', () => {
      authService.login('test@test.com', 'testpassword');
      expect(client.post).toHaveBeenCalledTimes(1);
      expect(client.post).toHaveBeenCalledWith('/login', {
        username: 'test@test.com',
        password: 'testpassword',
      });
    });

    describe('when the login fails', () => {
      beforeEach(() => {
        (client.post as any).mockResolvedValue({
          data: { success: false },
        });
      });

      it('throws an error without setting a session', async () => {
        const { setValue } = useSessionVault();
        expect(() => authService.login('test@test.com', 'password')).rejects.toThrow();
        expect(setValue).not.toHaveBeenCalled();
      });
    });

    describe('when the login succeeds', () => {
      it('sets the session', async () => {
        const { setValue } = useSessionVault();
        await authService.login('test@test.com', 'password');
        expect(setValue).toHaveBeenCalledTimes(1);
        expect(setValue).toHaveBeenCalledWith('auth-token', '123456789');
      });
    });
  });

  describe('logout', () => {
    const { client } = useBackendAPI();

    it('posts to the login endpoint', () => {
      authService.logout();
      expect(client.post).toHaveBeenCalledTimes(1);
      expect(client.post).toHaveBeenCalledWith('/logout', {});
    });

    it('clears the session', async () => {
      const { clear } = useSessionVault();
      await authService.logout();
      expect(clear).toHaveBeenCalledTimes(1);
      expect(clear).toHaveBeenCalledWith();
    });
  });

  describe('get access token', () => {
    it('resolves the token if it exists', async () => {
      const { getValue } = useSessionVault();
      (getValue as Mock).mockResolvedValue('88fueesli32s');
      expect(await authService.getAccessToken()).toEqual('88fueesli32s');
    });

    it('resolves undefined if the token does not exist', async () => {
      const { getValue } = useSessionVault();
      (getValue as Mock).mockResolvedValue(undefined);
      expect(await authService.getAccessToken()).toBeUndefined();
    });
  });

  describe('is authenticated', () => {
    it('resolves true if the token exists', async () => {
      const { getValue } = useSessionVault();
      (getValue as Mock).mockResolvedValue('88fueesli32s');
      expect(await authService.isAuthenticated()).toEqual(true);
    });

    it('resolves false if the token does not exist', async () => {
      const { getValue } = useSessionVault();
      (getValue as Mock).mockResolvedValue(undefined);
      expect(await authService.isAuthenticated()).toEqual(false);
    });
  });
});
