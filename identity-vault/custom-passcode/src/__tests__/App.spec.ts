import App from '@/App.vue';
import { useSessionVault } from '@/composables/session-vault';
import { VueWrapper, shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
});
