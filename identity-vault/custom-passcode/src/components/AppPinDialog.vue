<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ title }}</ion-title>
      <ion-buttons v-if="!setPasscodeMode" slot="start">
        <ion-button @click="cancel" data-testid="cancel-button">
          Cancel
        </ion-button>
      </ion-buttons>
      <ion-buttons slot="end">
        <ion-button :strong="true" data-testid="submit-button" @click="submit">Enter
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding ion-text-center">
    <div>Under Construction</div>
  </ion-content>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  modalController,
} from '@ionic/vue';
import { ref } from 'vue';

// eslint-disable-next-line no-undef
const props = defineProps({
  setPasscodeMode: Boolean,
});

const title = ref('');

const initSetPasscodeMode = () => {
  title.value = 'Create PIN';
};

const initUnlockMode = () => {
  title.value = 'Unlock';
};

const cancel = () => {
  modalController.dismiss(undefined, 'cancel');
};

const submit = () => {
  modalController.dismiss('1234');
};

if (props.setPasscodeMode) {
  initSetPasscodeMode();
} else {
  initUnlockMode();
}
</script>
