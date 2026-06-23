import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/lib';
import {
  buildVaccineList, getPaidVaccines,
  type VaccineListItem, type VaccineItem,
  JE_CHOICE_KEY, HEPA_CHOICE_KEY, JE_OPTIONS, HEPA_OPTIONS,
  JE_OPTION_LABELS, HEPA_OPTION_LABELS,
} from '../data/vaccines';
import DateInput from '../components/DateInput';
import ChildSelector from '../components/ChildSelector';
import {
  getChildren, updateChild,
  updateVaccinated, updateJeChoice, updateHepaChoice,
  type ChildProfile,
} from '../data/children';

type FilterMode = 'all' | 'pending' | 'done';
type ViewMode = 'free' | 'paid' | 'knowledge';

function getStatusLabel(status: string): string {
  switch (status) {
    case 'future': return '待接种';
    case 'due-soon': return '即将到期';
    case 'due': return '应种';
    case 'overdue': return '超期';
    case 'done': return '已完成';
    default: return status;
  }
}

function formatDaysUntil(days: number): string {
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  if (days < 0) return `已超期${Math.abs(days)}天`;
  if (days <= 7) return `${days}天后`;
  if (days <= 30) return `约${Math.round(days / 7)}周后`;
  if (days <= 365) return `约${Math.round(days / 30)}个月后`;
  return `约${Math.round(days / 365)}年后`;
}

// ==================== 乙脑选择卡片 ====================
function JeChoiceCard({
  chosen, onChoose,
}: {
  chosen: string | undefined;
  onChoose: (id: string) => void;
}) {
  return (
    <Card color="default" style={{ marginBottom: '12px', border: '2px solid var(--warning)' }}>
      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-header)', marginBottom: '10px' }}>
        🦟 8月龄了！乙脑疫苗选择
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        乙脑疫苗有两种方案，请根据实际情况选择：
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {JE_OPTIONS.map(id => (
          <Button
            key={id}
            size="small"
            type={chosen === id ? 'primary' : 'default'}
            onClick={() => onChoose(id)}
            style={chosen === id ? {} : { background: '#f0f0f0' }}
          >
            {JE_OPTION_LABELS[id]}
          </Button>
        ))}
      </div>
      {chosen && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>
          ✓ 已选择：{JE_OPTION_LABELS[chosen]}
        </div>
      )}
    </Card>
  );
}

// ==================== 甲肝选择卡片 ====================
function HepaChoiceCard({
  chosen, onChoose,
}: {
  chosen: string | undefined;
  onChoose: (id: string) => void;
}) {
  return (
    <Card color="default" style={{ marginBottom: '12px', border: '2px solid var(--warning)' }}>
      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-header)', marginBottom: '10px' }}>
        🦟 18月龄了！甲肝疫苗选择
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        甲肝疫苗有两种方案，请根据实际情况选择：
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {HEPA_OPTIONS.map(id => (
          <Button
            key={id}
            size="small"
            type={chosen === id ? 'primary' : 'default'}
            onClick={() => onChoose(id)}
            style={chosen === id ? {} : { background: '#f0f0f0' }}
          >
            {HEPA_OPTION_LABELS[id]}
          </Button>
        ))}
      </div>
      {chosen && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>
          ✓ 已选择：{HEPA_OPTION_LABELS[chosen]}
        </div>
      )}
    </Card>
  );
}

// ==================== 疫苗卡片 ====================
function FreeVaccineCard({ v, onToggle }: { v: VaccineListItem; onToggle: (key: string) => void }) {
  return (
    <Card color="default" className={`vaccine-card ${v.status}`} style={{ marginBottom: '12px' }}>
      <div className="vaccine-card-header">
        <div style={{ flex: 1 }}>
          <div className="vaccine-name">{v.name}
            {v.dose > 0 && `（第${v.dose}针）`}
          </div>
          <div className="vaccine-dose">{v.recommendAge}</div>
        </div>
        <span className={`vaccine-status ${v.status}`}>{getStatusLabel(v.status)}</span>
      </div>

      {v.description && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
          💡 {v.description}
        </p>
      )}

      <div style={{
        fontSize: '13px',
        fontWeight: 600,
        color: v.daysUntil < 0 ? 'var(--error)' : v.daysUntil <= 7 ? 'var(--warning)' : 'var(--text-secondary)',
        marginBottom: '8px',
      }}>
        {v.status !== 'done' ? (
          <>接种日期：{v.dueDate.toLocaleDateString('zh-CN')}（{formatDaysUntil(v.daysUntil)}）</>
        ) : (
          <span style={{ color: 'var(--success)' }}>✓ 已完成</span>
        )}
      </div>

      {v.doseNotes && (
        <p className="text-sm text-muted" style={{ marginBottom: '8px', fontStyle: 'italic' }}>{v.doseNotes}</p>
      )}

      <Button
        size="small"
        type={v.status === 'done' ? 'default' : 'primary'}
        onClick={() => onToggle(v.doseKey)}
      >
        {v.status === 'done' ? '取消完成' : '标记已完成'}
      </Button>
    </Card>
  );
}

