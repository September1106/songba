export interface VaccineItem {
  id: string;
  name: string;
  type: 'free' | 'paid'; // 一类(免费) / 二类(自费)
  doses: VaccineDose[];
  description: string; // 疫苗作用一句话介绍
  precautions?: string; // 接种后注意事项
  contraindications?: string; // 禁忌
  notes?: string; // 补充说明
  // 标记属于哪个"二选一"组，用于8月龄/18月龄家长选择后过滤
  // 例如 choiceKey: 'je' 表示乙脑选组，choiceKey: 'hepa' 表示甲肝选组
  choiceKey?: string;
}

export interface VaccineDose {
  dose: number; // 第几针/剂
  recommendAge: string; // 推荐接种月龄
  months: number; // 月龄数值（用于计算）
  notes?: string; // 该剂次备注
}

export const vaccineData: VaccineItem[] = [
  // ==================== 一类疫苗（免费）====================
  {
    id: 'bcg',
    name: '卡介苗',
    type: 'free',
    description: '预防结核病，特别是对儿童结核性脑膜炎和粟粒性肺结核有较好保护效果。',
    doses: [
      { dose: 1, recommendAge: '出生时', months: 0, notes: '出生医院接种，通常在出院前完成' },
    ],
    precautions: '接种后2周左右接种部位出现红肿，约6-8周结痂。注意保持清洁，不要抓挠。接种后应避免剧烈运动。',
  },
  {
    id: 'hepb',
    name: '乙肝疫苗',
    type: 'free',
    description: '预防乙型肝炎，降低乙肝感染风险和肝癌发生率。',
    doses: [
      { dose: 1, recommendAge: '出生时', months: 0 },
      { dose: 2, recommendAge: '1月龄', months: 1 },
      { dose: 3, recommendAge: '6月龄', months: 6 },
    ],
    precautions: '发热、患急性或慢性疾病患儿应暂缓接种。接种后观察30分钟无异常再离开。',
  },
  // ===================== 脊灰疫苗（IPV + bOPV）====================
  {
    id: 'ipv',
    name: '脊灰灭活疫苗（IPV）',
    type: 'free',
    description: '预防脊髓灰质炎（小儿麻痹症），灭活疫苗，注射接种。',
    doses: [
      { dose: 1, recommendAge: '2月龄', months: 2 },
      { dose: 2, recommendAge: '3月龄', months: 3 },
    ],
    contraindications: '已知对疫苗成分过敏、免疫缺陷者禁种。',
    notes: '2020年起采用"2剂IPV+2剂bOPV"程序，前2剂为脊灰灭活疫苗(IPV)，后2剂为脊灰减毒活疫苗(bOPV)口服',
  },
  {
    id: 'bopv',
    name: '脊灰减毒活疫苗（bOPV）',
    type: 'free',
    description: '预防脊髓灰质炎（小儿麻痹症），口服接种，俗称"糖丸"或"滴剂"。',
    doses: [
      { dose: 1, recommendAge: '4月龄', months: 4, notes: '口服第1剂次' },
      { dose: 2, recommendAge: '4周岁', months: 48, notes: '口服第2剂次' },
    ],
    contraindications: '已知对疫苗成分过敏、免疫缺陷者禁种。',
    notes: '与脊灰灭活疫苗(IPV)配合使用，完成4剂程序',
  },
  // ===================== 百白破 + 白破疫苗 ====================
  {
    id: 'dtap',
    name: '百白破疫苗',
    type: 'free',
    description: '同时预防百日咳、白喉、破伤风三种严重疾病。',
    doses: [
      { dose: 1, recommendAge: '3月龄', months: 3 },
      { dose: 2, recommendAge: '4月龄', months: 4 },
      { dose: 3, recommendAge: '5月龄', months: 5 },
      { dose: 4, recommendAge: '18月龄', months: 18 },
    ],
    precautions: '接种后部分孩子会有局部红肿、发热，属于正常反应。如发热超38.5℃可服退热药。',
    notes: 'DTaP为无细胞百日咳疫苗，反应更轻；DT为全细胞百白破，已逐步淘汰',
  },
  {
    id: 'td',
    name: '白破疫苗',
    type: 'free',
    description: '预防白喉和破伤风，用于6岁以上儿童加强免疫。',
    doses: [
      { dose: 1, recommendAge: '6周岁', months: 72, notes: '6岁接种白破疫苗（非百白破）' },
    ],
    precautions: '接种后部分孩子会有局部红肿、发热，属于正常反应。',
    notes: '白破疫苗（Td）不含百日咳成分，用于6岁以上加强，与4岁前接种的百白破疫苗相区分',
  },
  // ===================== 麻腮风疫苗 ====================
  {
    id: 'mr',
    name: '麻腮风疫苗',
    type: 'free',
    description: '预防麻疹、流行性腮腺炎、风疹三种呼吸道传染病。',
    doses: [
      { dose: 1, recommendAge: '8月龄', months: 8 },
      { dose: 2, recommendAge: '18月龄', months: 18 },
    ],
    precautions: '接种后部分孩子会有轻微发热、皮疹，属于正常反应，通常2-3天自愈。',
    notes: '麻腮风疫苗是联合疫苗，可同时预防三种疾病，减少接种次数',
  },
  // ===================== 乙脑疫苗（两选一）====================
  {
    id: 'jele',
    name: '乙脑减毒活疫苗',
    type: 'free',
    choiceKey: 'je',
    description: '预防流行性乙型脑炎（乙脑），减毒活疫苗，只需接种2剂。',
    doses: [
      { dose: 1, recommendAge: '8月龄', months: 8 },
      { dose: 2, recommendAge: '2周岁', months: 24 },
    ],
    notes: '乙脑通过蚊子传播，南方地区5-10月高发。减毒活疫苗接种2剂即可，适合大多数孩子。',
  },
  {
    id: 'jei',
    name: '乙脑灭活疫苗',
    type: 'free',
    choiceKey: 'je',
    description: '预防流行性乙型脑炎（乙脑），灭活疫苗，需要接种4剂。',
    doses: [
      { dose: 1, recommendAge: '8月龄', months: 8, notes: '第1剂' },
      { dose: 2, recommendAge: '8月龄（间隔7-10天）', months: 8, notes: '第2剂，与第1剂间隔7-10天' },
      { dose: 3, recommendAge: '2周岁', months: 24, notes: '第3剂' },
      { dose: 4, recommendAge: '6周岁', months: 72, notes: '第4剂' },
    ],
    notes: '灭活疫苗需要4剂，前2剂在8月龄完成（间隔7-10天），第3剂2岁，第4剂6岁。如有替代方案可选减毒活疫苗（仅2剂）',
  },
  // ===================== 流脑疫苗 ====================
  {
    id: 'mena',
    name: 'A群流脑疫苗',
    type: 'free',
    description: '预防A群脑膜炎奈瑟菌引起的流行性脑脊髓膜炎。',
    doses: [
      { dose: 1, recommendAge: '6月龄', months: 6 },
      { dose: 2, recommendAge: '9月龄', months: 9 },
    ],
    notes: '流脑起病急、进展快，婴幼儿是高危人群',
  },
  {
    id: 'menac',
    name: 'A+C群流脑疫苗',
    type: 'free',
    description: '预防A群和C群脑膜炎奈瑟菌引起的流行性脑脊髓膜炎。',
    doses: [
      { dose: 1, recommendAge: '3周岁', months: 36 },
      { dose: 2, recommendAge: '6周岁', months: 72 },
    ],
    notes: '在A群流脑疫苗基础上扩大保护范围至C群',
  },
  // ===================== 甲肝疫苗（两选一）====================
  {
    id: 'hepal',
    name: '甲肝减毒活疫苗',
    type: 'free',
    choiceKey: 'hepa',
    description: '预防甲型病毒性肝炎，减毒活疫苗，只需接种1剂。',
    doses: [
      { dose: 1, recommendAge: '18月龄', months: 18 },
    ],
    notes: '甲肝为急性自限性疾病，减毒活疫苗接种1剂即可完成基础免疫，接种后可获得持久免疫力',
  },
  {
    id: 'hepai',
    name: '甲肝灭活疫苗',
    type: 'free',
    choiceKey: 'hepa',
    description: '预防甲型病毒性肝炎，灭活疫苗，需要接种2剂。',
    doses: [
      { dose: 1, recommendAge: '18月龄', months: 18 },
      { dose: 2, recommendAge: '2周岁', months: 24 },
    ],
    notes: '甲肝灭活疫苗需要接种2剂（18月龄+2岁），可作为减毒活疫苗的替代方案',
  },
  // ==================== 二类疫苗（自费）====================
  {
    id: 'influenza',
    name: '流感疫苗',
    type: 'paid',
    description: '预防季节性流感，降低重症风险。每年接种。',
    doses: [
      { dose: 1, recommendAge: '6月龄以上', months: 6 },
      { dose: 2, recommendAge: '每年秋季', months: 12, notes: '每年需重新接种' },
    ],
    notes: '建议每年接种，尤其是体质较弱的孩子、孕妇、老年人。6月龄以下婴儿家庭成员建议接种形成保护圈。',
  },
  {
    id: 'varicella',
    name: '水痘疫苗',
    type: 'paid',
    description: '预防水痘及带状疱疹，减少儿童皮肤感染和并发症。',
    doses: [
      { dose: 1, recommendAge: '12月龄以上', months: 12 },
      { dose: 2, recommendAge: '4周岁以上', months: 48 },
    ],
    notes: '水痘传染性强，幼儿园儿童建议两剂完成保护。',
  },
  {
    id: 'pneumococcal',
    name: '肺炎球菌疫苗（13价）',
    type: 'paid',
    description: '预防肺炎球菌引起的肺炎、脑膜炎、中耳炎等。',
    doses: [
      { dose: 1, recommendAge: '2月龄', months: 2 },
      { dose: 2, recommendAge: '4月龄', months: 4 },
      { dose: 3, recommendAge: '12月龄', months: 12 },
      { dose: 4, recommendAge: '12-15月龄加强', months: 15 },
    ],
    notes: '13价肺炎球菌结合疫苗（PCV13），全程4剂。 WHO推荐婴幼儿优先接种。',
  },
  {
    id: 'ev71',
    name: '手足口病疫苗（EV71）',
    type: 'paid',
    description: '预防EV71型肠道病毒引起的手足口病及重症。',
    doses: [
      { dose: 1, recommendAge: '6月龄', months: 6 },
      { dose: 2, recommendAge: '间隔1个月', months: 7 },
    ],
    notes: '针对EV71型病毒，不能预防其他病毒导致的手足口病。重症手足口病主要由EV71引起。',
  },
  {
    id: 'rotavirus',
    name: '轮状病毒疫苗',
    type: 'paid',
    description: '预防轮状病毒引起的婴幼儿腹泻、呕吐、发热。',
    doses: [
      { dose: 1, recommendAge: '2月龄', months: 2 },
      { dose: 2, recommendAge: '4月龄', months: 4 },
      { dose: 3, recommendAge: '6月龄', months: 6 },
    ],
    notes: '五价轮状病毒疫苗，口服接种。注意：接种年龄窗口严格，不可超龄接种。',
  },
  {
    id: 'meningococcal',
    name: 'ACYW135群流脑疫苗',
    type: 'paid',
    description: '预防A、C、Y、W135群脑膜炎球菌引起的流脑，保护更全面。',
    doses: [
      { dose: 1, recommendAge: '3月龄', months: 3 },
      { dose: 2, recommendAge: '6月龄', months: 6 },
      { dose: 3, recommendAge: '3周岁', months: 36 },
      { dose: 4, recommendAge: '6周岁', months: 72 },
    ],
    notes: '可替代免费A群流脑疫苗，提供更广保护范围。接种程序与免费疫苗不完全相同。',
  },
  {
    id: 'hepb-paid',
    name: '乙肝疫苗（加强型）',
    type: 'paid',
    description: '若免费乙肝疫苗接种后无应答，可考虑加强接种。',
    doses: [
      { dose: 1, recommendAge: '加强免疫', months: 120 },
    ],
    notes: '通常在完成常规程序后检测抗体，如无应答可加强。',
  },
];

