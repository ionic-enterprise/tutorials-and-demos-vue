import { UnlockMode, useSessionVault } from '@/composables/session-vault';
import { useVaultFactory } from '@/composables/vault-factory';
import router from '@/router';
import { Capacitor } from '@capacitor/core';
import { AuthResult } from '@ionic-enterprise/auth';
import { BiometricPermissionState, Device, DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/router', () => ({
  default: {
    replace: vi.fn(),
  },
}));
vi.mock('@capacitor/core');
vi.mock('@/composables/vault-factory');
vi.mock('@/router');

describe('useSessionVault', () => {
  let mockVault: any;
  const testSession = {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    idToken: 'test-id-token',
  };

  beforeEach(() => {
    const { createVault } = useVaultFactory();
    mockVault = createVault();
    // key: 'com.kensodemann.teataster',
    // type: VaultType.SecureStorage,
    // deviceSecurityType: DeviceSecurityType.None,
    // lockAfterBackgrounded: 5000,
    // shouldClearVaultAfterTooManyFailedAttempts: true,
    // customPasscodeInvalidUnlockAttempts: 2,
    // unlockVaultOnLoad: false,
    vi.clearAllMocks();
    (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
  });

  describe('after initialize', () => {
    beforeEach(async () => {
      const { initializeVault } = useSessionVault();
      await initializeVault();
    });

    it('starts with an undefined session', async () => {
      const { getSession } = useSessionVault();
      expect(await getSession()).toBeUndefined();
    });

    describe('setSession', () => {
      it('sets the session', async () => {
        const { getSession, setSession } = useSessionVault();
        await setSession(testSession as AuthResult);
        expect(await getSession()).toEqual(testSession);
      });

      it('stores the session in the vault', async () => {
        const { setSession } = useSessionVault();
        await setSession(testSession as AuthResult);
        expect(mockVault.setValue).toHaveBeenCalledTimes(1);
        expect(mockVault.setValue).toHaveBeenCalledWith('session', testSession);
      });
    });

    describe('clearSession', () => {
      beforeEach(async () => {
        const { setSession } = useSessionVault();
        await setSession(testSession as AuthResult);
      });

      it('clears the session', async () => {
        const { getSession, clearSession } = useSessionVault();
        await clearSession();
        expect(await getSession()).toBeUndefined();
      });

      it('removes the vault', async () => {
        const { clearSession } = useSessionVault();
        await clearSession();
        expect(mockVault.clear).toHaveBeenCalledTimes(1);
      });

      it('resets the unlock mode', async () => {
        const { clearSession } = useSessionVault();
        const expectedConfig = {
          ...mockVault.config,
          type: VaultType.SecureStorage,
          deviceSecurityType: DeviceSecurityType.None,
        };
        await clearSession();
        expect(mockVault.updateConfig).toHaveBeenCalledTimes(1);
        expect(mockVault.updateConfig).toHaveBeenCalledWith(expectedConfig);
      });
    });

    describe('getSession', () => {
      beforeEach(async () => {
        const { clearSession } = useSessionVault();
        await clearSession();
      });

      it('gets the session from the vault', async () => {
        const { getSession } = useSessionVault();
        (mockVault.getValue as Mock).mockResolvedValue(testSession);
        expect(await getSession()).toEqual(testSession);
        expect(mockVault.getValue).toHaveBeenCalledTimes(1);
        expect(mockVault.getValue).toHaveBeenCalledWith('session');
      });

      it('caches the retrieved session', async () => {
        const { getSession } = useSessionVault();
        (mockVault.getValue as Mock).mockResolvedValue(testSession);
        await getSession();
        await getSession();
        expect(mockVault.getValue).toHaveBeenCalledTimes(1);
      });

      it('caches the session set via setSession', async () => {
        const { getSession, setSession } = useSessionVault();
        await setSession(testSession as AuthResult);
        expect(await getSession()).toEqual(testSession);
        expect(mockVault.getValue).not.toHaveBeenCalled();
      });
    });

    describe('setUnlockMode', () => {
      it.each([
        ['Device' as UnlockMode, VaultType.DeviceSecurity, DeviceSecurityType.Both],
        ['SessionPIN' as UnlockMode, VaultType.CustomPasscode, DeviceSecurityType.None],
        ['ForceLogin' as UnlockMode, VaultType.InMemory, DeviceSecurityType.None],
        ['NeverLock' as UnlockMode, VaultType.SecureStorage, DeviceSecurityType.None],
      ])(
        'Sets the unlock mode for %s',
        async (unlockMode: UnlockMode, type: VaultType, deviceSecurityType: DeviceSecurityType) => {
          const expectedConfig = {
            ...mockVault.config,
            type,
            deviceSecurityType,
          };
          const { setUnlockMode } = useSessionVault();
          await setUnlockMode(unlockMode);
          expect(mockVault.updateConfig).toHaveBeenCalledTimes(1);
          expect(mockVault.updateConfig).toHaveBeenCalledWith(expectedConfig);
        },
      );

      describe('device mode', () => {
        it('provisions the FaceID permissions if needed', async () => {
          Device.isBiometricsAllowed = vi.fn(() => Promise.resolve(BiometricPermissionState.Prompt));
          Device.showBiometricPrompt = vi.fn(() => Promise.resolve());
          const { setUnlockMode } = useSessionVault();
          await setUnlockMode('Device');
          expect(Device.showBiometricPrompt).toHaveBeenCalledTimes(1);
          expect(Device.showBiometricPrompt).toHaveBeenCalledWith({
            iosBiometricsLocalizedReason: 'Authenticate to continue',
          });
        });

        it('does not provision the FaceID permissions if permissions have already been granted', async () => {
          Device.isBiometricsAllowed = vi.fn(() => Promise.resolve(BiometricPermissionState.Granted));
          Device.showBiometricPrompt = vi.fn(() => Promise.resolve());
          const { setUnlockMode } = useSessionVault();
          await setUnlockMode('Device');
          expect(Device.showBiometricPrompt).not.toHaveBeenCalled();
        });

        it('does not provision the FaceID permissions if permissions have already been denied', async () => {
          Device.isBiometricsAllowed = vi.fn(() => Promise.resolve(BiometricPermissionState.Denied));
          Device.showBiometricPrompt = vi.fn(() => Promise.resolve());
          const { setUnlockMode } = useSessionVault();
          await setUnlockMode('Device');
          expect(Device.showBiometricPrompt).not.toHaveBeenCalled();
        });
      });
    });

    describe('canUseLocking', () => {
      it('is false for web', () => {
        (Capacitor.isNativePlatform as Mock).mockReturnValue(false);
        const { canUseLocking } = useSessionVault();
        expect(canUseLocking()).toBe(false);
      });

      it('is true for native', () => {
        (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
        const { canUseLocking } = useSessionVault();
        expect(canUseLocking()).toBe(true);
      });
    });

    describe('canUnlock', () => {
      it.each([
        [true, false, true, true],
        [false, true, true, true],
        [false, false, false, true],
        [false, false, true, false],
      ])(
        'is %s for exists: %s, locked: %s, native: %s',
        async (expected: boolean, empty: boolean, locked: boolean, isNative: boolean) => {
          (Capacitor.isNativePlatform as Mock).mockReturnValue(isNative);
          const { canUnlock } = useSessionVault();
          mockVault.isLocked.mockResolvedValue(locked);
          mockVault.isEmpty.mockResolvedValue(empty);
          expect(await canUnlock()).toBe(expected);
        },
      );
    });

    describe('on lock', () => {
      beforeEach(async () => {
        const { setSession } = useSessionVault();
        await setSession(testSession as AuthResult);
        (mockVault.getValue as Mock).mockResolvedValue(undefined);
      });

      it('clears the session cache', async () => {
        const { getSession } = useSessionVault();
        mockVault.lock();
        await getSession();
        expect(mockVault.getValue).toHaveBeenCalledTimes(1);
      });

      it('goes to the login page', () => {
        mockVault.lock();
        expect(router.replace).toHaveBeenCalledTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/login');
      });
    });
  });
});
