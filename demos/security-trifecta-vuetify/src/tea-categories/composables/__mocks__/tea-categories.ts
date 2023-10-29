import { TeaCategory } from '@/tea-categories/TeaCategory';
import { vi } from 'vitest';
import { ref } from 'vue';

const categories = ref<Array<TeaCategory>>([]);
const find = vi.fn().mockResolvedValue(undefined);
const load = vi.fn().mockResolvedValue(undefined);
const rate = vi.fn().mockResolvedValue(undefined);
const refresh = vi.fn().mockResolvedValue(undefined);

export const useTeaCategories = vi.fn().mockReturnValue({
  categories,
  find,
  load,
  rate,
  refresh,
});
