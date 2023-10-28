<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" color="tertiary">
        <ion-tab-button tab="teas" href="/tabs/teas">
          <ion-icon :icon="leafOutline" />
          <ion-label>Teas</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="vault-control" href="/tabs/vault-control">
          <ion-icon :icon="settingsOutline" />
          <ion-label>Vault Control</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="about" href="/tabs/about">
          <ion-icon :icon="informationCircleOutline" />
          <ion-label>About</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { informationCircleOutline, leafOutline, settingsOutline } from 'ionicons/icons';
</script>
