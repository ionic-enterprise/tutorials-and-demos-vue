import { Router } from 'vue-router';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import ValueListPage from '@/views/ValueListPage.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { useSessionVault } from '@/composables/session-vault';
import { alertController } from '@ionic/vue';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@/composables/session-vault');
vi.mock('@ionic/vue', async () => {
  const actual = (await vi.importActual('@ionic/vue')) as any;
  return {
    ...actual,
    alertController: {
      create: vi.fn(),
    },
  };
});

let router: Router;

const mountView = async (): Promise<VueWrapper<any>> => {
  router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: [{ path: '/', component: ValueListPage }],
  });
  router.push('/');
  await router.isReady();
  return mount(ValueListPage, {
    global: {
      plugins: [router],
    },
  });
};

describe('ValueListPage.vue', () => {
  beforeEach(() => {
    const vault = useSessionVault();
    (vault.getKeys as Mock).mockResolvedValue([]);
    vi.clearAllMocks();
  });

  it('displays the title', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAll('ion-title');
    expect(titles).toHaveLength(2);
    expect(titles[0].text()).toBe('Stored Values');
    expect(titles[1].text()).toBe('Stored Values');
  });

  describe('without data', () => {
    it('displays no data', async () => {
      const wrapper = await mountView();
      await flushPromises();
      const list = wrapper.findComponent('[data-testid="value-list"]');
      const items = list.findAllComponents('ion-item');
      expect(items.length).toEqual(0);
    });
  });

  describe('with data', () => {
    beforeEach(() => {
      const vault = useSessionVault();
      (vault.getKeys as Mock).mockResolvedValue(['foo', 'bar', 'baz']);
      (vault.getValue as Mock).mockImplementation((key: string) => {
        return key === 'foo' ? 'cat' : key === 'bar' ? 'dog' : key === 'baz' ? 'mouse' : 'unknown';
      });
    });

    it('displays the data', async () => {
      const wrapper = await mountView();
      await flushPromises();
      const list = wrapper.findComponent('[data-testid="value-list"]');
      const items = list.findAllComponents('ion-item');
      expect(items.length).toEqual(3);
      expect(items[0].text()).toContain('foo');
      expect(items[0].text()).toContain('"cat"');
      expect(items[1].text()).toContain('bar');
      expect(items[1].text()).toContain('"dog"');
      expect(items[2].text()).toContain('baz');
      expect(items[2].text()).toContain('"mouse"');
    });
  });

  describe('add value', () => {
    const alert = {
      present: vi.fn().mockResolvedValue(undefined),
      onDidDismiss: vi.fn().mockResolvedValue({
        role: 'cancel',
        data: {
          values: { key: '', value: '' },
        },
      }),
    };

    beforeEach(() => {
      (alertController.create as Mock).mockResolvedValueOnce(alert);
    });

    it('creates and presents an alert', async () => {
      const wrapper = await mountView();
      const button = wrapper.findComponent('[data-testid="add-value-button"]');
      await button.trigger('click');
      expect(alertController.create).toHaveBeenCalledTimes(1);
      expect(alert.present).toHaveBeenCalledTimes(1);
    });

    describe('on cancel', () => {
      beforeEach(() => {
        alert.onDidDismiss.mockResolvedValue({
          role: 'cancel',
          data: { values: { key: 'foo', value: 'to the bar' } },
        });
      });

      it('does not save anything', async () => {
        const vault = useSessionVault();
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="add-value-button"]');
        await button.trigger('click');
        await flushPromises();
        expect(vault.setValue).not.toHaveBeenCalled();
      });
    });

    describe('without data', () => {
      beforeEach(() => {
        alert.onDidDismiss.mockResolvedValue({
          data: { values: { key: '', value: '' } },
        });
      });

      it('does not save anything', async () => {
        const vault = useSessionVault();
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="add-value-button"]');
        await button.trigger('click');
        await flushPromises();
        expect(vault.setValue).not.toHaveBeenCalled();
      });
    });

    describe('submitted with data', () => {
      beforeEach(() => {
        alert.onDidDismiss.mockResolvedValue({
          data: { values: { key: 'foo', value: 'to the bar' } },
        });
      });

      it('saves the item in the vault', async () => {
        const vault = useSessionVault();
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="add-value-button"]');
        await button.trigger('click');
        await flushPromises();
        expect(vault.setValue).toHaveBeenCalledTimes(1);
        expect(vault.setValue).toHaveBeenCalledWith('foo', 'to the bar');
      });

      it('refreshes the item in the list', async () => {
        const vault = useSessionVault();
        (vault.getKeys as Mock).mockResolvedValue(['bar', 'baz']);
        (vault.getValue as Mock).mockImplementation((key: string) => {
          return key === 'bar' ? 'dog' : key === 'baz' ? 'mouse' : 'unknown';
        });
        const wrapper = await mountView();
        await flushPromises();
        const list = wrapper.findComponent('[data-testid="value-list"]');
        let items = list.findAllComponents('ion-item');
        expect(items.length).toEqual(2);
        const button = wrapper.findComponent('[data-testid="add-value-button"]');
        (vault.getKeys as Mock).mockResolvedValue(['bar', 'baz', 'foo']);
        (vault.getValue as Mock).mockImplementation((key: string) => {
          return key === 'bar' ? 'dog' : key === 'baz' ? 'mouse' : key === 'foo' ? 'to the bar' : 'unknown';
        });
        await button.trigger('click');
        await flushPromises();
        items = list.findAllComponents('ion-item');
        expect(items.length).toEqual(3);
        expect(items[2].text()).toContain('foo');
        expect(items[2].text()).toContain('"to the bar"');
      });
    });
  });
});
