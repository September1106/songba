// USDA FoodData Central API 服务
// 端点: https://api.nal.usda.gov/fdc/v1/foods/search

const API_KEY = 'oiJRMaIe0g77n9Y2qu2Dbnj5r7esEy87dXFBN14k';
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// USDA营养素ID映射到内部key
export const NUTRIENT_ID_MAP: Record<number, string> = {
  1003: 'protein_g',       // Protein
  1004: 'fat_g',           // Total lipid (fat)
  1005: 'carbohydrate_g',  // Carbohydrate, by difference
  1008: 'energy_kcal',     // Energy (kcal)
  1079: 'fiber_g',         // Fiber, total dietary
  1087: 'calcium_mg',      // Calcium, Ca
  1089: 'iron_mg',         // Iron, Fe
  1090: 'magnesium_mg',    // Magnesium, Mg
  1091: 'phosphorus_mg',    // Phosphorus, P
  1092: 'potassium_mg',    // Potassium, K
  1093: 'sodium_mg',       // Sodium, Na
  1095: 'copper_mg',       // Copper, Cu
  1096: 'zinc_mg',         // Zinc, Zn
  1104: 'vitaminA_ug',     // Vitamin A, IU -> converted to ugRAE
  1106: 'vitaminA_ug',    // Vitamin A, RAE
  1162: 'vitaminC_mg',    // Vitamin C, total ascorbic acid
  1163: 'vitaminD_ug',     // Vitamin D (D2 + D3)
  1165: 'vitaminE_mg',     // Vitamin E (alpha-tocopherol)
  1167: 'vitaminK_ug',     // Vitamin K (phylloquinone)
  1175: 'vitaminB12_ug',  // Vitamin B12
  1177: 'vitaminB6_mg',   // Vitamin B6
  1178: 'folate_ug',       // Folate, total
  1180: 'vitaminD_ug',    // Vitamin D3
};

// USDA食物搜索响应
export interface USDASearchResult {
  fdcId: number;
  description: string;
  dataType: string;
  foodCategory?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: USDANutrient[];
}

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  value: number;
  unitName: string;
}

// 搜索食物
export async function searchUSDAFoods(query: string, pageSize = 10): Promise<USDASearchResult[]> {
  const params = new URLSearchParams({
    query,
    pageSize: String(pageSize),
    api_key: API_KEY,
  });

  const resp = await fetch(`${BASE_URL}/foods/search?${params}`);
  if (!resp.ok) throw new Error(`USDA API error: ${resp.status}`);

  const data = await resp.json();
  return data.foods || [];
}

// 获取食物详情
export async function getUSDAFoodDetail(fdcId: number): Promise<USDASearchResult> {
  const params = new URLSearchParams({
    api_key: API_KEY,
  });

  const resp = await fetch(`${BASE_URL}/food/${fdcId}?${params}`);
  if (!resp.ok) throw new Error(`USDA API error: ${resp.status}`);

  const data = await resp.json();
  return data;
}

// 将USDA营养素转换为内部格式
export function convertUSDANutrients(foodNutrients: USDANutrient[]): Record<string, number> {
  const result: Record<string, number> = {
    energy_kcal: 0, protein_g: 0, fat_g: 0, carbohydrate_g: 0,
    fiber_g: 0, calcium_mg: 0, iron_mg: 0, zinc_mg: 0,
    vitaminA_ug: 0, vitaminC_mg: 0, vitaminD_ug: 0,
  };

  foodNutrients.forEach(n => {
    const key = NUTRIENT_ID_MAP[n.nutrientId];
    if (key && n.value !== null && n.value !== undefined) {
      // 维生素A: IU转ugRAE (1 IU = 0.3 ugRAE)
      if (n.nutrientName === 'Vitamin A, IU') {
        result['vitaminA_ug'] = (result['vitaminA_ug'] || 0) + n.value * 0.3;
      } else {
        result[key] = (result[key] || 0) + n.value;
      }
    }
  });

  return result;
}

// 格式化食物描述（去掉大写，截断）
export function formatFoodDescription(desc: string): string {
  // 去掉多余的大写，变成正常大小写
  // "APPLE, SKIN, RAW" -> "Apple, skin, raw"
  const lower = desc.toLowerCase();
  const result = lower.replace(/\b\w/g, c => c.toUpperCase());
  // 截断太长的描述
  if (result.length > 60) return result.substring(0, 57) + '...';
  return result;
}

