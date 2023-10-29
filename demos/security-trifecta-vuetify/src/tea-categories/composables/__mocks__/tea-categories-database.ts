import { vi } from 'vitest';

const getAll = vi.fn().mockResolvedValue([]);
const trim = vi.fn().mockResolvedValue(undefined);
const upsert = vi.fn().mockResolvedValue(undefined);

export const useTeaCategoriesDatabase = vi.fn().mockReturnValue({
  getAll,
  trim,
  upsert,
});
