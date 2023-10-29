import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import TastingNotesPage from '@/tasting-notes/TastingNotesPage.vue';
import { useTastingNotes } from '@/tasting-notes/composables/tasting-notes';
import TastingNoteEditor from '@/tasting-notes/components/TastingNoteEditor.vue';
import TastingNoteViewer from '@/tasting-notes/components/TastingNoteViewer.vue';
import { nextTick } from 'vue';

vi.mock('@/composables/vault-factory');
vi.mock('@ionic-enterprise/secure-storage');
vi.mock('@/tasting-notes/composables/tasting-notes');

describe('Tasting Notes Page', () => {
  const vuetify = createVuetify({ components, directives });
  const mountPage = () => mount(TastingNotesPage, { global: { plugins: [vuetify] } });

  beforeEach(() => {
    vi.clearAllMocks();
    const { notes } = useTastingNotes();
    notes.value = [
      {
        editMode: 'view',
        data: {
          id: 1,
          brand: 'Lipton',
          name: 'Green',
          notes: 'Bland and dull, but better than their standard tea',
          rating: 2,
          teaCategoryId: 1,
        },
      },
      {
        editMode: 'view',
        data: {
          id: 3,
          brand: 'Rishi',
          name: 'Puer Tuo Cha',
          notes: 'Earthy with a bold a full flavor',
          rating: 5,
          teaCategoryId: 6,
        },
      },
      {
        editMode: 'view',
        data: {
          id: 42,
          brand: 'Rishi',
          name: 'Elderberry Healer',
          notes: 'Elderberry and ginger. Strong and healthy.',
          rating: 4,
          teaCategoryId: 7,
        },
      },
    ];
  });

  it('renders', () => {
    const wrapper = mountPage();
    expect(wrapper.exists()).toBe(true);
  });

  it('refreshes the tasting notes', () => {
    const { refresh } = useTastingNotes();
    mountPage();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('displays each note in a viewer', () => {
    const wrapper = mountPage();
    const views = wrapper.findAllComponents(TastingNoteViewer);
    const editors = wrapper.findAllComponents(TastingNoteEditor);
    expect(views.length).toBe(3);
    expect(editors.length).toBe(0);
  });

  describe('editing a note', () => {
    it('displays the editor', async () => {
      const wrapper = mountPage();
      let views = wrapper.findAllComponents(TastingNoteViewer);
      let editors = wrapper.findAllComponents(TastingNoteEditor);
      expect(views.length).toBe(3);
      expect(editors.length).toBe(0);
      views[2].vm.$emit('edit');
      await nextTick();
      views = wrapper.findAllComponents(TastingNoteViewer);
      editors = wrapper.findAllComponents(TastingNoteEditor);
      expect(views.length).toBe(2);
      expect(editors.length).toBe(1);
    });

    describe('cancel', () => {
      it('displays the viewer when the editor is cancelled', async () => {
        const wrapper = mountPage();
        let views = wrapper.findAllComponents(TastingNoteViewer);
        let editors = wrapper.findAllComponents(TastingNoteEditor);
        views[0].vm.$emit('edit');
        await nextTick();
        editors = wrapper.findAllComponents(TastingNoteEditor);
        editors[0].vm.$emit('cancel');
        await nextTick();
        views = wrapper.findAllComponents(TastingNoteViewer);
        editors = wrapper.findAllComponents(TastingNoteEditor);
        expect(views.length).toBe(3);
        expect(editors.length).toBe(0);
      });
    });

    describe('save', () => {
      it('saves the new data', async () => {
        const { notes, save } = useTastingNotes();
        const wrapper = mountPage();
        const views = wrapper.findAllComponents(TastingNoteViewer);
        let editors = wrapper.findAllComponents(TastingNoteEditor);
        views[1].vm.$emit('edit');
        await nextTick();
        editors = wrapper.findAllComponents(TastingNoteEditor);
        editors[0].vm.$emit('save', notes.value[1], {
          id: 3,
          brand: 'Foo Bar',
          name: 'Swill',
          notes: 'Earthy with a flavor full of sewage',
          rating: 1,
          teaCategoryId: 6,
        });
        await nextTick();
        expect(save).toHaveBeenCalledTimes(1);
        expect(save).toHaveBeenCalledWith({
          id: 3,
          brand: 'Foo Bar',
          name: 'Swill',
          notes: 'Earthy with a flavor full of sewage',
          rating: 1,
          teaCategoryId: 6,
        });
      });

      it('displays the viewer', async () => {
        const { notes } = useTastingNotes();
        const wrapper = mountPage();
        let views = wrapper.findAllComponents(TastingNoteViewer);
        let editors = wrapper.findAllComponents(TastingNoteEditor);
        views[1].vm.$emit('edit');
        await nextTick();
        editors = wrapper.findAllComponents(TastingNoteEditor);
        editors[0].vm.$emit('save', notes.value[1], {
          id: 3,
          brand: 'Foo Bar',
          name: 'Swill',
          notes: 'Earthy with a flavor full of sewage',
          rating: 1,
          teaCategoryId: 6,
        });
        await flushPromises();
        views = wrapper.findAllComponents(TastingNoteViewer);
        editors = wrapper.findAllComponents(TastingNoteEditor);
        expect(views.length).toBe(3);
        expect(editors.length).toBe(0);
      });
    });
  });

  describe('delete', () => {
    it('removes the note', () => {
      const { notes, remove } = useTastingNotes();
      const wrapper = mountPage();
      const views = wrapper.findAllComponents(TastingNoteViewer);
      expect(views.length).toBe(3);
      views[1].vm.$emit('delete', notes.value[1]);
      expect(remove).toHaveBeenCalledTimes(1);
      expect(remove).toHaveBeenCalledWith(notes.value[1].data);
    });
  });
});
