import { TastingNote } from '@/tasting-notes/TastingNote';
import { vi } from 'vitest';
import { ref } from 'vue';

const notes = ref<Array<TastingNote>>([]);
const find = vi.fn().mockResolvedValue(undefined);
const load = vi.fn().mockResolvedValue(undefined);
const refresh = vi.fn().mockResolvedValue(undefined);
const remove = vi.fn().mockResolvedValue(undefined);
const save = vi.fn().mockResolvedValue(undefined);

export const useTastingNotes = vi.fn().mockReturnValue({
  notes,
  find,
  load,
  refresh,
  remove,
  save,
});
