import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Select } from '@/lib';
import DateInput from '../components/DateInput';
import {
  heightStandardsMale, heightStandardsFemale,
  weightStandardsMale, weightStandardsFemale,
  getGrowthRecords, addGrowthRecord, deleteGrowthRecord,
} from '../data/growth_china';
import type { GrowthRecord, GrowthStandard } from '../data/growth_china';

type ViewMode = 'height' | 'weight';
type Gender = 'male' | 'female';

function calculateAgeMonths(birthDate: string, measureDate: string): number {
  const birth = new Date(birthDate);
  const measure = new Date(measureDate);
  let years = measure.getFullYear() - birth.getFullYear();
  let months = measure.getMonth() - birth.getMonth();
  let days = measure.getDate() - birth.getDate();
  if (days < 0) months--;
  return Math.max(0, years * 12 + months);
}

function findStandardMonth(ageMonths: number, standards: GrowthStandard[]): number {
  const exact = standards.find(s => s.month === ageMonths);
  if (exact) return ageMonths;
  const lower = standards.filter(s => s.month <= ageMonths);
  if (lower.length > 0) return Math.max(...lower.map(s => s.month));
  return standards[0].month;
}

function evaluateLevel(value: number, std: GrowthStandard): { level: string; percent: string } {
  if (value >= std.p97) return { level: '上等', percent: '≥P97' };
  if (value >= std.p90) return { level: '中上等', percent: '≥P90' };
  if (value >= std.p75) return { level: '中上等', percent: '≥P75' };
  if (value >= std.p50) return { level: '中等', percent: '≥P50' };
  if (value >= std.p25) return { level: '中等', percent: '≥P25' };
  if (value >= std.p10) return { level: '中下等', percent: '≥P10' };
  if (value >= std.p3)  return { level: '中下等', percent: '≥P3' };
  return { level: '下等', percent: '<P3' };
}

const PERCENTILE_COLORS: Array<{key: keyof GrowthStandard; label: string; dash?: boolean}> = [
  { key: 'p97', label: 'P97', dash: true },
  { key: 'p90', label: 'P90', dash: true },
  { key: 'p75', label: 'P75' },
  { key: 'p50', label: 'P50', dash: false },
  { key: 'p25', label: 'P25' },
  { key: 'p10', label: 'P10', dash: true },
  { key: 'p3',  label: 'P3',  dash: true },
];

