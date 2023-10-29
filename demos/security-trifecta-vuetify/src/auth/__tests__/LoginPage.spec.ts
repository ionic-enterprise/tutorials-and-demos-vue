import { useSessionVault } from '@/composables/session-vault';
import LoginPage from '@/auth/LoginPage.vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import AppLoginCard from '@/auth/components/AppLoginCard.vue';
import AppUnlockCard from '@/auth/components/AppUnlockCard.vue';
import { useThemeSwitcher } from '@/composables/theme-switcher';
import { createRouter, createWebHistory, Router } from 'vue-router';
vi.mock('@/composables/session-vault');

vi.mock('@/composables/sync');
vi.mock('@/composables/theme-switcher');

describe('LoginPage.vue', () => {
  let router: Router;
  const vuetify = createVuetify({ components, directives });
  const mountPage = () => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: LoginPage }],
    });
    router.push('/');
    router.replace = vi.fn();
    return mount(LoginPage, { global: { plugins: [router, vuetify] } });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { canUseLocking } = useSessionVault();
    (canUseLocking as Mock).mockReturnValue(true);
  });

  it('renders', () => {
    const wrapper = mountPage();
    expect(wrapper.exists()).toBe(true);
  });

  describe('when unlocked', () => {
    beforeEach(() => {
      const { canUnlock } = useSessionVault();
      (canUnlock as Mock).mockResolvedValue(false);
    });

    it('shows the login card', async () => {
      const wrapper = mountPage();
      await flushPromises();
      const login = wrapper.findComponent(AppLoginCard);
      const unlock = wrapper.findComponent(AppUnlockCard);
      expect(login.exists()).toBe(true);
      expect(unlock.exists()).toBe(false);
    });

    describe('on login success', () => {
      it('routes to home', async () => {
        const wrapper = mountPage();
        await flushPromises();
        const login = wrapper.findComponent(AppLoginCard);
        login.vm.$emit('success');
        expect(router.replace).toHaveBeenCalledTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/home');
      });

      it('loads the theme', async () => {
        const { load } = useThemeSwitcher();
        const wrapper = mountPage();
        await flushPromises();
        const login = wrapper.findComponent(AppLoginCard);
        login.vm.$emit('success');
        expect(load).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when locked', () => {
    beforeEach(() => {
      const { canUnlock } = useSessionVault();
      (canUnlock as Mock).mockResolvedValue(true);
    });

    it('shows the unlock card', async () => {
      const wrapper = mountPage();
      await flushPromises();
      const login = wrapper.findComponent(AppLoginCard);
      const unlock = wrapper.findComponent(AppUnlockCard);
      expect(login.exists()).toBe(false);
      expect(unlock.exists()).toBe(true);
    });

    describe('on unlock', () => {
      it('routes to home', async () => {
        const wrapper = mountPage();
        await flushPromises();
        const unlock = wrapper.findComponent(AppUnlockCard);
        unlock.vm.$emit('unlocked');
        expect(router.replace).toHaveBeenCalledTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/home');
      });

      it('loads the theme', async () => {
        const { load } = useThemeSwitcher();
        const wrapper = mountPage();
        await flushPromises();
        const unlock = wrapper.findComponent(AppUnlockCard);
        unlock.vm.$emit('unlocked');
        expect(load).toHaveBeenCalledTimes(1);
      });
    });

    describe('redo login', () => {
      it('clears the session vault', async () => {
        const wrapper = mountPage();
        await flushPromises();
        const { clear } = useSessionVault();
        const unlock = wrapper.findComponent(AppUnlockCard);
        unlock.vm.$emit('redo');
        await flushPromises();
        expect(clear).toHaveBeenCalledTimes(1);
      });

      it('hides the unlock card and shows the login card', async () => {
        const wrapper = mountPage();
        await flushPromises();
        const unlockB4 = wrapper.findComponent(AppUnlockCard);
        unlockB4.vm.$emit('redo');
        await flushPromises();
        const login = wrapper.findComponent(AppLoginCard);
        const unlock = wrapper.findComponent(AppUnlockCard);
        expect(login.exists()).toBe(true);
        expect(unlock.exists()).toBe(false);
      });
    });
  });
});
