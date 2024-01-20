import { useAuthentication } from '@/composables/authentication';
import LoginPage from '@/views/LoginPage.vue';
import Tab1Page from '@/views/Tab1Page.vue';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { createRouter, createWebHistory, Router } from 'vue-router';

vi.mock('@/composables/authentication');
vi.mock('@/composables/session-vault');

describe('Tab1 Page', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [
        { path: '/', component: LoginPage },
        { path: '/tabs/tab1', component: Tab1Page },
      ],
    });
    router.push('/');
    await router.isReady();
    return mount(LoginPage, {
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
    expect(titles[0].text()).toBe('Login');
    expect(titles[1].text()).toBe('Login');
  });

  describe('clicking on the login button', () => {
    let wrapper: VueWrapper<any>;
    beforeEach(async () => {
      wrapper = await mountView();
    });

    it('performs the login', async () => {
      const { login } = useAuthentication();
      const button = wrapper.find('[data-testid="login"]');
      button.trigger('click');
      expect(login).toHaveBeenCalledTimes(1);
    });

    describe('if the login succeeds', () => {
      beforeEach(() => {
        const { login } = useAuthentication();
        (login as Mock).mockResolvedValue(undefined);
      });

      it('navigates to the tab1 page', async () => {
        const button = wrapper.find('[data-testid="login"]');
        router.replace = vi.fn();
        await button.trigger('click');
        await flushPromises();
        expect(router.replace).toHaveBeenCalledTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/tabs/tab1');
      });
    });

    describe('if the login fails', () => {
      beforeEach(() => {
        const { login } = useAuthentication();
        (login as Mock).mockRejectedValue(new Error('that login is not right'));
      });

      it('does not navigate', async () => {
        const button = wrapper.find('[data-testid="login"]');
        router.replace = vi.fn();
        console.error = vi.fn();
        button.trigger('click');
        await flushPromises();
        expect(router.replace).not.toHaveBeenCalled();
      });
    });
  });
});
