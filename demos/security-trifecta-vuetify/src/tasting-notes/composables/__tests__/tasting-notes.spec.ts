import { Editable } from '@/models/Editable';
import { useTastingNotes } from '@/tasting-notes/composables/tasting-notes';
import { useTastingNotesAPI } from '@/tasting-notes/composables/tasting-notes-api';
import { useTastingNotesDatabase } from '@/tasting-notes/composables/tasting-notes-database';
import { TastingNote } from '@/tasting-notes/TastingNote';
import { Capacitor } from '@capacitor/core';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@capacitor/core');
vi.mock('@/composables/session-vault');
vi.mock('@/tasting-notes/composables/tasting-notes-api');
vi.mock('@/tasting-notes/composables/tasting-notes-database');

describe('useTastingNotes', () => {
  let tastingNotes: Array<TastingNote>;
  let editableNotes: Array<Editable<TastingNote>>;

  const initializeTestData = () => {
    tastingNotes = [
      {
        id: 1,
        brand: 'Lipton',
        name: 'Green',
        notes: 'Bland and dull, but better than their standard tea',
        rating: 2,
        teaCategoryId: 1,
      },
      {
        id: 3,
        brand: 'Rishi',
        name: 'Puer Tuo Cha',
        notes: 'Earthy with a bold a full flavor',
        rating: 5,
        teaCategoryId: 6,
      },
      {
        id: 42,
        brand: 'Rishi',
        name: 'Elderberry Healer',
        notes: 'Elderberry and ginger. Strong and healthy.',
        rating: 4,
        teaCategoryId: 7,
      },
    ];
    editableNotes = tastingNotes.map((n) => ({ editMode: 'view', data: n }));
  };

  beforeEach(() => {
    const { getAll: getAllFromAPI } = useTastingNotesAPI();
    const { getAll: getAllFromDatabase } = useTastingNotesDatabase();
    initializeTestData();
    vi.clearAllMocks();
    (getAllFromAPI as Mock).mockResolvedValue(tastingNotes);
    (getAllFromDatabase as Mock).mockResolvedValue(tastingNotes);
    (Capacitor.isNativePlatform as Mock).mockReturnValue(false);
  });

  describe('load', () => {
    describe('on mobile', () => {
      beforeEach(() => {
        (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
      });

      it('gets the tasting notes from the backend API', async () => {
        const { getAll } = useTastingNotesAPI();
        const { load } = useTastingNotes();
        await load();
        expect(getAll).toHaveBeenCalledTimes(1);
      });

      it('trims the notes in the database', async () => {
        const { trim } = useTastingNotesDatabase();
        const { load } = useTastingNotes();
        await load();
        expect(trim).toHaveBeenCalledTimes(1);
        expect(trim).toHaveBeenCalledWith(tastingNotes.map((x) => x.id as number));
      });

      it('upserts each of the tasting notes', async () => {
        const { upsert } = useTastingNotesDatabase();
        const { load } = useTastingNotes();
        await load();
        expect(upsert).toHaveBeenCalledTimes(tastingNotes.length);
        tastingNotes.forEach((n) => expect(upsert).toHaveBeenCalledWith(n));
      });
    });

    describe('on web', () => {
      it('does not load the tasting notes', async () => {
        const { getAll } = useTastingNotesAPI();
        const { trim, upsert } = useTastingNotesDatabase();
        const { load } = useTastingNotes();
        await load();
        expect(getAll).not.toHaveBeenCalled();
        expect(trim).not.toHaveBeenCalled();
        expect(upsert).not.toHaveBeenCalled();
      });
    });
  });

  describe('refresh', () => {
    describe('on mobile', () => {
      beforeEach(() => {
        (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
      });

      it('gets the tasting notes from the database', async () => {
        const { getAll } = useTastingNotesDatabase();
        const { refresh } = useTastingNotes();
        await refresh();
        expect(getAll).toHaveBeenCalledTimes(1);
      });

      it('populates the notes data', async () => {
        const { refresh, notes } = useTastingNotes();
        await refresh();
        expect(notes.value).toEqual(editableNotes);
      });
    });

    describe('on the web', () => {
      it('gets the tasting notes from the API', async () => {
        const { getAll } = useTastingNotesAPI();
        const { refresh } = useTastingNotes();
        await refresh();
        expect(getAll).toHaveBeenCalledTimes(1);
      });

      it('populates the notes data', async () => {
        const { refresh, notes } = useTastingNotes();
        await refresh();
        expect(notes.value).toEqual(editableNotes);
      });
    });
  });

  describe('find', () => {
    const { find, refresh, notes } = useTastingNotes();

    beforeEach(() => {
      notes.value = [];
    });

    it('refreshes the tasting notes data if it has not been loaded yet', async () => {
      const t = await find(3);
      expect(notes.value.length).toEqual(3);
      expect(t).toEqual({
        id: 3,
        brand: 'Rishi',
        name: 'Puer Tuo Cha',
        notes: 'Earthy with a bold a full flavor',
        rating: 5,
        teaCategoryId: 6,
      });
    });

    it('finds the tasting notes from the existing tasting notes', async () => {
      const { getAll } = useTastingNotesAPI();
      await refresh();
      vi.clearAllMocks();
      const t = await find(3);
      expect(t).toEqual({
        id: 3,
        brand: 'Rishi',
        name: 'Puer Tuo Cha',
        notes: 'Earthy with a bold a full flavor',
        rating: 5,
        teaCategoryId: 6,
      });
      expect(getAll).not.toHaveBeenCalled();
    });

    it('return undefined if the tasting note does not exist', async () => {
      expect(await find(73)).toBeUndefined();
    });
  });

  describe('save', () => {
    const { notes, save, refresh } = useTastingNotes();
    beforeEach(async () => await refresh());

    describe('a new note', () => {
      const note: TastingNote = {
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Overly acidic, highly tannic flavor',
        rating: 1,
        teaCategoryId: 3,
      };

      describe('on mobile', () => {
        const { save: saveToDatabase } = useTastingNotesDatabase();

        beforeEach(() => {
          (saveToDatabase as Mock).mockResolvedValue({ id: 73, ...note });
          (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
        });

        it('saves the note to the database', async () => {
          await save(note);
          expect(saveToDatabase).toHaveBeenCalledTimes(1);
          expect(saveToDatabase).toHaveBeenCalledWith(note);
        });

        it('resolves the saved note', async () => {
          expect(await save(note)).toEqual({ id: 73, ...note });
        });

        it('adds the note to the notes list', async () => {
          await save(note);
          expect(notes.value.length).toEqual(4);
          expect(notes.value[3]).toEqual({ editMode: 'view', data: { id: 73, ...note } });
        });
      });

      describe('on the web', () => {
        const { save: saveToBackend } = useTastingNotesAPI();
        beforeEach(() => {
          (saveToBackend as Mock).mockResolvedValue({ id: 73, ...note });
        });

        it('posts the new note', async () => {
          await save(note);
          expect(saveToBackend).toHaveBeenCalledTimes(1);
          expect(saveToBackend).toHaveBeenCalledWith(note);
        });

        it('resolves the saved note', async () => {
          expect(await save(note)).toEqual({ id: 73, ...note });
        });

        it('adds the note to the notes list', async () => {
          await save(note);
          expect(notes.value.length).toEqual(4);
          expect(notes.value[3]).toEqual({ editMode: 'view', data: { id: 73, ...note } });
        });
      });
    });

    describe('an existing note', () => {
      const note: TastingNote = {
        id: 1,
        brand: 'Lipton',
        name: 'Green Tea',
        notes: 'Kinda like Lite beer. Dull, but well executed.',
        rating: 3,
        teaCategoryId: 1,
      };

      describe('on mobile', () => {
        const { save: saveToDatabase } = useTastingNotesDatabase();

        beforeEach(() => {
          (saveToDatabase as Mock).mockResolvedValue(note);
          (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
        });

        it('save the note in the database', async () => {
          await save(note);
          expect(saveToDatabase).toHaveBeenCalledTimes(1);
          expect(saveToDatabase).toHaveBeenCalledWith(note);
        });

        it('resolves the saved note', async () => {
          expect(await save(note)).toEqual(note);
        });

        it('update the note to the notes list', async () => {
          await save(note);
          expect(notes.value.length).toEqual(3);
          expect(notes.value[0].data).toEqual(note);
        });
      });

      describe('on the web', () => {
        const { save: saveToBackend } = useTastingNotesAPI();
        beforeEach(() => {
          (saveToBackend as Mock).mockResolvedValue(note);
        });

        it('saves the existing note', async () => {
          await save(note);
          expect(saveToBackend).toHaveBeenCalledTimes(1);
          expect(saveToBackend).toHaveBeenCalledWith(note);
        });

        it('resolves the saved note', async () => {
          expect(await save(note)).toEqual(note);
        });

        it('updates the note in the notes list', async () => {
          await save(note);
          expect(notes.value.length).toEqual(3);
          expect(notes.value[0].data).toEqual(note);
        });
      });
    });
  });

  describe('remove', () => {
    const { notes, remove, refresh } = useTastingNotes();
    beforeEach(async () => await refresh());

    describe('on mobile', () => {
      beforeEach(() => {
        (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
      });

      it('marks the note for deletion', async () => {
        const note = { ...tastingNotes[1] };
        const { remove: markTastingNoteForDelete } = useTastingNotesDatabase();
        await remove(tastingNotes[1]);
        expect(markTastingNoteForDelete).toHaveBeenCalledTimes(1);
        expect(markTastingNoteForDelete).toHaveBeenCalledWith(note);
      });

      it('removes the note from the notes', async () => {
        const note = { ...tastingNotes[1] };
        await remove(note);
        expect(notes.value.length).toEqual(2);
        expect(notes.value[0].data.id).toEqual(1);
        expect(notes.value[1].data.id).toEqual(42);
      });
    });

    describe('on the web', () => {
      it('deletes the existing note', async () => {
        const note = { ...tastingNotes[1] };
        const { remove: removeUsingAPI } = useTastingNotesAPI();
        await remove(note);
        expect(removeUsingAPI).toHaveBeenCalledTimes(1);
        expect(removeUsingAPI).toHaveBeenCalledWith(note);
      });

      it('removes the note from the notes', async () => {
        const note = { ...tastingNotes[1] };
        await remove(note);
        expect(notes.value.length).toEqual(2);
        expect(notes.value[0].data.id).toEqual(1);
        expect(notes.value[1].data.id).toEqual(42);
      });
    });
  });
});
