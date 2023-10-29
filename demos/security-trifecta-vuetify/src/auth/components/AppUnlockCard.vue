<template>
  <v-card class="auth-card rounded-lg text-center">
    <v-card-title data-testid="title"> Your Session is Locked </v-card-title>
    <v-card-subtitle data-testid="subtitle">Please unlock to continue</v-card-subtitle>
    <v-card-text>
      <div>
        <v-btn
          prepend-icon="mdi-account-lock-open-outline"
          size="x-large"
          color="primary"
          @click="unlock"
          data-testid="unlock-button"
          >Unlock</v-btn
        >
      </div>
      <div class="mt-8">
        <v-btn color="secondary" variant="plain" data-testid="redo-signin-button" @click="$emit('redo')">
          Redo Sign In Instead
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useSessionVault } from '@/composables/session-vault';

const emit = defineEmits(['redo', 'unlocked']);

const unlock = async () => {
  const { unlock } = useSessionVault();
  await unlock();
  emit('unlocked');
};
</script>
