import { useAuthentication } from '@/composables/authentication';
import Tab1Page from '@/views/Tab1Page.vue';
import { IonButton, IonTitle } from '@ionic/vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { VueWrapper, flushPromises, mount } from '@vue/test-utils';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'vue-router';

vi.mock('@/composables/authentication');

describe('Tab1Page.vue', () => {
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

  it('displays the title', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAllComponents(IonTitle);
    expect(titles).toHaveLength(2);
    expect(titles[0].text()).toBe('Tab 1');
    expect(titles[1].text()).toBe('Tab 1');
  });

  it('checks the authentication status', async () => {
    const { isAuthenticated } = useAuthentication();
    await mountView();
    await flushPromises();
    expect(isAuthenticated).toHaveBeenCalledOnce();
  });

  it('checks for an access token', async () => {
    const { getAccessToken } = useAuthentication();
    await mountView();
    await flushPromises();
    expect(getAccessToken).toHaveBeenCalledOnce();
  });

  describe('when logged in', () => {
    beforeEach(() => {
      const { getAccessToken, isAuthenticated } = useAuthentication();
      (getAccessToken as Mock).mockResolvedValue('i-am-an-access-token');
      (isAuthenticated as Mock).mockResolvedValue(true);
    });

    it('displays the token', async () => {
      const wrapper = await mountView();
      await flushPromises();
      const token = wrapper.find('pre');
      expect(token.text()).toBe('i-am-an-access-token');
    });

    it('displays the logout button', async () => {
      const wrapper = await mountView();
      await flushPromises();
      const buttons = wrapper.findAllComponents(IonButton);
      expect(buttons).toHaveLength(1);
      expect(buttons[0].text()).toBe('Logout');
    });

    it('logs out on click', async () => {
      const { login, logout } = useAuthentication();
      const wrapper = await mountView();
      await flushPromises();
      const button = wrapper.findComponent(IonButton);
      await button.trigger('click');
      expect(login).not.toHaveBeenCalled();
      expect(logout).toHaveBeenCalledOnce();
    });

    it('re-checks the access token', async () => {
      const { getAccessToken } = useAuthentication();
      const wrapper = await mountView();
      await flushPromises();
      const button = wrapper.findComponent(IonButton);
      await button.trigger('click');
      await flushPromises();
      expect(getAccessToken).toHaveBeenCalledTimes(2);
    });

    it('re-checks the auth status', async () => {
      const { isAuthenticated } = useAuthentication();
      const wrapper = await mountView();
      await flushPromises();
      const button = wrapper.findComponent(IonButton);
      await button.trigger('click');
      await flushPromises();
      expect(isAuthenticated).toHaveBeenCalledTimes(2);
    });
  });

  describe('when logged out', () => {
    beforeEach(() => {
      const { getAccessToken, isAuthenticated } = useAuthentication();
      (getAccessToken as Mock).mockResolvedValue(undefined);
      (isAuthenticated as Mock).mockResolvedValue(false);
    });

    it('does not display a token', async () => {
      const wrapper = await mountView();
      await flushPromises();
      const token = wrapper.find('pre');
      expect(token.text()).toBe('');
    });

    it('displays the login button', async () => {
      const wrapper = await mountView();
      await flushPromises();
      const buttons = wrapper.findAllComponents(IonButton);
      expect(buttons).toHaveLength(1);
      expect(buttons[0].text()).toBe('Login');
    });

    it('logs in on click', async () => {
      const { login, logout } = useAuthentication();
      const wrapper = await mountView();
      await flushPromises();
      const button = wrapper.findComponent(IonButton);
      await button.trigger('click');
      expect(logout).not.toHaveBeenCalled();
      expect(login).toHaveBeenCalledOnce();
    });

    it('re-checks the access token', async () => {
      const { getAccessToken } = useAuthentication();
      const wrapper = await mountView();
      await flushPromises();
      const button = wrapper.findComponent(IonButton);
      await button.trigger('click');
      await flushPromises();
      expect(getAccessToken).toHaveBeenCalledTimes(2);
    });

    it('re-checks the auth status', async () => {
      const { isAuthenticated } = useAuthentication();
      const wrapper = await mountView();
      await flushPromises();
      const button = wrapper.findComponent(IonButton);
      await button.trigger('click');
      await flushPromises();
      expect(isAuthenticated).toHaveBeenCalledTimes(2);
    });
  });
});
