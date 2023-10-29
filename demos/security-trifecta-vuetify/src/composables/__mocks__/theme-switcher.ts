import { vi } from 'vitest';

const load = vi.fn().mockResolvedValue(undefined);
const toggle = vi.fn().mockResolvedValue(undefined);

export const useThemeSwitcher = vi.fn().mockReturnValue({
  load,
  toggle,
});
