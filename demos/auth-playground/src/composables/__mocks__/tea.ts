import { Tea } from '@/models';
import { vi } from 'vitest';
import { ref } from 'vue';

export const useTea = vi.fn().mockReturnValue({
  teas: ref<Array<Tea>>([]),
  find: vi.fn().mockResolvedValue(undefined),
  rate: vi.fn().mockResolvedValue(undefined),
  refresh: vi.fn().mockResolvedValue(false),
});
