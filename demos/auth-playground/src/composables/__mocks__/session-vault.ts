import { vi } from 'vitest';

export const useSessionVault = vi.fn().mockReturnValue({
  canUnlock: vi.fn().mockResolvedValue(false),
  initializeUnlockMode: vi.fn().mockResolvedValue(undefined),
  setUnlockMode: vi.fn().mockResolvedValue(undefined),
  getConfig: vi.fn().mockReturnValue({}),
  getKeys: vi.fn().mockResolvedValue([]),
  getValue: vi.fn().mockResolvedValue({ value: null }),
  setValue: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn().mockResolvedValue(undefined),
  lock: vi.fn().mockResolvedValue(undefined),
  unlock: vi.fn().mockResolvedValue(undefined),
});
