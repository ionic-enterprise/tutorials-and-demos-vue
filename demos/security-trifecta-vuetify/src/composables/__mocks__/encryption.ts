import { vi } from 'vitest';

const getDatabaseKey = vi.fn().mockResolvedValue(undefined);

export const useEncryption = vi.fn().mockReturnValue({
  getDatabaseKey,
});
