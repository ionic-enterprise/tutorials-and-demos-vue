import { useAuthentication } from '@/composables/authentication';
import { useSessionVault } from '@/composables/session-vault';
import Tab1Page from '@/views/Tab1Page.vue';
import { mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRouter, createWebHistory, Router } from 'vue-router';

vi.mock('@/composables/authentication');
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

  describe('logout button', () => {
    it('calls logout on click', async () => {
      const { logout } = useAuthentication();
      const wrapper = await mountView();
      const btn = wrapper.find('[data-testid="logout"]');
      await btn.trigger('click');
      expect(logout).toHaveBeenCalledOnce();
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

  describe('use custom passcode button', () => {
    it('updates the unlock mode', async () => {
      const { updateUnlockMode } = useSessionVault();
      const wrapper = await mountView();
      const btn = wrapper.find('[data-testid="use-custom-passcode"]');
      await btn.trigger('click');
      expect(updateUnlockMode).toHaveBeenCalledOnce();
      expect(updateUnlockMode).toHaveBeenCalledWith('CustomPasscode');
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
});
