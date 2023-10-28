import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { isPlatform } from '@ionic/vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { Device, VaultType } from '@ionic-enterprise/identity-vault';
import VaultControlPage from '@/views/VaultControlPage.vue';
import { useSessionVault } from '@/composables/session-vault';
import waitForExpect from 'wait-for-expect';
import { Router } from 'vue-router';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@/composables/session-vault');
vi.mock('@ionic/vue', async () => {
  const actual = (await vi.importActual('@ionic/vue')) as any;
  return { ...actual, isPlatform: vi.fn() };
});

describe('VaultControlPage.vue', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [{ path: '/', component: VaultControlPage }],
    });
    router.push('/');
    await router.isReady();
    router.push = vi.fn();
    return mount(VaultControlPage, {
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
    const titles = wrapper.findAll('ion-title');
    expect(titles).toHaveLength(2);
    expect(titles[0].text()).toBe('Vault Control');
    expect(titles[1].text()).toBe('Vault Control');
  });

  describe('on web', () => {
    beforeEach(() => {
      (isPlatform as Mock).mockReturnValue(false);
    });

    describe('use biometrics button', () => {
      it('is disabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="use-device-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));
      });
    });

    describe('use system PIN button', () => {
      it('is disabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="use-system-passcode-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));
      });
    });

    describe('use custom PIN button', () => {
      it('is disabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="use-custom-passcode-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));
      });
    });

    describe('clear on lock button', () => {
      it('is disabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="clear-on-lock-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));
      });
    });

    describe('lock button', () => {
      it('is disabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="lock-vault-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));
      });
    });

    describe('clear vault button', () => {
      it('is enabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="clear-vault-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
      });

      it('clears the vault', async () => {
        const wrapper = await mountView();
        const { clear } = useSessionVault();
        const button = wrapper.findComponent('[data-testid="clear-vault-button"]');
        await button.trigger('click');
        expect(clear).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('on mobile', () => {
    beforeEach(() => {
      (isPlatform as Mock).mockReturnValue(true);
      Device.isSystemPasscodeSet = vi.fn().mockResolvedValue(true);
      Device.isBiometricsEnabled = vi.fn().mockResolvedValue(true);
    });

    describe('use biometrics button', () => {
      it('is enabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="use-device-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
      });

      it('is disabled if biometrics is not enabled', async () => {
        Device.isBiometricsEnabled = vi.fn().mockResolvedValue(false);
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="use-device-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));
      });

      it('sets the device vault type', async () => {
        const wrapper = await mountView();
        const { setUnlockMode } = useSessionVault();
        const button = wrapper.findComponent('[data-testid="use-device-button"]');
        await button.trigger('click');
        expect(setUnlockMode).toHaveBeenCalledTimes(1);
        expect(setUnlockMode).toHaveBeenCalledWith('Device');
      });
    });

    describe('use system PIN button', () => {
      it('is enabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="use-system-passcode-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
      });

      it('is disabled if the system passcode is not set', async () => {
        Device.isSystemPasscodeSet = vi.fn().mockResolvedValue(false);
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="use-system-passcode-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));
      });

      it('sets the system passcode type', async () => {
        const wrapper = await mountView();
        const { setUnlockMode } = useSessionVault();
        const button = wrapper.findComponent('[data-testid="use-system-passcode-button"]');
        await button.trigger('click');
        expect(setUnlockMode).toHaveBeenCalledTimes(1);
        expect(setUnlockMode).toHaveBeenCalledWith('SystemPIN');
      });
    });

    describe('use custom PIN button', () => {
      it('is enabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="use-custom-passcode-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
      });

      it('sets the custom passcode type', async () => {
        const wrapper = await mountView();
        const { setUnlockMode } = useSessionVault();
        const button = wrapper.findComponent('[data-testid="use-custom-passcode-button"]');
        await button.trigger('click');
        expect(setUnlockMode).toHaveBeenCalledTimes(1);
        expect(setUnlockMode).toHaveBeenCalledWith('SessionPIN');
      });
    });

    describe('clear on lock button', () => {
      it('is enabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="clear-on-lock-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
      });

      it('sets the in memory type', async () => {
        const wrapper = await mountView();
        const { setUnlockMode } = useSessionVault();
        const button = wrapper.findComponent('[data-testid="clear-on-lock-button"]');
        await button.trigger('click');
        expect(setUnlockMode).toHaveBeenCalledTimes(1);
        expect(setUnlockMode).toHaveBeenCalledWith('ForceLogin');
      });
    });

    describe('lock button', () => {
      it('is enabled', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="lock-vault-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
      });

      it('is disabled if the vault type is secure storage', async () => {
        const { getConfig } = useSessionVault();
        (getConfig as Mock).mockReturnValueOnce({ type: VaultType.SecureStorage });
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="lock-vault-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(true));
      });

      it('is disabled if never lock is pressed', async () => {
        const wrapper = await mountView();
        const button = wrapper.findComponent('[data-testid="lock-vault-button"]');
        await flushPromises();
        await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
      });

      it('locks the vault', async () => {
        const wrapper = await mountView();
        const { lock } = useSessionVault();
        const button = wrapper.findComponent('[data-testid="lock-vault-button"]');
        await button.trigger('click');
        expect(lock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('never lock button', () => {
    it('is enabled', async () => {
      const wrapper = await mountView();
      const button = wrapper.findComponent('[data-testid="never-lock-button"]');
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
    });

    it('sets the secure storage type', async () => {
      const wrapper = await mountView();
      const { setUnlockMode } = useSessionVault();
      const button = wrapper.findComponent('[data-testid="never-lock-button"]');
      await button.trigger('click');
      expect(setUnlockMode).toHaveBeenCalledTimes(1);
      expect(setUnlockMode).toHaveBeenCalledWith('NeverLock');
    });
  });

  describe('clear vault button', () => {
    it('is enabled', async () => {
      const wrapper = await mountView();
      const button = wrapper.findComponent('[data-testid="clear-vault-button"]');
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLIonButtonElement).disabled).toBe(false));
    });

    it('clears the vault', async () => {
      const wrapper = await mountView();
      const { clear } = useSessionVault();
      const button = wrapper.findComponent('[data-testid="clear-vault-button"]');
      await button.trigger('click');
      expect(clear).toHaveBeenCalledTimes(1);
    });
  });
});
