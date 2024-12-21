<template>
  <v-card class="auth-card rounded-lg">
    <v-card-title data-testid="title"> Login </v-card-title>
    <v-card-subtitle data-testid="subtitle">Ionic Security Trifecta Demo</v-card-subtitle>
    <v-card-text>
      <v-form>
        <v-btn block append-icon="mdi-login" color="primary" @click="doLogin" data-testid="signin-button"
          >Sign In</v-btn
        >
      </v-form>
      <v-alert class="mt-3" v-model="signinError" type="error" data-testid="signin-error">
        Invalid Credentials. Please try again.
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/auth/composables/auth';
import { useSync } from '@/composables/sync';
import { useSessionVault } from '@/composables/session-vault';

const emit = defineEmits(['success']);

const signinError = ref<boolean>(false);

const doLogin = async () => {
  const { login } = useAuth();
  try {
    await login();
    const sync = useSync();
    const { initializeUnlockMode } = useSessionVault();
    await sync();
    await initializeUnlockMode();
    emit('success');
  } catch {
    signinError.value = true;
  }
};
</script>
