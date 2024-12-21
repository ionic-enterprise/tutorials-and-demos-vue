<template>
  <ion-page>
    <ion-content> </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useAuthentication } from '@/composables/authentication';
import { useSessionVault } from '@/composables/session-vault';
import { IonContent, IonPage, onIonViewDidEnter } from '@ionic/vue';
import { useRouter } from 'vue-router';

const { isAuthenticated } = useAuthentication();
const { sessionIsLocked, unlockSession } = useSessionVault();
const router = useRouter();

const performNavigation = async (): Promise<void> => {
  if (!(await sessionIsLocked())) {
    if (await isAuthenticated()) {
      router.replace('/tabs/tab1');
    } else {
      router.replace('/login');
    }
  }
};

const performUnlock = async (): Promise<void> => {
  if (await sessionIsLocked()) {
    try {
      await unlockSession();
    } catch {
      router.replace('/unlock');
    }
  }
};

onIonViewDidEnter(async () => {
  await performUnlock();
  await performNavigation();
});
</script>
