import AppPinDialog from '@/components/AppPinDialog.vue';
import { useVaultFactory } from '@/composables/vault-factory';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { PrivacyScreen } from '@capacitor/privacy-screen';
import { AuthResult } from '@ionic-enterprise/auth';
import {
  AndroidBiometricCryptoPreference,
  BiometricPermissionState,
  Device,
  DeviceSecurityType,
  VaultType,
} from '@ionic-enterprise/identity-vault';
import { modalController } from '@ionic/vue';
import { ref } from 'vue';

export type UnlockMode =
  | 'Biometrics'
  | 'BiometricsWithPasscode'
  | 'SystemPasscode'
  | 'CustomPasscode'
  | 'SecureStorage';

const sessionKey = 'session';
const hideInBackgroundKey = 'hide-in-background';
const modeKey = 'LastUnlockMode';
const session = ref<AuthResult | null | undefined>();

const { createVault } = useVaultFactory();
const vault = createVault({
  key: 'io.ionic.teatastervue',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 5000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
});

const initializeVault = async (): Promise<void> => {
  try {
    await vault.initialize({
      key: 'io.ionic.teatastervue',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
      lockAfterBackgrounded: 5000,
      shouldClearVaultAfterTooManyFailedAttempts: true,
      customPasscodeInvalidUnlockAttempts: 2,
      unlockVaultOnLoad: false,
      androidBiometricsPreferStrongVaultOrSystemPasscode: AndroidBiometricCryptoPreference.StrongVault,
    });
  } catch {
    await vault.clear();
    await setUnlockMode('SecureStorage');
  }

  vault.onLock(() => (session.value = undefined));

  vault.onPasscodeRequested(async (isPasscodeSetRequest: boolean) => {
    const dlg = await modalController.create({
      backdropDismiss: false,
      component: AppPinDialog,
      componentProps: {
        setPasscodeMode: isPasscodeSetRequest,
      },
    });
    dlg.present();
    const { data } = await dlg.onDidDismiss();
    vault.setCustomPasscode(data || '');
  });
};

const canHideContentsInBackground = (): boolean => Capacitor.isNativePlatform();
const canUseBiometrics = async (): Promise<boolean> =>
  Capacitor.isNativePlatform() && (await Device.isBiometricsEnabled());
const canUseCustomPasscode = (): boolean => Capacitor.isNativePlatform();
const canUseSystemPasscode = async (): Promise<boolean> =>
  Capacitor.isNativePlatform() && (await Device.isSystemPasscodeSet());

const hideContentsInBackground = async (value: boolean): Promise<void> => {
  if (value) {
    await PrivacyScreen.enable({ android: { dimBackground: true, privacyModeOnActivityHidden: 'splash' } });
  } else {
    await PrivacyScreen.disable();
  }
  return Preferences.set({ key: hideInBackgroundKey, value: JSON.stringify(value) });
};

const isHidingContentsInBackground = async (): Promise<boolean> => {
  const { value } = await Preferences.get({ key: hideInBackgroundKey });
  return JSON.parse(value || 'false');
};

const setSession = async (s: AuthResult): Promise<void> => {
  session.value = s;
  return vault.setValue(sessionKey, s);
};

const provision = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    try {
      await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Please authenticate to continue' });
    } catch {}
  }
};

const getUnlockMode = async (): Promise<UnlockMode> => {
  const { value } = await Preferences.get({ key: modeKey });
  return (value as UnlockMode | null) || 'SecureStorage';
};

const setUnlockMode = async (unlockMode: UnlockMode): Promise<void> => {
  let type: VaultType;
  let deviceSecurityType: DeviceSecurityType;

  switch (unlockMode) {
    case 'Biometrics':
      await provision();
      type = VaultType.DeviceSecurity;
      deviceSecurityType = DeviceSecurityType.Biometrics;
      break;

    case 'BiometricsWithPasscode':
      await provision();
      type = VaultType.DeviceSecurity;
      deviceSecurityType = DeviceSecurityType.Both;
      break;

    case 'SystemPasscode':
      type = VaultType.DeviceSecurity;
      deviceSecurityType = DeviceSecurityType.SystemPasscode;
      break;

    case 'CustomPasscode':
      type = VaultType.CustomPasscode;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    case 'SecureStorage':
      type = VaultType.SecureStorage;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    default:
      type = VaultType.SecureStorage;
      deviceSecurityType = DeviceSecurityType.None;
  }

  await vault.updateConfig({
    ...vault.config,
    type,
    deviceSecurityType,
  });
  await Preferences.set({ key: modeKey, value: unlockMode });
};

const clearSession = async (): Promise<void> => {
  session.value = undefined;
  await vault.clear();
  await setUnlockMode('SecureStorage');
};

const getSession = async (): Promise<AuthResult | null | undefined> => {
  let s: AuthResult | null | undefined = null;
  try {
    s = await vault.getValue(sessionKey);
    session.value = s;
  } catch (e: any) {
    if (e.code !== 8 && e.code !== 6) {
      await clearSession();
    }
  }
  return s;
};

const unlockSession = async (): Promise<void> => {
  await vault.unlock();
  session.value = await vault.getValue('session');
};

const sessionIsLocked = async (): Promise<boolean> => {
  const { value } = await Preferences.get({ key: modeKey });
  return (value || 'SecureStorage') !== 'SecureStorage' && !(await vault.isEmpty()) && (await vault.isLocked());
};

export const useSessionVault = () => {
  return {
    session,
    canHideContentsInBackground,
    canUseBiometrics,
    canUseCustomPasscode,
    canUseSystemPasscode,
    clearSession,
    getSession,
    getUnlockMode,
    hideContentsInBackground,
    initializeVault,
    isHidingContentsInBackground,
    setSession,
    setUnlockMode,
    sessionIsLocked,
    unlockSession,
  };
};
