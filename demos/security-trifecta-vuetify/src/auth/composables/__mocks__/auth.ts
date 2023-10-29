import { vi } from 'vitest';

const isAuthenticated = vi.fn().mockResolvedValue(false);
const getAccessToken = vi.fn().mockResolvedValue(undefined);
const getUserEmail = vi.fn().mockResolvedValue(undefined);
const login = vi.fn().mockResolvedValue(false);
const logout = vi.fn().mockResolvedValue(undefined);

export const useAuth = vi.fn().mockReturnValue({
  isAuthenticated,
  getAccessToken,
  getUserEmail,
  login,
  logout,
});
