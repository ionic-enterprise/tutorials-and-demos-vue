import { vi } from 'vitest';

const create = vi.fn().mockResolvedValue(undefined);
const echoTest = vi.fn().mockResolvedValue(undefined);
const selfTest = vi.fn().mockResolvedValue(undefined);
const deleteDatabase = vi.fn().mockResolvedValue(undefined);

export const SQLite = {
  create,
  echoTest,
  selfTest,
  deleteDatabase,
};
