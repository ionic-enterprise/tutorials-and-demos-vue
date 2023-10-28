<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Stored Values</ion-title>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/vault-control"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="main-content" :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Stored Values</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-list data-testid="value-list">
        <ion-item v-for="item of values" :key="item.key">
          <ion-label>
            <div>
              <strong> {{ item.key }} </strong>
            </div>
            <div>
              <pre>{{ item.value }}</pre>
            </div>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="addValue" data-testid="add-value-button">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  alertController,
  IonBackButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { add } from 'ionicons/icons';
import { useSessionVault } from '@/composables/session-vault';

const values = ref<Array<{ key: string; value?: any }>>([]);
const { getKeys, getValue, setValue } = useSessionVault();

const addValue = async () => {
  const alert = await alertController.create({
    header: 'Key/Value Pair',
    subHeader: 'Enter a new key for new data or an existing key to supply different data for that key',
    inputs: [
      {
        name: 'key',
        type: 'text',
        placeholder: 'Key',
      },
      {
        name: 'value',
        id: 'value',
        type: 'textarea',
        placeholder: 'Value',
      },
    ],
    backdropDismiss: false,
    buttons: ['OK', 'Cancel'],
  });
  await alert.present();
  const { data, role } = await alert.onDidDismiss();
  if (role !== 'cancel' && data.values.key && data.values.value) {
    await setValue(data.values.key, data.values.value);
    await getValues();
  }
};

const getValues = async () => {
  const keys = await getKeys();
  values.value = await Promise.all(
    keys.map(async (key: string) => ({
      key,
      value: JSON.stringify(await getValue(key), undefined, 2),
    }))
  );
};

getValues();
</script>
