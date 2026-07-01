// 食物分类树 - 用于分类浏览模式
// 分类参考：WHO / 中国居民膳食指南 / USDA

import veggiesData from './veggies_nutrition.json';
import fruitsData from './fruits_nutrition.json';
import milkLegumesData from './milk_legumes_nutrition.json';
import meatsData from './meats_nutrition.json';
import seafoodsData from './seafoods_nutrition.json';
import eggsData from './eggs_nutrition.json';
import grainsData from './grains_nutrition.json';

export interface FoodNode {
  id: string;
  name: string;
  nutrients?: Record<string, number>;
}

export interface FoodCategory {
  id: string;
  name: string;
  children?: FoodNode[];
}

// ============================================================
// 营养素 key 映射：USDA key -> FOOD_DATABASE key
// ============================================================
const USDA_KEY_MAP: Record<string, string> = {
  // 完整键名（蔬菜、水果、蛋奶、谷物）
  'Energy (kcal)': 'energy_kcal',
  'Total lipid (fat) (g)': 'fat_g',
  'Protein (g)': 'protein_g',
  'Carbohydrate, by difference (g)': 'carbohydrate_g',
  'Fiber, total dietary (g)': 'fiber_g',
  'Calcium, Ca (mg)': 'calcium_mg',
  'Iron, Fe (mg)': 'iron_mg',
  'Zinc, Zn (mg)': 'zinc_mg',
  'Vitamin C, total ascorbic acid (mg)': 'vitaminC_mg',
  'Vitamin D (D2 + D3) (µg)': 'vitaminD_ug',
  // 简短键名（肉类）
  'Fat (g)': 'fat_g',
  'Carbohydrate (g)': 'carbohydrate_g',
  'Fiber (g)': 'fiber_g',
  'Ca (mg)': 'calcium_mg',
  'Fe (mg)': 'iron_mg',
  'Zn (mg)': 'zinc_mg',
  'VitA (ug)': 'vitaminA_ug',
  'VitC (mg)': 'vitaminC_mg',
  'VitD (ug)': 'vitaminD_ug',
};

function convertNutrients(nutrients: Record<string, unknown>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [usdaKey, dbKey] of Object.entries(USDA_KEY_MAP)) {
    const val = nutrients[usdaKey];
    if (val != null && typeof val === 'number') {
      result[dbKey] = val;
    }
  }
  const vaRae = nutrients['Vitamin A, RAE (µg)'];
  if (typeof vaRae === 'number' && vaRae > 0) {
    result['vitaminA_ug'] = vaRae;
  } else {
    const vaIu = nutrients['Vitamin A, IU (IU)'];
    if (typeof vaIu === 'number' && vaIu > 0) {
      result['vitaminA_ug'] = Math.round(vaIu / 3.33 * 10) / 10;
    }
  }
  return result;
}

