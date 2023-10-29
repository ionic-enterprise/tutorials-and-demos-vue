<template>
  <v-card class="pa-2">
    <v-card-text>
      <v-form>
        <v-text-field
          label="Brand"
          variant="underlined"
          name="brand"
          v-model="brand"
          data-testid="brand-input"
          :error-messages="errors.brand"
        ></v-text-field>
        <v-text-field
          label="Name"
          variant="underlined"
          name="name"
          v-model="name"
          :error-messages="errors.name"
          data-testid="name-input"
        ></v-text-field>
        <v-select
          label="Type"
          v-model="type"
          :items="categories"
          item-title="name"
          item-value="id"
          data-testid="type-input"
        />
        <v-rating v-model="rating" active-color="yellow-accent-4" data-testid="rating-input"></v-rating>
        <v-textarea
          rows="4"
          label="Notes"
          v-model="notes"
          data-testid="notes-input"
          :error-messages="errors.notes"
        ></v-textarea>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" :disabled="!meta.valid" @click="saveEvent" data-testid="save-button">Save</v-btn>
      <v-btn color="secondary" @click="$emit('cancel', note)" data-testid="cancel-button">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { number as yupNumber, object as yupObject, string as yupString } from 'yup';
import { onMounted } from 'vue';
import { Editable } from '@/models';
import { TastingNote } from '@/tasting-notes/TastingNote';
import { useTeaCategories } from '@/tea-categories/composables/tea-categories';

const props = defineProps<{ note: Editable<TastingNote> }>();
const emit = defineEmits(['cancel', 'save']);

const { categories, refresh: refreshTeaCatgories } = useTeaCategories();

if (categories.value.length === 0) {
  refreshTeaCatgories();
}

const validationSchema = yupObject({
  brand: yupString().required().label('Brand'),
  name: yupString().required().label('Name'),
  notes: yupString().required().label('Notes'),
  rating: yupNumber().label('Rating'),
  type: yupNumber().required().label('Type'),
});

const { errors, meta, resetForm } = useForm({ validationSchema });

const { value: brand } = useField<string>('brand');
const { value: name } = useField<string>('name');
const { value: notes } = useField<string>('notes');
const { value: rating } = useField<string>('rating');
const { value: type } = useField<string>('type');

onMounted(() => {
  resetForm({
    values: {
      brand: props.note.data.brand,
      name: props.note.data.name,
      notes: props.note.data.notes,
      rating: props.note.data.rating || 0,
      type: props.note.data.teaCategoryId,
    },
  });
});

const saveEvent = () => {
  emit('save', props.note, {
    ...props.note.data,
    brand: brand.value,
    name: name.value,
    rating: rating.value,
    teaCategoryId: type.value,
    notes: notes.value,
  });
};
</script>
