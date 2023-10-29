<template>
  <v-card>
    <v-card-title data-testid="title">Are you sure?</v-card-title>
    <v-card-text data-testid="body">{{ question }}</v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="$emit('confirm')" data-testid="yes-button">Yes</v-btn>
      <v-btn color="secondary" @click="$emit('cancel')" data-testid="no-button">No</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{ question: string }>();
defineEmits(['confirm', 'cancel']);
</script>
