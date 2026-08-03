import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Select } from '@/lib';
import { Typewriter } from 'animal-island-ui';
import DateInput from '../components/DateInput';
import {
  bmiStandards,
  getBMIRecords,
  addBMIRecord,
  deleteBMIRecord,
  calculateHalfYearAge,
  evaluateBMIMalnutrition,
} from '../data/bmi_evaluation';
import type { BMIRecord, BMICutoff } from '../data/bmi_evaluation';

type Gender = 'male' | 'female';

function findStandard(ageYears: number, sex: '男' | '女'): BMICutoff | undefined {
  // 精确匹配
  const exact = bmiStandards.find(s => s.age_years === ageYears && s.sex === sex);
  if (exact) return exact;
  // 向下取半岁
  const candidates = bmiStandards.filter(s => s.sex === sex && s.age_years <= ageYears);
  if (candidates.length > 0) return candidates.sort((a, b) => b.age_years - a.age_years)[0];
  return bmiStandards.filter(s => s.sex === sex).sort((a, b) => a.age_years - b.age_years)[0];
}

export default function BMIEvaluationPage() {
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
  const [records, setRecords] = useState<BMIRecord[]>(() => getBMIRecords());
  const [latestEval, setLatestEval] = useState<BMIRecord | null>(null);

  const birthDateStr = useMemo(() => {
    if (!birthYear || !birthMonth || !birthDay) return '';
    return `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
  }, [birthYear, birthMonth, birthDay]);

  const measureDateStr = useMemo(() => {
    if (!measureYear || !measureMonth || !measureDay) return '';
    return `${measureYear}-${measureMonth.padStart(2, '0')}-${measureDay.padStart(2, '0')}`;
  }, [measureYear, measureMonth, measureDay]);

  const ageYears = useMemo(() => {
    if (!birthDateStr || !measureDateStr) return null;
    return calculateHalfYearAge(birthDateStr, measureDateStr);
  }, [birthDateStr, measureDateStr]);

  const computedBMI = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return null;
    return Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
  }, [height, weight]);

  const saveRecord = () => {
    if (!birthDateStr || !measureDateStr || computedBMI === null || ageYears === null) return;
    if (ageYears < 6 || ageYears > 18) return;
    const sex = gender === 'male' ? '男' : '女';
    const cutoff = findStandard(ageYears, sex);
    if (!cutoff) return;
    const { level, levelDesc } = evaluateBMIMalnutrition(computedBMI, cutoff);
    const record: BMIRecord = {
      id: Date.now().toString(),
      date: measureDateStr,
      birthDate: birthDateStr,
      ageYears,
      gender,
      height: parseFloat(height),
      weight: parseFloat(weight),
      bmi: computedBMI,
      level,
      levelDesc,
    };
    addBMIRecord(record);
    setRecords(getBMIRecords());
    setLatestEval(record);
    setHeight('');
    setWeight('');
  };

  const removeRecord = (id: string) => {
    deleteBMIRecord(id);
    setRecords(getBMIRecords());
    setLatestEval(null);
  };

  const standards = useMemo(() => {
    return bmiStandards.filter(s => s.sex === (gender === 'male' ? '男' : '女'));
  }, [gender]);

  const renderChart = () => {
    const svgW = 580;
    const svgH = 500;
    const paddingLeft = 56;
    const paddingRight = 36;
    const paddingTop = 20;
    const paddingBottom = 50;

    const plotW = svgW - paddingLeft - paddingRight;
    const plotH = svgH - paddingTop - paddingBottom;
    const squareSize = Math.min(plotW, plotH);
    const offsetX = (plotW - squareSize) / 2;
    const offsetY = (plotH - squareSize) / 2;

    const minAge = 6;
    const maxAge = 18;
    const minBMI = 10;
    const maxBMI = 32;

    const xScale = (age: number) => paddingLeft + offsetX + ((age - minAge) / (maxAge - minAge)) * squareSize;
    const yScale = (bmi: number) => paddingTop + offsetY + squareSize - ((bmi - minBMI) / (maxBMI - minBMI) * squareSize);

    const pathLine = (data: BMICutoff[], key: keyof BMICutoff) => {
      return data.map((s, i) => {
        const x = xScale(s.age_years);
        const y = yScale(s[key] as number);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      }).join(' ');
    };

    const userPoints = records
      .filter(r => r.gender === gender)
      .map(r => {
        const cutoff = findStandard(r.ageYears, gender === 'male' ? '男' : '女');
        const { level } = cutoff ? evaluateBMIMalnutrition(r.bmi, cutoff) : { level: '未知' };
        return { ...r, cutoff, level };
      });

    const levelColor = (level: string) => {
      if (level === '肥胖') return '#e84040';
      if (level === '超重') return '#f0a030';
      if (level === '正常') return '#30c758';
      if (level === '轻度消瘦') return '#3b82f6';
      return '#9f927d';
    };

    const ageTicks = [];
    for (let a = 6; a <= 18; a += 0.5) {
      const label = a % 1 === 0 ? `${a}岁` : '';
      ageTicks.push({ age: a, label });
    }

    return (
      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}>
        {/* 背景格子 */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <line key={ratio}
            x1={paddingLeft + offsetX}
            y1={paddingTop + offsetY + squareSize * ratio}
            x2={paddingLeft + offsetX + squareSize}
            y2={paddingTop + offsetY + squareSize * ratio}
            stroke="#e8e0cc" strokeWidth="1" strokeDasharray="4,4"
          />
        ))}

        {/* 四根曲线 */}
        <path d={pathLine(standards, 'moderate_severe_thinness_bmi')} fill="none" stroke="#2563eb" strokeWidth={2} strokeDasharray="5,3" opacity={0.8} />
        <path d={pathLine(standards, 'mild_thinness_bmi')} fill="none" stroke="#7c3aed" strokeWidth={2} strokeDasharray="5,3" opacity={0.8} />
        <path d={pathLine(standards, 'overweight_bmi')} fill="none" stroke="#ea580c" strokeWidth={2} strokeDasharray="5,3" opacity={0.85} />
        <path d={pathLine(standards, 'obese_bmi')} fill="none" stroke="#dc2626" strokeWidth={2} strokeDasharray="5,3" />

        {/* 四根曲线的图例标签 */}
        {[
          { key: 'moderate_severe_thinness_bmi' as const, label: '中重度消瘦', color: '#2563eb' },
          { key: 'mild_thinness_bmi' as const, label: '轻度消瘦', color: '#7c3aed' },
          { key: 'overweight_bmi' as const, label: '超重', color: '#ea580c' },
          { key: 'obese_bmi' as const, label: '肥胖', color: '#dc2626' },
        ].map(({ key, label, color }) => {
          const lastPt = standards[standards.length - 1];
          const lx = xScale(lastPt.age_years) + 6;
          const ly = yScale(lastPt[key] as number);
          return (
            <g key={key}>
              <text x={lx} y={ly + 4} fontSize="11" fill={color} fontWeight={400}>{label}</text>
            </g>
          );
        })})

        {/* 用户数据点 */}
        {userPoints.map((p, i) => (
          <g key={p.id}>
            <circle
              cx={xScale(p.ageYears)}
              cy={yScale(p.bmi)}
              r="5"
              fill={levelColor(p.level)}
              stroke="#fff"
              strokeWidth="2"
            />
            <title>{p.date} · {p.ageYears}岁\nBMI: {p.bmi}\n{p.levelDesc}</title>
          </g>
        ))}

        {/* 坐标轴 */}
        <line x1={paddingLeft + offsetX} y1={paddingTop + offsetY + squareSize} x2={paddingLeft + offsetX + squareSize} y2={paddingTop + offsetY + squareSize} stroke="#9f927d" strokeWidth="2" />
        <line x1={paddingLeft + offsetX} y1={paddingTop + offsetY} x2={paddingLeft + offsetX} y2={paddingTop + offsetY + squareSize} stroke="#9f927d" strokeWidth="2" />

        {/* X轴刻度 */}
        {ageTicks.filter(t => t.label).map(t => (
          <g key={t.age}>
            <line x1={xScale(t.age)} y1={paddingTop + offsetY + squareSize} x2={xScale(t.age)} y2={paddingTop + offsetY + squareSize + 6} stroke="#9f927d" strokeWidth="2" />
            <text x={xScale(t.age)} y={paddingTop + offsetY + squareSize + 18} fontSize="12" fill="#9f927d" textAnchor="middle">{t.label}</text>
          </g>
        ))}
        <text x={paddingLeft + offsetX + squareSize / 2} y={svgH - 4} fontSize="12" fill="#9f927d" textAnchor="middle">年龄（岁）</text>

        {/* Y轴刻度 */}
        {Array.from({ length: 9 }, (_, i) => {
          const bmi = minBMI + (maxBMI - minBMI) * (1 - i / 8);
          return (
            <g key={i}>
              <line x1={paddingLeft + offsetX - 6} y1={yScale(bmi)} x2={paddingLeft + offsetX} y2={yScale(bmi)} stroke="#9f927d" strokeWidth="2" />
              <text x={paddingLeft + offsetX - 10} y={yScale(bmi) + 4} fontSize="11" fill="#9f927d" textAnchor="end">{bmi.toFixed(0)}</text>
            </g>
          );
        })}
        <text x={14} y={paddingTop + offsetY + squareSize / 2} fontSize="12" fill="#9f927d" textAnchor="middle" transform={`rotate(-90, 14, ${paddingTop + offsetY + squareSize / 2})`}>BMI (kg/m²)</text>
      </svg>
    );
  };

  const levelBadgeColor = (level: string) => {
    if (level === '肥胖') return { bg: '#fff0f0', color: '#e84040', border: '#e84040' };
    if (level === '超重') return { bg: '#fff8f0', color: '#d47900', border: '#f0a030' };
    if (level === '正常') return { bg: '#f0fff4', color: '#30c758', border: '#30c758' };
    if (level === '轻度消瘦') return { bg: '#f0f8ff', color: '#3b82f6', border: '#3b82f6' };
    return { bg: '#f5f5f5', color: '#666', border: '#999' };
  };

  return (
    <div className="growth-page ac-fade-up">
      <div className="page-header">
        <h2 className="page-title">⚖️ 6~18岁儿童发育评价</h2>
        <div className="page-desc"><Typewriter speed={60}>计算BMI值，评估消瘦、超重与肥胖</Typewriter></div>
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
            minDate={`${new Date().getFullYear() - 18}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
            maxDate={`${new Date().getFullYear() - 6}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
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
        {ageYears !== null && (
          <div className="form-group">
            <label className="form-label">年龄：{ageYears} 岁</label>
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
                if (!isNaN(num) && (num < 50 || num > 220)) {
                  const clamped = num < 50 ? 50 : 220;
                  setHeight(clamped.toString());
                  e.target.value = clamped.toString();
                }
              }}
              placeholder="如: 135.5"
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
                if (!isNaN(num) && (num < 10 || num > 150)) {
                  const clamped = num < 10 ? 10 : 150;
                  setWeight(clamped.toString());
                  e.target.value = clamped.toString();
                }
              }}
              placeholder="如: 32.5"
            />
          </div>
        </div>
        {computedBMI !== null && ageYears !== null && (
          <div style={{ padding: '10px 14px', background: '#f0f7ff', borderRadius: '8px', textAlign: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#555' }}>BMI = </span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#2a7fc1' }}>{computedBMI}</span>
            <span style={{ fontSize: '14px', color: '#555' }}> kg/m²</span>
          </div>
        )}
        <Button type="primary" onClick={saveRecord} style={{ width: '100%', marginTop: '8px' }}>📝 记录</Button>
      </Card>

      <Card className="growth-chart-container">
        {records.filter(r => r.gender === gender).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>还没有记录，添加一条开始查看发育评价</p>
          </div>
        ) : renderChart()}
      </Card>

      {latestEval && (
        <Card className="growth-evaluation">
          <h3 className="records-title">📋 发育评价 · 最新记录</h3>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            {latestEval.date} · {latestEval.ageYears}岁
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '190px', padding: '14px', background: '#f0f7ff', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>身高体重</div>
              <div style={{ fontSize: '14px', color: '#333', marginBottom: '4px' }}>{latestEval.height}cm / {latestEval.weight}kg</div>
              <div style={{ fontSize: '14px', color: '#888' }}>BMI {latestEval.bmi} kg/m²</div>
            </div>
            {(() => {
              const badge = levelBadgeColor(latestEval.level);
              return (
                <div style={{ flex: 1, minWidth: '190px', padding: '14px', background: badge.bg, borderRadius: '10px', border: `1.5px solid ${badge.border}` }}>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>发育评价</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: badge.color, marginBottom: '4px' }}>{latestEval.level}</div>
                  <div style={{ fontSize: '13px', color: badge.color }}>{latestEval.levelDesc}</div>
                </div>
              );
            })()}
          </div>
        </Card>
      )}

      {records.filter(r => r.gender === gender).length > 0 && (
        <Card className="growth-records">
          <h3 className="records-title">📋 记录列表（{gender === 'male' ? '男孩' : '女孩'}）</h3>
          {records
            .filter(r => r.gender === gender)
            .sort((a, b) => a.ageYears - b.ageYears)
            .map(record => {
              const badge = levelBadgeColor(record.level);
              return (
                <div key={record.id} className="record-item">
                  <div className="record-info">
                    <span className="record-date">{record.date}</span>
                    <span style={{color:'#999',margin:'0 2px'}}>，</span>
                    <span className="record-date">{record.ageYears}岁</span>
                    <span style={{color:'#999',margin:'0 2px'}}>，</span>
                    <span className="record-value">身高 {record.height}cm</span>
                    <span style={{color:'#999',margin:'0 2px'}}>，</span>
                    <span className="record-value">体重 {record.weight}kg</span>
                    <span style={{color:'#999',margin:'0 2px'}}>，</span>
                    <span className="record-value">BMI {record.bmi}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: badge.color, padding: '2px 8px', background: badge.bg, borderRadius: '6px', border: `1px solid ${badge.border}` }}>{record.level}</span>
                  </div>
                  <Button size="small" onClick={() => removeRecord(record.id)}>删除</Button>
                </div>
              );
            })}
        </Card>
      )}

      <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-content)', borderRadius: '12px' }}>
        <p className="text-sm text-muted">⚠️ 数据来源：WS/T 456-2014《学龄儿童青少年营养不良筛查》、WS/T 586-2018《学龄儿童青少年超重与肥胖筛查》，适用于6~18岁儿童青少年，仅供参考。</p>
      </div>
    </div>
  );
}
