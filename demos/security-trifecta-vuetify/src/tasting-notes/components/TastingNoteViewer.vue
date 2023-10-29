<template>
  <div>
    <v-card class="rounded-lg">
      <v-card-title data-testid="title">{{ note.data.brand }}: {{ note.data.name }}</v-card-title>
      <v-card-subtitle data-testid="subtitle"
        >Rating: {{ note.data.rating }} star{{ note.data.rating > 1 ? 's' : '' }}
      </v-card-subtitle>
      <v-card-text data-testid="body">{{ note.data.notes }}</v-card-text>
      <v-card-actions>
        <v-btn color="secondary" prepend-icon="mdi-pencil" @click="$emit('edit', note)" data-testid="edit-button"
          >Edit</v-btn
        >
        <v-btn
          color="danger"
          prepend-icon="mdi-delete-outline"
          @click="showConfirmDialog = true"
          data-testid="delete-button"
          >Delete</v-btn
        >
      </v-card-actions>
    </v-card>
    <v-dialog v-model="showConfirmDialog" max-width="600px" data-testid="confirm-dialog">
      <AppConfirmCard
        :question="`Are you sure you want to delete ${note.data.name}?`"
        @confirm="doRemove"
        @cancel="showConfirmDialog = false"
      />
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Editable } from '@/models';
import { TastingNote } from '@/tasting-notes/TastingNote';
import AppConfirmCard from '@/components/AppConfirmCard.vue';

const showConfirmDialog = ref(false);

const props = defineProps<{ note: Editable<TastingNote> }>();
const emit = defineEmits(['delete', 'edit']);

const doRemove = () => {
  emit('delete', props.note);
  showConfirmDialog.value = false;
};
</script>
