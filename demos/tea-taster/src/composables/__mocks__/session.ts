import { vi } from 'vitest';

const clearSession = vi.fn().mockResolvedValue(undefined);
const setSession = vi.fn().mockResolvedValue(undefined);
const getSession = vi.fn().mockResolvedValue(undefined);

export const useSession = () => ({
  clearSession,
  setSession,
  getSession,
});
