import { useAuthentication } from '@/composables/authentication';
import { useSessionVault } from '@/composables/session-vault';
import LoginPage from '@/views/LoginPage.vue';
import Tab1Page from '@/views/Tab1Page.vue';
import UnlockPage from '@/views/UnlockPage.vue';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { createRouter, createWebHistory, Router } from 'vue-router';

vi.mock('@/composables/authentication');
vi.mock('@/composables/session-vault');

describe('Unlock Page', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [
        { path: '/', component: UnlockPage },
        { path: '/login', component: LoginPage },
        { path: '/tabs/tab1', component: Tab1Page },
      ],
    });
    router.push('/');
    await router.isReady();
    return mount(UnlockPage, {
      global: {
        plugins: [router],
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has a title', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAllComponents('ion-title') as Array<VueWrapper>;
    expect(titles).toHaveLength(1);
  });

  describe('pressing the redo login button', () => {
    let wrapper: VueWrapper<any>;
    beforeEach(async () => {
      wrapper = await mountView();
      router.replace = vi.fn();
      await flushPromises();
      vi.clearAllMocks();
    });

    it('performs a logout', async () => {
      const { logout } = useAuthentication();
      const buttons = wrapper.findAllComponents('ion-button') as Array<VueWrapper>;
      await buttons[1].trigger('click');
      await flushPromises();
      expect(logout).toHaveBeenCalledOnce();
    });

    it('redirects to the login page', async () => {
      const buttons = wrapper.findAllComponents('ion-button') as Array<VueWrapper>;
      await buttons[1].trigger('click');
      await flushPromises();
      expect(router.replace).toHaveBeenCalledOnce();
      expect(router.replace).toHaveBeenCalledWith('/login');
    });
  });

  describe('pressing the unlock button ', () => {
    let wrapper: VueWrapper<any>;
    beforeEach(async () => {
      wrapper = await mountView();
      router.replace = vi.fn();
      await flushPromises();
      vi.clearAllMocks();
    });

    it('runs through the unlock process', async () => {
      const { sessionIsLocked, unlockSession } = useSessionVault();
      (sessionIsLocked as Mock).mockResolvedValue(false).mockResolvedValueOnce(true);
      (unlockSession as Mock).mockResolvedValue(undefined);
      const { isAuthenticated } = useAuthentication();
      (isAuthenticated as Mock).mockResolvedValue(true);
      const buttons = wrapper.findAllComponents('ion-button') as Array<VueWrapper>;
      await buttons[0].trigger('click');
      await flushPromises();
      expect(unlockSession).toHaveBeenCalledOnce();
      expect(router.replace).toHaveBeenCalledOnce();
      expect(router.replace).toHaveBeenCalledWith('/tabs/tab1');
    });
  });
});
