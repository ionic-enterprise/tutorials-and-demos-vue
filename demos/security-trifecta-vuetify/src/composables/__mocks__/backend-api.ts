import { vi } from 'vitest';

const mockDelete = vi.fn().mockResolvedValue({ data: null });
const get = vi.fn().mockResolvedValue({ data: null });
const post = vi.fn().mockResolvedValue({ data: null });

export const useBackendAPI = vi.fn().mockReturnValue({
  client: {
    delete: mockDelete,
    get,
    post,
  },
});
