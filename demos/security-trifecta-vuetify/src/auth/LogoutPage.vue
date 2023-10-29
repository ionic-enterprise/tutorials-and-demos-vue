<template>
  <div></div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '@/auth/composables/auth';

const { logout } = useAuth();
const router = useRouter();

logout().then(() => router.replace('/login'));
</script>
