<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Device Information</ion-title>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/vault-control"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="main-content" :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Device Information</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item data-testid="has-secure-hardware">
          <ion-label> Has Secure Hardware </ion-label>
          <ion-note slot="end">
            {{ hasSecureHardware }}
          </ion-note>
        </ion-item>
        <ion-item data-testid="biometrics-supported">
          <ion-label> Biometrics Supported </ion-label>
          <ion-note slot="end">
            {{ biometricsSupported }}
          </ion-note>
        </ion-item>
        <ion-item data-testid="biometrics-enabled">
          <ion-label> Biometrics Enabled </ion-label>
          <ion-note slot="end">
            {{ biometricsEnabled }}
          </ion-note>
        </ion-item>
        <ion-item data-testid="biometrics-allowed">
          <ion-label> Biometrics Allowed </ion-label>
          <ion-note slot="end">
            {{ biometricsAllowed }}
          </ion-note>
        </ion-item>
        <ion-item data-testid="biometric-security-strength">
          <ion-label> Biometric Strength </ion-label>
          <ion-note slot="end">
            {{ biometricStrength }}
          </ion-note>
        </ion-item>
        <ion-item data-testid="system-passcode">
          <ion-label> System Passcode </ion-label>
          <ion-note slot="end">
            {{ systemPasscode }}
          </ion-note>
        </ion-item>
        <ion-item data-testid="privacy-screen">
          <ion-label> Privacy Screen </ion-label>
          <ion-note slot="end">
            {{ privacyScreen }}
          </ion-note>
        </ion-item>
        <ion-item data-testid="locked-out">
          <ion-label> Locked Out </ion-label>
          <ion-note slot="end">
            {{ lockedOut }}
          </ion-note>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button
              data-testid="toggle-privacy-screen-button"
              expand="block"
              :disabled="!isNativePlatform"
              @click="togglePrivacy"
              >Toggle Privacy Screen</ion-button
            >
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button
              data-testid="show-biometric-prompt-button"
              expand="block"
              :disabled="
                !(isNativePlatform && biometricsEnabled && biometricsAllowed === BiometricPermissionState.Granted)
              "
              @click="showBiometricPrompt"
              >Show Biometric Prompt</ion-button
            >
          </ion-label>
        </ion-item>
      </ion-list>

      <div data-testid="available-hardware">
        <p>Available Biometric Hardware:</p>
        <ul v-if="availableHardware?.length">
          <li v-for="h of availableHardware" :key="h">{{ h }}</li>
        </ul>
        <ul v-else>
          <li>None</li>
        </ul>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
  alertController,
  isPlatform,
} from '@ionic/vue';
import { ref } from 'vue';
import {
  BiometricPermissionState,
  BiometricSecurityStrength,
  Device,
  SupportedBiometricType,
} from '@ionic-enterprise/identity-vault';

const hasSecureHardware = ref(false);
const biometricsSupported = ref(false);
const biometricsEnabled = ref(false);
const biometricsAllowed = ref(BiometricPermissionState.Denied);
const biometricStrength = ref(BiometricSecurityStrength.Weak);
const privacyScreen = ref(false);
const systemPasscode = ref(false);
const lockedOut = ref(false);
const availableHardware = ref<Array<SupportedBiometricType>>([]);
const isNativePlatform = isPlatform('hybrid');

Device.hasSecureHardware().then((x) => (hasSecureHardware.value = x));
Device.isBiometricsSupported().then((x) => (biometricsSupported.value = x));
Device.isBiometricsEnabled().then((x) => (biometricsEnabled.value = x));
Device.isBiometricsAllowed().then((x) => (biometricsAllowed.value = x));
Device.getBiometricStrengthLevel().then((x) => (biometricStrength.value = x));
Device.isSystemPasscodeSet().then((x) => (systemPasscode.value = x));
Device.isHideScreenOnBackgroundEnabled().then((x) => (privacyScreen.value = x));
Device.isLockedOutOfBiometrics().then((x) => (lockedOut.value = x));
Device.getAvailableHardware().then((x) => (availableHardware.value = x));

const togglePrivacy = async () => {
  await Device.setHideScreenOnBackground(!privacyScreen.value);
  privacyScreen.value = await Device.isHideScreenOnBackgroundEnabled();
};

const showBiometricPrompt = async () => {
  try {
    await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'This is only a test' });
    await displayBioResult('Success!!');
  } catch (err) {
    await displayBioResult('Failed. User likely cancelled the operation.');
  }
};

const displayBioResult = async (subHeader: string) => {
  const alert = await alertController.create({ header: 'Show Biometrics', subHeader });
  await alert.present();
};
</script>
