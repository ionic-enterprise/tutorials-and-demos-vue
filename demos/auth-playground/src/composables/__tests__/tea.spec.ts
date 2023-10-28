import { useBackendAPI } from '@/composables/backend-api';
import { useTea } from '@/composables/tea';
import { Tea } from '@/models';
import { GetOptions, Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@capacitor/preferences');
vi.mock('@/composables/backend-api');

describe('useTea', () => {
  let expectedTeas: Array<Tea>;
  let httpResultTeas: Array<{ id: number; name: string; description: string }>;

  const initializeTestData = () => {
    expectedTeas = [
      {
        id: 1,
        name: 'Green',
        image: 'img/green.jpg',
        description: 'Green tea description.',
        rating: 0,
      },
      {
        id: 2,
        name: 'Black',
        image: 'img/black.jpg',
        description: 'Black tea description.',
        rating: 0,
      },
      {
        id: 3,
        name: 'Herbal',
        image: 'img/herbal.jpg',
        description: 'Herbal Infusion description.',
        rating: 4,
      },
      {
        id: 4,
        name: 'Oolong',
        image: 'img/oolong.jpg',
        description: 'Oolong tea description.',
        rating: 3,
      },
      {
        id: 5,
        name: 'Dark',
        image: 'img/dark.jpg',
        description: 'Dark tea description.',
        rating: 0,
      },
      {
        id: 6,
        name: 'Puer',
        image: 'img/puer.jpg',
        description: 'Puer tea description.',
        rating: 5,
      },
      {
        id: 7,
        name: 'White',
        image: 'img/white.jpg',
        description: 'White tea description.',
        rating: 0,
      },
      {
        id: 8,
        name: 'Yellow',
        image: 'img/yellow.jpg',
        description: 'Yellow tea description.',
        rating: 0,
      },
    ];
    httpResultTeas = expectedTeas.map((t: Tea) => {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { image, rating, ...tea } = { ...t };
      return tea;
    });
  };

  beforeEach(() => {
    const { client } = useBackendAPI();
    initializeTestData();
    vi.clearAllMocks();
    (client.get as Mock).mockResolvedValue({ data: httpResultTeas });
    (Preferences.get as Mock).mockImplementation(async (opt: GetOptions) => {
      let value = null;
      switch (opt.key) {
        case 'rating3':
          value = '4';
          break;
        case 'rating4':
          value = '3';
          break;
        case 'rating6':
          value = '5';
          break;
      }
      return { value };
    });
  });

  describe('refresh', () => {
    it('gets the tea categories', async () => {
      const { client } = useBackendAPI();
      const { refresh } = useTea();
      await refresh();
      expect(client.get).toHaveBeenCalledTimes(1);
      expect(client.get).toHaveBeenCalledWith('/tea-categories');
    });

    it('transforms the tea data', async () => {
      const { refresh, teas } = useTea();
      await refresh();
      expect(teas.value).toEqual(expectedTeas);
    });
  });

  describe('find', () => {
    const { find, refresh, teas } = useTea();

    beforeEach(() => {
      teas.value = [];
    });

    it('refreshes the tea data if it has not been loaded yet', async () => {
      const t = await find(6);
      expect(teas.value.length).toEqual(8);
      expect(t).toEqual({
        id: 6,
        name: 'Puer',
        image: 'img/puer.jpg',
        description: 'Puer tea description.',
        rating: 5,
      });
    });

    it('finds the tea from the existing teas', async () => {
      const { client } = useBackendAPI();
      await refresh();
      vi.clearAllMocks();
      const t = await find(4);
      expect(t).toEqual({
        id: 4,
        name: 'Oolong',
        image: 'img/oolong.jpg',
        description: 'Oolong tea description.',
        rating: 3,
      });
      expect(client.get).not.toHaveBeenCalled();
    });

    it('returns undefined if the tea does not exist', async () => {
      expect(await find(42)).toBeUndefined();
    });
  });

  describe('rate', () => {
    const { rate, refresh, teas } = useTea();

    it('saves the value', async () => {
      await rate(5, 4);
      expect(Preferences.set).toHaveBeenCalledTimes(1);
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'rating5',
        value: '4',
      });
    });

    it('updates the teas array', async () => {
      await refresh();
      await rate(5, 4);
      expect(teas.value[4].rating).toEqual(4);
    });
  });
});
