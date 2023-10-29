import { vi } from 'vitest';

const getAll = vi.fn().mockResolvedValue([]);
const save = vi.fn().mockResolvedValue(undefined);
const remove = vi.fn().mockResolvedValue(undefined);

export const useTastingNotesAPI = vi.fn().mockReturnValue({
  getAll,
  save,
  remove,
});
