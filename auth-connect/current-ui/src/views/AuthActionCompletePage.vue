<template>
  <ion-content class="main-content">
    <div class="container">
      <ion-spinner name="dots"></ion-spinner>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { IonContent, IonSpinner } from '@ionic/vue';
import { useAuthentication } from '@/composables/authentication'

if (!Capacitor.isNativePlatform()) {
  const { handleAuthCallback } = useAuthentication();
  const router = useRouter();
  handleAuthCallback().then(() => router.replace('/'));
}
</script>

<style scoped>
.container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
</style>
