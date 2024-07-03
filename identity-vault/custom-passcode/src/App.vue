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
const { session, sessionIsLocked } = useSessionVault();

watch(session, async () => {
  if (await sessionIsLocked()) {
    router.replace('/');
  }
})
</script>
