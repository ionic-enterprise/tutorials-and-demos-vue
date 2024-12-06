<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSessionVault } from './composables/session-vault';

const router = useRouter();
const { session, sessionIsLocked, unlockSession } = useSessionVault();

watch(session, async () => {
  if (await sessionIsLocked()) {
    try {
      await unlockSession();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      router.replace('/unlock');
    }
  }
});
</script>
