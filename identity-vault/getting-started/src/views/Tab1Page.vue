<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="storeClicked" data-testid="store">Store</ion-button>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button expand="block" color="danger" @click="clearSession" data-testid="clear">Clear</ion-button>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button expand="block" color="secondary" @click="updateUnlockMode('BiometricsWithPasscode')"
              data-testid="use-biometrics">Use
              Biometrics</ion-button>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button expand="block" color="secondary" @click="updateUnlockMode('InMemory')"
              data-testid="use-in-memory">Use In Memory</ion-button>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button expand="block" color="secondary" @click="updateUnlockMode('SecureStorage')"
              data-testid="use-secure-storage">Use Secure
              Storage</ion-button>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button expand="block" color="warning" @click="lockSession" data-testid="lock">Lock</ion-button>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button expand="block" color="warning" @click="getSession" data-testid="unlock">Unlock</ion-button>
          </ion-label>
        </ion-item>
        <ion-item>
          <div data-testid="session">
            <div>{{ session?.email }}</div>
            <div>{{ session?.firstName }} {{ session?.lastName }}</div>
            <div>{{ session?.accessToken }}</div>
            <div>{{ session?.refreshToken }}</div>
          </div>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { useSessionVault } from '@/composables/session-vault';

const { clearSession, getSession, lockSession, session, storeSession, updateUnlockMode } = useSessionVault();

const storeClicked = async (): Promise<void> => {
  await storeSession({
    email: 'test@ionic.io',
    firstName: 'Tessa',
    lastName: 'Testsmith',
    accessToken: '4abf1d79-143c-4b89-b478-19607eb5ce97',
    refreshToken: '565111b6-66c3-4527-9238-6ea2cc017126',
  });
}

getSession();
</script>
