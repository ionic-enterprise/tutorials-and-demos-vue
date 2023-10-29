import { vi } from 'vitest';

const getAll = vi.fn().mockResolvedValue([]);
const save = vi.fn().mockResolvedValue(undefined);
const remove = vi.fn().mockResolvedValue(undefined);
const reset = vi.fn().mockResolvedValue(undefined);
const trim = vi.fn().mockResolvedValue(undefined);
const upsert = vi.fn().mockResolvedValue(undefined);

export const useTastingNotesDatabase = vi.fn().mockReturnValue({
  getAll,
  save,
  remove,
  reset,
  trim,
  upsert,
});
