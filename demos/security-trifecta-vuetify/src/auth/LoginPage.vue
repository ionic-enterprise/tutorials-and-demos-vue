<template>
  <AppUnlockCard v-if="showUnlock" @unlocked="goHome" @redo="redoLogin" />
  <AppLoginCard v-else @success="goHome" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppLoginCard from '@/auth/components/AppLoginCard.vue';
import AppUnlockCard from '@/auth/components/AppUnlockCard.vue';
import { useSessionVault } from '@/composables/session-vault';
import { useThemeSwitcher } from '@/composables/theme-switcher';
import { useRouter } from 'vue-router';

const showUnlock = ref(false);

const { canUnlock } = useSessionVault();
const { load } = useThemeSwitcher();
const router = useRouter();

canUnlock().then((x) => (showUnlock.value = x));

const redoLogin = () => {
  const { clear } = useSessionVault();
  clear();
  showUnlock.value = false;
};

const goHome = () => {
  load();
  router.replace('/home');
};
</script>
