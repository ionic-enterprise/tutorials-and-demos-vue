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

  <ion-footer>
    <ion-grid>
      <ion-row>
        <ion-col v-for="n of [1, 2, 3]" :key="n">
          <ion-button expand="block" fill="outline" @click="append(n)" :disabled="disableInput"
            data-testclass="number-button">{{ n }}</ion-button>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col v-for="n of [4, 5, 6]" :key="n">
          <ion-button expand="block" fill="outline" @click="append(n)" :disabled="disableInput"
            data-testclass="number-button">{{ n }}</ion-button>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col v-for="n of [7, 8, 9]" :key="n">
          <ion-button expand="block" fill="outline" @click="append(n)" :disabled="disableInput"
            data-testclass="number-button">{{ n }}</ion-button>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
        </ion-col>
        <ion-col>
          <ion-button expand="block" fill="outline" @click="append(0)" :disabled="disableInput"
            data-testclass="number-button">0</ion-button>
        </ion-col>
        <ion-col>
          <ion-button color="tertiary" expand="block" @click="remove()" :disabled="disableDelete"
            data-testid="delete-button">Delete</ion-button>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-footer>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonRow,
  IonTitle,
  IonToolbar,
  modalController,
} from '@ionic/vue';
import { ref } from 'vue';

// eslint-disable-next-line no-undef
const props = defineProps({
  setPasscodeMode: Boolean,
});

const disableDelete = false;
const disableInput = false;

const title = ref('');

const append = (n: number) => {
  console.log('append', n);
};

const remove = () => {
  console.log('remove');
};

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