function normalizeId(name: string): string {
  return name.toLowerCase().replace(/[\s,\(\)\/]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ============================================================
// 蔬菜数据（来自 veggies_nutrition.json，98种）
// ============================================================
type VeggieJSON = typeof veggiesData;
const VEGGIES_JSON = (veggiesData as VeggieJSON).vegetables;

export const VEGGIES_DATABASE: Record<string, Record<string, number>> = {};
for (const v of VEGGIES_JSON) {
  VEGGIES_DATABASE[normalizeId(v.english)] = convertNutrients(v.nutrients);
}

// ============================================================
// 水果数据（来自 fruits_nutrition.json，42种）
// ============================================================
type FruitJSON = typeof fruitsData;
const FRUITS_JSON = (fruitsData as FruitJSON).fruits;

export const FRUITS_DATABASE: Record<string, Record<string, number>> = {};
for (const f of FRUITS_JSON) {
  FRUITS_DATABASE[normalizeId(f.english)] = convertNutrients(f.nutrients);
}

// ============================================================
// 肉类数据（来自 meats_nutrition.json，31种）
// ============================================================
type MeatJSON = typeof meatsData;
const MEATS_JSON = (meatsData as MeatJSON).meats;

export const MEATS_DATABASE: Record<string, Record<string, number>> = {};
for (const m of MEATS_JSON) {
  MEATS_DATABASE[m.id] = convertNutrients(m.nutrients);
}

// ============================================================
// 水产数据（来自 seafoods_nutrition.json，18种）
// ============================================================
type SeafoodJSON = typeof seafoodsData;
const SEAFOODS_JSON = seafoodsData as unknown as typeof seafoodsData;

export const SEAFOODS_DATABASE: Record<string, Record<string, number>> = {};
for (const s of SEAFOODS_JSON) {
  SEAFOODS_DATABASE[s.id] = convertNutrients(s.nutrients);
}

// ============================================================
// 奶类+豆类数据（来自 milk_legumes_nutrition.json，9种）
// ============================================================
type MilkLegumeJSON = typeof milkLegumesData;
const MILK_LEGUMES_JSON = milkLegumesData as unknown as typeof milkLegumesData;

export const MILK_LEGUMES_DATABASE: Record<string, Record<string, number>> = {};
for (const m of MILK_LEGUMES_JSON) {
  MILK_LEGUMES_DATABASE[m.id] = convertNutrients(m.nutrients);
}

// ============================================================
// 蛋类数据（来自 eggs_nutrition.json，4种）
// ============================================================
type EggJSON = typeof eggsData;
const EGGS_JSON = eggsData as unknown as typeof eggsData;

export const EGGS_DATABASE: Record<string, Record<string, number>> = {};
for (const e of EGGS_JSON) {
  EGGS_DATABASE[e.id] = convertNutrients(e.nutrients);
}

// ============================================================
// 谷物类数据（来自 grains_nutrition.json，12种）
// ============================================================
type GrainJSON = typeof grainsData;
const GRAINS_JSON = (grainsData as GrainJSON).grains;

export const GRAINS_DATABASE: Record<string, Record<string, number>> = {};
for (const g of GRAINS_JSON) {
  GRAINS_DATABASE[g.id] = convertNutrients(g.nutrients);
}

// ============================================================
// 谷物类子类（3个子类，12种）
// ============================================================
export const GRAINS_SUBCATEGORIES: Record<string, { name: string; items: FoodNode[] }> = {
  '米饭类': {
    name: '🍚 米饭类',
    items: [
      { id: 'rice-white-long', name: '白米饭（长粒，熟）' },
      { id: 'rice-white-short', name: '白米饭（短粒，熟）' },
      { id: 'rice-brown', name: '糙米饭' },
      { id: 'rice-glutinous', name: '糯米/紫米饭（熟）' },
    ],
  },
  '面食类': {
    name: '🍜 面食类',
    items: [
      { id: 'rice-noodles', name: '米粉/米线（熟）' },
      { id: 'buckwheat-noodles', name: '荞麦面（熟）' },
      { id: 'pasta', name: '意大利面（熟）' },
      { id: 'bread-white', name: '普通白面包' },
    ],
  },
  '粗粮类': {
    name: '🌽 粗粮类',
    items: [
      { id: 'corn-grits', name: '玉米碴（熟）' },
      { id: 'oatmeal', name: '燕麦（熟）' },
      { id: 'millet', name: '小米（熟）' },
      { id: 'corn-sweet-white', name: '甜玉米' },
    ],
  },
};

// ============================================================
// 蔬菜子类（6个子类，98种）
// ============================================================
export const VEGGIE_SUBCATEGORIES: Record<string, { name: string; items: FoodNode[] }> = {
  '绿叶菜类': {
    name: '🥬 绿叶菜类',
    items: [
      { id: 'amaranth-leaves', name: '苋菜' },
      { id: 'kale', name: '羽衣甘蓝' },
{ id: 'mustard-greens', name: '芥蓝' },
      { id: 'mustard-spinach', name: '芥菜' },
      { id: 'cabbage-common', name: '卷心菜' },
      { id: 'cabbage-red', name: '紫甘蓝' },
{ id: 'lettuce-butterhead', name: '生菜' },
      { id: 'arugula', name: '芝麻菜' },
      { id: 'cabbage-chinese-pak-choi', name: '小白菜' },
      { id: 'cabbage-chinese-pe-tsai', name: '大白菜' },
      { id: 'spinach', name: '菠菜' },
      { id: 'beet-greens', name: '红菜苔' },
      { id: 'watercress', name: '西洋菜' },
      { id: 'dill-weed', name: '莳萝' },
      { id: 'coriander-cilantro-leaves', name: '香菜' },
      { id: 'parsley-fresh', name: '欧芹' },
      { id: 'chrysanthemum-garland', name: '茼蒿' },
],
  },
  '根茎类': {
    name: '🥕 根茎类',
    items: [
      { id: 'carrots', name: '胡萝卜' },
      { id: 'beets', name: '甜菜' },
      { id: 'radishes', name: '萝卜' },

      { id: 'potatoes', name: '土豆' },
      { id: 'cassava', name: '木薯' },
      { id: 'sweet-potato', name: '红薯' },
      { id: 'taro', name: '芋头' },
      { id: 'waterchestnuts', name: '荸荠 / 马蹄' },
      { id: 'lotus-root', name: '莲藕' },
      { id: 'yambean', name: '地瓜' },
      { id: 'yam', name: '山药' },
      { id: 'bamboo-shoots', name: '竹笋' },
],
  },
  '瓜果类': {
    name: '🍆 瓜果类',
    items: [
      { id: 'cucumber', name: '黄瓜' },
      { id: 'squash-summer-zucchini', name: '西葫芦' },
      
      { id: 'squash-winter', name: '冬南瓜' },
      { id: 'balsam-pear-pods', name: '苦瓜' },
    ],
  },
  '豆类': {
    name: '🫘 豆类',
    items: [
      { id: 'beans-snap-green', name: '四季豆' },
      { id: 'yardlong-bean', name: '长豇豆' },
      { id: 'soybeans-green', name: '毛豆' },
      { id: 'broadbeans-immature-seeds', name: '蚕豆' },
      { id: 'peas-edible-podded', name: '荷兰豆' },
      { id: 'peas-green', name: '豌豆' },
      { id: 'mung-beans-sprouted', name: '绿豆芽' },
      { id: 'soybeans-mature-seeds-sprouted', name: '黄豆芽' },
],  
  },
  '菌藻类': {
    name: '🍄 菌藻类',
    items: [
      { id: 'mushrooms-white', name: '白蘑菇' },
      { id: 'mushrooms-brown-italian-or-crimini', name: '褐蘑菇' },
      { id: 'mushrooms-shiitake', name: '香菇' },
      { id: 'mushrooms-oyster', name: '平菇' },
{ id: 'mushrooms-enoki', name: '金针菇' },
      { id: 'chanterelle', name: '鸡油菌' },
      { id: 'mushrooms-morel', name: '牛肝菌' },
{ id: 'seaweed-kelp', name: '海带' },
      { id: 'seaweed-laver', name: '紫菜' },
      { id: 'seaweed-wakame', name: '裙带菜' },
    ],
  },
  '其他类': {
    name: '🌽 其他类',
    items: [
      { id: 'asparagus', name: '芦笋' },
      { id: 'peppers-sweet-green', name: '甜椒' },
      { id: 'tomatoes', name: '番茄' },
      { id: 'eggplant', name: '茄子' },
      { id: 'okra', name: '秋葵' },
{ id: 'broccoli', name: '西兰花' },
      { id: 'cauliflower', name: '花菜' },
      { id: 'celery', name: '芹菜' },
{ id: 'onions', name: '洋葱' },
],
  },
};

// ============================================================
// 水果子类（6个大类，42种）
// ============================================================
export const FRUIT_SUBCATEGORIES: Record<string, { name: string; items: FoodNode[] }> = {
  '柑橘类': {
    name: '🍊 柑橘类',
    items: [
      { id: 'oranges', name: '橙子' },
      { id: 'tangerines', name: '柑橘' },
      { id: 'lemon', name: '柠檬' },
      { id: 'limes', name: '青柠' },
      { id: 'grapefruit', name: '西柚' },
      { id: 'pummelo', name: '柚子' },
    ],
  },
  '热带水果': {
    name: '🥭 热带水果',
    items: [
      { id: 'pineapple', name: '菠萝' },
      { id: 'mangos', name: '芒果' },
      { id: 'papayas', name: '木瓜' },
      { id: 'litchis', name: '荔枝' },
      { id: 'longans', name: '龙眼' },
      { id: 'jackfruit', name: '菠萝蜜' },
      { id: 'passion-fruit', name: '百香果' },
      { id: 'carambola', name: '杨桃' },
    ],
  },
  '浆果类': {
    name: '🫐 浆果类',
    items: [
      { id: 'strawberries', name: '草莓' },
      { id: 'blueberries', name: '蓝莓' },
      { id: 'blackberries', name: '黑莓' },
      { id: 'raspberries', name: '覆盆子' },
      { id: 'cranberries', name: '蔓越莓' },
      { id: 'mulberries', name: '桑葚' },
    ],
  },
  '核果/梨果类': {
    name: '🍑 核果/梨果类',
    items: [
      { id: 'apricots', name: '杏' },
      { id: 'plums', name: '李子' },
      { id: 'peaches', name: '桃' },
      { id: 'apples', name: '苹果' },
      { id: 'pears', name: '梨' },
      { id: 'persimmons', name: '柿子' },
      { id: 'crabapples', name: '山楂' },
    ],
  },
  '瓜类': {
    name: '🍈 瓜类',
    items: [
      { id: 'watermelon', name: '西瓜' },
      { id: 'melons-cantaloupe', name: '哈密瓜' },
      { id: 'melons-honeydew', name: '蜜瓜' },
    ],
  },
  '其他': {
    name: '🍇 其他',
    items: [
      { id: 'grapes', name: '葡萄' },
      { id: 'pomegranates', name: '石榴' },
      { id: 'bananas', name: '香蕉' },
      { id: 'avocados', name: '牛油果' },
      { id: 'loquats', name: '枇杷' },
      { id: 'tamarinds', name: '酸角' },
      { id: 'jujube', name: '鲜枣' },
      { id: 'figs', name: '无花果' },
      { id: 'kiwifruit', name: '猕猴桃' },
      { id: 'kumquats', name: '金橘' },
      { id: 'cherries-sweet', name: '车厘子' },
    ],
  },
};

// ============================================================
// 肉类子类（4个大类，31种）
// ============================================================
export const MEAT_SUBCATEGORIES: Record<string, { name: string; items: FoodNode[] }> = {
  '禽类': {
    name: '🍗 禽类',
    items: [
      { id: 'chicken-breast', name: '鸡胸肉' },
      { id: 'chicken-thigh', name: '鸡腿肉' },
      { id: 'chicken-wing', name: '鸡翅' },
      { id: 'chicken-claw', name: '鸡爪' },
      { id: 'chicken-heart', name: '鸡心' },
      { id: 'chicken-liver', name: '鸡肝' },
      { id: 'chicken-gizzard', name: '鸡胗' },
      { id: 'duck-breast', name: '鸭胸肉' },
      { id: 'duck-leg', name: '鸭腿肉' },
      { id: 'goose-meat', name: '鹅肉' },
      { id: 'turkey-breast', name: '火鸡胸' },
      { id: 'turkey-leg', name: '火鸡腿' },
    ],
  },
  '猪肉类': {
    name: '🥩 猪肉类',
    items: [
      { id: 'pork-tenderloin', name: '猪里脊' },
      { id: 'pork-belly', name: '猪五花' },
      { id: 'pork-top-loin', name: '猪通脊' },
      { id: 'pork-blade', name: '猪排骨' },
      { id: 'pork-shoulder', name: '猪腿肉' },
      { id: 'pork-heart', name: '猪心' },
      { id: 'pork-liver', name: '猪肝' },
    ],
  },
  '牛肉类': {
    name: '🥩 牛肉类',
    items: [
      { id: 'beef-tenderloin', name: '牛里脊' },
      { id: 'beef-brisket', name: '牛腩' },
      { id: 'beef-round-steak', name: '牛腱' },
      { id: 'beef-short-rib', name: '牛肋条' },
      { id: 'beef-round-roast', name: '牛腿肉' },
      { id: 'beef-heart', name: '牛心' },
      { id: 'beef-liver', name: '牛肝' },
    ],
  },
  '羊肉类': {
    name: '🥩 羊肉类',
    items: [
      { id: 'lamb-leg', name: '羊腿肉' },
      { id: 'lamb-rib', name: '羊排' },
      { id: 'lamb-shoulder', name: '羊肩肉' },
      { id: 'lamb-heart', name: '羊心' },
      { id: 'lamb-liver', name: '羊肝' },
    ],
  },
  '蛋类': {
    name: '🥚 蛋类',
    items: [
      { id: 'egg-chicken', name: '鸡蛋' },
      { id: 'egg-duck', name: '鸭蛋' },
      { id: 'egg-goose', name: '鹅蛋' },
      { id: 'egg-quail', name: '鹌鹑蛋' },
    ],
  },
};

// ============================================================
// 水产子类（2个大类，18种）
// ============================================================
export const SEAFOOD_SUBCATEGORIES: Record<string, { name: string; items: FoodNode[] }> = {
  '鱼类': {
    name: '🐟 鱼类',
    items: [
      { id: 'tilapia', name: '罗非鱼' },
      { id: 'trout-rainbow', name: '虹鳟鱼' },
      { id: 'bass-fresh', name: '淡水鲈鱼' },
      { id: 'sea-bass', name: '海鲈鱼' },
      { id: 'eel', name: '鳗鱼' },
      { id: 'cod-atlantic', name: '大西洋鳕鱼' },
      { id: 'salmon-atlantic', name: '三文鱼' },
      { id: 'tuna-skipjack', name: '鲣鱼' },
      { id: 'bass-striped', name: '鳜鱼' },
    ],
  },
  '虾蟹贝类': {
    name: '🦐 虾蟹贝类',
    items: [
      { id: 'shrimp', name: '虾' },
      { id: 'crab-king', name: '帝王蟹' },
      { id: 'lobster', name: '波士顿龙虾' },
      { id: 'crayfish', name: '小龙虾' },
      { id: 'clam', name: '蛤蜊' },
      { id: 'mussel', name: '青口' },
      { id: 'oyster', name: '生蚝' },
      { id: 'scallop', name: '扇贝' },
      { id: 'abalone', name: '鲍鱼' },
      { id: 'octopus', name: '章鱼' },
      { id: 'squid', name: '墨鱼/鱿鱼' },
    ],
  },
};

// ============================================================
// 奶类+豆类子类（2个子类，9种）
// ============================================================
export const MILK_LEGUMES_SUBCATEGORIES: Record<string, { name: string; items: FoodNode[] }> = {
  '奶类': {
    name: '🥛 奶类',
    items: [
      { id: 'milk-whole', name: '全脂牛奶' },
      { id: 'milk-goat', name: '羊奶' },
      { id: 'yogurt-whole', name: '全脂酸奶' },
      { id: 'yogurt-greek', name: '希腊酸奶' },
    ],
  },
  '豆类': {
    name: '🫘 豆类',
    items: [
      { id: 'tofu-soft', name: '嫩豆腐' },
      { id: 'tofu-firm', name: '老豆腐' },
      { id: 'soybean-green', name: '黄豆' },
    ],
  },
};

// ============================================================
// 主分类列表
// ============================================================
export const FOOD_CATEGORIES: FoodCategory[] = [
  {
    id: 'fruits',
    name: '🍎 水果类',
    children: [], // 由 FRUIT_SUBCATEGORIES 提供两层结构
  },
  {
    id: 'vegetables',
    name: '🥬 蔬菜类',
    children: [],
  },
  {
    id: 'meats',
    name: '🍖 禽畜肉蛋类',
    children: [],
  },
  {
    id: 'seafoods',
    name: '🐟 水产品',
    children: [],
  },
  {
    id: 'milk_legumes',
    name: '🥛🫘 奶豆类',
    children: [],
  },
  {
    id: 'grains',
    name: '🍚 谷薯类',
    children: [], // 由 GRAINS_SUBCATEGORIES 提供两层结构
  },
];

// ============================================================
// 通过食物ID获取营养数据
// ============================================================
export function getFoodNutrients(foodId: string): Record<string, number> | null {
  if (VEGGIES_DATABASE[foodId]) return VEGGIES_DATABASE[foodId];
  if (FRUITS_DATABASE[foodId]) return FRUITS_DATABASE[foodId];
  if (MEATS_DATABASE[foodId]) return MEATS_DATABASE[foodId];
  if (SEAFOODS_DATABASE[foodId]) return SEAFOODS_DATABASE[foodId];
  if (MILK_LEGUMES_DATABASE[foodId]) return MILK_LEGUMES_DATABASE[foodId];
  if (EGGS_DATABASE[foodId]) return EGGS_DATABASE[foodId];
  if (GRAINS_DATABASE[foodId]) return GRAINS_DATABASE[foodId];
  return null;
}

// ============================================================
// 搜索食物
// ============================================================
export function searchFoods(query: string): { id: string; name: string; categoryPath: string; nutrients: Record<string, number> }[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  const results: { id: string; name: string; categoryPath: string; nutrients: Record<string, number> }[] = [];
  const seen = new Set<string>();

  // 搜索水果（遍历所有子类）
  Object.entries(FRUIT_SUBCATEGORIES).forEach(([subcatName, subcat]) => {
    subcat.items.forEach(item => {
      if ((item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)) && !seen.has(item.id)) {
        seen.add(item.id);
        results.push({
          id: item.id,
          name: item.name,
          categoryPath: `🍎 水果类 › ${subcatName}`,
          nutrients: FRUITS_DATABASE[item.id] || {},
        });
      }
    });
  });

  // 搜索禽畜肉类（遍历所有子类）
  Object.entries(MEAT_SUBCATEGORIES).forEach(([subcatName, subcat]) => {
    subcat.items.forEach(item => {
      if ((item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)) && !seen.has(item.id)) {
        seen.add(item.id);
        results.push({
          id: item.id,
          name: item.name,
          categoryPath: `🍖 禽畜肉蛋类 › ${subcatName}`,
          nutrients: MEATS_DATABASE[item.id] || {},
        });
      }
    });
  });

  // 搜索水产（遍历所有子类）
  Object.entries(SEAFOOD_SUBCATEGORIES).forEach(([subcatName, subcat]) => {
    subcat.items.forEach(item => {
      if ((item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)) && !seen.has(item.id)) {
        seen.add(item.id);
        results.push({
          id: item.id,
          name: item.name,
          categoryPath: `🐟 水产品 › ${subcatName}`,
          nutrients: SEAFOODS_DATABASE[item.id] || {},
        });
      }
    });
  });

  // 搜索奶豆类（遍历所有子类）
  Object.entries(MILK_LEGUMES_SUBCATEGORIES).forEach(([subcatName, subcat]) => {
    subcat.items.forEach(item => {
      if ((item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)) && !seen.has(item.id)) {
        seen.add(item.id);
        results.push({
          id: item.id,
          name: item.name,
          categoryPath: `🥛🫘 奶豆类 › ${subcatName}`,
          nutrients: MILK_LEGUMES_DATABASE[item.id] || {},
        });
      }
    });
  });

  // 搜索蛋类
  EGGS_JSON.forEach(item => {
    if ((item.chinese.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)) && !seen.has(item.id)) {
      seen.add(item.id);
      results.push({
        id: item.id,
        name: item.chinese,
        categoryPath: '🥚 蛋类',
        nutrients: EGGS_DATABASE[item.id] || {},
      });
    }
  });

  // 搜索谷物类（遍历所有子类）
  Object.entries(GRAINS_SUBCATEGORIES).forEach(([subcatName, subcat]) => {
    subcat.items.forEach(item => {
      if ((item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)) && !seen.has(item.id)) {
        seen.add(item.id);
        results.push({
          id: item.id,
          name: item.name,
          categoryPath: `🍚 谷物类 › ${subcatName}`,
          nutrients: GRAINS_DATABASE[item.id] || {},
        });
      }
    });
  });

  // 搜索蔬菜（遍历所有子类）
  Object.entries(VEGGIE_SUBCATEGORIES).forEach(([subcatName, subcat]) => {
    subcat.items.forEach(item => {
      if ((item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)) && !seen.has(item.id)) {
        seen.add(item.id);
        results.push({
          id: item.id,
          name: item.name,
          categoryPath: `🥬 蔬菜类 › ${subcatName}`,
          nutrients: VEGGIES_DATABASE[item.id] || {},
        });
      }
    });
  });

    return results;
}


