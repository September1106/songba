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
  vitaminB1_mg: number; // 硫胺素 mg
  vitaminB2_mg: number; // 核黄素 mg
  vitaminB6_mg: number; // 维生素B6 mg
  vitaminB12_ug: number; // 维生素B12 ug
  niacin_mg: number;   // 烟酸 mg
  folate_ug: number;   // 叶酸 ug
  selenium_ug: number; // 硒 ug
  copper_mg: number;   // 铜 mg
  magnesium_mg: number; // 镁 mg
  phosphorus_mg: number; // 磷 mg
  potassium_mg: number; // 钾 mg
  sodium_mg: number;   // 钠 mg
}

export const DRI_BY_AGE: Record<string, { label: string; dris: DRIValue }> = {
  '1-3y': {
    label: '1-3岁',
    dris: {
      energy_kcal: 1100, protein_g: 25, fat_g: 35, carbohydrate_g: 140, fiber_g: 12,
      calcium_mg: 600, iron_mg: 9, zinc_mg: 4,
      vitaminA_ug: 310, vitaminC_mg: 40, vitaminD_ug: 10,
      vitaminB1_mg: 0.6, vitaminB2_mg: 0.6, vitaminB6_mg: 0.5, vitaminB12_ug: 1.0,
      niacin_mg: 6, folate_ug: 160, selenium_ug: 25,
      copper_mg: 0.3, magnesium_mg: 80, phosphorus_mg: 300, potassium_mg: 900, sodium_mg: 700,
    },
  },
  '4-6y': {
    label: '4-6岁',
    dris: {
      energy_kcal: 1400, protein_g: 30, fat_g: 40, carbohydrate_g: 170, fiber_g: 15,
      calcium_mg: 800, iron_mg: 10, zinc_mg: 5.5,
      vitaminA_ug: 360, vitaminC_mg: 50, vitaminD_ug: 10,
      vitaminB1_mg: 0.8, vitaminB2_mg: 0.8, vitaminB6_mg: 0.6, vitaminB12_ug: 1.2,
      niacin_mg: 8, folate_ug: 200, selenium_ug: 30,
      copper_mg: 0.4, magnesium_mg: 130, phosphorus_mg: 400, potassium_mg: 1100, sodium_mg: 900,
    },
  },
  '7-10y': {
    label: '7-10岁',
    dris: {
      energy_kcal: 1800, protein_g: 45, fat_g: 50, carbohydrate_g: 240, fiber_g: 20,
      calcium_mg: 1000, iron_mg: 13, zinc_mg: 6,
      vitaminA_ug: 500, vitaminC_mg: 65, vitaminD_ug: 10,
      vitaminB1_mg: 1.0, vitaminB2_mg: 1.0, vitaminB6_mg: 0.8, vitaminB12_ug: 1.5,
      niacin_mg: 10, folate_ug: 300, selenium_ug: 40,
      copper_mg: 0.6, magnesium_mg: 180, phosphorus_mg: 600, potassium_mg: 1500, sodium_mg: 1200,
    },
  },
  '11-13y': {
    label: '11-13岁',
    dris: {
      energy_kcal: 2200, protein_g: 60, fat_g: 60, carbohydrate_g: 300, fiber_g: 25,
      calcium_mg: 1200, iron_mg: 15, zinc_mg: 7,
      vitaminA_ug: 630, vitaminC_mg: 90, vitaminD_ug: 10,
      vitaminB1_mg: 1.2, vitaminB2_mg: 1.2, vitaminB6_mg: 1.0, vitaminB12_ug: 2.0,
      niacin_mg: 12, folate_ug: 400, selenium_ug: 50,
      copper_mg: 0.7, magnesium_mg: 240, phosphorus_mg: 800, potassium_mg: 1900, sodium_mg: 1500,
    },
  },
  '14-17y': {
    label: '14-17岁',
    dris: {
      energy_kcal: 2500, protein_g: 75, fat_g: 70, carbohydrate_g: 340, fiber_g: 30,
      calcium_mg: 1000, iron_mg: 18, zinc_mg: 8,
      vitaminA_ug: 800, vitaminC_mg: 100, vitaminD_ug: 10,
      vitaminB1_mg: 1.4, vitaminB2_mg: 1.4, vitaminB6_mg: 1.2, vitaminB12_ug: 2.4,
      niacin_mg: 14, folate_ug: 400, selenium_ug: 60,
      copper_mg: 0.8, magnesium_mg: 300, phosphorus_mg: 1000, potassium_mg: 2200, sodium_mg: 1800,
    },
  },
  '18y+': {
    label: '18岁以上（成人）',
    dris: {
      energy_kcal: 2100, protein_g: 65, fat_g: 60, carbohydrate_g: 300, fiber_g: 30,
      calcium_mg: 800, iron_mg: 12, zinc_mg: 7,
      vitaminA_ug: 700, vitaminC_mg: 100, vitaminD_ug: 10,
      vitaminB1_mg: 1.2, vitaminB2_mg: 1.2, vitaminB6_mg: 1.2, vitaminB12_ug: 2.4,
      niacin_mg: 12, folate_ug: 400, selenium_ug: 60,
      copper_mg: 0.8, magnesium_mg: 300, phosphorus_mg: 700, potassium_mg: 2000, sodium_mg: 1500,
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

// 营养素中文名与单位
export const NUTRIENT_LABELS: Record<string, { label: string; unit: string }> = {
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
  vitaminB1_mg: { label: '维生素B1', unit: 'mg' },
  vitaminB2_mg: { label: '维生素B2', unit: 'mg' },
  vitaminB6_mg: { label: '维生素B6', unit: 'mg' },
  vitaminB12_ug: { label: '维生素B12', unit: 'μg' },
  niacin_mg: { label: '烟酸', unit: 'mg' },
  folate_ug: { label: '叶酸', unit: 'μg' },
  selenium_ug: { label: '硒', unit: 'μg' },
  copper_mg: { label: '铜', unit: 'mg' },
  magnesium_mg: { label: '镁', unit: 'mg' },
  phosphorus_mg: { label: '磷', unit: 'mg' },
  potassium_mg: { label: '钾', unit: 'mg' },
  sodium_mg: { label: '钠', unit: 'mg' },
};

// 营养素排名分类（全部营养素）
export interface NutrientRankCategory {
  id: string;
  name: string;
  icon: string;
  nutrients: { key: string; label: string; unit: string }[];
}

export const NUTRIENT_RANK_CATEGORIES: NutrientRankCategory[] = [
  {
    id: 'macro',
    name: '宏量营养素',
    icon: '🍖',
    nutrients: [
      { key: 'energy_kcal', label: '能量', unit: 'kcal' },
      { key: 'protein_g', label: '蛋白质', unit: 'g' },
      { key: 'fat_g', label: '脂肪', unit: 'g' },
      { key: 'carbs_g', label: '碳水化合物', unit: 'g' },
      { key: 'fiber_g', label: '膳食纤维', unit: 'g' },
    ],
  },
  {
    id: 'vitamins',
    name: '维生素',
    icon: '🍊',
    nutrients: [
      { key: 'vitA_ug', label: '维生素A', unit: 'μg' },
      { key: 'vitB1_mg', label: '维生素B1（硫胺素）', unit: 'mg' },
      { key: 'vitB2_mg', label: '维生素B2（核黄素）', unit: 'mg' },
      { key: 'niacin_mg', label: '烟酸', unit: 'mg' },
      { key: 'vitC_mg', label: '维生素C', unit: 'mg' },
      { key: 'vitE_mg_alpha', label: '维生素E（α-TE）', unit: 'mg' },
    ],
  },
  {
    id: 'minerals',
    name: '矿物质',
    icon: '🥛',
    nutrients: [
      { key: 'calcium_mg', label: '钙', unit: 'mg' },
      { key: 'phosphorus_mg', label: '磷', unit: 'mg' },
      { key: 'potassium_mg', label: '钾', unit: 'mg' },
      { key: 'sodium_mg', label: '钠', unit: 'mg' },
      { key: 'magnesium_mg', label: '镁', unit: 'mg' },
      { key: 'iron_mg', label: '铁', unit: 'mg' },
      { key: 'zinc_mg', label: '锌', unit: 'mg' },
      { key: 'selenium_ug', label: '硒', unit: 'μg' },
      { key: 'copper_mg', label: '铜', unit: 'mg' },
      { key: 'manganese_mg', label: '锰', unit: 'mg' },
    ],
  },
  {
    id: 'cholesterol',
    name: '胆固醇',
    icon: '🥚',
    nutrients: [
      { key: 'cholesterol_mg', label: '胆固醇', unit: 'mg' },
    ],
  },
];

// DRI key 映射：CnFood key → DRI key（营养素排名需要知道用哪个 DRI 字段计算占日需%）
export const RANK_DRI_KEY_MAP: Record<string, keyof DRIValue> = {
  energy_kcal: 'energy_kcal',
  protein_g: 'protein_g',
  fat_g: 'fat_g',
  carbs_g: 'carbohydrate_g',
  fiber_g: 'fiber_g',
  calcium_mg: 'calcium_mg',
  phosphorus_mg: 'phosphorus_mg',
  potassium_mg: 'potassium_mg',
  sodium_mg: 'sodium_mg',
  magnesium_mg: 'magnesium_mg',
  iron_mg: 'iron_mg',
  zinc_mg: 'zinc_mg',
  selenium_ug: 'selenium_ug',
  copper_mg: 'copper_mg',
  manganese_mg: 'magnesium_mg', // 无单独锰DRI，用镁代替（仅显示）
  vitA_ug: 'vitaminA_ug',
  vitB1_mg: 'vitaminB1_mg',
  vitB2_mg: 'vitaminB2_mg',
  niacin_mg: 'niacin_mg',
  vitC_mg: 'vitaminC_mg',
  vitE_mg_alpha: 'vitaminD_ug', // 无单独维E DRI，用维D代替（仅显示）
  sat_fat_g: 'fat_g',
  monounsat_fat_g: 'fat_g',
  polyunsat_fat_g: 'fat_g',
  cholesterol_mg: 'fat_g',
};