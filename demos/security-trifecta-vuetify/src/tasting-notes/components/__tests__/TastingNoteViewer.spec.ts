import { Editable } from '@/models';
import TastingNoteViewer from '@/tasting-notes/components/TastingNoteViewer.vue';
import { TastingNote } from '@/tasting-notes/TastingNote';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

describe('Tasting Note Card', () => {
  let testNote: Editable<TastingNote>;
  const vuetify = createVuetify({ components, directives });
  const mountComponent = (note: Editable<TastingNote>) =>
    mount(TastingNoteViewer, { global: { plugins: [vuetify] }, props: { note } });

  beforeEach(() => {
    vi.clearAllMocks();
    testNote = {
      editMode: 'view',
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

  it('displays the brand and name in the title', () => {
    const wrapper = mountComponent(testNote);
    const title = wrapper.findComponent('[data-testid="title"]');
    expect(title.text()).toBe('Lipton: Yellow Label');
  });

  it('displays the rating in the subtitle', () => {
    const wrapper = mountComponent(testNote);
    const subtitle = wrapper.findComponent('[data-testid="subtitle"]');
    expect(subtitle.text()).toBe('Rating: 1 star');
  });

  it('pluralizes the stars if more than one', () => {
    testNote.data.rating = 3;
    const wrapper = mountComponent(testNote);
    const subtitle = wrapper.findComponent('[data-testid="subtitle"]');
    expect(subtitle.text()).toBe('Rating: 3 stars');
  });

  it('displays the notes in the body', () => {
    const wrapper = mountComponent(testNote);
    const body = wrapper.findComponent('[data-testid="body"]');
    expect(body.text()).toBe('Very acidic with an overpowering tannic flavor');
  });

  describe('edit button', () => {
    it('emits edit', async () => {
      const wrapper = mountComponent(testNote);
      const button = wrapper.findComponent('[data-testid="edit-button"]');
      await button.trigger('click');
      expect(wrapper.emitted('edit')).toBeTruthy();
    });
  });
});
