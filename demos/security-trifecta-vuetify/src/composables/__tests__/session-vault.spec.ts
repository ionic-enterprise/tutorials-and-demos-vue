import { UnlockMode, useSessionVault } from '@/composables/session-vault';
import { useVaultFactory } from '@/composables/vault-factory';
import router from '@/router';
import { Capacitor } from '@capacitor/core';
import { BiometricPermissionState, Device, DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@/auth/composables/auth');
vi.mock('@capacitor/core');
vi.mock('@/composables/vault-factory');
vi.mock('@/router');

describe('useSessionVault', () => {
  let mockVault: any;

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

  describe('after initialization', () => {
    beforeEach(async () => {
      const { initializeVault } = useSessionVault();
      await initializeVault();
    });

    describe('get value', () => {
      it('calls the vault get value', async () => {
        const { getValue } = useSessionVault();
        await getValue('foo-key');
        expect(mockVault.getValue).toHaveBeenCalledTimes(1);
        expect(mockVault.getValue).toHaveBeenCalledWith('foo-key');
      });
    });

    describe('set value', () => {
      it('calls the vault set value', async () => {
        const { setValue } = useSessionVault();
        await setValue('foo-key', 'some random value');
        expect(mockVault.setValue).toHaveBeenCalledTimes(1);
        expect(mockVault.setValue).toHaveBeenCalledWith('foo-key', 'some random value');
      });
    });

    describe('clear', () => {
      it('calls the vault unlock', async () => {
        const { clear } = useSessionVault();
        await clear();
        expect(mockVault.clear).toHaveBeenCalledTimes(1);
      });
    });

    describe('unlock', () => {
      it('calls the vault unlock', async () => {
        const { unlock } = useSessionVault();
        await unlock();
        expect(mockVault.unlock).toHaveBeenCalledTimes(1);
      });
    });

    describe('initialize unlock type', () => {
      describe('on mobile', () => {
        beforeEach(() => {
          (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
        });

        it('uses a secure storage if no system PIN is set', async () => {
          Device.isSystemPasscodeSet = vi.fn().mockResolvedValue(false);
          const expectedConfig = {
            ...mockVault.config,
            type: VaultType.SecureStorage,
            deviceSecurityType: DeviceSecurityType.None,
          };
          const { initializeUnlockMode } = useSessionVault();
          await initializeUnlockMode();
          expect(mockVault.updateConfig).toHaveBeenCalledTimes(1);
          expect(mockVault.updateConfig).toHaveBeenCalledWith(expectedConfig);
        });

        it('uses device security if a system PIN is set and biometrics is enabled', async () => {
          Device.isSystemPasscodeSet = vi.fn().mockResolvedValue(true);
          Device.isBiometricsEnabled = vi.fn().mockResolvedValue(true);
          const expectedConfig = {
            ...mockVault.config,
            type: VaultType.DeviceSecurity,
            deviceSecurityType: DeviceSecurityType.Both,
          };
          const { initializeUnlockMode } = useSessionVault();
          await initializeUnlockMode();
          expect(mockVault.updateConfig).toHaveBeenCalledTimes(1);
          expect(mockVault.updateConfig).toHaveBeenCalledWith(expectedConfig);
        });

        it('uses system PIN if a system PIN is set and biometrics is not enabled', async () => {
          Device.isSystemPasscodeSet = vi.fn().mockResolvedValue(true);
          Device.isBiometricsEnabled = vi.fn().mockResolvedValue(false);
          const expectedConfig = {
            ...mockVault.config,
            type: VaultType.DeviceSecurity,
            deviceSecurityType: DeviceSecurityType.SystemPasscode,
          };
          const { initializeUnlockMode } = useSessionVault();
          await initializeUnlockMode();
          expect(mockVault.updateConfig).toHaveBeenCalledTimes(1);
          expect(mockVault.updateConfig).toHaveBeenCalledWith(expectedConfig);
        });
      });

      describe('on web', () => {
        beforeEach(() => {
          (Capacitor.isNativePlatform as Mock).mockReturnValue(false);
        });

        it('uses secure storage', async () => {
          const expectedConfig = {
            ...mockVault.config,
            type: VaultType.SecureStorage,
            deviceSecurityType: DeviceSecurityType.None,
          };
          const { initializeUnlockMode } = useSessionVault();
          await initializeUnlockMode();
          expect(mockVault.updateConfig).toHaveBeenCalledTimes(1);
          expect(mockVault.updateConfig).toHaveBeenCalledWith(expectedConfig);
        });
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

      it('is true for hybrid', () => {
        (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
        const { canUseLocking } = useSessionVault();
        expect(canUseLocking()).toBe(true);
      });
    });

    describe('canUnlock', () => {
      it.each([
        [true, true, true, 'hybrid'],
        [false, false, true, 'hybrid'],
        [false, true, false, 'hybrid'],
        [false, true, true, 'web'],
      ])(
        'is %s for exists: %s locked %s on %s',
        async (expected: boolean, exists: boolean, locked: boolean, platform: string) => {
          (Capacitor.isNativePlatform as Mock).mockReturnValue(platform === 'hybrid');
          const { canUnlock } = useSessionVault();
          mockVault.isLocked.mockResolvedValue(locked);
          mockVault.isEmpty.mockResolvedValue(!exists);
          expect(await canUnlock()).toBe(expected);
        },
      );
    });

    describe('on lock', () => {
      beforeEach(async () => {
        (mockVault.getValue as Mock).mockResolvedValue(undefined);
      });

      it('goes to the login page', () => {
        mockVault.lock();
        expect(router.replace).toHaveBeenCalledTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/login');
      });
    });
  });
});
