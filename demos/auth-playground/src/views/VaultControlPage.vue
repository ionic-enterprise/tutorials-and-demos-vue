<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Vault Control</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Vault Control</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item>
          <ion-label>Vault Type</ion-label>
          <!-- <ion-note slot="end">{{ config?.type | vaultType }}</ion-note> -->
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-button
              expand="block"
              :disabled="disableDeviceUnlock"
              @click="setMode('Device')"
              data-testid="use-device-button"
              >Use Biometrics (System PIN Backup)</ion-button
            >
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-button
              expand="block"
              :disabled="disableSystemPasscode"
              @click="setMode('SystemPIN')"
              data-testid="use-system-passcode-button"
              >Use System PIN (No Biometrics)</ion-button
            >
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-button
              expand="block"
              :disabled="disableCustomPasscode"
              @click="setMode('SessionPIN')"
              data-testid="use-custom-passcode-button"
              >Use Custom Passcode (Session PIN)</ion-button
            >
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="setMode('NeverLock')" data-testid="never-lock-button"
              >Never Lock (Secure Storage)
            </ion-button>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-button
              expand="block"
              :disabled="disableInMemory"
              @click="setMode('ForceLogin')"
              data-testid="clear-on-lock-button"
              >Clear on Lock (In Memory)</ion-button
            >
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-button expand="block" :disabled="disableLock" @click="lock" data-testid="lock-vault-button"
              >Lock the Vault</ion-button
            >
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="clear" data-testid="clear-vault-button">Clear the Vault </ion-button>
          </ion-label>
        </ion-item>
      </ion-list>

      <div class="commentary ion-padding">
        <h1>Expected Results</h1>
        <h2>On Mobile</h2>
        <p>
          On a mobile device, the vault will be created in the keystore (Android) or key chain (iOS). The following
          vault types are available:
        </p>
        <dl>
          <dt>Device</dt>
          <dd>
            The system passcode needs to be set on the device in order to use this option. This option will use
            biometrics as the primary unlocking mechanism if the devices supports it and the user has registered their
            fingerprint (or face). The system passcode is used as a fallback.
          </dd>
          <dt>Custom Passcode</dt>
          <dd>
            This option will use a custom passcode that is defined for the session. Once the vault is cleared, the
            passcode must be re-entered for the next session. The passcode itself is never stored. Rather, it is used to
            generate the key used to lock and unlock the vault. If the passcode entered to unlock the vault is no the
            same as the passcode used to lock the vault, they generated key will not work. This option is always
            available, even if the system passcode is not set up.
          </dd>
          <dt>Secure Storage</dt>
          <dd>
            The data is stored in the vault but it is never locked. This type of vault is used when the token needs to
            be protected, but device being unlocked is "good enough" in order to access the application.
          </dd>
          <dt>In Memory</dt>
          <dd>
            This is the safest option, but probably also the most annoying for the user. All data is stored in memory
            and is destroyed when the vault locks. As a result, the authentication tokens are never stored, and the user
            needs to log in each time they restart the app or put the app in the background long enough to cause a
            timeout.
          </dd>
        </dl>

        <p>This page also allows the following actions to be performed on the vault:</p>

        <dl>
          <dt>Lock</dt>
          <dd>
            This option is not available with the "Secure Storage" vault. For "Device" and "Custom Passcode", the vault
            will lock and the app will redirect to the "unlock" page. For "In Memory", the data stored by the vault is
            cleared and will behave in a similar manner to clearing the vault.
          </dd>
          <dt>Clear</dt>
          <dd>
            All data stored by the vault is cleared. If you open the values page you will not see any values. If you go
            to the tea list page, the HTTP request to get the teas will result in a 401 error and you will be redirected
            to the login page. The actual login may or may not ask for credentials as the OIDC provider may still
            technically be in a logged in state.
          </dd>
        </dl>

        <h2>On Web</h2>
        <p>
          The web does not have a secure storage area. As such, there is no vault but we create a fake one for
          development purposes. It behaves like a "Secure Storage" vault, but is <strong>not</strong> secure. As such,
          the only action you can take is to clear the vault.
        </p>
      </div>
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button data-testid="fab-menu-button">
          <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
        </ion-fab-button>
        <ion-fab-list side="top">
          <ion-fab-button data-testid="device-page-button">
            <ion-icon :icon="hardwareChipOutline" @click="openDevicePage"></ion-icon>
          </ion-fab-button>
          <ion-fab-button data-testid="values-page-button">
            <ion-icon :icon="listOutline" @click="openValuesPage"></ion-icon>
          </ion-fab-button>
        </ion-fab-list>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  isPlatform,
} from '@ionic/vue';
import { ellipsisVerticalOutline, hardwareChipOutline, listOutline } from 'ionicons/icons';
import { useSessionVault, UnlockMode } from '@/composables/session-vault';
import { Device, VaultType } from '@ionic-enterprise/identity-vault';

const router = useRouter();
const { getConfig, lock, setUnlockMode, clear } = useSessionVault();

const disableCustomPasscode = ref<boolean>(true);
const disableSystemPasscode = ref<boolean>(true);
const disableDeviceUnlock = ref<boolean>(true);
const disableInMemory = ref<boolean>(true);
const disableLock = ref<boolean>(true);

const setMode = async (mode: UnlockMode): Promise<void> => {
  disableLock.value = mode === 'NeverLock';
  setUnlockMode(mode);
};

const openDevicePage = async (): Promise<void> => {
  router.push('/tabs/vault-control/device-info');
};
const openValuesPage = async (): Promise<void> => {
  router.push('/tabs/vault-control/values');
};

if (isPlatform('hybrid')) {
  disableCustomPasscode.value = false;
  disableInMemory.value = false;
  disableLock.value = getConfig().type === VaultType.SecureStorage;
  Device.isSystemPasscodeSet().then((x) => (disableSystemPasscode.value = !x));
  Device.isBiometricsEnabled().then((x) => (disableDeviceUnlock.value = !x));
}
</script>

<style scoped>
.commentary {
  margin-bottom: 2em;
}
</style>
