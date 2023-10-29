<template>
  <div class="pa-4">
    <div class="mb-4" v-for="note in notes" :key="note.data.id">
      <TastingNoteEditor v-if="note.editMode === 'edit'" @cancel="note.editMode = 'view'" @save="save" :note="note" />
      <TastingNoteViewer
        v-else
        @edit="note.editMode = 'edit'"
        @delete="(note: Editable<TastingNote>) => remove(note.data)"
        :note="note"
      />
    </div>

    <v-dialog v-model="showAddDialog" max-width="800px" data-testid="confirm-dialog">
      <TastingNoteEditor
        :note="emptyNote"
        @cancel="showAddDialog = false"
        @save="
          (note: Editable<TastingNote>, data:TastingNote) => {
            save(note, data);
            showAddDialog = false;
          }
        "
      />
    </v-dialog>
    <v-btn
      class="fab-btn"
      icon="mdi-plus"
      color="primary"
      @click="
        () => {
          emptyNote.editMode = 'create';
          showAddDialog = true;
        }
      "
    ></v-btn>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useTastingNotes } from '@/tasting-notes/composables/tasting-notes';
import TastingNoteEditor from '@/tasting-notes/components/TastingNoteEditor.vue';
import TastingNoteViewer from '@/tasting-notes/components/TastingNoteViewer.vue';
import { Editable } from '@/models/Editable';
import { TastingNote } from './TastingNote';

const { notes, refresh, remove, save: saveNote } = useTastingNotes();

const showAddDialog = ref(false);
const emptyNote: Editable<TastingNote> = {
  editMode: 'create',
  data: {
    brand: '',
    name: '',
    teaCategoryId: 1,
    rating: 0,
    notes: '',
  },
};

const save = async (note: Editable<TastingNote>, data: TastingNote) => {
  await saveNote(data);
  note.editMode = 'view';
};

refresh();
</script>
