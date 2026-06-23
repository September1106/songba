export interface FoodStage {
  id: string;
  name: string;
  monthsMin: number;
  monthsMax: number;
  texture: string;       // 食物性状
  amount: string;       // 每餐用量
  mealsPerDay: string;  // 每日餐数
  keyPoints: string[];  // 喂养要点
  foods: string[];       // 推荐食物
  notes: string[];      // 注意事项
}

export const foodStages: FoodStage[] = [
  {
    id: 'stage1',
    name: '第一阶段：辅食引入期',
    monthsMin: 6,
    monthsMax: 8,
    texture: '泥糊状→碎末状（舌可压碎）',
    amount: '从10mL开始，逐渐增至约125mL/餐',
    mealsPerDay: '1~2餐',
    keyPoints: [
      '满6月龄、健康时开始添加辅食',
      '继续母乳喂养，频率逐步减至每日4~6次',
      '优先添加含铁丰富的食物：如铁强化米粉、瘦肉泥、肝泥',
      '由单一到多样，每种新食物观察3~5天',
      '餐次在两餐奶之间',
    ],
    foods: [
      '铁强化米粉（首选）',
      '稠粥、菜泥（胡萝卜、南瓜、小青菜）',
      '果泥（苹果、梨、香蕉）',
      '肉泥、肝泥（猪肉、牛肉、鸡肝）',
      '蛋黄（从1/4个开始）',
    ],
    notes: [
      '首选铁强化米粉，不要用米汤代替',
      '新食物每次只加一种，密切观察过敏反应',
    ],
  },
  {
    id: 'stage2',
    name: '第二阶段：辅食过渡期',
    monthsMin: 9,
    monthsMax: 12,
    texture: '碎块状、指状食物（牙床可压碎，如香蕉状）',
    amount: '逐渐增至约180mL/餐',
    mealsPerDay: '2~3餐，1~2次加餐',
    keyPoints: [
      '继续母乳喂养，每日约4次',
      '增加禽肉、畜肉、鱼、肝、血等动物性食物',
      '每日1个蛋黄',
      '开始练习用杯子喝水',
      '可引入少量植物油（约5~10g/日）',
    ],
    foods: [
      '稠粥→软饭（约100g/日）',
      '碎菜50~100g/日，水果50g/日',
      '动物性食物25~50g/日（蛋黄1个+肉类）',
      '豆腐、少量植物蛋白',
      '手指食物：香蕉片、煮软的小块蔬菜',
    ],
    notes: [
      '食物质地适合咀嚼能力，避免整粒坚果',
      '鼓励自主进食，但不强迫喂食',
    ],
  },
  {
    id: 'stage3',
    name: '第三阶段：1~2岁',
    monthsMin: 13,
    monthsMax: 24,
    texture: '块状、指状食物（牙床可咀嚼，如肉丸子状）',
    amount: '180~250mL/餐',
    mealsPerDay: '3餐，2次加餐',
    keyPoints: [
      '继续母乳喂养，每日2~3次',
      '每日摄入≥4类食物（7类常见食物中）',
      '基本同成人饮食，必要时切碎',
      '1岁后可少量加盐，淡口味',
      '每日一个鸡蛋，动物性食物50~80g/日',
      '蔬菜200~250g/日，水果100~150g/日',
      '鼓励自主进食，培养良好饮食习惯',
    ],
    foods: [
      '家庭主食（同成人米饭、面条）',
      '各种蔬菜（切碎）',
      '鱼、虾、肉类、动物肝脏',
      '蛋类（蒸蛋、煮蛋、炒蛋）',
      '豆制品、奶类（牛奶、酸奶）',
      '水果（直接吃或切块）',
    ],
    notes: [
      '12月龄内不加盐、糖及刺激性调味品',
      '避免整粒坚果、整粒葡萄等窒息风险食物',
      '鼓励自己用勺子吃，不强迫喂食',
    ],
  },
];

// 根据月龄获取阶段
export function getStageByMonth(months: number): FoodStage | null {
  return foodStages.find(s => months >= s.monthsMin && months <= s.monthsMax) || null;
}