// 接种状态
export type VaccineStatus = 'future' | 'due-soon' | 'due' | 'overdue' | 'done';

export interface VaccineListItem extends VaccineItem {
  dose: number;
  recommendAge: string;
  doseKey: string;
  status: VaccineStatus;
  doseNotes?: string;
  birthDate: string;
  months: number;
  dueDate: Date;
  daysUntil: number;
}

export function buildVaccineList(
  birthDate: string,
  vaccinated: Set<string>,
  /**
   * 家长做出的疫苗选择映射。
   * key: choiceKey（如 'je'、'hepa'）
   * value: 选中的疫苗id（如 'jele' 表示选减毒活，'jei' 表示选灭活）
   * 如果某个 key 不在 map 中，表示该选择组尚未确定（展示时需出现选择卡片）
   */
  choices: Record<string, string> = {},
): VaccineListItem[] {
  const today = new Date();
  const birth = new Date(birthDate);

  const result: VaccineListItem[] = [];

  vaccineData.forEach(vaccine => {
    // 如果该疫苗属于某个 choiceKey 组，但用户已选择其他方案，则跳过整个疫苗
    if (vaccine.choiceKey) {
      const chosenId = choices[vaccine.choiceKey];
      // 如果已经做了选择，且没有选这个疫苗，跳过
      if (chosenId !== undefined && chosenId !== vaccine.id) return;
      // 如果还没做选择（chosenId === undefined），先正常展示（选择卡片会在页面层处理）
    }

    vaccine.doses.forEach(dose => {
      const doseKey = `${vaccine.id}-${dose.dose}`;
      let status: VaccineStatus = 'future';

      // 正确计算满n月龄的日期（处理月末溢出问题）
      const dueDate = new Date(birth);
      dueDate.setMonth(dueDate.getMonth() + dose.months);
      // 若溢出（如1月31日+1月→3月），回拨到当月最后一天
      if (dueDate.getDate() !== birth.getDate()) {
        dueDate.setDate(0);
      }
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (vaccinated.has(doseKey)) {
        status = 'done';
      } else if (daysUntilDue < -30) {
        // 超过推荐接种日1个月以上，才算超期
        status = 'overdue';
      } else if (daysUntilDue > 30) {
        // 距离接种日超过30天
        status = 'future';
      } else {
        // 0 ~ +30天内：正常或轻微延迟，均视为"待接种"
        status = 'due';
      }

      result.push({
        ...vaccine,
        dose: dose.dose,
        recommendAge: dose.recommendAge,
        doseKey,
        status,
        doseNotes: dose.notes,
        birthDate,
        months: dose.months,
        dueDate,
        daysUntil: daysUntilDue,
      });
    });
  });

  return result;
}

export function getFreeVaccines(): VaccineItem[] {
  return vaccineData.filter(v => v.type === 'free');
}

export function getPaidVaccines(): VaccineItem[] {
  return vaccineData.filter(v => v.type === 'paid');
}

/** 乙脑疫苗选择组 */
export const JE_CHOICE_KEY = 'je';
/** 甲肝疫苗选择组 */
export const HEPA_CHOICE_KEY = 'hepa';

/** 乙脑选组下的两个疫苗ID */
export const JE_OPTIONS = ['jele', 'jei'];
/** 甲肝选组下的两个疫苗ID */
export const HEPA_OPTIONS = ['hepal', 'hepai'];

/** 乙脑方案说明 */
export const JE_OPTION_LABELS: Record<string, string> = {
  jele: '乙脑减毒活疫苗（2剂：8月龄 + 2周岁）',
  jei: '乙脑灭活疫苗（4剂：8月龄×2剂间隔7-10天 + 2周岁 + 6周岁）',
};

/** 甲肝方案说明 */
export const HEPA_OPTION_LABELS: Record<string, string> = {
  hepal: '甲肝减毒活疫苗（1剂：18月龄）',
  hepai: '甲肝灭活疫苗（2剂：18月龄 + 2周岁）',
};