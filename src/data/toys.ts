import toysRaw from './toys.json';

export interface ToyItem {
  /** 起始年龄，如 "0个月及以上" */
  minAgeText: string;
  /** 起始年龄（月），用于筛选 */
  minAgeMonths: number;
  /** 玩具描述与示例 */
  desc: string;
  /** 类别 */
  category: string;
}

function parseAge(text: string): number {
  const m = text.match(/(\d+)\s*岁/);
  if (m) return parseInt(m[1], 10) * 12;
  const n = text.match(/(\d+)\s*个月/);
  if (n) return parseInt(n[1], 10);
  return 0;
}

export const toys: ToyItem[] = (toysRaw as Array<Record<string, string>>).map(r => ({
  minAgeText: r['起始年龄'] || '0个月及以上',
  minAgeMonths: parseAge(r['起始年龄'] || ''),
  desc: r['描述与示例'] || '',
  category: r['类别'] || '其他',
}));

/** 类别展示顺序与配色 */
export const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  '感官运动活动玩具': { icon: '🏃', color: '#FF9F43' },
  '智力活动玩具':   { icon: '🧩', color: '#54A0FF' },
  '创造性活动玩具': { icon: '🎨', color: '#1DD1A1' },
  '身体活动玩具':   { icon: '⚽', color: '#F368E0' },
  '社交关系玩具':   { icon: '🧸', color: '#Feca57' },
  '情感和同理心发展玩具': { icon: '💗', color: '#FF6B6B' },
  '重现科技世界玩具': { icon: '🚀', color: '#5F27CD' },
};

export const CATEGORY_ORDER = Object.keys(CATEGORY_META);

/** 可选年龄：完全取自 json 数据中出现过的「起始年龄」 */
export const AGE_OPTIONS: { label: string; months: number }[] = (() => {
  const seen = new Map<number, string>();
  toys.forEach(t => {
    if (!seen.has(t.minAgeMonths)) seen.set(t.minAgeMonths, t.minAgeText);
  });
  return Array.from(seen.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([months, text]) => ({ label: text, months }));
})();

export function getToysByAge(months: number): ToyItem[] {
  return toys.filter(t => t.minAgeMonths === months);
}

export function formatAge(months: number): string {
  if (months < 12) return `${months}个月`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m === 0 ? `${y}岁` : `${y}岁${m}个月`;
}
