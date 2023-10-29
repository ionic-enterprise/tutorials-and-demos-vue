import { useBackendAPI } from '@/composables/backend-api';
import { useCompare } from '@/composables/compare';
import { TeaCategory } from '@/tea-categories/TeaCategory';

const { client } = useBackendAPI();

const endpoint = '/tea-categories';

const getAll = async (): Promise<Array<TeaCategory>> => {
  const { byName } = useCompare();
  const { data } = await client.get(endpoint);
  return data.sort(byName);
};

export const useTeaCategoriesAPI = () => ({
  getAll,
});
