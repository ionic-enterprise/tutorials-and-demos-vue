import { ref } from 'vue';
import { Tea } from '@/models';
import { Preferences } from '@capacitor/preferences';
import { useBackendAPI } from './backend-api';

const { client } = useBackendAPI();
const teas = ref<Array<Tea>>([]);

const images: Array<string> = ['green', 'black', 'herbal', 'oolong', 'dark', 'puer', 'white', 'yellow'];

interface RawData {
  id: number;
  name: string;
  description: string;
}

const transform = async (data: RawData): Promise<Tea> => {
  const { value } = await Preferences.get({ key: `rating${data.id}` });
  return {
    ...data,
    rating: parseInt(value || '0', 10),
    image: `img/${images[data.id - 1]}.jpg`,
  };
};

const unpack = (data: Array<RawData>): Promise<Array<Tea>> => {
  return Promise.all(data.map((t) => transform(t)));
};

const refresh = async (): Promise<void> => {
  teas.value = await client.get('/tea-categories').then((res) => unpack(res.data || []));
};

const find = async (id: number): Promise<Tea | undefined> => {
  if (!teas.value.length) {
    await refresh();
  }
  return teas.value.find((t) => t.id === id);
};

const rate = async (id: number, rating: number): Promise<void> => {
  await Preferences.set({ key: `rating${id}`, value: rating.toString() });
  const tea = await find(id);
  if (tea) {
    tea.rating = rating;
  }
};

export const useTea = () => ({
  find,
  refresh,
  rate,
  teas,
});
