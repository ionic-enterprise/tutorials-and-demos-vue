import App from '@/App.vue';
import { useSessionVault } from '@/composables/session-vault';
import { SplashScreen } from '@capacitor/splash-screen';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { Router } from 'vue-router';

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
    return mount(App, {
      global: {
        plugins: [router],
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', async () => {
    const wrapper = await mountView();
    expect(wrapper.exists()).toBe(true);
  });

  it('hides the splash screen', async () => {
    await mountView();
    expect(SplashScreen.hide).toHaveBeenCalled();
  });

  it.each([[true], [false]])('sets the background hiding', async (value: boolean) => {
    const { hideContentsInBackground, isHidingContentsInBackground } = useSessionVault();
    (isHidingContentsInBackground as Mock).mockResolvedValue(value);
    await mountView();
    await flushPromises();
    expect(hideContentsInBackground).toHaveBeenCalled();
    expect(hideContentsInBackground).toHaveBeenCalledWith(value);
  });
});
