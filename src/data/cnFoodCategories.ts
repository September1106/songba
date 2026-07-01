// 中国食物分类浏览模块
// 基于中国疾控中心营养与健康所数据，16个大类动态构建

import { CN_FOODS_DATA } from './cnFoods_data';
import type { CnFood, CnFoodCategory } from './cnFoodsTypes';

// ── 大类 emoji 映射 ────────────────────────────────────────
const CAT_EMOJI: Record<string, string> = {
  '谷类及制品': '🍚',
  '薯类、淀粉及制品': '🥔',
  '干豆类及制品': '🫘',
  '蔬菜类及制品': '🥬',
  '菌藻类': '🍄',
  '水果类及制品': '🍎',
  '坚果、种子类': '🥜',
  '畜肉类及制品': '🥩',
  '禽肉类及制品': '🍗',
  '乳类及制品': '🥛',
  '蛋类及制品': '🥚',
  '鱼虾蟹贝类': '🐟',
  '小吃、甜饼': '🍪',
  '速食食品': '🍜',
  '饮料类': '🥤',
  '糖、果脯和蜜饯、蜂蜜': '🍬',
};

export const CN_FOOD_CATEGORIES: CnFoodCategory[] = (() => {
  const catCount: Record<string, number> = {};
  for (const f of CN_FOODS_DATA) {
    const c = f.cat1 || '其他';
    catCount[c] = (catCount[c] || 0) + 1;
  }
  return Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      id: name,
      name: (CAT_EMOJI[name] || '🍽️') + ' ' + name.replace(/^[\S]+\s/, ''),
      count,
    }));
})();

// ── 子类映射 ───────────────────────────────────────────────
// 某些大类内有明确子类（来自cat2字段非空的）
export interface CnSubCategory {
  id: string;      // '大类:子类'
  parent: string; // cat1
  name: string;
  items: CnFood[];
}

export const CN_ALL_SUBCATEGORIES: CnSubCategory[] = (() => {
  const map: Record<string, CnSubCategory> = {};
  for (const f of CN_FOODS_DATA) {
    const parent = f.cat1 || '其他';
    const child = f.cat2 || '';
    const key = child ? `${parent}:${child}` : `${parent}:全部`;
    if (!map[key]) {
      map[key] = {
        id: key,
        parent,
        name: child || '全部',
        items: [],
      };
    }
    map[key].items.push(f);
  }
  return Object.values(map);
})();

// ── 搜索食物 ───────────────────────────────────────────────
export function searchCnFoods(query: string): CnFood[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase().trim();
  const seen = new Set<string>();
  const results: CnFood[] = [];
  for (const f of CN_FOODS_DATA) {
    if (f.food_name.toLowerCase().includes(q) && !seen.has(f.food_name)) {
      seen.add(f.food_name);
      results.push(f);
    }
  }
  return results;
}

// ── 获取某大类的食物列表 ────────────────────────────────────
export function getCnFoodsByCategory(cat1: string): CnFood[] {
  return CN_FOODS_DATA.filter(f => f.cat1 === cat1);
}

// ── 获取某子类的食物列表 ────────────────────────────────────
export function getCnFoodsBySubCategory(cat1: string, cat2: string): CnFood[] {
  return CN_FOODS_DATA.filter(f => f.cat1 === cat1 && (f.cat2 === cat2 || (!cat2)));
}

// ── 按大类+子类二级导航，获取子类列表 ─────────────────────────
export function getSubCategories(cat1: string): { name: string; count: number }[] {
  const subcats: Record<string, number> = {};
  for (const f of CN_FOODS_DATA) {
    if (f.cat1 === cat1) {
      const child = f.cat2 || '（无子类）';
      subcats[child] = (subcats[child] || 0) + 1;
    }
  }
  return Object.entries(subcats)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

// ── 展示全部营养素 ──────────────────────────────────────────
export const CN_NUTRIENT_DISPLAY: { key: keyof CnFood; label: string; unit: string; dri_key?: string }[] = [
  { key: 'energy_kcal',       label: '能量',           unit: 'kcal', dri_key: 'energy_kcal' },
  { key: 'protein_g',          label: '蛋白质',          unit: 'g',    dri_key: 'protein_g' },
  { key: 'fat_g',              label: '脂肪',            unit: 'g',    dri_key: 'fat_g' },
  { key: 'carbs_g',            label: '碳水化合物',      unit: 'g',    dri_key: 'carbohydrate_g' },
  { key: 'fiber_g',            label: '膳食纤维',        unit: 'g',    dri_key: 'fiber_g' },
  { key: 'cholesterol_mg',      label: '胆固醇',          unit: 'mg' },
  { key: 'sat_fat_g',          label: '饱和脂肪酸(SFA)',  unit: 'g' },
  { key: 'monounsat_fat_g',    label: '单不饱和脂肪酸',  unit: 'g' },
  { key: 'polyunsat_fat_g',    label: '多不饱和脂肪酸',  unit: 'g' },
  { key: 'vitA_ug',            label: '维生素A',         unit: 'μg',  dri_key: 'vitaminA_ug' },
  { key: 'vitB1_mg',           label: '维生素B1',        unit: 'mg',  dri_key: 'vitaminB1_mg' },
  { key: 'vitB2_mg',           label: '维生素B2',        unit: 'mg',  dri_key: 'vitaminB2_mg' },
  { key: 'niacin_mg',          label: '烟酸',            unit: 'mg',  dri_key: 'niacin_mg' },
  { key: 'vitC_mg',            label: '维生素C',          unit: 'mg',  dri_key: 'vitaminC_mg' },
  { key: 'vitE_mg_alpha',      label: '维生素E(α-TE)',    unit: 'mg' },
  { key: 'calcium_mg',         label: '钙',              unit: 'mg',  dri_key: 'calcium_mg' },
  { key: 'phosphorus_mg',      label: '磷',              unit: 'mg' },
  { key: 'potassium_mg',       label: '钾',              unit: 'mg' },
  { key: 'sodium_mg',          label: '钠',              unit: 'mg',  dri_key: 'sodium_mg' },
  { key: 'magnesium_mg',       label: '镁',              unit: 'mg',  dri_key: 'magnesium_mg' },
  { key: 'iron_mg',            label: '铁',              unit: 'mg',  dri_key: 'iron_mg' },
  { key: 'zinc_mg',            label: '锌',              unit: 'mg',  dri_key: 'zinc_mg' },
  { key: 'selenium_ug',        label: '硒',              unit: 'μg',  dri_key: 'selenium_ug' },
  { key: 'copper_mg',          label: '铜',              unit: 'mg' },
  { key: 'manganese_mg',       label: '锰',              unit: 'mg' },
];
