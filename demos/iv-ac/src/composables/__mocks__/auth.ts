import { vi } from 'vitest';

const getAccessToken = vi.fn().mockResolvedValue('test-token');
const isAuthenticated = vi.fn().mockResolvedValue(false);
const login = vi.fn().mockResolvedValue(false);
const logout = vi.fn().mockResolvedValue(undefined);

export const useAuth = () => ({
  getAccessToken,
  isAuthenticated,
  login,
  logout,
});