export default function GrowthChinaPage() {
  const navigate = useNavigate();
  const [gender, setGender] = useState<Gender>('male');
  const [birthYear, setBirthYear] = useState<string>('');
  const [birthMonth, setBirthMonth] = useState<string>('');
  const [birthDay, setBirthDay] = useState<string>('');
  const [measureYear, setMeasureYear] = useState<string>(String(new Date().getFullYear()));
  const [measureMonth, setMeasureMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [measureDay, setMeasureDay] = useState<string>(String(new Date().getDate()));
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('height');
  const [records, setRecords] = useState<GrowthRecord[]>(() => getGrowthRecords());
  const [latestEval, setLatestEval] = useState<ReturnType<typeof computeLatestEval>>(null);

  const birthDateStr = useMemo(() => {
    if (!birthYear || !birthMonth || !birthDay) return '';
    return `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
  }, [birthYear, birthMonth, birthDay]);

  const measureDateStr = useMemo(() => {
    if (!measureYear || !measureMonth || !measureDay) return '';
    return `${measureYear}-${measureMonth.padStart(2, '0')}-${measureDay.padStart(2, '0')}`;
  }, [measureYear, measureMonth, measureDay]);

  const ageMonths = birthDateStr && measureDateStr ? calculateAgeMonths(birthDateStr, measureDateStr) : 0;

  const saveRecord = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if ((!h && !w) || ageMonths === 0) return;
    const clampedH = isNaN(h) ? 0 : Math.max(30, Math.min(199, h));
    const clampedW = isNaN(w) ? 0 : Math.max(1, Math.min(150, w));
    const record: GrowthRecord = {
      id: Date.now().toString(),
      date: measureDateStr,
      birthDate: birthDateStr,
      ageMonths,
      gender,
      ...(clampedH ? { height: clampedH } : {}),
      ...(clampedW ? { weight: clampedW } : {}),
    };
    addGrowthRecord(record);
    setRecords(getGrowthRecords());
    // 保存后立即更新最新评价，不依赖 viewMode
    const heightStd = (gender === 'male' ? heightStandardsMale : heightStandardsFemale).find(s => s.month === findStandardMonth(ageMonths, gender === 'male' ? heightStandardsMale : heightStandardsFemale))!;
    const weightStd = (gender === 'male' ? weightStandardsMale : weightStandardsFemale).find(s => s.month === findStandardMonth(ageMonths, gender === 'male' ? weightStandardsMale : weightStandardsFemale))!;
    setLatestEval({
      record,
      heightEval: clampedH ? evaluateLevel(clampedH, heightStd) : null,
      weightEval: clampedW ? evaluateLevel(clampedW, weightStd) : null,
    });
    setHeight('');
    setWeight('');
  };

  const removeRecord = (id: string) => {
    deleteGrowthRecord(id);
    setRecords(getGrowthRecords());
  };

  const getStandards = (): GrowthStandard[] => {
    if (viewMode === 'height') {
      return gender === 'male' ? heightStandardsMale : heightStandardsFemale;
    }
    return gender === 'male' ? weightStandardsMale : weightStandardsFemale;
  };

  const computeLatestEval = () => {
    const myRecords = records
      .filter(r => r.gender === gender)
      .sort((a, b) => b.ageMonths - a.ageMonths);
    if (myRecords.length === 0) return null;
    const latest = myRecords[0];
    const heightStd = (gender === 'male' ? heightStandardsMale : heightStandardsFemale).find(s => s.month === findStandardMonth(latest.ageMonths, gender === 'male' ? heightStandardsMale : heightStandardsFemale))!;
    const weightStd = (gender === 'male' ? weightStandardsMale : weightStandardsFemale).find(s => s.month === findStandardMonth(latest.ageMonths, gender === 'male' ? weightStandardsMale : weightStandardsFemale))!;
    return {
      record: latest,
      heightEval: latest.height ? evaluateLevel(latest.height, heightStd) : null,
      weightEval: latest.weight ? evaluateLevel(latest.weight, weightStd) : null,
    };
  };

  const getLatestEvaluation = useMemo(computeLatestEval, [records, gender, viewMode]);

  const renderChart = () => {
    const svgW = 580;
    const svgH = 560;
    const paddingLeft = 56;
    const paddingRight = 36;
    const paddingTop = 20;
    const paddingBottom = 50;

    const plotW = svgW - paddingLeft - paddingRight;
    const plotH = svgH - paddingTop - paddingBottom;
    const squareSize = Math.min(plotW, plotH);
    const offsetX = (plotW - squareSize) / 2;
    const offsetY = (plotH - squareSize) / 2;

    const maxMonth = 81;
    const standards = getStandards();
    const pKeys = ['p3', 'p10', 'p25', 'p50', 'p75', 'p90', 'p97'];

    const allValues = standards.flatMap(s => pKeys.map(k => s[k as keyof GrowthStandard] as number));
    const minVal = Math.floor(Math.min(...allValues) * 0.88);
    const maxVal = Math.ceil(Math.max(...allValues) * 1.06);
    const valRange = maxVal - minVal;

    const xScale = (month: number) => paddingLeft + offsetX + (month / maxMonth) * squareSize;
    const yScale = (val: number) => paddingTop + offsetY + squareSize - ((val - minVal) / valRange * squareSize);

    const pathLine = (data: typeof standards, key: string) => {
      return data.map((s, i) => {
        const x = xScale(s.month);
        const y = yScale(s[key as keyof GrowthStandard] as number);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      }).join(' ');
    };

    const userPoints = records
      .filter(r => r.gender === gender)
      .map(r => {
        const std = getStandards();
        const stdMonth = findStandardMonth(r.ageMonths, std);
        const std2 = std.find(s => s.month === stdMonth)!;
        return {
          x: xScale(stdMonth),
          heightY: r.height ? yScale(r.height) : null,
          weightY: r.weight ? yScale(r.weight) : null,
          height: r.height,
          weight: r.weight,
          ageMonths: r.ageMonths,
          heightEval: r.height ? evaluateLevel(r.height, std2) : null,
          weightEval: r.weight ? evaluateLevel(r.weight, std2) : null,
        };
      });

    const colors = ['#e8b4b8', '#e8c4a0', '#90d4a0', '#6fba2c', '#90d4a0', '#e8c4a0', '#e8b4b8'];

    const legendX = paddingLeft + offsetX + squareSize + 16;
    const legendY = paddingTop + offsetY + 14;

    return (
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="growth-chart" style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}>
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <line key={ratio}
            x1={paddingLeft + offsetX}
            y1={paddingTop + offsetY + squareSize * ratio}
            x2={paddingLeft + offsetX + squareSize}
            y2={paddingTop + offsetY + squareSize * ratio}
            stroke="#e8e0cc" strokeWidth="1" strokeDasharray="4,4"
          />
        ))}

        {PERCENTILE_COLORS.map(({ key, label, dash }, idx) => {
          const lastPt = standards[standards.length - 1];
          const lx = xScale(lastPt.month) + 6;
          const ly = yScale(lastPt[key as keyof GrowthStandard] as number);
          return (
            <g key={key}>
              <path d={pathLine(standards, key)} fill="none" stroke={colors[idx]} strokeWidth={key === 'p50' ? 3 : 1.5} strokeDasharray={dash ? '5,3' : '0'} opacity={key === 'p50' ? 1 : 0.65} />
              <text x={lx} y={ly + 4} fontSize="11" fill={colors[idx]} fontWeight={key === 'p50' ? 700 : 400}>{label}</text>
            </g>
          );
        })}

        {userPoints.map((p, i) => (
          <g key={i}>
            {(viewMode === 'height' ? p.heightY : p.weightY) && (
              <>
                <circle cx={p.x} cy={viewMode === 'height' ? p.heightY! : p.weightY!} r="5" fill={viewMode === 'height' ? '#5ba3d9' : '#b77dee'} stroke="#fff" strokeWidth="2" />
                <title>{viewMode === 'height'
                  ? `${p.ageMonths}月龄\n身高: ${p.height}cm\n${p.heightEval?.level || ''} ${p.heightEval?.percent || ''}`
                  : `${p.ageMonths}月龄\n体重: ${p.weight}kg\n${p.weightEval?.level || ''} ${p.weightEval?.percent || ''}`}</title>
              </>
            )}
          </g>
        ))}

        <line x1={paddingLeft + offsetX} y1={paddingTop + offsetY + squareSize} x2={paddingLeft + offsetX + squareSize} y2={paddingTop + offsetY + squareSize} stroke="#9f927d" strokeWidth="2" />
        <line x1={paddingLeft + offsetX} y1={paddingTop + offsetY} x2={paddingLeft + offsetX} y2={paddingTop + offsetY + squareSize} stroke="#9f927d" strokeWidth="2" />

        {[0, 12, 24, 36, 48, 60, 72].map(m => (
          <g key={m}>
            <line x1={xScale(m)} y1={paddingTop + offsetY + squareSize} x2={xScale(m)} y2={paddingTop + offsetY + squareSize + 6} stroke="#9f927d" strokeWidth="2" />
            <text x={xScale(m)} y={paddingTop + offsetY + squareSize + 18} fontSize="12" fill="#9f927d" textAnchor="middle">{m}月</text>
          </g>
        ))}
        <text x={paddingLeft + offsetX + squareSize / 2} y={svgH - 4} fontSize="12" fill="#9f927d" textAnchor="middle">月龄</text>

        {Array.from({ length: 7 }, (_, i) => {
          const val = minVal + valRange * (1 - i / 6);
          return (
            <g key={i}>
              <line x1={paddingLeft + offsetX - 6} y1={yScale(val)} x2={paddingLeft + offsetX} y2={yScale(val)} stroke="#9f927d" strokeWidth="2" />
              <text x={paddingLeft + offsetX - 10} y={yScale(val) + 4} fontSize="11" fill="#9f927d" textAnchor="end">
                {viewMode === 'height' ? `${val.toFixed(0)}cm` : `${val.toFixed(1)}kg`}
              </text>
            </g>
          );
        })}

      </svg>
    );
  };

  return (
    <div className="growth-page ac-fade-up">
      <div className="page-header">
        <Button size="small" onClick={() => navigate('/')} className="back-btn">← 返回</Button>
        <h2 className="page-title">📈 身高体重曲线</h2>
      </div>

      <Card className="growth-form">
        <div className="form-group">
          <label className="form-label">孩子的性别</label>
          <Select
            value={gender}
            onChange={val => setGender(val as Gender)}
            options={[{ key: 'male', label: '男孩' }, { key: 'female', label: '女孩' }]}
          />
        </div>
        <div className="form-group">
          <label className="form-label">出生日期</label>
          <DateInput
            year={birthYear} month={birthMonth} day={birthDay}
            onYearChange={setBirthYear} onMonthChange={setBirthMonth} onDayChange={setBirthDay}
            maxYearsBack={7}
          />
        </div>
        <div className="form-group">
          <label className="form-label">测量日期</label>
          <DateInput
            year={measureYear} month={measureMonth} day={measureDay}
            onYearChange={setMeasureYear} onMonthChange={setMeasureMonth} onDayChange={setMeasureDay}
            maxMonthsBack={6}
          />
        </div>
        {birthDateStr && (
          <div className="form-group">
            <label className="form-label">计算年龄：{Math.floor(ageMonths / 12)}岁{ageMonths % 12}个月</label>
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
            <label className="form-label">身高 (cm)</label>
            <Input
              type="number"
              value={height}
              onChange={e => setHeight(e.target.value)}
              onBlur={e => {
                const num = parseFloat(e.target.value);
                if (!isNaN(num) && (num < 30 || num > 199)) {
                  const clamped = num < 30 ? 30 : 199;
                  setHeight(clamped.toString());
                  e.target.value = clamped.toString();
                }
              }}
              placeholder="如: 75.5"
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
            <label className="form-label">体重 (kg)</label>
            <Input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              onBlur={e => {
                const num = parseFloat(e.target.value);
                if (!isNaN(num) && (num < 1 || num > 150)) {
                  const clamped = num < 1 ? 1 : 150;
                  setWeight(clamped.toString());
                  e.target.value = clamped.toString();
                }
              }}
              placeholder="如: 10.2"
            />
          </div>
        </div>
        <Button type="primary" onClick={saveRecord} style={{ width: '100%', marginTop: '8px' }}>📝 记录</Button>
      </Card>

      <Card className="mb-16">
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button type={viewMode === 'height' ? 'primary' : 'default'} onClick={() => setViewMode('height')} size="small">📏 身高曲线</Button>
          <Button type={viewMode === 'weight' ? 'primary' : 'default'} onClick={() => setViewMode('weight')} size="small">⚖️ 体重曲线</Button>
        </div>

      </Card>

      <Card className="growth-chart-container">
        {records.filter(r => r.gender === gender).length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📈</div><p>还没有记录，添加一条开始追踪生长曲线</p></div>
        ) : renderChart()}
      </Card>

      {latestEval && (
        <Card className="growth-evaluation">
          <h3 className="records-title">📋 发育评价 · 最新记录</h3>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            {latestEval.record.date} · {Math.floor(latestEval.record.ageMonths / 12)}岁{latestEval.record.ageMonths % 12}个月
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {latestEval.heightEval && (
              <div style={{ flex: 1, minWidth: '190px', padding: '14px', background: '#f0f7ff', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>身高 {latestEval.record.height}cm</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#2a7fc1', marginBottom: '4px' }}>{latestEval.heightEval.level}</div>
                <div style={{ fontSize: '13px', color: '#5a9fd4' }}>处于 {latestEval.heightEval.percent} 百分位数</div>
              </div>
            )}
            {latestEval.weightEval && (
              <div style={{ flex: 1, minWidth: '190px', padding: '14px', background: '#f5f0ff', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>体重 {latestEval.record.weight}kg</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#7c5cc4', marginBottom: '4px' }}>{latestEval.weightEval.level}</div>
                <div style={{ fontSize: '13px', color: '#9a7cd4' }}>处于 {latestEval.weightEval.percent} 百分位数</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {records.filter(r => r.gender === gender).length > 0 && (
        <Card className="growth-records">
          <h3 className="records-title">📋 记录列表（{gender === 'male' ? '男孩' : '女孩'}）</h3>
          {records
            .filter(r => r.gender === gender)
            .sort((a, b) => a.ageMonths - b.ageMonths)
            .map(record => (
              <div key={record.id} className="record-item">
                <div className="record-info">
                  <span className="record-date">{record.date}</span>
                  <span className="record-date">{Math.floor(record.ageMonths / 12)}岁{record.ageMonths % 12}个月</span>
                  {record.height && <span className="record-value">身高 {record.height}cm</span>}
                  {record.weight && <span className="record-value">体重 {record.weight}kg</span>}
                </div>
                <Button size="small" onClick={() => removeRecord(record.id)}>删除</Button>
              </div>
            ))}
        </Card>
      )}

      <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-content)', borderRadius: '12px' }}>
        <p className="text-sm text-muted">⚠️ 数据来源：WS/T 423-2022《7岁以下儿童生长标准》，适用于七岁以下儿童，仅供参考。如有生长发育疑问请咨询儿科医生。</p>
      </div>
    </div>
  );
}
