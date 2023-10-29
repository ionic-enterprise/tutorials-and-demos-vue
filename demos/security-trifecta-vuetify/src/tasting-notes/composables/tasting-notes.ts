import { Editable } from '@/models/Editable';
import { useTastingNotesAPI } from '@/tasting-notes/composables/tasting-notes-api';
import { useTastingNotesDatabase } from '@/tasting-notes/composables/tasting-notes-database';
import { TastingNote } from '@/tasting-notes/TastingNote';
import { Capacitor } from '@capacitor/core';
import { ref } from 'vue';

const notes = ref<Array<Editable<TastingNote>>>([]);

const load = async (): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    const { getAll } = useTastingNotesAPI();
    const { trim, upsert } = useTastingNotesDatabase();

    const notes = await getAll();
    await trim(notes.map((x: TastingNote) => x.id as number));
    const upserts: Array<Promise<any>> = notes.map((note: TastingNote) => upsert(note));
    await Promise.all(upserts);
  }
};

const refresh = async (): Promise<void> => {
  const { getAll } = Capacitor.isNativePlatform() ? useTastingNotesDatabase() : useTastingNotesAPI();
  const rawNotes = await getAll();
  notes.value = rawNotes.map((n) => ({ data: n, editMode: 'view' }));
};

const find = async (id: number): Promise<TastingNote | undefined> => {
  if (!notes.value.length) {
    await refresh();
  }
  const n = notes.value.find((n) => n.data.id === id);
  return n?.data;
};

const save = async (note: TastingNote): Promise<TastingNote | undefined> => {
  const { save } = Capacitor.isNativePlatform() ? useTastingNotesDatabase() : useTastingNotesAPI();
  const savedNote = await save(note);

  const idx = notes.value.findIndex((n) => n.data.id === savedNote.id);
  if (idx > -1) {
    notes.value[idx].data = savedNote;
  } else {
    notes.value.push({ editMode: 'view', data: savedNote });
  }
  return savedNote;
};

const remove = async (note: TastingNote): Promise<void> => {
  const { remove } = Capacitor.isNativePlatform() ? useTastingNotesDatabase() : useTastingNotesAPI();
  await remove(note);
  const idx = notes.value.findIndex((n) => n.data.id === note.id);
  notes.value.splice(idx, 1);
};

export const useTastingNotes = () => ({
  notes,
  find,
  load,
  refresh,
  remove,
  save,
});
