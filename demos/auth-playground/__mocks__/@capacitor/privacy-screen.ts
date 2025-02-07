import { vi } from 'vitest';

export const PrivacyScreen = {
  enable: vi.fn().mockResolvedValue(undefined),
  disable: vi.fn().mockResolvedValue(undefined),
  isEnabled: vi.fn().mockResolvedValue({ enabled: false }),
};
