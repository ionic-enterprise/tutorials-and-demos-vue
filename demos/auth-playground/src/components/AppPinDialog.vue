<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ title }}</ion-title>
      <ion-buttons v-if="!setPasscodeMode" slot="primary">
        <ion-button icon-only @click="cancel" data-testid="cancel-button">
          <ion-icon :icon="close"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding ion-text-center">
    <ion-label data-testid="prompt">
      <div class="prompt">{{ prompt }}</div>
    </ion-label>
    <ion-label data-testid="display-pin">
      <div class="pin">{{ displayPin }}</div>
    </ion-label>
    <ion-label color="danger" data-testid="error-message">
      <div class="error">{{ errorMessage }}</div>
    </ion-label>
  </ion-content>

  <ion-footer>
    <ion-grid>
      <ion-row>
        <ion-col v-for="n of [1, 2, 3]" :key="n">
          <ion-button
            expand="block"
            fill="outline"
            @click="append(n)"
            :disabled="disableInput"
            data-testclass="number-button"
            >{{ n }}</ion-button
          >
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col v-for="n of [4, 5, 6]" :key="n">
          <ion-button
            expand="block"
            fill="outline"
            @click="append(n)"
            :disabled="disableInput"
            data-testclass="number-button"
            >{{ n }}</ion-button
          >
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col v-for="n of [7, 8, 9]" :key="n">
          <ion-button
            expand="block"
            fill="outline"
            @click="append(n)"
            :disabled="disableInput"
            data-testclass="number-button"
            >{{ n }}</ion-button
          >
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-button
            color="tertiary"
            expand="block"
            @click="remove()"
            :disabled="disableDelete"
            data-testid="delete-button"
            >Delete</ion-button
          >
        </ion-col>
        <ion-col>
          <ion-button
            expand="block"
            fill="outline"
            @click="append(0)"
            :disabled="disableInput"
            data-testclass="number-button"
            >0</ion-button
          >
        </ion-col>
        <ion-col>
          <ion-button
            color="secondary"
            expand="block"
            @click="enter()"
            :disabled="disableEnter"
            data-testid="enter-button"
            >Enter</ion-button
          >
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
  IonIcon,
  IonLabel,
  IonRow,
  IonTitle,
  IonToolbar,
  modalController,
} from '@ionic/vue';
import { computed, ref } from 'vue';
import { close } from 'ionicons/icons';

const props = defineProps({
  setPasscodeMode: Boolean,
});

let verifyPin = '';

const errorMessage = ref('');
const pin = ref('');
const prompt = ref('');
const title = ref('');

const disableDelete = computed(() => !pin.value.length);
const disableEnter = computed(() => !(pin.value.length > 2));
const disableInput = computed(() => pin.value.length > 8);

const displayPin = computed(() => '*********'.slice(0, pin.value.length));

const handleGetPasscodeFlow = () => {
  modalController.dismiss(pin.value);
};

const handleSetPasscodeFlow = () => {
  if (!verifyPin) {
    initVerifyMode();
  } else if (verifyPin === pin.value) {
    modalController.dismiss(pin.value);
  } else {
    errorMessage.value = 'PINs do not match';
    initSetPasscodeMode();
  }
};

const initSetPasscodeMode = () => {
  prompt.value = 'Create Session PIN';
  title.value = 'Create PIN';
  verifyPin = '';
  pin.value = '';
};

const initUnlockMode = () => {
  prompt.value = 'Enter PIN to Unlock';
  title.value = 'Unlock';
  pin.value = '';
};

const initVerifyMode = () => {
  prompt.value = 'Verify PIN';
  verifyPin = pin.value;
  pin.value = '';
};

const append = (n: number) => {
  errorMessage.value = '';
  pin.value = pin.value.concat(n.toString());
};

const cancel = () => {
  modalController.dismiss(undefined, 'cancel');
};

const enter = () => {
  if (props.setPasscodeMode) {
    handleSetPasscodeFlow();
  } else {
    handleGetPasscodeFlow();
  }
};

const remove = () => {
  if (pin.value) {
    pin.value = pin.value.slice(0, pin.value.length - 1);
  }
};

if (props.setPasscodeMode) {
  initSetPasscodeMode();
} else {
  initUnlockMode();
}
</script>

<style scoped>
.prompt {
  font-size: 2rem;
  font-weight: bold;
}

.pin {
  font-size: 3rem;
  font-weight: bold;
}

.error {
  font-size: 1.5rem;
  font-weight: bold;
}

ion-grid {
  padding-bottom: 32px;
}
</style>
