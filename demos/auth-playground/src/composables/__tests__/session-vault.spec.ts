import AppPinDialog from '@/components/AppPinDialog.vue';
import { BiometricPermissionState, Device, DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';
import { modalController, isPlatform } from '@ionic/vue';
import { Preferences } from '@capacitor/preferences';
import { useVaultFactory } from '@/composables/vault-factory';
import { useSessionVault, UnlockMode } from '@/composables/session-vault';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@capacitor/preferences');
vi.mock('@ionic/vue', async () => {
  const actual = (await vi.importActual('@ionic/vue')) as any;
  return { ...actual, isPlatform: vi.fn() };
});
vi.mock('@/composables/vault-factory');

describe('useSessionVault', () => {
  const { createVault } = useVaultFactory();
  const mockVault = createVault({
    key: 'io.ionic.auth-playground-vue-test',
    type: VaultType.SecureStorage,
    deviceSecurityType: DeviceSecurityType.None,
    lockAfterBackgrounded: 5000,
    shouldClearVaultAfterTooManyFailedAttempts: true,
    customPasscodeInvalidUnlockAttempts: 2,
    unlockVaultOnLoad: false,
  });
  const onPasscodeRequestedCallback = (mockVault.onPasscodeRequested as Mock).mock.calls[0][0];

  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('setUnlockMode', () => {
    describe('Device security', () => {
      beforeEach(() => {
        Device.showBiometricPrompt = vi.fn();
      });

      it('shows a bio prompt if provisioning the permission is required', async () => {
        Device.isBiometricsAllowed = vi.fn().mockResolvedValue(BiometricPermissionState.Prompt);
        const { setUnlockMode } = useSessionVault();
        await setUnlockMode('Device');
        expect(Device.showBiometricPrompt).toHaveBeenCalledTimes(1);
        expect(Device.showBiometricPrompt).toHaveBeenCalledWith({
          iosBiometricsLocalizedReason: 'Please authenticate to continue',
        });
      });

      it('does not show a bio prompt if the permission has already been granted', async () => {
        Device.isBiometricsAllowed = vi.fn().mockResolvedValue(BiometricPermissionState.Granted);
        const { setUnlockMode } = useSessionVault();
        await setUnlockMode('Device');
        expect(Device.showBiometricPrompt).not.toHaveBeenCalled();
      });

      it('does not show a bio prompt if the permission has already been denied', async () => {
        Device.isBiometricsAllowed = vi.fn().mockResolvedValue(BiometricPermissionState.Denied);
        const { setUnlockMode } = useSessionVault();
        await setUnlockMode('Device');
        expect(Device.showBiometricPrompt).not.toHaveBeenCalled();
      });
    });

    it.each([
      ['Device' as UnlockMode, VaultType.DeviceSecurity, DeviceSecurityType.Both],
      ['SystemPIN' as UnlockMode, VaultType.DeviceSecurity, DeviceSecurityType.SystemPasscode],
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
        expect(Preferences.set).toHaveBeenCalledTimes(1);
        expect(Preferences.set).toHaveBeenCalledWith({ key: 'LastUnlockMode', value: unlockMode });
      },
    );
  });

  describe('initialize unlock type', () => {
    describe('on mobile', () => {
      beforeEach(() => {
        (isPlatform as Mock).mockReturnValue(true);
      });

      it('uses a session PIN if no system PIN is set', async () => {
        Device.isSystemPasscodeSet = vi.fn().mockResolvedValue(false);
        const expectedConfig = {
          ...mockVault.config,
          type: VaultType.CustomPasscode,
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
        (isPlatform as Mock).mockReturnValue(false);
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

  describe('can unlock', () => {
    it.each([
      [false, 'NeverLock' as UnlockMode, false, true],
      [false, 'NeverLock' as UnlockMode, true, true],
      [false, 'NeverLock' as UnlockMode, false, false],
      [true, 'Device' as UnlockMode, false, true],
      [false, 'Device' as UnlockMode, true, true],
      [false, 'Device' as UnlockMode, false, false],
      [true, 'SystemPIN' as UnlockMode, false, true],
      [false, 'SystemPIN' as UnlockMode, true, true],
      [false, 'SystemPIN' as UnlockMode, false, false],
      [true, 'SessionPIN' as UnlockMode, false, true],
      [false, 'SessionPIN' as UnlockMode, true, true],
      [false, 'SessionPIN' as UnlockMode, false, false],
    ])(
      'is %s for %s, empty: %s, locked: %s',
      async (expected: boolean, mode: UnlockMode, empty: boolean, locked: boolean) => {
        (mockVault.isEmpty as Mock).mockResolvedValue(empty);
        (mockVault.isLocked as Mock).mockResolvedValue(locked);
        (Preferences.get as Mock).mockResolvedValue({ value: mode });
        const { canUnlock } = useSessionVault();
        expect(await canUnlock()).toBe(expected);
      },
    );
  });

  describe('onPasscodeRequested', () => {
    let modal: { onDidDismiss: () => Promise<any>; present: () => Promise<void> };
    beforeEach(async () => {
      modal = {
        onDidDismiss: vi.fn().mockResolvedValue({ role: 'cancel' }),
        present: vi.fn().mockResolvedValue(undefined),
      };
      modalController.create = vi.fn().mockResolvedValue(modal);
    });

    it.each([[true], [false]])('creates a PIN dialog, setting passcode: %s', async (setPasscode: boolean) => {
      await onPasscodeRequestedCallback(setPasscode);
      expect(modalController.create).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledWith({
        backdropDismiss: false,
        component: AppPinDialog,
        componentProps: {
          setPasscodeMode: setPasscode,
        },
      });
    });

    it('presents the modal', async () => {
      await onPasscodeRequestedCallback(false);
      expect(modal.present).toHaveBeenCalledTimes(1);
    });

    it('sets the custom passcode to the PIN', async () => {
      (modal.onDidDismiss as Mock).mockResolvedValue({ data: '4203', role: 'OK' });
      await onPasscodeRequestedCallback(false);
      expect(mockVault.setCustomPasscode).toHaveBeenCalledTimes(1);
      expect(mockVault.setCustomPasscode).toHaveBeenCalledWith('4203');
    });

    it('sets the custom passcode to and empty string if the PIN is undefined', async () => {
      await onPasscodeRequestedCallback(false);
      expect(mockVault.setCustomPasscode).toHaveBeenCalledTimes(1);
      expect(mockVault.setCustomPasscode).toHaveBeenCalledWith('');
    });
  });

  describe('getConfig', () => {
    it('resolves the config', async () => {
      const { getConfig } = useSessionVault();
      expect(await getConfig()).toEqual(mockVault.config);
    });
  });

  describe('get keys', () => {
    it('calls the vault get keys', async () => {
      const { getKeys } = useSessionVault();
      await getKeys();
      expect(mockVault.getKeys).toHaveBeenCalledTimes(1);
    });
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

  describe('lock', () => {
    it('calls the vault lock', async () => {
      const { lock } = useSessionVault();
      await lock();
      expect(mockVault.lock).toHaveBeenCalledTimes(1);
    });
  });

  describe('unlock', () => {
    it('calls the vault unlock', async () => {
      const { unlock } = useSessionVault();
      await unlock();
      expect(mockVault.unlock).toHaveBeenCalledTimes(1);
    });
  });

  describe('clear', () => {
    it('calls the vault clear', async () => {
      const { clear } = useSessionVault();
      await clear();
      expect(mockVault.clear).toHaveBeenCalledTimes(1);
    });
  });
});
