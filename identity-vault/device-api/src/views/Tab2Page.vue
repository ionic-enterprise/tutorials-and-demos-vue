<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 2</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 2</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-list-header>
          <ion-label>Capabilities</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-label>Secure Hardware</ion-label>
          <ion-note slot="end">{{ hasSecureHardware }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Biometrics Supported</ion-label>
          <ion-note slot="end">{{ isBiometricsSupported }}</ion-note>
        </ion-item>
        <ion-item>
          <div>
            <p>Available Biometric Hardware:</p>
            <ul v-if="availableHardware?.length">
              <li v-for="h of availableHardware" :key="h">{{ h }}</li>
            </ul>
            <ul v-if="availableHardware?.length === 0">
              <li>None</li>
            </ul>
          </div>
        </ion-item>
        <ion-list-header>
          <ion-label>Configuration and Status</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-label>Biometric Strength Level</ion-label>
          <ion-note slot="end">{{ biometricStrengthLevel }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Biometric Allowed</ion-label>
          <ion-note slot="end">{{ isBiometricsAllowed }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Biometrics Enabled</ion-label>
          <ion-note slot="end">{{ isBiometricsEnabled }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Hide Screen Enabled</ion-label>
          <ion-note slot="end">{{ isHideScreenOnBackgroundEnabled }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Locked Out of Biometrics</ion-label>
          <ion-note slot="end">{{ isLockedOutOfBiometrics }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>System Passcode Set</ion-label>
          <ion-note slot="end">{{ isSystemPasscodeSet }}</ion-note>
        </ion-item>
        <ion-list-header>
          <ion-label>Actions</ion-label>
        </ion-list-header>
        <ion-item>
          <ion-label>
            <ion-button expand="block" :disabled="!isBiometricsEnabled" @click="showBiometricPrompt"
              >Show Biometric Prompt</ion-button
            >
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="toggleHideScreenOnBackground"
              >{{ isHideScreenOnBackgroundEnabled ? 'Disable' : 'Enable' }} Security Screen</ion-button
            >
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonToolbar,
  IonTitle,
} from '@ionic/vue';
import { ref } from 'vue';
import { Device } from '@ionic-enterprise/identity-vault';
import { PrivacyScreen } from '@capacitor/privacy-screen';

const hasSecureHardware = ref<boolean>(false);
const isBiometricsSupported = ref<boolean>(false);
const availableHardware = ref<Array<string>>([]);

const biometricStrengthLevel = ref<string>('');
const isBiometricsAllowed = ref<string>('');
const isBiometricsEnabled = ref<boolean>(false);
const isHideScreenOnBackgroundEnabled = ref<boolean>(false);
const isLockedOutOfBiometrics = ref<boolean>(false);
const isSystemPasscodeSet = ref<boolean>(false);

const initialize = async (): Promise<void> => {
  hasSecureHardware.value = await Device.hasSecureHardware();
  isBiometricsSupported.value = await Device.isBiometricsSupported();
  availableHardware.value = await Device.getAvailableHardware();

  biometricStrengthLevel.value = await Device.getBiometricStrengthLevel();
  isBiometricsAllowed.value = await Device.isBiometricsAllowed();
  isBiometricsEnabled.value = await Device.isBiometricsEnabled();
  const { enabled } = await PrivacyScreen.isEnabled();
  isHideScreenOnBackgroundEnabled.value = enabled;
  isLockedOutOfBiometrics.value = await Device.isLockedOutOfBiometrics();
  isSystemPasscodeSet.value = await Device.isSystemPasscodeSet();
};

const toggleHideScreenOnBackground = async (): Promise<void> => {
  if (isHideScreenOnBackgroundEnabled.value) {
    await PrivacyScreen.disable();
  } else {
    await PrivacyScreen.enable();
  }
  const { enabled } = await PrivacyScreen.isEnabled();
  isHideScreenOnBackgroundEnabled.value = enabled;
};

const showBiometricPrompt = async (): Promise<void> => {
  try {
    await Device.showBiometricPrompt({
      iosBiometricsLocalizedReason: 'Just to show you how this works',
    });
  } catch {
    // This is the most likely scenario
    alert('user cancelled biometrics prompt');
  }
};

initialize();
</script>
