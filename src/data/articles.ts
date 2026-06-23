export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  date: string;
  tags: string[];
  cover?: string; // 封面图URL，可选
}

const articles: Article[] = [
  {
    id: 'hormone-face-cream',
    title: '激素面霜又爆雷：一份不制造焦虑的儿童化妆品选购指南收好',
    summary: '激素面霜为何屡禁不止？儿童化妆品到底怎么选？一份不制造焦虑的科学选购指南',
    url: 'https://mp.weixin.qq.com/s/MbWmoXGbKyCU40XWIqh0LA',
    date: '2026-06-05',
    tags: ['儿童化妆品', '激素', '面霜'],
  },
  {
    id: 'milk-selection',
    title: '牛奶喝不对，身高全白费！记住这几条，从此不被坑',
    summary: '市面上的牛奶种类繁多，纯牛奶、调制乳、酸奶……家长到底怎么选？哪些坑千万别踩？一篇说清楚。',
    url: 'https://mp.weixin.qq.com/s/Xmwk1rdVinAJJXfHfjETAg',
    date: '2026-05-13',
    tags: ['牛奶', '补钙', '选购'],
  },
  {
    id: 'fish-nutrition',
    title: '这种幼儿园不敢提供的食物，建议在家多吃',
    summary: '鱼虾贝类富含优质蛋白和DHA，但幼儿园却很少提供。孩子每周该吃多少？怎么选、怎么吃才安全？这篇帮你理清楚。',
    url: 'https://mp.weixin.qq.com/s/jeFLYnaLDUnAGb8NPGUKUA',
    date: '2026-04-30',
    tags: ['鱼', 'DHA', '维生素D'],
  },
  {
    id: 'egg-nutrition',
    title: '鸡蛋虽小，却撑起孩子的半边天：关于吃蛋，看这篇就够了',
    summary: '蛋是带着"午餐和游泳池"上路的小胚胎——一枚小小的鸡蛋，营养为何如此全面？孩子每天吃几个？怎么吃最营养？',
    url: 'https://mp.weixin.qq.com/s/MPRXp0VrAcbfB3rDhmAPEA',
    date: '2026-04-23',
    tags: ['鸡蛋', '营养', '无抗'],
  },
  {
    id: 'chicken-guide',
    title: '速成鸡、六翅鸡、无抗鸡...孩子健康吃鸡，看这一篇就够了',
    summary: '超市里各种鸡让人眼花缭乱：速成鸡是不是激素喂的？无抗鸡是不是更健康？孩子多大能吃鸡？一篇说清楚。',
    url: 'https://mp.weixin.qq.com/s/99UXLBDJrWs8O2g_MfBOAQ',
    date: '2026-03-12',
    tags: ['鸡肉', '速成鸡', '无抗'],
  },
  {
    id: 'vegetable-evolution',
    title: '孩子不爱吃蔬菜，源于一场持续数亿年的军备竞赛',
    summary: '为什么孩子天生排斥苦味？植物花了数亿年进化出"化学武器"，人类也花了几百万年进化出"解毒系统"。这场军备竞赛，造就了今天孩子对蔬菜的本能抗拒。',
    url: 'https://mp.weixin.qq.com/s/yiCeg9QAmHDdXO6V-umnjw',
    date: '2026-02-09',
    tags: ['进化', '蔬菜', '挑食'],
  },
  {
    id: 'plastic-history',
    title: '科学看待20世纪的伟大发明——塑料',
    summary: '塑料是人类历史上最伟大的发明之一，也是最糟糕的发明之一。它让人类飞向太空，也让海洋充满了微塑料。我们该如何看待它？',
    url: 'https://mp.weixin.qq.com/s/Pn0yR0D4szzUNqkegNG9VA',
    date: '2026-01-16',
    tags: ['塑料', '白色污染', '环保'],
  },
  {
    id: 'melamine-formaldehyde',
    title: '三聚氰胺+甲醛，你家孩子可能天天在用',
    summary: '仿瓷餐具、三聚氰胺餐具……这些在有宝宝的家庭里再常见不过。但三聚氰胺+甲醛这个组合，到底有多可怕？哪些情况才真的有风险？',
    url: 'https://mp.weixin.qq.com/s/Kz0JI_Yb9hkX-GQOsMX7SQ',
    date: '2025-12-08',
    tags: ['密胺', '塑料', '餐具'],
  },
  {
    id: 'persimmon',
    title: '这种应季水果，孩子能不能多吃？',
    summary: '柿子有营养，但民间流传的"食物相克"让很多家长不敢给孩子吃。真相到底是什么？孩子多大能吃、吃多少？一篇讲清楚。',
    url: 'https://mp.weixin.qq.com/s/PzBgFi_veKuLT5G08lqK6g',
    date: '2025-11-19',
    tags: ['柿子', '单宁', '食物相克'],
  },
  {
    id: 'heimlich',
    title: '这个救命知识每位家长都要懂',
    summary: '气管异物窒息是儿童意外伤害的致命杀手之一。海姆立克急救法，每位家长都应该学会，但很多家长做得不对。',
    url: 'https://mp.weixin.qq.com/s/4VxsqzwBFYG4_FrrTgirmA',
    date: '2025-10-27',
    tags: ['海姆立克', '窒息', '安全'],
  },
  {
    id: 'special-medical-formula',
    title: '关于"特医婴儿配方食品"，家长必须知道的几件事',
    summary: '氨基酸配方、深度水解配方、无乳糖配方……特殊医学配方奶粉到底怎么选？哪些情况才需要用？一篇讲清楚。',
    url: 'https://mp.weixin.qq.com/s/MVBKin_vXLVo4btX85O6nQ',
    date: '2025-09-21',
    tags: ['婴儿奶粉', '特医食品', '配方食品'],
  },
  {
    id: 'beach-safety',
    title: '带娃赶海什么最重要？',
    summary: '赶海是越来越受孩子欢迎的亲子活动，但潮汐、礁石、生物毒素……安全这根弦一刻都不能松。这份攻略请收好。',
    url: 'https://mp.weixin.qq.com/s/x8BnT51l1f3204oSGZG6og',
    date: '2025-08-23',
    tags: ['赶海', '潮汐', '安全'],
  },
  {
    id: 'lead-poisoning',
    title: '彩色发糕背后的隐形毒药：天水幼儿园血铅异常事件',
    summary: '天水某幼儿园血铅异常事件敲响警钟。彩色发糕、劣质陶瓷……生活中还有哪些"铅陷阱"？如何保护孩子远离铅暴露？',
    url: 'https://mp.weixin.qq.com/s/KK02rn0cwOPMWpxpIhxnyg',
    date: '2025-07-08',
    tags: ['发糕', '铅中毒', '安全'],
  },
  {
    id: 'vitamin-d',
    title: '这种营养素，日常饮食可能吃不够',
    summary: '维生素D是孩子生长发育不可或缺的关键营养素，但仅靠日常饮食几乎不可能吃够。阳光、食物、补剂——到底该怎么补？',
    url: 'https://mp.weixin.qq.com/s/HwvGZZAvvMNg0HJ5yDdKbg',
    date: '2025-06-10',
    tags: ['维生素D', '阳光', '进化'],
  },
  {
    id: 'tiramisu',
    title: '蒙城提拉米苏事件：路边摊的"甜蜜陷阱"如何避开？',
    summary: '路边摊的提拉米苏为何成为"甜蜜陷阱"？自制甜点又该如何注意食品安全？家长必须知道的安全隐患有哪些？',
    url: 'https://mp.weixin.qq.com/s/ZXz0p3G0W3tjJQFfW_BWUw',
    date: '2025-05-25',
    tags: ['提拉米苏', '鸡蛋', '细菌'],
  },
  {
    id: 'sunscreen-part2',
    title: '儿童户外JO级防晒攻略！（Part 2）',
    summary: '防晒霜怎么选、怎么涂、涂多少？SPF和PA到底看哪个？物理防晒和化学防晒哪个更适合孩子？Part 2 继续讲。',
    url: 'https://mp.weixin.qq.com/s/e2pYYAVuiab1lU_RNagEIQ',
    date: '2025-05-22',
    tags: ['防晒霜', 'SPF', 'PA'],
  },
  {
    id: 'sunscreen-part1',
    title: '儿童户外JO级防晒攻略！（Part 1）',
    summary: '孩子的皮肤比成人薄，紫外线伤害是成人的3倍。防晒服、太阳镜……户外防晒到底怎么做才有效？Part 1 先从装备说起。',
    url: 'https://mp.weixin.qq.com/s/jeKsMEm50BM36JthXmSY1Q',
    date: '2025-05-15',
    tags: ['防晒服', '紫外线', '太阳镜'],
  },
  {
    id: 'mosquito-repellent',
    title: '夏季防蚊大作战！安全有效的户外驱蚊攻略！',
    summary: '驱蚊成分那么多，避蚊胺（DEET）、派卡瑞丁、柠檬桉……哪个安全、哪个有效、哪个适合孩子？一份安全驱蚊攻略，请收好。',
    url: 'https://mp.weixin.qq.com/s/WuoGb7E1E6jQhLyfPXEWlQ',
    date: '2025-05-08',
    tags: ['驱蚊', '避蚊胺', '派卡瑞丁'],
  },
  {
    id: 'zero-additive',
    title: '"0添加"的千层套路',
    summary: '"0添加"成了越来越多食品的卖点，但"0添加"真的更健康吗？背后有哪些营销套路？家长该怎么识别和选择？',
    url: 'https://mp.weixin.qq.com/s/XQPDkR8Ea_nc6pnHIbS70w',
    date: '2025-04-08',
    tags: ['0添加', '谣言'],
  },
  {
    id: 'snack-standard',
    title: '新国标下的儿童零食攻略！5招教你选对健康零食',
    summary: '新版儿童零食标准实施，对"儿童零食"提出了更严格要求。家长怎么在货架上选出真正适合孩子的健康零食？5招教你避坑。',
    url: 'https://mp.weixin.qq.com/s/T1G6qBnIw4N5DvxiHcpDUw',
    date: '2025-03-28',
    tags: ['预包装食品', '零食'],
  },
];

export default articles;
