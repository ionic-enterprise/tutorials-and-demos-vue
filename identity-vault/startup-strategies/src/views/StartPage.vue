<template>
  <ion-page>
    <ion-content class="ion-padding">
      <ion-list v-if="showUnlock">
        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="performUnlockFlow">Unlock</ion-button>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="redoLogin">Redo Login</ion-button>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonButton, IonContent, IonItem, IonLabel, IonList, IonPage, onIonViewDidEnter } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthentication } from '@/composables/authentication';
import { useSessionVault } from '@/composables/session-vault';

const showUnlock = ref(false);
const { isAuthenticated, logout } = useAuthentication();
const { sessionIsLocked, unlockSession } = useSessionVault();
const router = useRouter();

const performUnlockFlow = async (): Promise<void> => {
  await attemptUnlock();
  await attemptNavigation();
};

const redoLogin = async (): Promise<void> => {
  await logout();
  router.replace('/login');
};

const attemptNavigation = async (): Promise<void> => {
  if (!(await sessionIsLocked())) {
    if (await isAuthenticated()) {
      router.replace('/tabs/tab1');
    } else {
      router.replace('/login');
    }
  }
};

const attemptUnlock = async (): Promise<void> => {
  if (await sessionIsLocked()) {
    try {
      await unlockSession();
    } catch (err: unknown) {
      showUnlock.value = true;
    }
  }
};

onIonViewDidEnter(() => {
  performUnlockFlow();
});
</script>