function PaidVaccineCard({ v }: { v: VaccineItem }) {
  return (
    <Card color="default" style={{ marginBottom: '12px' }}>
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-header)', marginBottom: '4px' }}>
          💰 {v.name}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          {v.description}
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '4px 0', color: 'var(--text-muted)', width: '70px' }}>接种时间</td>
            <td style={{ padding: '4px 0', color: 'var(--text-body)' }}>
              {v.doses[0]?.recommendAge}起，共{v.doses.length}剂
            </td>
          </tr>
          <tr>
            <td style={{ padding: '4px 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>接种建议</td>
            <td style={{ padding: '4px 0', color: 'var(--text-body)' }}>{v.notes || '按知情自愿原则接种'}</td>
          </tr>
          {v.precautions && (
            <tr>
              <td style={{ padding: '4px 0', color: 'var(--text-muted)', verticalAlign: 'top' }}>注意事项</td>
              <td style={{ padding: '4px 0', color: 'var(--text-body)' }}>{v.precautions}</td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}

// ==================== 接种知识卡片（口语化）====================
const KNOWLEDGE_CARDS = [
  {
    icon: '⏰',
    title: '各疫苗最晚什么时候种？',
    content: '每种疫苗都有个最晚时间限制，超过了这个年龄就不能按常规程序接种了——得走补种流程。\n\n简单说：乙肝第1剂出生24小时内；卡介苗3月龄内；百白破第4剂、麻腮风第1剂等12月龄内；甲肝第2剂3岁内；脊灰第4剂5岁内；白破疫苗、A群C群流脑第2剂、乙脑灭活第4剂7岁内。\n\n万一超龄了也别慌，后面会讲到补种原则。',
  },
  {
    icon: '💉',
    title: '两针一起打？没问题！',
    content: '带娃打疫苗经常遇到要打好几针的情况，很多家长担心能不能同时打。答案是：可以。\n\n两种及以上的注射类疫苗，只要打在不同的部位（左臂右臂、左腿右腿），可以一起接种。注射器里不能混合两种疫苗，这是禁止的。\n\n减毒活疫苗之间（像麻腮风和水痘），如果一起打不了，要间隔至少28天。灭活疫苗没有这个限制，跟其他疫苗不需要特意间隔。',
  },
  {
    icon: '🔧',
    title: '漏打了怎么办？补种原则来了',
    content: '忘了按预约时间去打疫苗？别焦虑，这是很常见的情况。补种的基本原则就三条：\n\n① 尽快补种，越早越好，把缺的剂次补上；\n② 不用从头开始，只补没打的剂次就行；\n③ 如果找不到同厂家的疫苗，用不同厂家的同种疫苗也可以完成后续接种。\n\n说白了就是：别拖着，赶紧约时间补上。',
  },
  {
    icon: '👶',
    title: '早产宝宝能打疫苗吗？',
    content: '早产儿（胎龄小于37周）和低出生体重儿（出生体重小于2500g）是家长问得最多的情况之一。\n\n原则是：看宝宝的身体状况。如果医学评估稳定，不需要在医院持续治疗严重感染、代谢病、器官疾病等，就可以按实际月龄接种疫苗。\n\n卡介苗稍微特殊一点：胎龄大于31周且评估稳定就可以接种；31周及以下的，看情况可以在出院前接种。',
  },
  {
    icon: '🤧',
    title: '过敏体质能打疫苗吗？',
    content: '"我家孩子过敏体质，能打疫苗吗？"这是门诊经常被问到的问题。\n\n首先，"过敏性体质"本身不是疫苗接种的禁忌。\n\n真正需要警惕的情况是：对疫苗成分有严重过敏史，或者之前接种疫苗发生过喉头水肿、过敏性休克等全身性严重过敏反应——这种情况下，禁忌继续接种同种疫苗。\n\n普通的湿疹、食物过敏、轻微过敏体质，不影响正常接种。',
  },
  {
    icon: '🛡️',
    title: 'HIV妈妈生的宝宝怎么打疫苗？',
    content: 'HIV感染母亲所生的婴儿，接种前不必常规做HIV抗体筛查，按感染状况不详的情况处理。\n\n主要原则：\n• 卡介苗：暂缓接种，等确认未感染HIV后再补；确认感染了则不予接种；\n• 含麻疹成分疫苗：有艾滋病相关症状的不接种，没有症状的可以接种；\n• 乙肝、百白破、流脑、白破等灭活疫苗：可以正常接种；\n• 乙脑减毒活疫苗、甲肝减毒活疫苗、脊灰减毒活疫苗：除非明确未感染HIV，否则不接种，可选灭活版本代替。',
  },
  {
    icon: '⚠️',
    title: '免疫功能异常能用减毒活疫苗吗？',
    content: '免疫功能异常的情况比较复杂，原则上：\n• 灭活疫苗：可以接种；\n• 减毒活疫苗：原则上不予接种，但补体缺陷患者除外。\n\n免疫抑制治疗包括化疗、全身用大剂量激素、免疫调节药物等，正在接受这些治疗的孩子更要谨慎。具体怎么打，一定要让医生评估后决定。',
  },
  {
    icon: '✅',
    title: '这些情况不是疫苗禁忌',
    content: '很多家长带孩子去打疫苗，被社区医生问有没有禁忌，结果家长百度了一圈越查越慌。其实下面这些常见情况都不属于疫苗接种禁忌：\n\n• 生理性黄疸、母乳性黄疸；\n• 单纯性热性惊厥史（没有神经系统疾病的那种）；\n• 癫痫控制稳定期间；\n• 病情稳定的脑疾病、肝脏疾病；\n• 常见先天性疾病：先天性甲状腺功能减低、苯丙酮尿症、唐氏综合征、先天性心脏病；\n• 先天性感染：梅毒、巨细胞病毒、风疹病毒宫内感染。\n\n简单说：不是急性发作期的慢性病，孩子状态稳定，就可以正常接种。',
  },
  {
    icon: '🦮',
    title: '被汪（喵）星人抓咬怎么办？',
    content: '根据接触方式和暴露程度，狂犬病暴露分为三个等级：\n\nⅠ级暴露：触摸/喂养动物，或完好皮肤被舔。无需处置，冲洗即可。\n\nⅡ级暴露：裸露皮肤被轻咬，或无明显出血的轻微抓伤/擦伤。需处置伤口并接种狂犬病疫苗。\n\nⅢ级暴露：贯穿性咬伤/抓伤，破损皮肤被舔，开放性伤口或黏膜被污染，或直接接触蝙蝠。需彻底冲洗伤口，接种疫苗＋被动免疫制剂。\n\n伤口处置原则：用肥皂水和流动清水交替冲洗15分钟，越早越好，然后尽快就医清创消毒。一般推荐24小时内接种疫苗，且必须全程接种（5针法或4针法），并非只打一针。',
  },
];

const KNOWLEDGE_CARDS_EXTRA = [
  {
    icon: '🧠',
    title: '接种疫苗会导致自闭症？',
    content: '不会。1998年英国《柳叶刀》论文早已被撤稿，作者被吊销执照，研究被证明造假。后续大量研究（涉及数百万儿童）均未发现疫苗与自闭症之间存在任何关联。自闭症是一种先天的神经发育差异，通常在宝宝出生后早期就已决定。',
  },
];

// ==================== 主页面 ====================
export default function VaccinePage() {
  const navigate = useNavigate();
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [birthYear, setBirthYear] = useState<string>('');
  const [birthMonth, setBirthMonth] = useState<string>('');
  const [birthDay, setBirthDay] = useState<string>('');
  const [vaccinated, setVaccinated] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterMode>('pending');
  const [viewMode, setViewMode] = useState<ViewMode>('free');

  // 乙脑/甲肝的家长选择
  const [jeChoice, setJeChoice] = useState<string | undefined>(undefined);
  const [hepaChoice, setHepaChoice] = useState<string | undefined>(undefined);

  // 每次活跃孩子变化时，同步表单数据
  useEffect(() => {
    if (!activeChild) {
      setBirthYear('');
      setBirthMonth('');
      setBirthDay('');
      setVaccinated(new Set());
      setJeChoice(undefined);
      setHepaChoice(undefined);
      return;
    }
    const [y, m, d] = activeChild.birthDate.split('-');
    setBirthYear(y);
    setBirthMonth(m);
    setBirthDay(d);
    setVaccinated(new Set(activeChild.vaccinated));
    setJeChoice(activeChild.jeChoice);
    setHepaChoice(activeChild.hepaChoice);
  }, [activeChild?.id]);

  // 出生日期变化 → 同步写回 children.ts
  useEffect(() => {
    if (!activeChild || !birthYear || !birthMonth || !birthDay) return;
    const birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    if (birthDate === activeChild.birthDate) return;
    updateChild(activeChild.id, { birthDate });
    const kids = getChildren();
    const latest = kids.find(c => c.id === activeChild.id);
    if (latest) setActiveChild(latest);
  }, [birthYear, birthMonth, birthDay]);

  const birthDateStr = useMemo(() => {
    if (!birthYear || !birthMonth || !birthDay) return '';
    return `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
  }, [birthYear, birthMonth, birthDay]);

  // 持久化 helpers
  const syncVaccinated = (keys: Set<string>) => {
    setVaccinated(keys);
    if (activeChild) updateVaccinated(activeChild.id, Array.from(keys));
  };

  const syncJeChoice = (v: string | undefined) => {
    setJeChoice(v);
    if (activeChild) updateJeChoice(activeChild.id, v);
  };

  const syncHepaChoice = (v: string | undefined) => {
    setHepaChoice(v);
    if (activeChild) updateHepaChoice(activeChild.id, v);
  };

  const choices = useMemo(() => {
    const c: Record<string, string> = {};
    if (jeChoice) c[JE_CHOICE_KEY] = jeChoice;
    if (hepaChoice) c[HEPA_CHOICE_KEY] = hepaChoice;
    return c;
  }, [jeChoice, hepaChoice]);

  // 按接种日期排序的一类疫苗列表
  const vaccineList = useMemo(() => {
    if (!birthDateStr) return [];
    return buildVaccineList(birthDateStr, vaccinated, choices)
      .filter(v => v.type === 'free')
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [birthDateStr, vaccinated, choices]);

  const toggleVaccinated = (doseKey: string) => {
    const next = new Set(vaccinated);
    if (next.has(doseKey)) next.delete(doseKey);
    else next.add(doseKey);
    syncVaccinated(next);
  };

  // 找到第一个 months >= 8 / >= 18 的疫苗索引（插入选择卡）
  const jeInsertIdx = vaccineList.findIndex(v => v.months >= 8);
  const hepaInsertIdx = vaccineList.findIndex(v => v.months >= 18);

  const renderFreeList = (list: VaccineListItem[]) => {
    const items: React.ReactNode[] = [];
    let jeInserted = false;
    let hepaInserted = false;

    list.forEach((v, i) => {
      if (!jeInserted && jeInsertIdx !== -1 && i === jeInsertIdx) {
        items.push(<JeChoiceCard key="je-choice" chosen={jeChoice} onChoose={syncJeChoice} />);
        jeInserted = true;
      }
      if (!hepaInserted && hepaInsertIdx !== -1 && i === hepaInsertIdx) {
        items.push(<HepaChoiceCard key="hepa-choice" chosen={hepaChoice} onChoose={syncHepaChoice} />);
        hepaInserted = true;
      }
      items.push(<FreeVaccineCard key={v.doseKey} v={v} onToggle={toggleVaccinated} />);
    });

    if (!jeInserted && list.length > 0) {
      items.push(<JeChoiceCard key="je-choice" chosen={jeChoice} onChoose={syncJeChoice} />);
    }
    if (!hepaInserted && list.length > 0) {
      items.push(<HepaChoiceCard key="hepa-choice" chosen={hepaChoice} onChoose={syncHepaChoice} />);
    }

    return items;
  };

  const pendingVaccines = vaccineList.filter(v => v.status !== 'done');
  const doneVaccines = vaccineList.filter(v => v.status === 'done');
  const displayedVaccines = filter === 'pending' ? pendingVaccines : filter === 'done' ? doneVaccines : vaccineList;

  return (
    <div className="vaccine-page ac-fade-up">
      <div className="page-header">
        <Button size="small" onClick={() => navigate('/')} className="back-btn">← 返回</Button>
        <h2 className="page-title">💉 疫苗接种计算器</h2>
      </div>

      <ChildSelector onChildChange={setActiveChild} />

      <Card className="vaccine-info">
        <div className="form-group">
          <label className="form-label">孩子的出生日期</label>
          <DateInput
            year={birthYear}
            month={birthMonth}
            day={birthDay}
            onYearChange={setBirthYear}
            onMonthChange={setBirthMonth}
            onDayChange={setBirthDay}
            maxYearsBack={6}
          />
          <p className="form-hint">选择后自动计算所有应种疫苗</p>
        </div>
      </Card>

      {/* 视图切换 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <Button
          type={viewMode === 'free' ? 'primary' : 'default'}
          onClick={() => setViewMode('free')}
          style={{ fontSize: '15px', padding: '8px 16px' }}
        >
          💉 一类疫苗
        </Button>
        <Button
          type={viewMode === 'paid' ? 'primary' : 'default'}
          onClick={() => setViewMode('paid')}
          style={{ fontSize: '15px', padding: '8px 16px' }}
        >
          💊 二类疫苗
        </Button>
        <Button
          type={viewMode === 'knowledge' ? 'primary' : 'default'}
          onClick={() => setViewMode('knowledge')}
          style={{ fontSize: '15px', padding: '8px 16px' }}
        >
          📖 接种知识
        </Button>
      </div>

      {/* 一类疫苗视图 */}
      {viewMode === 'free' && (
        <div>
          {!birthDateStr && (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p>请输入孩子出生日期开始计算</p>
            </div>
          )}

          {birthDateStr && (
            <>
              {filter === 'pending' && pendingVaccines.length === 0 && (
                <div style={{
                  padding: '20px',
                  background: 'var(--primary-bg)',
                  border: '2px solid var(--primary)',
                  borderRadius: 'var(--radius-base)',
                  textAlign: 'center',
                  marginBottom: '16px',
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>一类疫苗全部完成！</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>已按时完成所有免费疫苗接种</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                <Button type={filter === 'all' ? 'primary' : 'default'} onClick={() => setFilter('all')} size="small">
                  🗂️ 全部 {vaccineList.length > 0 && `(${vaccineList.length})`}
                </Button>
                <Button type={filter === 'done' ? 'primary' : 'default'} onClick={() => setFilter('done')} size="small">
                  ✔️ 已接种 {doneVaccines.length > 0 ? `(${doneVaccines.length})` : ''}
                </Button>
                <Button type={filter === 'pending' ? 'primary' : 'default'} onClick={() => setFilter('pending')} size="small">
                  ⏳ 待接种 {pendingVaccines.length > 0 ? `(${pendingVaccines.length})` : ''}
                </Button>
              </div>

              {displayedVaccines.length === 0 && !jeChoice && !hepaChoice ? (
                <div className="empty-state">
                  <div className="empty-state-icon">{filter === 'done' ? '💉' : filter === 'pending' ? '⏳' : '📋'}</div>
                  <p>{filter === 'done' ? '暂无已接种疫苗' : filter === 'pending' ? '没有待接种疫苗了' : '暂无疫苗记录'}</p>
                </div>
              ) : (
                <div className="vaccine-list">
                  {renderFreeList(displayedVaccines)}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 二类疫苗视图 */}
      {viewMode === 'paid' && (
        <div>
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-base)',
            marginBottom: '16px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}>
            💡 二类疫苗（自费）遵循"知情、自愿、自费"原则，家长可根据孩子情况选择接种。
          </div>
          <div>
            {getPaidVaccines().map(v => (
              <PaidVaccineCard key={v.id} v={v} />
            ))}
          </div>
        </div>
      )}

      {/* 接种知识视图 */}
      {viewMode === 'knowledge' && (
        <div>
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-base)',
            marginBottom: '20px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            💡 以下内容依据《国家免疫规划疫苗儿童免疫程序说明（2021年版）》，帮助家长了解接种规则与注意事项。
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...KNOWLEDGE_CARDS, ...KNOWLEDGE_CARDS_EXTRA].map((card, idx) => (
              <Card key={idx} color="default" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    flexShrink: 0,
                    width: '40px',
                    height: '40px',
                    background: 'var(--primary-bg)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-header)', marginBottom: '6px' }}>
                      {card.title}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {card.content}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-content)', borderRadius: '12px' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              📖 参考来源：《国家免疫规划疫苗儿童免疫程序说明（2021年版）》
            </p>
          </div>
        </div>
      )}

      {viewMode !== 'knowledge' && (
        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-content)', borderRadius: '12px' }}>
          <p className="text-sm text-muted">
            ⚠️ 疫苗接种信息根据国家免疫规划疫苗儿童免疫程序及说明（2021年版）制作，具体接种方案请遵医嘱。如有疑问请咨询当地疾控中心或社区卫生服务中心。
          </p>
        </div>
      )}
    </div>
  );
}
