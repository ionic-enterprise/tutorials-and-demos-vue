<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>About Auth Playground</ion-title>
        <ion-buttons slot="end">
          <ion-button data-testid="logout-button" @click="logoutClicked">
            <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-list-header>About</ion-list-header>
        <ion-item>
          <ion-label>Name</ion-label>
          <ion-note slot="end">{{ name }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Author</ion-label>
          <ion-note slot="end">{{ author }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Version</ion-label>
          <ion-note slot="end">{{ version }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Auth Connect</ion-label>
          <ion-note slot="end">{{ authConnectVersion }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-label>Identity Vault</ion-label>
          <ion-note slot="end">{{ identityVaultVersion }}</ion-note>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { logOutOutline } from 'ionicons/icons';
import { useAuth } from '@/composables/auth';
import { useSessionVault } from '@/composables/session-vault';
import packageInfo from '../../package.json';

const { author, name, version } = packageInfo;
const authConnectVersion = packageInfo.dependencies['@ionic-enterprise/auth'];
const identityVaultVersion = packageInfo.dependencies['@ionic-enterprise/identity-vault'];

const router = useRouter();
const { logout } = useAuth();
const { setUnlockMode } = useSessionVault();

const logoutClicked = async (): Promise<void> => {
  await setUnlockMode('NeverLock');
  await logout();
  router.replace('/login');
};
</script>
