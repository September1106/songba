// 来源：WS/T 456-2014《学龄儿童青少年营养不良筛查》、WS/T 586-2018《学龄儿童青少年超重与肥胖筛查》
export interface BMICutoff {
  age_years: number;
  sex: '男' | '女';
  overweight_bmi: number;     // 超重界值
  obese_bmi: number;          // 肥胖界值
  mild_thinness_bmi: number; // 轻度消瘦界值
  moderate_severe_thinness_bmi: number; // 中重度消瘦界值
}

export const bmiStandards: BMICutoff[] = [
  { age_years: 6, sex: '男', overweight_bmi: 16.4, obese_bmi: 17.7, mild_thinness_bmi: 13.4, moderate_severe_thinness_bmi: 13.2 },
  { age_years: 6.5, sex: '男', overweight_bmi: 16.7, obese_bmi: 18.1, mild_thinness_bmi: 13.8, moderate_severe_thinness_bmi: 13.4 },
  { age_years: 7, sex: '男', overweight_bmi: 17.0, obese_bmi: 18.7, mild_thinness_bmi: 13.9, moderate_severe_thinness_bmi: 13.5 },
  { age_years: 7.5, sex: '男', overweight_bmi: 17.4, obese_bmi: 19.2, mild_thinness_bmi: 13.9, moderate_severe_thinness_bmi: 13.5 },
  { age_years: 8, sex: '男', overweight_bmi: 17.8, obese_bmi: 19.7, mild_thinness_bmi: 14.0, moderate_severe_thinness_bmi: 13.6 },
  { age_years: 8.5, sex: '男', overweight_bmi: 18.1, obese_bmi: 20.3, mild_thinness_bmi: 14.0, moderate_severe_thinness_bmi: 13.6 },
  { age_years: 9, sex: '男', overweight_bmi: 18.5, obese_bmi: 20.8, mild_thinness_bmi: 14.1, moderate_severe_thinness_bmi: 13.7 },
  { age_years: 9.5, sex: '男', overweight_bmi: 18.9, obese_bmi: 21.4, mild_thinness_bmi: 14.2, moderate_severe_thinness_bmi: 13.8 },
  { age_years: 10, sex: '男', overweight_bmi: 19.2, obese_bmi: 21.9, mild_thinness_bmi: 14.4, moderate_severe_thinness_bmi: 13.9 },
  { age_years: 10.5, sex: '男', overweight_bmi: 19.6, obese_bmi: 22.5, mild_thinness_bmi: 14.6, moderate_severe_thinness_bmi: 14.0 },
  { age_years: 11, sex: '男', overweight_bmi: 19.9, obese_bmi: 23.0, mild_thinness_bmi: 14.9, moderate_severe_thinness_bmi: 14.2 },
  { age_years: 11.5, sex: '男', overweight_bmi: 20.3, obese_bmi: 23.6, mild_thinness_bmi: 15.1, moderate_severe_thinness_bmi: 14.3 },
  { age_years: 12, sex: '男', overweight_bmi: 20.7, obese_bmi: 24.1, mild_thinness_bmi: 15.4, moderate_severe_thinness_bmi: 14.4 },
  { age_years: 12.5, sex: '男', overweight_bmi: 21.0, obese_bmi: 24.7, mild_thinness_bmi: 15.6, moderate_severe_thinness_bmi: 14.5 },
  { age_years: 13, sex: '男', overweight_bmi: 21.4, obese_bmi: 25.2, mild_thinness_bmi: 15.9, moderate_severe_thinness_bmi: 14.8 },
  { age_years: 13.5, sex: '男', overweight_bmi: 21.9, obese_bmi: 25.7, mild_thinness_bmi: 16.1, moderate_severe_thinness_bmi: 15.0 },
  { age_years: 14, sex: '男', overweight_bmi: 22.3, obese_bmi: 26.1, mild_thinness_bmi: 16.4, moderate_severe_thinness_bmi: 15.3 },
  { age_years: 14.5, sex: '男', overweight_bmi: 22.6, obese_bmi: 26.4, mild_thinness_bmi: 16.7, moderate_severe_thinness_bmi: 15.5 },
  { age_years: 15, sex: '男', overweight_bmi: 22.9, obese_bmi: 26.6, mild_thinness_bmi: 16.9, moderate_severe_thinness_bmi: 15.8 },
  { age_years: 15.5, sex: '男', overweight_bmi: 23.1, obese_bmi: 26.9, mild_thinness_bmi: 17.0, moderate_severe_thinness_bmi: 16.0 },
  { age_years: 16, sex: '男', overweight_bmi: 23.3, obese_bmi: 27.1, mild_thinness_bmi: 17.3, moderate_severe_thinness_bmi: 16.2 },
  { age_years: 16.5, sex: '男', overweight_bmi: 23.5, obese_bmi: 27.4, mild_thinness_bmi: 17.5, moderate_severe_thinness_bmi: 16.4 },
  { age_years: 17, sex: '男', overweight_bmi: 23.7, obese_bmi: 27.6, mild_thinness_bmi: 17.7, moderate_severe_thinness_bmi: 16.6 },
  { age_years: 17.5, sex: '男', overweight_bmi: 23.8, obese_bmi: 27.8, mild_thinness_bmi: 17.9, moderate_severe_thinness_bmi: 16.8 },
  { age_years: 18, sex: '男', overweight_bmi: 24.0, obese_bmi: 28.0, mild_thinness_bmi: 17.9, moderate_severe_thinness_bmi: 16.8 },
  { age_years: 6, sex: '女', overweight_bmi: 16.2, obese_bmi: 17.5, mild_thinness_bmi: 13.1, moderate_severe_thinness_bmi: 12.8 },
  { age_years: 6.5, sex: '女', overweight_bmi: 16.5, obese_bmi: 18.0, mild_thinness_bmi: 13.3, moderate_severe_thinness_bmi: 12.9 },
  { age_years: 7, sex: '女', overweight_bmi: 16.8, obese_bmi: 18.5, mild_thinness_bmi: 13.4, moderate_severe_thinness_bmi: 13.0 },
  { age_years: 7.5, sex: '女', overweight_bmi: 17.2, obese_bmi: 19.0, mild_thinness_bmi: 13.5, moderate_severe_thinness_bmi: 13.0 },
  { age_years: 8, sex: '女', overweight_bmi: 17.6, obese_bmi: 19.4, mild_thinness_bmi: 13.6, moderate_severe_thinness_bmi: 13.1 },
  { age_years: 8.5, sex: '女', overweight_bmi: 18.1, obese_bmi: 19.9, mild_thinness_bmi: 13.7, moderate_severe_thinness_bmi: 13.1 },
  { age_years: 9, sex: '女', overweight_bmi: 18.5, obese_bmi: 20.4, mild_thinness_bmi: 13.8, moderate_severe_thinness_bmi: 13.2 },
  { age_years: 9.5, sex: '女', overweight_bmi: 19.0, obese_bmi: 21.0, mild_thinness_bmi: 13.9, moderate_severe_thinness_bmi: 13.2 },
  { age_years: 10, sex: '女', overweight_bmi: 19.5, obese_bmi: 21.5, mild_thinness_bmi: 14.0, moderate_severe_thinness_bmi: 13.3 },
  { age_years: 10.5, sex: '女', overweight_bmi: 20.0, obese_bmi: 22.1, mild_thinness_bmi: 14.1, moderate_severe_thinness_bmi: 13.4 },
  { age_years: 11, sex: '女', overweight_bmi: 20.5, obese_bmi: 22.7, mild_thinness_bmi: 14.3, moderate_severe_thinness_bmi: 13.7 },
  { age_years: 11.5, sex: '女', overweight_bmi: 21.1, obese_bmi: 23.3, mild_thinness_bmi: 14.5, moderate_severe_thinness_bmi: 13.9 },
  { age_years: 12, sex: '女', overweight_bmi: 21.5, obese_bmi: 23.9, mild_thinness_bmi: 14.7, moderate_severe_thinness_bmi: 14.1 },
  { age_years: 12.5, sex: '女', overweight_bmi: 21.9, obese_bmi: 24.5, mild_thinness_bmi: 14.9, moderate_severe_thinness_bmi: 14.3 },
  { age_years: 13, sex: '女', overweight_bmi: 22.2, obese_bmi: 25.0, mild_thinness_bmi: 15.3, moderate_severe_thinness_bmi: 14.6 },
  { age_years: 13.5, sex: '女', overweight_bmi: 22.6, obese_bmi: 25.6, mild_thinness_bmi: 15.6, moderate_severe_thinness_bmi: 14.9 },
  { age_years: 14, sex: '女', overweight_bmi: 22.8, obese_bmi: 25.9, mild_thinness_bmi: 16.0, moderate_severe_thinness_bmi: 15.3 },
  { age_years: 14.5, sex: '女', overweight_bmi: 23.0, obese_bmi: 26.3, mild_thinness_bmi: 16.3, moderate_severe_thinness_bmi: 15.7 },
  { age_years: 15, sex: '女', overweight_bmi: 23.2, obese_bmi: 26.6, mild_thinness_bmi: 16.6, moderate_severe_thinness_bmi: 16.0 },
  { age_years: 15.5, sex: '女', overweight_bmi: 23.4, obese_bmi: 26.9, mild_thinness_bmi: 16.8, moderate_severe_thinness_bmi: 16.2 },
  { age_years: 16, sex: '女', overweight_bmi: 23.6, obese_bmi: 27.1, mild_thinness_bmi: 17.0, moderate_severe_thinness_bmi: 16.4 },
  { age_years: 16.5, sex: '女', overweight_bmi: 23.7, obese_bmi: 27.4, mild_thinness_bmi: 17.1, moderate_severe_thinness_bmi: 16.5 },
  { age_years: 17, sex: '女', overweight_bmi: 23.8, obese_bmi: 27.6, mild_thinness_bmi: 17.2, moderate_severe_thinness_bmi: 16.6 },
  { age_years: 17.5, sex: '女', overweight_bmi: 23.9, obese_bmi: 27.8, mild_thinness_bmi: 17.3, moderate_severe_thinness_bmi: 16.7 },
  { age_years: 18, sex: '女', overweight_bmi: 24.0, obese_bmi: 28.0, mild_thinness_bmi: 17.3, moderate_severe_thinness_bmi: 16.7 },
];

