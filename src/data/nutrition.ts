// 营养查询工具 - 中国居民膳食指南推荐摄入量（按年龄）
// 参考：《中国居民膳食指南2022》婴幼儿喂养指南 + 普通人群

export interface DRIValue {
  energy_kcal: number;  // 能量 kcal
  protein_g: number;    // 蛋白质 g
  fat_g: number;        // 脂肪 g
  carbohydrate_g: number; // 碳水 g
  fiber_g: number;      // 膳食纤维 g
  calcium_mg: number;   // 钙 mg
  iron_mg: number;      // 铁 mg
  zinc_mg: number;      // 锌 mg
  vitaminA_ug: number; // 维生素A ugRAE
  vitaminC_mg: number; // 维生素C mg
  vitaminD_ug: number; // 维生素D ug
}

export const DRI_BY_AGE: Record<string, { label: string; dris: DRIValue }> = {
  '1-3y': {
    label: '1-3岁',
    dris: {
      energy_kcal: 1100, protein_g: 25, fat_g: 35, carbohydrate_g: 140, fiber_g: 12,
      calcium_mg: 600, iron_mg: 9, zinc_mg: 4, vitaminA_ug: 310, vitaminC_mg: 40, vitaminD_ug: 10,
    },
  },
  '4-6y': {
    label: '4-6岁',
    dris: {
      energy_kcal: 1400, protein_g: 30, fat_g: 40, carbohydrate_g: 170, fiber_g: 15,
      calcium_mg: 800, iron_mg: 10, zinc_mg: 5.5, vitaminA_ug: 360, vitaminC_mg: 50, vitaminD_ug: 10,
    },
  },
  '7-10y': {
    label: '7-10岁',
    dris: {
      energy_kcal: 1800, protein_g: 45, fat_g: 50, carbohydrate_g: 240, fiber_g: 20,
      calcium_mg: 1000, iron_mg: 13, zinc_mg: 6, vitaminA_ug: 500, vitaminC_mg: 65, vitaminD_ug: 10,
    },
  },
  '11-13y': {
    label: '11-13岁',
    dris: {
      energy_kcal: 2200, protein_g: 60, fat_g: 60, carbohydrate_g: 300, fiber_g: 25,
      calcium_mg: 1200, iron_mg: 15, zinc_mg: 7, vitaminA_ug: 630, vitaminC_mg: 90, vitaminD_ug: 10,
    },
  },
  '14-17y': {
    label: '14-17岁',
    dris: {
      energy_kcal: 2500, protein_g: 75, fat_g: 70, carbohydrate_g: 340, fiber_g: 30,
      calcium_mg: 1000, iron_mg: 18, zinc_mg: 8, vitaminA_ug: 800, vitaminC_mg: 100, vitaminD_ug: 10,
    },
  },
  '18y+': {
    label: '18岁以上（成人）',
    dris: {
      energy_kcal: 2100, protein_g: 65, fat_g: 60, carbohydrate_g: 300, fiber_g: 30,
      calcium_mg: 800, iron_mg: 12, zinc_mg: 7, vitaminA_ug: 700, vitaminC_mg: 100, vitaminD_ug: 10,
    },
  },
};

export function getDRIOptions() {
  return Object.entries(DRI_BY_AGE).map(([key, val]) => ({
    key,
    label: val.label,
  }));
}

export function getDRI(ageGroup: string): DRIValue {
  return DRI_BY_AGE[ageGroup]?.dris || DRI_BY_AGE['1-3y'].dris;
}

// 营养素中文名
export const NUTRIENT_LABELS: Record<keyof DRIValue, { label: string; unit: string }> = {
  energy_kcal: { label: '能量', unit: 'kcal' },
  protein_g: { label: '蛋白质', unit: 'g' },
  fat_g: { label: '脂肪', unit: 'g' },
  carbohydrate_g: { label: '碳水化合物', unit: 'g' },
  fiber_g: { label: '膳食纤维', unit: 'g' },
  calcium_mg: { label: '钙', unit: 'mg' },
  iron_mg: { label: '铁', unit: 'mg' },
  zinc_mg: { label: '锌', unit: 'mg' },
  vitaminA_ug: { label: '维生素A', unit: 'μg' },
  vitaminC_mg: { label: '维生素C', unit: 'mg' },
  vitaminD_ug: { label: '维生素D', unit: 'μg' },
};