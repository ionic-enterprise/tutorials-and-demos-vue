import { vi } from 'vitest';

export const useAuth = vi.fn().mockReturnValue({
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  isAuthenticated: vi.fn().mockResolvedValue(false),
  getAccessToken: vi.fn().mockResolvedValue(''),
});
