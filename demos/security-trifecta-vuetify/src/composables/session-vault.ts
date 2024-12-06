import { useVaultFactory } from '@/composables/vault-factory';
import router from '@/router';
import { Capacitor } from '@capacitor/core';
import {
  BiometricPermissionState,
  Device,
  DeviceSecurityType,
  IdentityVaultConfig,
  VaultType,
} from '@ionic-enterprise/identity-vault';

export type UnlockMode = 'Device' | 'SessionPIN' | 'SystemPIN' | 'NeverLock' | 'ForceLogin';

const { createVault } = useVaultFactory();
const vault = createVault();

const initializeVault = async (): Promise<void> => {
  try {
    await vault.initialize({
      key: 'io.ionic.csdemosecurestorage',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
      lockAfterBackgrounded: 5000,
      shouldClearVaultAfterTooManyFailedAttempts: true,
      customPasscodeInvalidUnlockAttempts: 2,
      unlockVaultOnLoad: !Capacitor.isNativePlatform(),
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
    await vault.clear();
    await setUnlockMode('NeverLock');
  }

  vault.onLock(() => {
    router.replace('/login');
  });

  vault.onPasscodeRequested(async (isPasscodeSetRequest: boolean) => {
    console.log(isPasscodeSetRequest);
    vault.setCustomPasscode('1234');
  });
};

const getValue = async <T>(key: string): Promise<T | null | undefined> => vault.getValue(key);
const setValue = async <T>(key: string, value: T): Promise<void> => vault.setValue(key, value);
const clear = async (): Promise<void> => vault.clear();
const unlock = async (): Promise<void> => vault.unlock();

const canUnlock = async (): Promise<boolean> => {
  return Capacitor.isNativePlatform() && !(await vault.isEmpty()) && (await vault.isLocked());
};

const canUseLocking = (): boolean => Capacitor.isNativePlatform();

const getVaultType = async (): Promise<VaultType | undefined> => {
  const exists = !(await vault.isEmpty());
  if (exists) {
    return vault.config?.type;
  }
};

const provision = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Authenticate to continue' });
  }
};

const initializeUnlockMode = async (): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    if (await Device.isSystemPasscodeSet()) {
      if (await Device.isBiometricsEnabled()) {
        await setUnlockMode('Device');
      } else {
        await setUnlockMode('SystemPIN');
      }
    } else {
      await setUnlockMode('NeverLock');
    }
  } else {
    await setUnlockMode('NeverLock');
  }
};

const setUnlockMode = async (unlockMode: UnlockMode): Promise<void> => {
  let type: VaultType;
  let deviceSecurityType: DeviceSecurityType;

  switch (unlockMode) {
    case 'Device':
      await provision();
      type = VaultType.DeviceSecurity;
      deviceSecurityType = DeviceSecurityType.Both;
      break;

    case 'SystemPIN':
      await provision();
      type = VaultType.DeviceSecurity;
      deviceSecurityType = DeviceSecurityType.SystemPasscode;
      break;

    case 'SessionPIN':
      type = VaultType.CustomPasscode;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    case 'ForceLogin':
      type = VaultType.InMemory;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    case 'NeverLock':
      type = VaultType.SecureStorage;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    default:
      type = VaultType.SecureStorage;
      deviceSecurityType = DeviceSecurityType.None;
  }

  await vault.updateConfig({
    ...(vault.config as IdentityVaultConfig),
    type,
    deviceSecurityType,
  });
};

export const useSessionVault = () => {
  return {
    canUnlock,
    canUseLocking,
    clear,
    unlock,
    getValue,
    setValue,
    initializeUnlockMode,
    initializeVault,
    setUnlockMode,
    getVaultType,
  };
};