// 所有本地食物 ID → 名称映射（供营养素排名等模块使用）
export const LOCAL_FOOD_NAMES: Record<string, string> = {
  'salmon-atlantic': '三文鱼',
  'milk-whole': '全脂牛奶',
  'yogurt-whole': '全脂酸奶',
  'squash-winter': '冬南瓜',
  'cabbage-common': '卷心菜',
  'melons-cantaloupe': '哈密瓜',
  'beans-snap-green': '四季豆',
  'potatoes': '土豆',
  'yambean': '地瓜',
  'squid': '墨鱼/鱿鱼',
  'cabbage-chinese-pe-tsai': '大白菜',
  'cod-atlantic': '大西洋鳕鱼',
  'tofu-soft': '嫩豆腐',
  'cabbage-chinese-pak-choi': '小白菜',
  'millet': '小米（熟）',
  'crayfish': '小龙虾',
  'crabapples': '山楂',
  'yam': '山药',
  'yogurt-greek': '希腊酸奶',
  'crab-king': '帝王蟹',
  'mushrooms-oyster': '平菇',
  'pasta': '意大利面（熟）',
  'scallop': '扇贝',
  'figs': '无花果',
  'bread-white': '普通白面包',
  'papayas': '木瓜',
  'cassava': '木薯',
  'plums': '李子',
  'apricots': '杏',
  'carambola': '杨桃',
  'loquats': '枇杷',
  'tangerines': '柑橘',
  'pummelo': '柚子',
  'lemon': '柠檬',
  'persimmons': '柿子',
  'peaches': '桃',
  'mulberries': '桑葚',
  'pears': '梨',
  'oranges': '橙子',
  'parsley-fresh': '欧芹',
  'soybeans-green': '毛豆',
  'lobster': '波士顿龙虾',
  'onions': '洋葱',
  'seaweed-kelp': '海带',
  'sea-bass': '海鲈鱼',
  'bass-fresh': '淡水鲈鱼',
  'turkey-breast': '火鸡胸',
  'turkey-leg': '火鸡腿',
  'oatmeal': '燕麦（熟）',
  'beef-heart': '牛心',
  'avocados': '牛油果',
  'beef-short-rib': '牛肋条',
  'beef-liver': '牛肝',
  'mushrooms-morel': '牛肝菌',
  'beef-brisket': '牛腩',
  'beef-round-steak': '牛腱',
  'beef-round-roast': '牛腿肉',
  'beef-tenderloin': '牛里脊',
  'kiwifruit': '猕猴桃',
  'pork-belly': '猪五花',
  'pork-heart': '猪心',
  'pork-blade': '猪排骨',
  'pork-liver': '猪肝',
  'pork-shoulder': '猪腿肉',
  'pork-top-loin': '猪通脊',
  'pork-tenderloin': '猪里脊',
  'corn-grits': '玉米碴（熟）',
  'peppers-sweet-green': '甜椒',
  'corn-sweet-white': '甜玉米',
  'beets': '甜菜',
  'lettuce-butterhead': '生菜',
  'oyster': '生蚝',
  'tomatoes': '番茄',
  'rice-white-short': '白米饭（短粒，熟）',
  'rice-white-long': '白米饭（长粒，熟）',
  'mushrooms-white': '白蘑菇',
  'passion-fruit': '百香果',
  'pomegranates': '石榴',
  'okra': '秋葵',
  'octopus': '章鱼',
  'bamboo-shoots': '竹笋',
  'rice-noodles': '米粉/米线（熟）',
  'rice-brown': '糙米饭',
  'rice-glutinous': '糯米/紫米饭（熟）',
  'cabbage-red': '紫甘蓝',
  'seaweed-laver': '紫菜',
  'beet-greens': '红菜苔',
  'sweet-potato': '红薯',
  'mung-beans-sprouted': '绿豆芽',
  'tilapia': '罗非鱼',
  'milk-goat': '羊奶',
  'lamb-heart': '羊心',
  'lamb-rib': '羊排',
  'lamb-liver': '羊肝',
  'lamb-shoulder': '羊肩肉',
  'lamb-leg': '羊腿肉',
  'kale': '羽衣甘蓝',
  'tofu-firm': '老豆腐',
  'carrots': '胡萝卜',
  'taro': '芋头',
  'mangos': '芒果',
  'arugula': '芝麻菜',
  'mustard-spinach': '芥菜',
  'mustard-greens': '芥蓝',
  'asparagus': '芦笋',
  'cauliflower': '花菜',
  'celery': '芹菜',
  'amaranth-leaves': '苋菜',
  'balsam-pear-pods': '苦瓜',
  'apples': '苹果',
  'eggplant': '茄子',
  'chrysanthemum-garland': '茼蒿',
  'strawberries': '草莓',
  'litchis': '荔枝',
  'buckwheat-noodles': '荞麦面（熟）',
  'peas-edible-podded': '荷兰豆',
  'waterchestnuts': '荸荠 / 马蹄',
  'lotus-root': '莲藕',
  'dill-weed': '莳萝',
  'spinach': '菠菜',
  'pineapple': '菠萝',
  'jackfruit': '菠萝蜜',
  'radishes': '萝卜',
  'grapes': '葡萄',
  'blueberries': '蓝莓',
  'cranberries': '蔓越莓',
  'trout-rainbow': '虹鳟鱼',
  'shrimp': '虾',
  'broadbeans-immature-seeds': '蚕豆',
  'clam': '蛤蜊',
  'melons-honeydew': '蜜瓜',
  'seaweed-wakame': '裙带菜',
  'mushrooms-brown-italian-or-crimini': '褐蘑菇',
  'broccoli': '西兰花',
  'grapefruit': '西柚',
  'watercress': '西洋菜',
  'watermelon': '西瓜',
  'squash-summer-zucchini': '西葫芦',
  'raspberries': '覆盆子',
  'peas-green': '豌豆',
  'cherries-sweet': '车厘子',
  'tamarinds': '酸角',
  'kumquats': '金橘',
  'mushrooms-enoki': '金针菇',
  'yardlong-bean': '长豇豆',
  'mussel': '青口',
  'limes': '青柠',
  'mushrooms-shiitake': '香菇',
  'coriander-cilantro-leaves': '香菜',
  'bananas': '香蕉',
  'abalone': '鲍鱼',
  'jujube': '鲜枣',
  'tuna-skipjack': '鲣鱼',
  'eel': '鳗鱼',
  'bass-striped': '鳜鱼',
  'chicken-heart': '鸡心',
  'chanterelle': '鸡油菌',
  'chicken-claw': '鸡爪',
  'chicken-wing': '鸡翅',
  'chicken-liver': '鸡肝',
  'chicken-gizzard': '鸡胗',
  'chicken-breast': '鸡胸肉',
  'chicken-thigh': '鸡腿肉',
  'egg-chicken': '鸡蛋',
  'duck-breast': '鸭胸肉',
  'duck-leg': '鸭腿肉',
  'egg-duck': '鸭蛋',
  'goose-meat': '鹅肉',
  'egg-goose': '鹅蛋',
  'egg-quail': '鹌鹑蛋',
  'cucumber': '黄瓜',
  'soybean-green': '黄豆',
  'soybeans-mature-seeds-sprouted': '黄豆芽',
  'blackberries': '黑莓',
  'longans': '龙眼',
  'fruits': '🍎 水果类',
  'meats': '🍖 禽畜肉蛋类',
  'grains': '🍚 谷薯类',
  'seafoods': '🐟 水产品',
  'milk_legumes': '🥛🫘 奶豆类',
  'vegetables': '🥬 蔬菜类',
};
