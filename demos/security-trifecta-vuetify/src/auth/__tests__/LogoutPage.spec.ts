import { useAuth } from '@/auth/composables/auth';
import LogoutPage from '@/auth/LogoutPage.vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useRouter } from 'vue-router';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

vi.mock('@/auth/composables/auth');
vi.mock('vue-router');

describe('Logout Page', () => {
  const vuetify = createVuetify({ components, directives });
  const mountPage = () => mount(LogoutPage, { global: { plugins: [vuetify] } });

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

  it('performs the logout', async () => {
    const { logout } = useAuth();
    mountPage();
    await flushPromises();
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('redirects to login', async () => {
    const router = useRouter();
    mountPage();
    await flushPromises();
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/login');
  });
});
