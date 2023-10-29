import { useSessionVault } from '@/composables/session-vault';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import AppUnlockCard from '../AppUnlockCard.vue';

vi.mock('@/composables/auth');
vi.mock('@/composables/session-vault');
vi.mock('@/composables/sync');

describe('app unlock card', () => {
  const vuetify = createVuetify({ components, directives });
  const mountComponent = () => mount(AppUnlockCard, { global: { plugins: [vuetify] } });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the title', () => {
    const wrapper = mountComponent();
    const title = wrapper.findComponent('[data-testid="title"]');
    expect(title.text()).toBe('Your Session is Locked');
  });

  it('displays a subtitle', () => {
    const wrapper = mountComponent();
    const title = wrapper.findComponent('[data-testid="subtitle"]');
    expect(title.text()).toBe('Please unlock to continue');
  });

  describe('unlock button', () => {
    it('exists', () => {
      const wrapper = mountComponent();
      const button = wrapper.findComponent('[data-testid="unlock-button"]');
      expect(button.text()).toBe('Unlock');
    });

    it('unlocks the session', async () => {
      const { unlock } = useSessionVault();
      const wrapper = mountComponent();
      const button = wrapper.findComponent('[data-testid="unlock-button"]');
      await button.trigger('click');
      expect(unlock).toHaveBeenCalledTimes(1);
    });

    it('emits unlocked', async () => {
      const wrapper = mountComponent();
      const button = wrapper.findComponent('[data-testid="unlock-button"]');
      await button.trigger('click');
      expect(wrapper.emitted('unlocked')).toBeTruthy();
    });
  });

  describe('redo button', () => {
    it('exists', () => {
      const wrapper = mountComponent();
      const button = wrapper.findComponent('[data-testid="redo-signin-button"]');
      expect(button.text()).toBe('Redo Sign In Instead');
    });

    it('emits redo', async () => {
      const wrapper = mountComponent();
      const button = wrapper.findComponent('[data-testid="redo-signin-button"]');
      await button.trigger('click');
      expect(wrapper.emitted('redo')).toBeTruthy();
    });
  });
});
