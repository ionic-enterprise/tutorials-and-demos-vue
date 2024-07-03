import App from '@/App.vue';
import { useSessionVault } from '@/composables/session-vault';
import { VueWrapper, flushPromises, shallowMount } from '@vue/test-utils';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router, createRouter, createWebHistory } from 'vue-router';

vi.mock('@capacitor/splash-screen');
vi.mock('@/composables/session-vault');

describe('App.vue', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: App }],
    });
    router.push('/');
    await router.isReady();
    return shallowMount(App, {
      global: {
        plugins: [router],
      },
    });
  };

  beforeEach(() => {
    const { session } = useSessionVault();
    session.value = {
      email: 'testy@test.com',
      firstName: 'Testy',
      lastName: 'McTesterson',
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    };
    vi.clearAllMocks();
  });

  it('renders', async () => {
    const wrapper = await mountView();
    expect(wrapper.exists()).toBe(true);
  });

  it('redirects to root on session lock', async () => {
    const { session, sessionIsLocked } = useSessionVault();
    (sessionIsLocked as Mock).mockResolvedValue(true);
    await mountView();
    router.replace = vi.fn();
    session.value = null;
    await flushPromises();
    expect(router.replace).toHaveBeenCalledOnce();
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('does not redirect if the session is not locked', async () => {
    const { session, sessionIsLocked } = useSessionVault();
    (sessionIsLocked as Mock).mockResolvedValue(false);
    await mountView();
    router.replace = vi.fn();
    session.value = null;
    await flushPromises();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
