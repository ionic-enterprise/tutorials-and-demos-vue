import { useSessionVault } from '@/composables/session-vault';
import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models/session';
import { DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/composables/vault-factory');

describe('useSessionVault', () => {
  let mockVault: any;
  let testSession: Session;

  beforeEach(() => {
    const { createVault } = useVaultFactory();
    mockVault = createVault();
    vi.clearAllMocks();
    testSession = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      accessToken: '1234567890',
      refreshToken: '0987654321',
    };
  });

  describe('initialize', () => {
    it('initializes the vault', async () => {
      const { initializeVault } = useSessionVault();
      await initializeVault();
      expect(mockVault.initialize).toHaveBeenCalledOnce();
      expect(mockVault.initialize).toHaveBeenCalledWith({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    });
  });

  describe('store session', () => {
    it('sets the value', async () => {
      const { storeSession } = useSessionVault();
      await storeSession(testSession);
      expect(mockVault.setValue).toHaveBeenCalledOnce();
      expect(mockVault.setValue).toHaveBeenCalledWith('session', testSession);
    });

    it('sets the session value', async () => {
      const { session, storeSession } = useSessionVault();
      await storeSession(testSession);
      expect(session.value).toEqual(testSession);
    });
  });

  describe('get session', () => {
    beforeEach(() => {
      mockVault.getValue.mockResolvedValue(testSession);
    });

    describe('when the vault is empty', () => {
      beforeEach(() => {
        mockVault.isEmpty.mockResolvedValue(true);
      });

      it('does not get the value from the vault', async () => {
        const { getSession } = useSessionVault();
        await getSession();
        expect(mockVault.getValue).not.toHaveBeenCalled();
      });

      it('sets the session false', async () => {
        const { getSession, session } = useSessionVault();
        await getSession();
        expect(session.value).toBeNull();
      });
    });

    describe('when the vault is not empty', () => {
      beforeEach(() => {
        mockVault.isEmpty.mockResolvedValue(false);
      });

      it('gets the value from the vault', async () => {
        const { getSession } = useSessionVault();
        await getSession();
        expect(mockVault.getValue).toHaveBeenCalledOnce();
        expect(mockVault.getValue).toHaveBeenCalledWith('session');
      });

      it('sets the session to the stored value', async () => {
        const { getSession, session } = useSessionVault();
        await getSession();
        expect(session.value).toEqual(testSession);
      });
    });
  });

  describe('clear session', () => {
    beforeEach(() => {
      const { storeSession } = useSessionVault();
      storeSession(testSession);
    });

    it('clears the vault', async () => {
      const { clearSession } = useSessionVault();
      await clearSession();
      expect(mockVault.clear).toHaveBeenCalledOnce();
    });

    it('sets the session null', async () => {
      const { clearSession, session } = useSessionVault();
      await clearSession();
      expect(session.value).toBeNull();
    });
  });

  describe('lock session', () => {
    beforeEach(() => {
      const { storeSession } = useSessionVault();
      storeSession(testSession);
    });

    it('locks the vault', async () => {
      const { lockSession } = useSessionVault();
      await lockSession();
      expect(mockVault.lock).toHaveBeenCalledOnce();
    });

    it('sets the session null', async () => {
      const { lockSession, session } = useSessionVault();
      await lockSession();
      expect(session.value).toBeNull();
    });
  });

  describe('session is locked', () => {
    describe('for secure storage mode', () => {
      beforeEach(async () => {
        const { initializeVault, updateUnlockMode } = useSessionVault();
        await initializeVault();
        await updateUnlockMode('SecureStorage');
        (mockVault as any).isLocked.mockResolvedValue(true);
        (mockVault as any).isEmpty.mockResolvedValue(false);
      });

      it('resolves false', () => {
        const { sessionIsLocked } = useSessionVault();
        expect(sessionIsLocked()).resolves.toBe(false);
      });
    });

    describe('for in memory mode', () => {
      beforeEach(async () => {
        const { initializeVault, updateUnlockMode } = useSessionVault();
        await initializeVault();
        await updateUnlockMode('InMemory');
        (mockVault as any).isLocked.mockResolvedValue(true);
        (mockVault as any).isEmpty.mockResolvedValue(false);
      });

      it('resolves false', () => {
        const { sessionIsLocked } = useSessionVault();
        expect(sessionIsLocked()).resolves.toBe(false);
      });
    });

    describe('for biometric mode', () => {
      beforeEach(async () => {
        const { initializeVault, updateUnlockMode } = useSessionVault();
        await initializeVault();
        await updateUnlockMode('BiometricsWithPasscode');
      });

      it('resolves true if not empty and locked', () => {
        (mockVault as any).isLocked.mockResolvedValue(true);
        (mockVault as any).isEmpty.mockResolvedValue(false);
        const { sessionIsLocked } = useSessionVault();
        expect(sessionIsLocked()).resolves.toBe(true);
      });

      it('resolves false if empty and locked', () => {
        (mockVault as any).isLocked.mockResolvedValue(true);
        (mockVault as any).isEmpty.mockResolvedValue(true);
        const { sessionIsLocked } = useSessionVault();
        expect(sessionIsLocked()).resolves.toBe(false);
      });

      it('resolves false if not empty and not locked', () => {
        (mockVault as any).isLocked.mockResolvedValue(false);
        (mockVault as any).isEmpty.mockResolvedValue(false);
        const { sessionIsLocked } = useSessionVault();
        expect(sessionIsLocked()).resolves.toBe(false);
      });
    });
  });

  describe('unlock session', () => {
    beforeEach(() => {
      mockVault.getValue.mockResolvedValue(testSession);
    });

    it('unlocks the vault', async () => {
      const { unlockSession } = useSessionVault();
      await unlockSession();
      expect(mockVault.unlock).toHaveBeenCalledOnce();
    });

    it('sets the session', async () => {
      const { session, unlockSession } = useSessionVault();
      await unlockSession();
      expect(session.value).toEqual(testSession);
    });
  });

  describe('update unlock mode', () => {
    beforeEach(() => {
      const { initializeVault } = useSessionVault();
      initializeVault();
    });

    it('updates to device security', async () => {
      const { updateUnlockMode } = useSessionVault();
      await updateUnlockMode('BiometricsWithPasscode');
      expect(mockVault.updateConfig).toHaveBeenCalledOnce();
      expect(mockVault.updateConfig).toHaveBeenCalledWith({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.DeviceSecurity,
        deviceSecurityType: DeviceSecurityType.Both,
        lockAfterBackgrounded: 2000,
      });
    });

    it('updates to in memory', async () => {
      const { updateUnlockMode } = useSessionVault();
      await updateUnlockMode('BiometricsWithPasscode');
      vi.clearAllMocks();
      await updateUnlockMode('InMemory');
      expect(mockVault.updateConfig).toHaveBeenCalledOnce();
      expect(mockVault.updateConfig).toHaveBeenCalledWith({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 30000,
      });
    });

    it('updates to secure storage', async () => {
      const { updateUnlockMode } = useSessionVault();
      await updateUnlockMode('BiometricsWithPasscode');
      vi.clearAllMocks();
      await updateUnlockMode('SecureStorage');
      expect(mockVault.updateConfig).toHaveBeenCalledOnce();
      expect(mockVault.updateConfig).toHaveBeenCalledWith({
        key: 'io.ionic.gettingstartediv',
        type: VaultType.SecureStorage,
        deviceSecurityType: DeviceSecurityType.None,
        lockAfterBackgrounded: 2000,
      });
    });
  });
});
