import { vi } from 'vitest';

const getHandle = vi.fn().mockResolvedValue(undefined);

export const useDatabase = vi.fn().mockReturnValue({
  getHandle,
});
