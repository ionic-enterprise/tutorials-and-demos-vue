<template>
  <div>
    <v-app-bar :elevation="2">
      <v-app-bar-title>Tasting Notes</v-app-bar-title>
      <template v-slot:append>
        <v-btn icon="mdi-theme-light-dark" @click="toggle"></v-btn>

        <v-btn icon="mdi-refresh" @click="doSync"></v-btn>

        <v-btn icon="mdi-logout" @click="routeToPage('/logout')"></v-btn>
      </template>
    </v-app-bar>

    <v-main scrollable>
      <router-view />
    </v-main>
  </div>
</template>

<script lang="ts" setup>
import { useThemeSwitcher } from '@/composables/theme-switcher';
import { useRouter } from 'vue-router';
import { useSync } from '@/composables/sync';
import { useTastingNotes } from '@/tasting-notes/composables/tasting-notes';

const { toggle } = useThemeSwitcher();

const router = useRouter();

const doSync = async (): Promise<void> => {
  const sync = useSync();
  const { refresh } = useTastingNotes();
  await sync();
  await refresh();
};

const routeToPage = (page: string) => {
  router.push(page);
};
</script>
