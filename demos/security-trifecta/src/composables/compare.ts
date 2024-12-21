interface BrandNamePair {
  brand: string;
  name: string;
}

const byStringProp = (x1: Partial<BrandNamePair>, x2: Partial<BrandNamePair>, propName: 'brand' | 'name'): number => {
  const str1 = x1[propName]?.trim().toUpperCase() || '';
  const str2 = x2[propName]?.trim().toUpperCase() || '';

  return str1.localeCompare(str2);
};

const byName = (x1: Pick<BrandNamePair, 'name'>, x2: Pick<BrandNamePair, 'name'>): number => {
  return byStringProp(x1, x2, 'name');
};

const byBrand = (x1: Pick<BrandNamePair, 'brand'>, x2: Pick<BrandNamePair, 'brand'>): number => {
  return byStringProp(x1, x2, 'brand');
};

const byBrandAndName = (x1: BrandNamePair, x2: BrandNamePair): number => {
  return byBrand(x1, x2) || byName(x1, x2);
};

export const useCompare = () => ({
  byName,
  byBrandAndName,
});
