import { Editable } from '@/models';
import TastingNoteEditor from '@/tasting-notes/components/TastingNoteEditor.vue';
import { TastingNote } from '@/tasting-notes/TastingNote';
import { useTeaCategories } from '@/tea-categories/composables/tea-categories';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import waitForExpect from 'wait-for-expect';

vi.mock('@/tea-categories/composables/tea-categories');

describe('Tasting Note Card', () => {
  let testNote: Editable<TastingNote>;
  let emptyNote: Editable<TastingNote>;
  const vuetify = createVuetify({ components, directives });
  const mountComponent = (note: Editable<TastingNote>) =>
    mount(TastingNoteEditor, { global: { plugins: [vuetify] }, props: { note } });

  beforeEach(() => {
    vi.clearAllMocks();
    emptyNote = {
      editMode: 'create',
      data: {
        brand: '',
        name: '',
        notes: '',
        rating: 0,
        teaCategoryId: 0,
        syncStatus: null,
      },
    };
    testNote = {
      editMode: 'edit',
      data: {
        id: 42,
        brand: 'Lipton',
        name: 'Yellow Label',
        notes: 'Very acidic with an overpowering tannic flavor',
        rating: 1,
        teaCategoryId: 3,
        syncStatus: 'UPDATE',
      },
    };
  });

  it('renders', () => {
    const wrapper = mountComponent(testNote);
    expect(wrapper.exists()).toBe(true);
  });

  it.skip('sets the values on mount', async () => {
    const wrapper = mountComponent(testNote);
    const brand = wrapper.findComponent('[data-testid="brand-input"]');
    const name = wrapper.findComponent('[data-testid="name-input"]');
    const notes = wrapper.findComponent('[data-testid="notes-input"]');
    const type = wrapper.findComponent('[data-testid="type-input"]');
    await flushPromises();
    expect((brand as any).componentVM.modelValue).toBe(testNote.data.brand);
    expect((name as any).componentVM.modelValue).toBe(testNote.data.name);
    expect((notes as any).componentVM.modelValue).toBe(testNote.data.notes);
    expect((type as any).componentVM.modelValue).toBe(testNote.data.teaCategoryId);
  });

  it('requires a brand', async () => {
    const wrapper = mountComponent(testNote);
    const brand = wrapper.findComponent('[data-testid="brand-input"]');
    const brandMsgs = brand.find('.v-messages');

    await waitForExpect(() => expect(brandMsgs.text()).toBe(''));

    await brand.setValue('');
    await waitForExpect(() => expect(brandMsgs.text()).toBe('Brand is a required field'));

    await brand.setValue('Wash my car');
    await waitForExpect(() => expect(brandMsgs.text()).toBe(''));
  });

  it('requires a name', async () => {
    const wrapper = mountComponent(testNote);
    const name = wrapper.findComponent('[data-testid="name-input"]');
    const nameMsgs = name.find('.v-messages');

    await waitForExpect(() => expect(nameMsgs.text()).toBe(''));

    await name.setValue('');
    await waitForExpect(() => expect(nameMsgs.text()).toBe('Name is a required field'));

    await name.setValue('Wash my car');
    await waitForExpect(() => expect(nameMsgs.text()).toBe(''));
  });

  it('requires notes', async () => {
    const wrapper = mountComponent(testNote);
    const notes = wrapper.findComponent('[data-testid="notes-input"]');
    const notesMsgs = notes.find('.v-messages');

    await waitForExpect(() => expect(notesMsgs.text()).toBe(''));

    await notes.setValue('');
    await waitForExpect(() => expect(notesMsgs.text()).toBe('Notes is a required field'));

    await notes.setValue('Wash my car');
    await waitForExpect(() => expect(notesMsgs.text()).toBe(''));
  });

  it('refreshes the tea-categories if needed', () => {
    const { refresh } = useTeaCategories();
    mountComponent(testNote);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('does not refresh the tea categories if they have already been fetched', () => {
    const { categories, refresh } = useTeaCategories();
    categories.value = [
      {
        id: 42,
        name: 'I am a tea',
        description: 'Just a tea',
      },
    ];
    mountComponent(testNote);
    expect(refresh).not.toHaveBeenCalled();
  });

  describe('save button', () => {
    it('is disabled until the required information is entered', async () => {
      const wrapper = mountComponent(emptyNote);
      const brand = wrapper.findComponent('[data-testid="brand-input"]');
      const name = wrapper.findComponent('[data-testid="name-input"]');
      const notes = wrapper.findComponent('[data-testid="notes-input"]');
      const type = wrapper.findComponent('[data-testid="type-input"]');
      const button = wrapper.findComponent('[data-testid="save-button"]');

      await waitForExpect(() => expect((button.element as HTMLButtonElement).disabled).toBe(true));
      await brand.setValue('Lipton');
      await waitForExpect(() => expect((button.element as HTMLButtonElement).disabled).toBe(true));
      await name.setValue('Green Tea');
      await waitForExpect(() => expect((button.element as HTMLButtonElement).disabled).toBe(true));
      await type.setValue(3);
      await waitForExpect(() => expect((button.element as HTMLButtonElement).disabled).toBe(true));
      await notes.setValue('A very basic green tea.');
      await waitForExpect(() => expect((button.element as HTMLButtonElement).disabled).toBe(false));
    });

    it.skip('emits the save event', async () => {
      const wrapper = mountComponent(emptyNote);
      const brand = wrapper.findComponent('[data-testid="brand-input"]');
      const name = wrapper.findComponent('[data-testid="name-input"]');
      const rating = wrapper.findComponent('[data-testid="rating-input"]');
      const notes = wrapper.findComponent('[data-testid="notes-input"]');
      const type = wrapper.findComponent('[data-testid="type-input"]');
      const button = wrapper.findComponent('[data-testid="save-button"]');

      await brand.setValue('Lipton');
      await name.setValue('Green Tea');
      await type.setValue(3);
      await rating.setValue(2);
      await notes.setValue('A very basic green tea.');
      await button.trigger('click');

      expect(wrapper.emitted('save')).toBeTruthy();
      expect(wrapper.emitted().save[0]).toEqual([
        emptyNote,
        {
          ...emptyNote.data,
          brand: 'Lipton',
          name: 'Green Tea',
          rating: 2,
          teaCategoryId: 3,
          notes: 'A very basic green tea.',
        },
      ]);
    });
  });

  describe('cancel button', () => {
    it('emits the cancel event', async () => {
      const wrapper = mountComponent(testNote);
      const button = wrapper.findComponent('[data-testid="cancel-button"]');

      await button.trigger('click');
      expect(wrapper.emitted('cancel')).toBeTruthy();
      expect(wrapper.emitted().cancel[0]).toEqual([testNote]);
    });
  });
});
