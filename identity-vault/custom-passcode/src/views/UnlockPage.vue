<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title> Unlock </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="unlock" data-testid="unlock">Unlock</ion-button>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="redoLogin" data-testid="redo-login">Redo Login</ion-button>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useAuthentication } from '@/composables/authentication';
import { useSessionVault } from '@/composables/session-vault';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { useRouter } from 'vue-router';

const { logout } = useAuthentication();
const { unlockSession } = useSessionVault();
const router = useRouter();

const redoLogin = async (): Promise<void> => {
  await logout();
  router.replace('/login');
};

const unlock = async (): Promise<void> => {
  try {
    await unlockSession();
    router.replace('/tabs/tab1');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err: unknown) {}
};
</script>
