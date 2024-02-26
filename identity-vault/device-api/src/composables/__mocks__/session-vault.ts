import { Session } from '@/models/session';
import { vi } from 'vitest';
import { ref } from 'vue';

const session = ref<Session | null>(null);
const clearSession = vi.fn().mockResolvedValue(undefined);
const getSession = vi.fn().mockResolvedValue(undefined);
const initializeVault = vi.fn().mockResolvedValue(undefined);
const enhanceVault = vi.fn().mockResolvedValue(undefined);
const lockSession = vi.fn().mockResolvedValue(undefined);
const sessionIsLocked = vi.fn().mockResolvedValue(false);
const storeSession = vi.fn().mockResolvedValue(undefined);
const unlockSession = vi.fn().mockResolvedValue(undefined);
const updateUnlockMode = vi.fn().mockResolvedValue(undefined);

export const useSessionVault = () => ({
  clearSession,
  getSession,
  initializeVault,
  enhanceVault,
  lockSession,
  session,
  sessionIsLocked,
  storeSession,
  unlockSession,
  updateUnlockMode,
});
