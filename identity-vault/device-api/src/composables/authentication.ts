import { useSessionVault } from './session-vault';

const { clearSession, getSession, session, storeSession } = useSessionVault();

const login = (): Promise<void> =>
  storeSession({
    email: 'test@ionic.io',
    firstName: 'Tessa',
    lastName: 'Testsmith',
    accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
    refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
  });

const logout = (): Promise<void> => clearSession();

const isAuthenticated = async (): Promise<boolean> => {
  await getSession();
  return !!session.value;
};

export const useAuthentication = (): any => ({ isAuthenticated, login, logout });
