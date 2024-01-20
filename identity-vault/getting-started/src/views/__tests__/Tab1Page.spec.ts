import { useSessionVault } from '@/composables/session-vault';
import Tab1Page from '@/views/Tab1Page.vue';
import { mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRouter, createWebHistory, Router } from 'vue-router';

vi.mock('@/composables/session-vault');

describe('Tab1 Page', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: Tab1Page }],
    });
    router.push('/');
    await router.isReady();
    return mount(Tab1Page, {
      global: {
        plugins: [router],
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the title', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAllComponents('ion-title') as Array<VueWrapper>;
    expect(titles).toHaveLength(2);
    expect(titles[0].text()).toBe('Tab 1');
    expect(titles[1].text()).toBe('Tab 1');
  });

  it('gets the current session', async () => {
    const { getSession } = useSessionVault();
    await mountView();
    expect(getSession).toHaveBeenCalledOnce();
  });

  describe('session display area', () => {
    it('displays a session when it is set', async () => {
      const { session } = useSessionVault();
      session.value = {
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        refreshToken: '99f99vkeldks',
        accessToken: 'kkkvd00e9few',
      };
      const wrapper = await mountView();
      const s = wrapper.find('[data-testid="session"]');
      expect(s.text()).toContain('Test User');
      expect(s.text()).toContain('test@test.com');
      expect(s.text()).toContain('99f99vkeldks');
      expect(s.text()).toContain('kkkvd00e9few');
    });

    it('displays nothing when a session is not set', async () => {
      const { session } = useSessionVault();
      session.value = null;
      const wrapper = await mountView();
      const s = wrapper.find('[data-testid="session"]');
      expect(s.text()).toBe('');
    });
  });

  describe('store button', () => {
    it('stores the session on click', async () => {
      const { storeSession } = useSessionVault();
      const wrapper = await mountView();
      const btn = wrapper.find('[data-testid="store"]');
      await btn.trigger('click');
      expect(storeSession).toHaveBeenCalledOnce();
      expect(storeSession).toHaveBeenCalledWith({
        email: 'test@ionic.io',
        firstName: 'Tessa',
        lastName: 'Testsmith',
        accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
        refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
      });
    });
  });

  describe('clear button', () => {
    it('clears the session on click', async () => {
      const { clearSession } = useSessionVault();
      const wrapper = await mountView();
      const btn = wrapper.find('[data-testid="clear"]');
      await btn.trigger('click');
      expect(clearSession).toHaveBeenCalledOnce();
    });
  });

  describe('use biometrics button', () => {
    it('updates the unlock mode', async () => {
      const { updateUnlockMode } = useSessionVault();
      const wrapper = await mountView();
      const btn = wrapper.find('[data-testid="use-biometrics"]');
      await btn.trigger('click');
      expect(updateUnlockMode).toHaveBeenCalledOnce();
      expect(updateUnlockMode).toHaveBeenCalledWith('BiometricsWithPasscode');
    });
  });

  describe('use in memory button', () => {
    it('updates the unlock mode', async () => {
      const { updateUnlockMode } = useSessionVault();
      const wrapper = await mountView();
      const btn = wrapper.find('[data-testid="use-in-memory"]');
      await btn.trigger('click');
      expect(updateUnlockMode).toHaveBeenCalledOnce();
      expect(updateUnlockMode).toHaveBeenCalledWith('InMemory');
    });
  });

  describe('use secure storage button', () => {
    it('updates the unlock mode', async () => {
      const { updateUnlockMode } = useSessionVault();
      const wrapper = await mountView();
      const btn = wrapper.find('[data-testid="use-secure-storage"]');
      await btn.trigger('click');
      expect(updateUnlockMode).toHaveBeenCalledOnce();
      expect(updateUnlockMode).toHaveBeenCalledWith('SecureStorage');
    });
  });

  describe('lock button', () => {
    it('lock the session on click', async () => {
      const { lockSession } = useSessionVault();
      const wrapper = await mountView();
      const btn = wrapper.find('[data-testid="lock"]');
      await btn.trigger('click');
      expect(lockSession).toHaveBeenCalledOnce();
    });
  });

  describe('unlock button', () => {
    it('gets the session on click', async () => {
      const { getSession } = useSessionVault();
      const wrapper = await mountView();
      vi.clearAllMocks();
      const btn = wrapper.find('[data-testid="unlock"]');
      await btn.trigger('click');
      expect(getSession).toHaveBeenCalledOnce();
    });
  });
});
