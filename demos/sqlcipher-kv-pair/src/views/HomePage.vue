<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Inbox</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="removeAllMessages">
            <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
          </ion-button>
          <ion-button @click="removeMessage">
            <ion-icon slot="icon-only" :icon="removeCircleOutline"></ion-icon>
          </ion-button>
          <ion-button @click="addMessage">
            <ion-icon slot="icon-only" :icon="addCircleOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <MessageListItem v-for="(message, idx) in messages" :key="idx" :message="message" />
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import MessageListItem from '@/components/MessageListItem.vue';
import { useEmailMessages } from '@/composables/email-messages';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { addCircleOutline, removeCircleOutline, trashOutline } from 'ionicons/icons';

const { messages, addMessage, removeAllMessages, removeMessage } = useEmailMessages();
</script>
