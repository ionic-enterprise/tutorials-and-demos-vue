import { useAuthentication } from '@/composables/authentication';
import { useSessionVault } from '@/composables/session-vault';
import LoginPage from '@/views/LoginPage.vue';
import StartPage from '@/views/StartPage.vue';
import Tab1Page from '@/views/Tab1Page.vue';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { createRouter, createWebHistory, Router } from 'vue-router';

vi.mock('@/composables/authentication');
vi.mock('@/composables/session-vault');

describe('Start Page', () => {
  let router: Router;

  const mountView = async (): Promise<VueWrapper<any>> => {
    router = createRouter({
      history: createWebHistory(process.env.BASE_URL),
      routes: [
        { path: '/', component: StartPage },
        { path: '/login', component: LoginPage },
        { path: '/tabs/tab1', component: Tab1Page },
      ],
    });
    router.push('/');
    await router.isReady();
    return mount(StartPage, {
      global: {
        plugins: [router],
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has no titles', async () => {
    const wrapper = await mountView();
    const titles = wrapper.findAllComponents('ion-title') as Array<VueWrapper>;
    expect(titles).toHaveLength(0);
  });

  describe('on view did enter', () => {
    describe('if the session is not locked', () => {
      beforeEach(() => {
        const { sessionIsLocked } = useSessionVault();
        (sessionIsLocked as Mock).mockResolvedValue(false);
      });

      it('does not try to unlock the vault', async () => {
        const { unlockSession } = useSessionVault();
        const wrapper = await mountView();
        wrapper.vm.onIonViewDidEnter[0]();
        await flushPromises();
        expect(unlockSession).not.toHaveBeenCalled();
      });

      describe('if the user is authenticated', () => {
        beforeEach(() => {
          const { isAuthenticated } = useAuthentication();
          (isAuthenticated as Mock).mockResolvedValue(true);
        });

        it('redirects to the tab1 page', async () => {
          const wrapper = await mountView();
          router.replace = vi.fn();
          wrapper.vm.onIonViewDidEnter[0]();
          await flushPromises();
          expect(router.replace).toHaveBeenCalledOnce();
          expect(router.replace).toHaveBeenCalledWith('/tabs/tab1');
        });
      });

      describe('if the user is not authenticated', () => {
        beforeEach(() => {
          const { isAuthenticated } = useAuthentication();
          (isAuthenticated as Mock).mockResolvedValue(false);
        });

        it('redirects to the login page', async () => {
          const wrapper = await mountView();
          router.replace = vi.fn();
          wrapper.vm.onIonViewDidEnter[0]();
          await flushPromises();
          expect(router.replace).toHaveBeenCalledOnce();
          expect(router.replace).toHaveBeenCalledWith('/login');
        });
      });
    });

    describe('if the session is locked', () => {
      beforeEach(() => {
        const { sessionIsLocked } = useSessionVault();
        (sessionIsLocked as Mock).mockResolvedValue(false).mockResolvedValueOnce(true);
      });

      it('attempts to unlock the vault', async () => {
        const { unlockSession } = useSessionVault();
        const wrapper = await mountView();
        wrapper.vm.onIonViewDidEnter[0]();
        await flushPromises();
        expect(unlockSession).toHaveBeenCalledOnce();
      });

      describe('the unlock succeeds', () => {
        describe('if the user is authenticated', () => {
          beforeEach(() => {
            const { isAuthenticated } = useAuthentication();
            (isAuthenticated as Mock).mockResolvedValue(true);
          });

          it('redirects to the tab1 page', async () => {
            const wrapper = await mountView();
            router.replace = vi.fn();
            wrapper.vm.onIonViewDidEnter[0]();
            await flushPromises();
            expect(router.replace).toHaveBeenCalledOnce();
            expect(router.replace).toHaveBeenCalledWith('/tabs/tab1');
          });
        });

        describe('if the user is not authenticated', () => {
          beforeEach(() => {
            const { isAuthenticated } = useAuthentication();
            (isAuthenticated as Mock).mockResolvedValue(false);
          });

          it('redirects to the login page', async () => {
            const wrapper = await mountView();
            router.replace = vi.fn();
            wrapper.vm.onIonViewDidEnter[0]();
            await flushPromises();
            expect(router.replace).toHaveBeenCalledOnce();
            expect(router.replace).toHaveBeenCalledWith('/login');
          });
        });
      });

      describe('the unlock fails', () => {
        beforeEach(() => {
          const { sessionIsLocked, unlockSession } = useSessionVault();
          (unlockSession as Mock).mockRejectedValue(new Error('unlock failed'));
          (sessionIsLocked as Mock).mockResolvedValue(true);
        });

        it('redirects to the unlock page', async () => {
          const wrapper = await mountView();
          router.replace = vi.fn();
          wrapper.vm.onIonViewDidEnter[0]();
          await flushPromises();
          expect(router.replace).toHaveBeenCalledOnce();
          expect(router.replace).toHaveBeenCalledWith('/unlock');
        });
      });
    });
  });
});
