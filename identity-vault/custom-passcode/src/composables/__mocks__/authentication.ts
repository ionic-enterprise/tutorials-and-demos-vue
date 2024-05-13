import { vi } from 'vitest';

const isAuthenticated = vi.fn().mockResolvedValue(false);
const login = vi.fn().mockResolvedValue(undefined);
const logout = vi.fn().mockResolvedValue(undefined);

export const useAuthentication = () => ({
  isAuthenticated,
  login,
  logout,
});
