import { vi } from 'vitest';

const getAll = vi.fn().mockResolvedValue([]);

export const useTeaCategoriesAPI = vi.fn().mockReturnValue({
  getAll,
});
