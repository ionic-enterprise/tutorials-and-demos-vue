import App from '@/App.vue';
import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor/splash-screen');
vi.mock('@/composables/session-vault');

describe('App.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = shallowMount(App);
    expect(wrapper.exists()).toBe(true);
  });
});
