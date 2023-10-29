import { vi } from 'vitest';

const getValue = vi.fn().mockResolvedValue(undefined);
const setValue = vi.fn().mockResolvedValue(undefined);

export const useStorage = vi.fn().mockReturnValue({
  getValue,
  setValue,
});
