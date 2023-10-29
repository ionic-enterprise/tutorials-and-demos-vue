import { TeaCategory } from '@/tea-categories/TeaCategory';
import { Capacitor } from '@capacitor/core';
import { ref } from 'vue';
import { useTeaCategoriesAPI } from './tea-categories-api';
import { useTeaCategoriesDatabase } from './tea-categories-database';

const categories = ref<Array<TeaCategory>>([]);

const load = async (): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    const { getAll } = useTeaCategoriesAPI();
    const { trim, upsert } = useTeaCategoriesDatabase();
    const cats = await getAll();
    await trim(cats.map((cat: TeaCategory) => cat.id));
    const upserts: Array<Promise<any>> = cats.map((cat: TeaCategory) => upsert(cat));
    await Promise.all(upserts);
  }
};

const refresh = async (): Promise<void> => {
  const { getAll } = Capacitor.isNativePlatform() ? useTeaCategoriesDatabase() : useTeaCategoriesAPI();
  categories.value = await getAll();
};

const find = async (id: number): Promise<TeaCategory | undefined> => {
  if (!categories.value.length) {
    await refresh();
  }
  return categories.value.find((t) => t.id === id);
};

export const useTeaCategories = () => ({
  categories,
  find,
  load,
  refresh,
});