// 中文人名转换（把英文描述转成中文食物名）
const CN_NAME_MAP: Record<string, string> = {
  // 水果
  'Apple': '苹果', 'Banana': '香蕉', 'Orange': '橙子', 'Grape': '葡萄',
  'Watermelon': '西瓜', 'Strawberry': '草莓', 'Pear': '梨', 'Peach': '桃',
  'Pineapple': '菠萝', 'Mango': '芒果', 'Blueberry': '蓝莓', 'Cherry': '樱桃',
  'Kiwi': '猕猴桃', 'Lemon': '柠檬', 'Lime': '青柠', 'Plum': '李子',
  'Apricot': '杏', 'Melon': '哈密瓜', 'Papaya': '木瓜', 'Guava': '番石榴',
  'Lychee': '荔枝', 'Longan': '龙眼', 'Pomegranate': '石榴', 'Fig': '无花果',
  'Coconut': '椰子', 'Avocado': '牛油果',

  // 蔬菜
  'Carrot': '胡萝卜', 'Broccoli': '西兰花', 'Spinach': '菠菜', 'Tomato': '番茄',
  'Potato': '土豆', 'Sweet potato': '红薯', 'Pumpkin': '南瓜', 'Cucumber': '黄瓜',
  'Eggplant': '茄子', 'Bell pepper': '彩椒', 'Pepper': '辣椒', 'Onion': '洋葱',
  'Garlic': '大蒜', 'Cabbage': '白菜', 'Lettuce': '生菜', 'Celery': '芹菜',
  'Asparagus': '芦笋', 'Corn': '玉米', 'Cauliflower': '花菜', 'Mushroom': '蘑菇',
  'Zucchini': '西葫芦', 'Radish': '萝卜', 'Leek': '韭菜', 'Ginger': '姜',

  // 肉类
  'Chicken': '鸡肉', 'Beef': '牛肉', 'Pork': '猪肉', 'Lamb': '羊肉',
  'Turkey': '火鸡肉', 'Duck': '鸭肉',
  'Salmon': '三文鱼', 'Cod': '鳕鱼', 'Tuna': '金枪鱼', 'Shrimp': '虾',
  'Crab': '蟹', 'Lobster': '龙虾', 'Oyster': '生蚝', 'Clam': '蛤蜊',
  'Scallop': '扇贝', 'Mussel': '青口', 'Sardine': '沙丁鱼', 'Mackerel': '鲭鱼',
  'Herring': '鲱鱼', 'Trout': '鳟鱼', 'Carp': '鲤鱼', 'Catfish': '鲶鱼',
  'Halibut': '大比目鱼', 'Sea bass': '鲈鱼', 'Anchovy': '凤尾鱼',
  'Squid': '鱿鱼', 'Octopus': '章鱼', 'Bacon': '培根', 'Ham': '火腿',
  'Sausage': '香肠',

  // 蛋奶
  'Egg': '鸡蛋', 'Yolk': '蛋黄', 'Milk': '牛奶', 'Cheese': '奶酪',
  'Yogurt': '酸奶', 'Butter': '黄油', 'Cream': '奶油', 'Ice cream': '冰淇淋',

  // 谷薯豆
  'Rice': '米饭', 'Bread': '面包', 'Tofu': '豆腐', 'Soybean': '黄豆',
  'Noodle': '面条', 'Pasta': '意面', 'Oat': '燕麦', 'Cereal': '麦片',

  // 坚果油脂
  'Almond': '杏仁', 'Walnut': '核桃', 'Peanut': '花生', 'Cashew': '腰果',
  'Pistachio': '开心果', 'Olive oil': '橄榄油', 'Oil': '油',

  // 饮品
  'Juice': '果汁', 'Coffee': '咖啡', 'Tea': '茶', 'Cola': '可乐',
  'Soy milk': '豆浆',

  // 零食甜点
  'Cookie': '饼干', 'Cake': '蛋糕', 'Chocolate': '巧克力', 'Candy': '糖果',
  'Chip': '薯片', 'Popcorn': '爆米花', 'Pudding': '布丁',

  // 调料
  'Salt': '盐', 'Sugar': '糖', 'Honey': '蜂蜜', 'Soy sauce': '酱油',
  'Vinegar': '醋', 'Ketchup': '番茄酱',

  // 其他
  'Baby food': '婴儿食品',
};

export function cnFoodName(description: string): string {
  // 去掉大写转小写，但保留第一个字母大写
  const desc = description.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  // 按长度从长到短匹配，避免短词（如"Egg"）优先于"Egg yolk"
  const entries = Object.entries(CN_NAME_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [en, cn] of entries) {
    if (desc.includes(en)) {
      return cn;
    }
  }
  // 找不到就截断
  return desc.length > 20 ? desc.substring(0, 17) + '...' : desc;
}