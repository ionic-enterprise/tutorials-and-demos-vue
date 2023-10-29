import { useAuth } from '@/auth/composables/auth';
import { useSessionVault } from '@/composables/session-vault';
import { useSync } from '@/composables/sync';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import AppLoginCard from '../AppLoginCard.vue';

vi.mock('@/auth/composables/auth');
vi.mock('@/composables/session-vault');
vi.mock('@/composables/sync');

describe('app login card', () => {
  const vuetify = createVuetify({ components, directives });
  const mountComponent = () => mount(AppLoginCard, { global: { plugins: [vuetify] } });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the title', () => {
    const wrapper = mountComponent();
    const title = wrapper.findComponent('[data-testid="title"]');
    expect(title.text()).toBe('Login');
  });

  it('displays a subtitle', () => {
    const wrapper = mountComponent();
    const title = wrapper.findComponent('[data-testid="subtitle"]');
    expect(title.text()).toBe('Ionic Security Trifecta Demo');
  });

  describe('sign in button', () => {
    it('is rendered', () => {
      const wrapper = mountComponent();
      const button = wrapper.find('[data-testid="signin-button"]');
      expect(button.text()).toBe('Sign In');
    });

    it('performs a login on press', async () => {
      const wrapper = mountComponent();
      const button = wrapper.find('[data-testid="signin-button"]');
      const { login } = useAuth();
      await button.trigger('click');
      expect(login).toHaveBeenCalledTimes(1);
    });

    describe('on success', () => {
      beforeEach(() => {
        const { login } = useAuth();
        (login as Mock).mockResolvedValue(undefined);
      });

      it('does not display an error', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        await button.trigger('click');
        await flushPromises();
        const error = wrapper.findComponent('[data-testid="signin-error"]');
        expect(error.exists()).toBe(false);
      });

      it('performs a sync', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        const sync = useSync();
        await button.trigger('click');
        await flushPromises();
        expect(sync).toHaveBeenCalledTimes(1);
      });

      it('initializes the unlock mode', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        const { initializeUnlockMode } = useSessionVault();
        await button.trigger('click');
        await flushPromises();
        expect(initializeUnlockMode).toHaveBeenCalledTimes(1);
      });

      it('emits success', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        await button.trigger('click');
        await flushPromises();
        expect(wrapper.emitted('success')).toBeTruthy();
      });
    });

    describe('on failure', () => {
      beforeEach(() => {
        const { login } = useAuth();
        (login as Mock).mockRejectedValue(new Error('Login closed'));
      });

      it('displays an error', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        await button.trigger('click');
        await flushPromises();
        const error = wrapper.findComponent('[data-testid="signin-error"]');
        expect(error.exists()).toBe(true);
      });

      it('does not performs a sync', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        const sync = useSync();
        await button.trigger('click');
        await flushPromises();
        expect(sync).not.toHaveBeenCalled();
      });

      it('does not set the unlock mode', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        const { setUnlockMode } = useSessionVault();
        await button.trigger('click');
        await flushPromises();
        expect(setUnlockMode).not.toHaveBeenCalled();
      });

      it('does not emit success', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        await button.trigger('click');
        await flushPromises();
        expect(wrapper.emitted('success')).toBeFalsy();
      });
    });
  });
});
