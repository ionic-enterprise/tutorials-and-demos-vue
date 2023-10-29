import { useTastingNotes } from '@/tasting-notes/composables/tasting-notes';
import { useTastingNotesAPI } from '@/tasting-notes/composables/tasting-notes-api';
import { useTastingNotesDatabase } from '@/tasting-notes/composables/tasting-notes-database';
import { TastingNote } from '@/tasting-notes/TastingNote';
import { useTeaCategories } from '@/tea-categories/composables/tea-categories';

const syncTastingNotes = async (): Promise<void> => {
  const { getAll, reset } = useTastingNotesDatabase();
  const { remove, save } = useTastingNotesAPI();
  const { load: loadTastingNotes } = useTastingNotes();

  const notes = await getAll(true);

  const calls: Array<Promise<any>> = [];
  notes.forEach((note: TastingNote) => {
    if (note.syncStatus === 'UPDATE') {
      calls.push(save(note));
    }
    if (note.syncStatus === 'INSERT') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...n } = note;
      calls.push(save(n));
    }
    if (note.syncStatus === 'DELETE') {
      calls.push(remove(note));
    }
  });
  await Promise.all(calls);
  await reset();
  await loadTastingNotes();
};

const syncTeaCategories = async (): Promise<void> => {
  const { load: loadTeaCategories } = useTeaCategories();
  await loadTeaCategories();
};

const sync = async (): Promise<void> => {
  await syncTastingNotes();
  await syncTeaCategories();
};

export const useSync = () => sync;
