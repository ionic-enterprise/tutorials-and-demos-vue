import Tab3Page from '@/views/Tab3Page.vue';
import { IonTitle } from '@ionic/vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { VueWrapper, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { Router } from 'vue-router';

describe('Tab3Page.vue', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: Tab3Page }],
    });
    router.push('/');
    await router.isReady();
    return mount(Tab3Page, {
      global: {
        plugins: [router],
      },
    });
  };

  it('displays the title', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAllComponents(IonTitle);
    expect(titles).toHaveLength(2);
    expect(titles[0].text()).toBe('Tab 3');
    expect(titles[1].text()).toBe('Tab 3');
  });
});
