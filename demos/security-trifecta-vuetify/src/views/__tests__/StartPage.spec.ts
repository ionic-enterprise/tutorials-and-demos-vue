import { useSessionVault } from '@/composables/session-vault';
import StartPage from '@/views/StartPage.vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useRouter } from 'vue-router';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

vi.mock('@/composables/session-vault');
vi.mock('vue-router');

describe('Start Page', () => {
  const vuetify = createVuetify({ components, directives });
  const mountPage = () => mount(StartPage, { global: { plugins: [vuetify] } });

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({
      replace: vi.fn(),
    });
  });

  it('renders', () => {
    const wrapper = mountPage();
    expect(wrapper.exists()).toBe(true);
  });

  it('redirects to login if there is something to unlock', async () => {
    const router = useRouter();
    const { canUnlock } = useSessionVault();
    (canUnlock as Mock).mockResolvedValue(true);
    mountPage();
    await flushPromises();
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  it('gives the home view a try if no unlocking is required', async () => {
    const router = useRouter();
    const { canUnlock } = useSessionVault();
    (canUnlock as Mock).mockResolvedValue(false);
    mountPage();
    await flushPromises();
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/home');
  });
});
