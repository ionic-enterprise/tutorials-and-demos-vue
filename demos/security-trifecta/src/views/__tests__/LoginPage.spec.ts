import { useSessionVault } from '@/composables/session-vault';
import { useSync } from '@/composables/sync';
import LoginPage from '@/views/LoginPage.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { Router } from 'vue-router';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/composables/session-vault');
vi.mock('@/composables/sync');

describe('LoginPage.vue', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: LoginPage }],
    });
    router.push('/');
    await router.isReady();
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [router],
      },
    });
    await flushPromises();
    return wrapper;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('without a session that can be unlocked', () => {
    beforeEach(() => {
      const { canUnlock } = useSessionVault();
      (canUnlock as Mock).mockResolvedValue(false);
    });

    it('displays the login card', async () => {
      const wrapper = await mountView();
      const loginCard = wrapper.findComponent('[data-testid="login-card"]');
      const unlockCard = wrapper.findComponent('[data-testid="unlock-card"]');
      expect(loginCard.exists()).toBe(true);
      expect(unlockCard.exists()).toBe(false);
    });

    describe('on login success', () => {
      it('syncs the database', async () => {
        const sync = useSync();
        const wrapper = await mountView();
        const loginCard = wrapper.findComponent('[data-testid="login-card"]') as VueWrapper;
        loginCard.vm.$emit('success');
        await flushPromises();
        expect(sync).toHaveBeenCalledTimes(1);
      });

      it('redirects to the main route', async () => {
        const wrapper = await mountView();
        const loginCard = wrapper.findComponent('[data-testid="login-card"]') as VueWrapper;
        router.replace = vi.fn();
        loginCard.vm.$emit('success');
        await flushPromises();
        expect(router.replace).toHaveReturnedTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('with a session that can be unlocked', () => {
    beforeEach(() => {
      const { canUnlock } = useSessionVault();
      (canUnlock as Mock).mockResolvedValue(true);
    });

    it('displays the unlock card', async () => {
      const wrapper = await mountView();
      const loginCard = wrapper.findComponent('[data-testid="login-card"]');
      const unlockCard = wrapper.findComponent('[data-testid="unlock-card"]');
      expect(loginCard.exists()).toBe(false);
      expect(unlockCard.exists()).toBe(true);
    });

    describe('on unlock', () => {
      it('navigates to the main route', async () => {
        const wrapper = await mountView();
        const unlockCard = wrapper.findComponent('[data-testid="unlock-card"]') as VueWrapper;
        router.replace = vi.fn();
        unlockCard.vm.$emit('unlocked');
        await flushPromises();
        expect(router.replace).toHaveReturnedTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/');
      });
    });

    describe('on vault cleared', () => {
      it('displays the login card', async () => {
        const wrapper = await mountView();
        let unlockCard = wrapper.findComponent('[data-testid="unlock-card"]') as VueWrapper;
        unlockCard.vm.$emit('vault-cleared');
        await flushPromises();
        unlockCard = wrapper.findComponent('[data-testid="unlock-card"]') as VueWrapper;
        const loginCard = wrapper.findComponent('[data-testid="login-card"]');
        expect(loginCard.exists()).toBe(true);
        expect(unlockCard.exists()).toBe(false);
      });
    });
  });
});
