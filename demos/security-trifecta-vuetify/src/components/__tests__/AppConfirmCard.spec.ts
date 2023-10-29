import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import AppConfirmCard from '../AppConfirmCard.vue';

describe('confirm card', () => {
  const vuetify = createVuetify({ components, directives });
  const mountComponent = (question: string) =>
    mount(AppConfirmCard, { global: { plugins: [vuetify] }, props: { question } });

  it('displays the question', () => {
    const question = 'This is the question that I will ask?';
    const wrapper = mountComponent(question);
    expect(wrapper.find('[data-testid="body"]').text()).toBe(question);
  });

  it('emits cancel on no pressed', async () => {
    const wrapper = mountComponent('This is the question that I will ask?');
    const button = wrapper.find('[data-testid="no-button"]');
    await button.trigger('click');
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('emits confirm on yes pressed', async () => {
    const wrapper = mountComponent('This is the question that I will ask?');
    const button = wrapper.find('[data-testid="yes-button"]');
    await button.trigger('click');
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });
});
