// 中国食物营养成分数据类型

export interface CnFood {
  // 识别字段
  food_name: string;
  cat1: string | null;
  cat2: string | null;
  // 来源标识（数据中存在但网站未展示）
  source?: string;
  edible_pct?: number;
  water_g?: number;
  energy_kJ?: number;
  ash_g?: number;
  iodine_ug?: number;
  // 营养成分（网站展示的部分）
  energy_kcal?: number | null;
  protein_g?: number | null;
  fat_g?: number | null;
  carbs_g?: number | null;
  fiber_g?: number | null;
  sodium_mg?: number | null;
  calcium_mg?: number | null;
  phosphorus_mg?: number | null;
  potassium_mg?: number | null;
  magnesium_mg?: number | null;
  iron_mg?: number | null;
  zinc_mg?: number | null;
  selenium_ug?: number | null;
  copper_mg?: number | null;
  manganese_mg?: number | null;
  vitA_ug?: number | null;
  vitB1_mg?: number | null;
  vitB2_mg?: number | null;
  niacin_mg?: number | null;
  vitC_mg?: number | null;
  vitE_mg_alpha?: number | null;
  sat_fat_g?: number | null;
  monounsat_fat_g?: number | null;
  polyunsat_fat_g?: number | null;
  cholesterol_mg?: number | null;
  carotene_ug?: number | null;
}

export interface CnFoodCategory {
  id: string;
  name: string;
  count: number;
}
