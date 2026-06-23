// WHO 0-5岁儿童生长标准数据
// 数据来源：WHO Child Growth Standards (2006)
// Z-score 表格（简化版，选取关键月龄点）

export interface GrowthRecord {
  id: string;
  date: string;
  birthDate?: string;
  ageMonths: number;
  height?: number;
  weight?: number;
  gender: 'male' | 'female';
}

// 身高标准数据（cm）- 简化关键月龄
export interface HeightStandard {
  month: number;
  p15: number; // -1 SD
  p50: number; // 中位数
  p85: number; // +1 SD
}

export const heightStandardsMale: HeightStandard[] = [
  { month: 0, p15: 48.0, p50: 49.9, p85: 51.8 },
  { month: 1, p15: 52.4, p50: 54.7, p85: 57.0 },
  { month: 2, p15: 55.5, p50: 58.4, p85: 61.3 },
  { month: 3, p15: 58.0, p50: 61.1, p85: 64.2 },
  { month: 4, p15: 60.0, p50: 63.3, p85: 66.6 },
  { month: 5, p15: 61.7, p50: 65.2, p85: 68.7 },
  { month: 6, p15: 63.1, p50: 67.0, p85: 70.9 },
  { month: 7, p15: 64.3, p50: 68.4, p85: 72.5 },
  { month: 8, p15: 65.4, p50: 69.6, p85: 73.8 },
  { month: 9, p15: 66.3, p50: 70.6, p85: 74.9 },
  { month: 10, p15: 67.1, p50: 71.5, p85: 75.9 },
  { month: 11, p15: 67.8, p50: 72.3, p85: 76.8 },
  { month: 12, p15: 68.6, p50: 73.3, p85: 78.0 },
  { month: 15, p15: 70.6, p50: 76.0, p85: 81.4 },
  { month: 18, p15: 72.5, p50: 78.3, p85: 84.1 },
  { month: 21, p15: 74.3, p50: 80.5, p85: 86.7 },
  { month: 24, p15: 76.0, p50: 82.4, p85: 88.8 },
  { month: 30, p15: 79.0, p50: 86.0, p85: 93.0 },
  { month: 36, p15: 81.9, p50: 89.0, p85: 96.1 },
  { month: 42, p15: 84.6, p50: 92.2, p85: 99.8 },
  { month: 48, p15: 87.1, p50: 95.2, p85: 103.3 },
  { month: 54, p15: 89.7, p50: 98.1, p85: 106.5 },
  { month: 60, p15: 92.2, p50: 101.0, p85: 109.8 },
];

export const heightStandardsFemale: HeightStandard[] = [
  { month: 0, p15: 47.2, p50: 49.1, p85: 51.0 },
  { month: 1, p15: 51.4, p50: 53.7, p85: 56.0 },
  { month: 2, p15: 54.2, p50: 57.1, p85: 60.0 },
  { month: 3, p15: 56.5, p50: 59.8, p85: 63.1 },
  { month: 4, p15: 58.3, p50: 61.8, p85: 65.3 },
  { month: 5, p15: 59.9, p50: 63.5, p85: 67.1 },
  { month: 6, p15: 61.2, p50: 65.2, p85: 69.2 },
  { month: 7, p15: 62.2, p50: 66.5, p85: 70.8 },
  { month: 8, p15: 63.2, p50: 67.7, p85: 72.2 },
  { month: 9, p15: 64.0, p50: 68.7, p85: 73.4 },
  { month: 10, p15: 64.8, p50: 69.6, p85: 74.4 },
  { month: 11, p15: 65.6, p50: 70.5, p85: 75.4 },
  { month: 12, p15: 66.5, p50: 71.5, p85: 76.5 },
  { month: 15, p15: 68.7, p50: 74.4, p85: 80.1 },
  { month: 18, p15: 70.6, p50: 76.8, p85: 83.0 },
  { month: 21, p15: 72.5, p50: 79.2, p85: 85.9 },
  { month: 24, p15: 74.3, p50: 81.3, p85: 88.3 },
  { month: 30, p15: 77.6, p50: 85.1, p85: 92.6 },
  { month: 36, p15: 80.7, p50: 88.4, p85: 96.1 },
  { month: 42, p15: 83.5, p50: 91.5, p85: 99.5 },
  { month: 48, p15: 86.2, p50: 94.5, p85: 102.8 },
  { month: 54, p15: 88.9, p50: 97.5, p85: 106.1 },
  { month: 60, p15: 91.7, p50: 100.5, p85: 109.3 },
];

// 体重标准数据（kg）- 简化关键月龄
export interface WeightStandard {
  month: number;
  p15: number;
  p50: number;
  p85: number;
}

