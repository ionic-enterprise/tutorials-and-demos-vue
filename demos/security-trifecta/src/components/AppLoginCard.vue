<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Login</ion-card-title>
      <ion-card-subtitle> Secure Storage Demo Application (Vue) </ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <ion-select
        v-if="displayUnlockOptions"
        label="Session Locking"
        v-model="unlockMode"
        data-testid="unlock-opt-select"
      >
        <ion-select-option v-for="unlockMode of unlockModes" :value="unlockMode.mode" :key="unlockMode.mode">{{
          unlockMode.label
        }}</ion-select-option>
      </ion-select>
      <ion-button expand="full" color="primary" @click="signinClicked()" data-testid="signin-button">
        <ion-icon slot="end" :icon="logInOutline"></ion-icon>
        Sign In
      </ion-button>
    </ion-card-content>
    <ion-toast
      :isOpen="loginFailed"
      message="Login failed!"
      color="danger"
      :duration="3000"
      position="middle"
      @didDismiss="loginFailed = false"
    ></ion-toast>
    <ion-loading :isOpen="authenticating" message="Authenticating..."></ion-loading>
  </ion-card>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/auth';
import { useSessionVault, UnlockMode } from '@/composables/session-vault';
import { Device } from '@ionic-enterprise/identity-vault';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonLoading,
  IonSelect,
  IonSelectOption,
  IonToast,
} from '@ionic/vue';
import { logInOutline } from 'ionicons/icons';
import { ref } from 'vue';

const { canUseLocking, setUnlockMode } = useSessionVault();
const { login } = useAuth();
const displayUnlockOptions = canUseLocking();

const emit = defineEmits(['success']);

const authenticating = ref<boolean>(false);
const loginFailed = ref<boolean>(false);

const unlockMode = ref<UnlockMode>('SessionPIN');
const unlockModes = ref<Array<{ mode: UnlockMode; label: string }>>([
  {
    mode: 'SessionPIN',
    label: 'Session PIN Unlock',
  },
  {
    mode: 'NeverLock',
    label: 'Never Lock Session',
  },
  {
    mode: 'ForceLogin',
    label: 'Force Login',
  },
]);

Device.isBiometricsEnabled().then((enabled: boolean) => {
  if (enabled) {
    unlockMode.value = 'Device';
    unlockModes.value = [
      {
        mode: 'Device',
        label: 'Biometric Unlock',
      },
      ...unlockModes.value,
    ];
  }
});

const signinClicked = async () => {
  try {
    authenticating.value = true;
    await login();
    await setUnlockMode(unlockMode.value);
    emit('success');
  } catch {
    loginFailed.value = true;
  } finally {
    authenticating.value = false;
  }
};
</script>
