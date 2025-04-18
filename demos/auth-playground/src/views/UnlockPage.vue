<template>
  <ion-page>
    <ion-content class="ion-text-center">
      <ion-card>
        <ion-card-content>
          <ion-card-title>The Playground is Locked</ion-card-title>

          <ion-button
            class="unlock-button"
            expand="full"
            fill="clear"
            @click="unlockClicked"
            data-testid="unlock-button"
          >
            <ion-icon slot="end" :icon="lockOpenOutline"></ion-icon>
            <div>Unlock</div>
          </ion-button>

          <ion-button expand="full" color="secondary" @click="redoClicked" data-testid="redo-button">
            <ion-icon slot="end" :icon="arrowRedoOutline"></ion-icon>
            <div>Redo Sign In</div>
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonButton, IonCard, IonCardContent, IonCardTitle, IonContent, IonIcon, IonPage } from '@ionic/vue';
import { arrowRedoOutline, lockOpenOutline } from 'ionicons/icons';
import { useAuth } from '@/composables/auth';
import { useSessionVault } from '@/composables/session-vault';

const router = useRouter();
const { logout } = useAuth();
const { canUnlock, clear, unlock } = useSessionVault();

const redoClicked = async (): Promise<void> => {
  await clear();
  await logout();
  await router.replace('/login');
};

const tryUnlock = async (): Promise<void> => {
  try {
    await unlock();
    await router.replace('/');
  } catch {}
};

const unlockClicked = async (): Promise<void> => {
  if (await canUnlock()) {
    tryUnlock();
  } else {
    await router.replace('/login');
  }
};
</script>

<style scoped>
.unlock-button {
  margin-top: 1rem;
  margin-bottom: 1rem;
  height: 3rem;
  font-size: xx-large;
}

@media (min-width: 0px) {
  ion-card {
    margin-top: 25%;
    margin-left: 5%;
    margin-right: 5%;
  }
}

@media (min-width: 576px) {
  ion-card {
    margin-top: 20%;
    margin-left: 10%;
    margin-right: 10%;
  }
}

@media (min-width: 768px) {
  ion-card {
    margin-top: 10%;
    margin-left: 20%;
    margin-right: 20%;
  }
}

@media (min-width: 992px) {
  ion-card {
    margin-top: 10%;
    margin-left: 25%;
    margin-right: 25%;
  }
}

@media (min-width: 1200px) {
  ion-card {
    margin-top: 10%;
    margin-left: 30%;
    margin-right: 30%;
  }
}
</style>