export const weightStandardsMale: WeightStandard[] = [
  { month: 0, p15: 2.5, p50: 3.3, p85: 4.3 },
  { month: 1, p15: 3.4, p50: 4.5, p85: 5.8 },
  { month: 2, p15: 4.3, p50: 5.6, p85: 7.1 },
  { month: 3, p15: 5.0, p50: 6.4, p85: 8.0 },
  { month: 4, p15: 5.6, p50: 7.0, p85: 8.7 },
  { month: 5, p15: 6.0, p50: 7.5, p85: 9.3 },
  { month: 6, p15: 6.4, p50: 7.9, p85: 9.8 },
  { month: 7, p15: 6.7, p50: 8.3, p85: 10.3 },
  { month: 8, p15: 6.9, p50: 8.6, p85: 10.7 },
  { month: 9, p15: 7.1, p50: 8.9, p85: 11.0 },
  { month: 10, p15: 7.4, p50: 9.2, p85: 11.4 },
  { month: 11, p15: 7.6, p50: 9.4, p85: 11.7 },
  { month: 12, p15: 7.7, p50: 9.6, p85: 12.0 },
  { month: 15, p15: 8.3, p50: 10.3, p85: 12.8 },
  { month: 18, p15: 8.8, p50: 10.9, p85: 13.7 },
  { month: 21, p15: 9.2, p50: 11.5, p85: 14.5 },
  { month: 24, p15: 9.7, p50: 12.2, p85: 15.4 },
  { month: 30, p15: 10.5, p50: 13.3, p85: 17.0 },
  { month: 36, p15: 11.4, p50: 14.6, p85: 18.8 },
  { month: 42, p15: 12.3, p50: 15.8, p85: 20.5 },
  { month: 48, p15: 13.1, p50: 17.0, p85: 22.1 },
  { month: 54, p15: 14.0, p50: 18.2, p85: 23.8 },
  { month: 60, p15: 14.9, p50: 19.4, p85: 25.5 },
];

export const weightStandardsFemale: WeightStandard[] = [
  { month: 0, p15: 2.4, p50: 3.2, p85: 4.0 },
  { month: 1, p15: 3.2, p50: 4.2, p85: 5.4 },
  { month: 2, p15: 3.9, p50: 5.1, p85: 6.5 },
  { month: 3, p15: 4.5, p50: 5.8, p85: 7.4 },
  { month: 4, p15: 5.0, p50: 6.4, p85: 8.1 },
  { month: 5, p15: 5.4, p50: 6.9, p85: 8.7 },
  { month: 6, p15: 5.7, p50: 7.3, p85: 9.2 },
  { month: 7, p15: 6.0, p50: 7.6, p85: 9.6 },
  { month: 8, p15: 6.3, p50: 7.9, p85: 10.0 },
  { month: 9, p15: 6.5, p50: 8.2, p85: 10.4 },
  { month: 10, p15: 6.7, p50: 8.5, p85: 10.7 },
  { month: 11, p15: 6.9, p50: 8.7, p85: 11.0 },
  { month: 12, p15: 7.0, p50: 8.9, p85: 11.3 },
  { month: 15, p15: 7.6, p50: 9.6, p85: 12.2 },
  { month: 18, p15: 8.1, p50: 10.2, p85: 13.2 },
  { month: 21, p15: 8.6, p50: 10.9, p85: 14.2 },
  { month: 24, p15: 9.0, p50: 11.5, p85: 15.0 },
  { month: 30, p15: 9.9, p50: 12.7, p85: 16.7 },
  { month: 36, p15: 10.8, p50: 14.0, p85: 18.5 },
  { month: 42, p15: 11.6, p50: 15.2, p85: 20.3 },
  { month: 48, p15: 12.5, p50: 16.3, p85: 22.0 },
  { month: 54, p15: 13.3, p50: 17.5, p85: 23.7 },
  { month: 60, p15: 14.2, p50: 18.8, p85: 25.5 },
];

// 通过插值计算任意月龄的标准值
export function interpolateStandard(
  standards: { month: number; p15: number; p50: number; p85: number }[],
  month: number
): { p15: number; p50: number; p85: number } {
  if (month <= 0) return standards[0];
  if (month >= 60) return standards[standards.length - 1];

  // 找到相邻的两个点
  let lower = standards[0];
  let upper = standards[standards.length - 1];
  for (let i = 0; i < standards.length - 1; i++) {
    if (month >= standards[i].month && month <= standards[i + 1].month) {
      lower = standards[i];
      upper = standards[i + 1];
      break;
    }
  }

  const ratio = (month - lower.month) / (upper.month - lower.month);
  return {
    p15: lower.p15 + (upper.p15 - lower.p15) * ratio,
    p50: lower.p50 + (upper.p50 - lower.p50) * ratio,
    p85: lower.p85 + (upper.p85 - lower.p85) * ratio,
  };
}

// 根据身高体重计算百分位
export function getPercentile(
  value: number,
  standard: { p15: number; p50: number; p85: number }
): 'p15' | 'p50' | 'p85' | 'below' | 'above' {
  const tolerance = (standard.p85 - standard.p15) * 0.1; // 10%的容差
  if (value < standard.p15 - tolerance) return 'below';
  if (value <= standard.p15 + tolerance) return 'p15';
  if (value <= standard.p50 + tolerance) return 'p50';
  if (value <= standard.p85 + tolerance) return 'p85';
  return 'above';
}

// LocalStorage 操作
const STORAGE_KEY = 'sentuncle-growth-records';

export function getGrowthRecords(): GrowthRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveGrowthRecords(records: GrowthRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addGrowthRecord(record: GrowthRecord): void {
  const records = getGrowthRecords();
  records.push(record);
  saveGrowthRecords(records);
}

export function deleteGrowthRecord(id: string): void {
  const records = getGrowthRecords().filter(r => r.id !== id);
  saveGrowthRecords(records);
}