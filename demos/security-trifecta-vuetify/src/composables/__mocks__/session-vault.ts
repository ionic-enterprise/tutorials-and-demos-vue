import { vi } from 'vitest';

let onLockCallback: (() => Promise<void>) | undefined;

const canUnlock = vi.fn().mockResolvedValue(false);
const canUseLocking = vi.fn().mockReturnValue(false);
const clear = vi.fn().mockResolvedValue(undefined);
const unlock = vi.fn().mockResolvedValue(undefined);
const setValue = vi.fn().mockResolvedValue(undefined);
const initializeVault = vi.fn().mockResolvedValue(undefined);
const getValue = vi.fn().mockResolvedValue(undefined);
const initializeUnlockMode = vi.fn().mockResolvedValue(undefined);
const setUnlockMode = vi.fn().mockResolvedValue(undefined);
const onLock = vi.fn().mockImplementation((cb: () => Promise<void>) => (onLockCallback = cb));
const lock = vi.fn().mockImplementation(() => {
  if (onLockCallback) {
    onLockCallback();
  }
});

export const useSessionVault = vi.fn().mockReturnValue({
  canUnlock,
  canUseLocking,
  clear,
  unlock,
  getValue,
  setValue,
  initializeUnlockMode,
  initializeVault,
  setUnlockMode,
  onLock,
  lock,
});
