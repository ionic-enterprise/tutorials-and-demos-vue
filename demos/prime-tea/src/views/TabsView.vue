<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <div>
    <h1>This is the tabs page</h1>

    <div>
      <RouterLink to="/tabs/teas">Tea List</RouterLink>
      <RouterLink to="/tabs/tasting-notes">Tasting Notes</RouterLink>
      <RouterLink to="/tabs/about">About</RouterLink>
    </div>
  </div>

  <main>
    <RouterView />
  </main>
</template>
