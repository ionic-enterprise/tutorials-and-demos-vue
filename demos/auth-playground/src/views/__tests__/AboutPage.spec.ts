import { Router } from 'vue-router';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import AboutPage from '@/views/AboutPage.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { useAuth } from '@/composables/auth';
import { useSessionVault } from '@/composables/session-vault';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/composables/auth');
vi.mock('@/composables/session-vault');

let router: Router;

const mountView = async (): Promise<VueWrapper<any>> => {
  router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: [{ path: '/', component: AboutPage }],
  });
  router.push('/');
  await router.isReady();
  return mount(AboutPage, {
    global: {
      plugins: [router],
    },
  });
};

describe('AboutPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the title', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAll('ion-title');
    expect(titles).toHaveLength(1);
    expect(titles[0].text()).toBe('About Auth Playground');
  });

  describe('logout button', () => {
    it('sets secure storage mode', async () => {
      const { setUnlockMode } = useSessionVault();
      const wrapper = await mountView();
      const button = wrapper.find('[data-testid="logout-button"]');
      router.replace = vi.fn();
      await button.trigger('click');
      await flushPromises();
      expect(setUnlockMode).toHaveBeenCalledTimes(1);
      expect(setUnlockMode).toHaveBeenCalledWith('NeverLock');
    });

    it('performs a logout', async () => {
      const { logout } = useAuth();
      const wrapper = await mountView();
      const button = wrapper.find('[data-testid="logout-button"]');
      router.replace = vi.fn();
      await button.trigger('click');
      expect(logout).toHaveBeenCalledTimes(1);
    });

    it('navigates to the login route', async () => {
      const wrapper = await mountView();
      const button = wrapper.find('[data-testid="logout-button"]');
      router.replace = vi.fn();
      await button.trigger('click');
      await flushPromises();
      expect(router.replace).toHaveBeenCalledTimes(1);
      expect(router.replace).toHaveBeenCalledWith('/login');
    });
  });
});
