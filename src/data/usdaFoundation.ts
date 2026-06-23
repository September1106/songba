import foundationData from './usdaFoundation.json';
export const USDA_FOUNDATION_FOODS: Record<string, Record<string, number>> = foundationData.foods;
export const USDA_FOUNDATION_BY_CAT: Record<string, {name: string; children: {id: string; name: string}[]}> = foundationData.by_cat;