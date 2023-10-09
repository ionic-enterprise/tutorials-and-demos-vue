import { vi } from 'vitest';

const getAccessToken = vi.fn().mockResolvedValue(undefined);
const isAuthenticated = vi.fn().mockResolvedValue(false);
const login = vi.fn().mockResolvedValue(undefined);
const logout = vi.fn().mockResolvedValue(undefined);

export const useAuthentication = () => ({
  getAccessToken,
  isAuthenticated,
  login,
  logout,
});
