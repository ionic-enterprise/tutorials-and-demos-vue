import Tab2Page from '@/views/Tab2Page.vue';
import { describe, expect, it, vi } from 'vitest';
import { IonTitle } from '@ionic/vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { mount, VueWrapper } from '@vue/test-utils';
import { Router } from 'vue-router';

describe('Tab2Page.vue', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: Tab2Page }],
    });
    router.push('/');
    await router.isReady();
    return mount(Tab2Page, {
      global: {
        plugins: [router],
      },
    });
  };

  it('displays the title', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAllComponents(IonTitle);
    expect(titles).toHaveLength(2);
    expect(titles[0].text()).toBe('Tab 2');
    expect(titles[1].text()).toBe('Tab 2');
  });
});
