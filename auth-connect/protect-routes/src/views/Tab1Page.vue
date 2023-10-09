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

      <ion-button v-if="authenticated" @click="logoutClicked">Logout</ion-button>
      <ion-button v-else @click="loginClicked">Login</ion-button>

      <pre>{{ accessToken }}</pre>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import { useAuthentication } from '@/composables/authentication';
import { ref } from 'vue';

const { getAccessToken, isAuthenticated, login, logout } = useAuthentication();
const accessToken = ref<string>();
const authenticated = ref<boolean>();

const checkAuthentication = async (): Promise<void> => {
  authenticated.value = await isAuthenticated();
  accessToken.value = await getAccessToken();
}

const loginClicked = async (): Promise<void> => {
  await login();
  checkAuthentication();
};

const logoutClicked = async (): Promise<void> => {
  await logout();
  checkAuthentication();
};

checkAuthentication();
</script>
