// 中国食物营养成分数据类型

export interface CnFood {
  food_name: string;       // 食物名称
  cat1: string | null;    // 大类
  cat2: string | null;    // 子类
  energy_kcal: number | null;  // 能量 (kcal)
  protein_g: number | null;     // 蛋白质 (g)
  fat_g: number | null;         // 脂肪 (g)
  carbs_g: number | null;       // 碳水化合物 (g)
  fiber_g: number | null;      // 膳食纤维 (g)
  sodium_mg: number | null;     // 钠 (mg)
  calcium_mg: number | null;    // 钙 (mg)
  phosphorus_mg: number | null;  // 磷 (mg)
  potassium_mg: number | null; // 钾 (mg)
  magnesium_mg: number | null;  // 镁 (mg)
  iron_mg: number | null;      // 铁 (mg)
  zinc_mg: number | null;      // 锌 (mg)
  selenium_ug: number | null;   // 硒 (μg)
  copper_mg: number | null;    // 铜 (mg)
  manganese_mg: number | null; // 锰 (mg)
  vitA_ug: number | null;      // 维生素A (μg)
  vitB1_mg: number | null;     // 维生素B1 (mg)
  vitB2_mg: number | null;    // 维生素B2 (mg)
  niacin_mg: number | null;     // 烟酸 (mg)
  vitC_mg: number | null;      // 维生素C (mg)
  vitE_mg_alpha: number | null;// 维生素E α-TE (mg)
  sat_fat_g: number | null;    // 饱和脂肪酸 (g) — 网站未检测
  monounsat_fat_g: number | null; // 单不饱和脂肪酸 (g)
  polyunsat_fat_g: number | null; // 多不饱和脂肪酸 (g)
  cholesterol_mg: number | null;   // 胆固醇 (mg)
}

export interface CnFoodCategory {
  id: string;
  name: string;
  count: number;
}
