<template>
  <div></div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useSessionVault } from '@/composables/session-vault';
import { SplashScreen } from '@capacitor/splash-screen';

const { canUnlock } = useSessionVault();
const router = useRouter();

SplashScreen.hide();

canUnlock().then((x: boolean) => {
  if (x) {
    router.replace('/login');
  } else {
    router.replace('/home');
  }
});
</script>