export interface BMIRecord {
  id: string;
  date: string;
  birthDate: string;
  ageYears: number; // 半岁年龄，如 10.5
  gender: 'male' | 'female';
  height: number;
  weight: number;
  bmi: number;
  level: string;
  levelDesc: string;
}

const STORAGE_KEY = 'bmi_records_v1';

export function getBMIRecords(): BMIRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addBMIRecord(record: BMIRecord): void {
  const records = getBMIRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function deleteBMIRecord(id: string): void {
  const records = getBMIRecords().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/**
 * 计算半岁年龄
 * 月份不满6个月 → 向下保留到整岁
 * 超过6个月但不到下一个年龄 → x.5岁
 */
export function calculateHalfYearAge(birthDateStr: string, measureDateStr: string): number {
  const birth = new Date(birthDateStr);
  const measure = new Date(measureDateStr);
  const totalMonths = (measure.getFullYear() - birth.getFullYear()) * 12 + (measure.getMonth() - birth.getMonth());
  const extraDays = measure.getDate() - birth.getDate();
  const adjustedMonths = extraDays < 0 ? totalMonths - 1 : totalMonths;
  const years = Math.floor(adjustedMonths / 12);
  const months = adjustedMonths % 12;
  if (months < 6) {
    return years;
  }
  return years + 0.5;
}

/**
 * 根据BMI和标准判断等级
 */
export function evaluateBMIMalnutrition(bmi: number, cutoff: BMICutoff): { level: string; levelDesc: string } {
  if (bmi >= cutoff.obese_bmi) {
    return { level: '肥胖', levelDesc: `BMI ${bmi} ≥ ${cutoff.obese_bmi}（肥胖界值）` };
  }
  if (bmi >= cutoff.overweight_bmi) {
    return { level: '超重', levelDesc: `BMI ${bmi} ≥ ${cutoff.overweight_bmi}（超重界值）` };
  }
  if (bmi >= cutoff.mild_thinness_bmi) {
    return { level: '正常', levelDesc: `BMI ${bmi} ≥ ${cutoff.mild_thinness_bmi}（正常范围）` };
  }
  if (bmi >= cutoff.moderate_severe_thinness_bmi) {
    return { level: '轻度消瘦', levelDesc: `BMI ${bmi} ≥ ${cutoff.moderate_severe_thinness_bmi}（轻度消瘦界值）` };
  }
  return { level: '中重度消瘦', levelDesc: `BMI ${bmi} < ${cutoff.moderate_severe_thinness_bmi}（中重度消瘦界值）` };
}
