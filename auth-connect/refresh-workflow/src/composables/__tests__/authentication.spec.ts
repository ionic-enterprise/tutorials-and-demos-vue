import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useAuthentication } from '../authentication';
import { Auth0Provider, AuthConnect } from '@ionic-enterprise/auth';
import { useSession } from '@/composables/session';

vi.mock('@/composables/session');
vi.mock('@ionic-enterprise/auth');

describe('useAuthentication', () => {
  const refreshAuthResult: any = {
    accessToken: 'refreshed-access-token',
    refreshToken: 'refreshed-refresh-token',
    idToken: 'refreshed-id-token',
  };

  const testAuthResult: any = {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    idToken: 'test-id-token',
  };

  it('runs', () => {
    expect(useAuthentication()).toBeTruthy();
  });

  describe('is authenticated', () => {
    describe('when there is no stored auth result', () => {
      beforeEach(() => {
        const { getSession } = useSession();
        (getSession as Mock).mockResolvedValue(null);
      });

      it('resolves false', async () => {
        const { isAuthenticated } = useAuthentication();
        expect(await isAuthenticated()).toBe(false);
      });

      it('does not check for an expired access token', async () => {
        const { isAuthenticated } = useAuthentication();
        await isAuthenticated();
        expect(AuthConnect.isAccessTokenExpired).not.toHaveBeenCalled();
      });
    });

    describe('when there is a stored auth result', () => {
      beforeEach(() => {
        const { getSession } = useSession();
        (getSession as Mock).mockResolvedValue(testAuthResult);
      });

      describe('when there is no access token', () => {
        beforeEach(() => {
          (AuthConnect.isAccessTokenAvailable as Mock).mockResolvedValue(false);
        });

        it('resolves false', async () => {
          const { isAuthenticated } = useAuthentication();
          expect(await isAuthenticated()).toBe(false);
        });
      });

      describe('when there is an access token', () => {
        beforeEach(() => {
          (AuthConnect.isAccessTokenAvailable as Mock).mockResolvedValue(true);
        });

        it('checks for an expired access token', async () => {
          const { isAuthenticated } = useAuthentication();
          await isAuthenticated();
          expect(AuthConnect.isAccessTokenExpired).toHaveBeenCalledOnce();
          expect(AuthConnect.isAccessTokenExpired).toHaveBeenCalledWith(testAuthResult);
        });

        describe('if the token is not expired', () => {
          beforeEach(() => {
            (AuthConnect.isAccessTokenExpired as Mock).mockResolvedValue(false);
          });

          it('resolves true', async () => {
            const { isAuthenticated } = useAuthentication();
            expect(await isAuthenticated()).toBe(true);
          });
        });

        describe('if the token is expired', () => {
          beforeEach(() => {
            (AuthConnect.isAccessTokenExpired as Mock).mockResolvedValue(true);
          });

          describe('if a refresh token is available', () => {
            beforeEach(() => {
              (AuthConnect.isRefreshTokenAvailable as Mock).mockResolvedValue(true);
            });

            it('attempts a refresh', async () => {
              const { isAuthenticated } = useAuthentication();
              await isAuthenticated();
              expect(AuthConnect.refreshSession).toHaveBeenCalledOnce();
              expect(AuthConnect.refreshSession).toHaveBeenCalledWith(expect.any(Auth0Provider), testAuthResult);
            });

            describe('if the refresh is successful', () => {
              beforeEach(() => {
                (AuthConnect.refreshSession as Mock).mockResolvedValue(refreshAuthResult);
              });

              it('resolves true', async () => {
                const { isAuthenticated } = useAuthentication();
                expect(await isAuthenticated()).toBe(true);
              });
            });

            describe('if the refresh fails', () => {
              beforeEach(() => {
                (AuthConnect.refreshSession as Mock).mockRejectedValue(new Error('test error'));
              });

              it('resolves false', async () => {
                const { isAuthenticated } = useAuthentication();
                expect(await isAuthenticated()).toBe(false);
              });
            });
          });

          describe('if a refresh token is not available', () => {
            beforeEach(() => {
              (AuthConnect.isRefreshTokenAvailable as Mock).mockResolvedValue(false);
            });

            it('does not attempt a refresh', async () => {
              const { isAuthenticated } = useAuthentication();
              await isAuthenticated();
              expect(AuthConnect.refreshSession).not.toHaveBeenCalled();
            });

            it('resolves false', async () => {
              const { isAuthenticated } = useAuthentication();
              expect(await isAuthenticated()).toBe(false);
            });
          });
        });
      });
    });
  });

  describe('login', () => {
    beforeEach(() => {
      (AuthConnect.login as Mock).mockResolvedValue(testAuthResult);
    });
    it('calls the login', async () => {
      const { login } = useAuthentication();
      await login();
      expect(AuthConnect.login).toHaveBeenCalledOnce();
    });

    it('saves the result of the login', async () => {
      const { setSession } = useSession();
      const { login } = useAuthentication();
      await login();
      expect(setSession).toHaveBeenCalledOnce();
      expect(setSession).toHaveBeenCalledWith(testAuthResult);
    });
  });

  describe('logout', () => {
    describe('when authenticated', () => {
      beforeEach(() => {
        const { getSession } = useSession();
        (getSession as Mock).mockResolvedValue(testAuthResult);
        (AuthConnect.isAccessTokenAvailable as Mock).mockResolvedValue(true);
        (AuthConnect.isAccessTokenExpired as Mock).mockResolvedValue(false);
      });

      it('calls the logout', async () => {
        const { logout } = useAuthentication();
        await logout();
        expect(AuthConnect.logout).toHaveBeenCalledOnce();
      });

      it('clears the session', async () => {
        const { clearSession } = useSession();
        const { logout } = useAuthentication();
        await logout();
        expect(clearSession).toHaveBeenCalledOnce();
      });
    });

    describe('when not authenticated', () => {
      beforeEach(() => {
        const { getSession } = useSession();
        (getSession as Mock).mockResolvedValue(null);
      });

      it('does nothing', async () => {
        const { clearSession } = useSession();
        const { logout } = useAuthentication();
        await logout();
        expect(AuthConnect.logout).not.toHaveBeenCalled();
        expect(clearSession).not.toHaveBeenCalled();
      });
    });
  });
});
