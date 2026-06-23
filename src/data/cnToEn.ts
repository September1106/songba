// 中文食物名称 -> 英文搜索词映射表
// 用于中文查询时自动转换为英文搜索

export const CN_TO_EN: Record<string, string> = {
  // 水果
  '苹果': 'apple',
  '香蕉': 'banana',
  '橙子': 'orange',
  '橘子': 'orange',
  '葡萄': 'grape',
  '西瓜': 'watermelon',
  '草莓': 'strawberry',
  '梨': 'pear',
  '桃': 'peach',
  '菠萝': 'pineapple',
  '芒果': 'mango',
  '蓝莓': 'blueberry',
  '樱桃': 'cherry',
  '猕猴桃': 'kiwi',

  // 蔬菜
  '胡萝卜': 'carrot',
  '西兰花': 'broccoli',
  '菠菜': 'spinach',
  '番茄': 'tomato',
  '西红柿': 'tomato',
  '土豆': 'potato',
  '马铃薯': 'potato',
  '红薯': 'sweet potato',
  '南瓜': 'pumpkin',
  '黄瓜': 'cucumber',
  '茄子': 'eggplant',
  '青椒': 'bell pepper',
  '辣椒': 'chili',
  '洋葱': 'onion',
  '大蒜': 'garlic',
  '大白菜': 'cabbage',
  '白菜': 'cabbage',
  '油菜': 'rapeseed',
  '生菜': 'lettuce',
  '芹菜': 'celery',
  '芦笋': 'asparagus',
  '玉米': 'corn',

  // 肉类
  '鸡胸肉': 'chicken breast',
  '鸡肉': 'chicken',
  '猪肉': 'pork',
  '牛肉': 'beef',
  '羊肉': 'lamb',
  '三文鱼': 'salmon',
  '鳕鱼': 'cod',
  '虾': 'shrimp',
  '虾仁': 'shrimp',
  '蟹': 'crab',
  '龙虾': 'lobster',
  '鱼肉': 'fish',
  '培根': 'bacon',
  '火腿': 'ham',

  // 蛋类
  '鸡蛋': 'egg',
  '蛋黄': 'egg yolk',
  '蛋白': 'egg white',

  // 奶类
  '牛奶': 'milk',
  '全脂牛奶': 'whole milk',
  '脱脂牛奶': 'skim milk',
  '酸奶': 'yogurt',
  '奶酪': 'cheese',
  '芝士': 'cheese',
  '黄油': 'butter',
  '奶油': 'cream',

  // 谷薯
  '米饭': 'rice',
  '面条': 'noodle or pasta',
  '面包': 'bread',
  '馒头': 'steamed bread',
  '饺子': 'dumpling',
  '包子': 'bun',
  '粥': 'porridge',
  '燕麦': 'oat',

  // 豆类
  '豆腐': 'tofu',
  '豆浆': 'soy milk',
  '黄豆': 'soybean',
  '红豆': 'red bean',
  '绿豆': 'mung bean',
  '毛豆': 'edamame',

  // 油脂
  '食用油': 'cooking oil',
  '橄榄油': 'olive oil',

  // 坚果
  '花生': 'peanut',
  '杏仁': 'almond',
  '核桃': 'walnut',
  '腰果': 'cashew',
  '开心果': 'pistachio',

  // 饮料
  '可乐': 'cola',
  '雪碧': 'sprite',
  '橙汁': 'orange juice',
  '苹果汁': 'apple juice',

  // 零食
  '薯片': 'potato chip',
  '饼干': 'cookie',
  '蛋糕': 'cake',
  '巧克力': 'chocolate',
  '冰淇淋': 'ice cream',

  // 常见辅食
  '米粉': 'rice cereal',
  '肉泥': 'meat puree',
  '蔬菜泥': 'vegetable puree',
  '果泥': 'fruit puree',
};

// 尝试将中文食物名转换为英文
export function cnToEn(query: string): string {
  // 先精确匹配
  for (const [cn, en] of Object.entries(CN_TO_EN)) {
    if (query.includes(cn)) {
      return query.replace(cn, en);
    }
  }

  // 如果没有匹配项，尝试逐字匹配看能不能替换其中部分
  let result = query;
  for (const [cn, en] of Object.entries(CN_TO_EN)) {
    if (result.includes(cn)) {
      result = result.replace(cn, en);
    }
  }

  return result;
}

// 检查是否包含中文
export function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

// 智能搜索：如果是中文，先翻译再搜索
export function prepareSearchQuery(query: string): string {
  if (hasChinese(query)) {
    const translated = cnToEn(query);
    // 如果翻译后和原文本不同，说明有词被替换了
    if (translated !== query) {
      return translated;
    }
  }
  return query;
}