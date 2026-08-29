import React, { useState, useRef } from 'react';
import { Button } from '@/lib';
import { Card, Modal } from 'animal-island-ui';
import 'animal-island-ui/dist/index.css';
import * as XLSX from 'xlsx';

/********************* 中小学生课桌椅数据（GB/T 3976-2014） *********************/
interface SchoolDesk {
  型号: string;
  桌高: number;   // cm
  椅高: number;   // cm
  身高下限: number | null;
  身高上限: number | null;
  范围: string;
}

const schoolData: SchoolDesk[] = [
  { 型号: '0号',  桌高: 79, 椅高: 46, 身高下限: 180, 身高上限: null,  范围: '≥180' },
  { 型号: '1号',  桌高: 76, 椅高: 44, 身高下限: 173, 身高上限: 187,   范围: '173～187' },
  { 型号: '2号',  桌高: 73, 椅高: 42, 身高下限: 165, 身高上限: 179,   范围: '165～179' },
  { 型号: '3号',  桌高: 70, 椅高: 40, 身高下限: 158, 身高上限: 172,   范围: '158～172' },
  { 型号: '4号',  桌高: 67, 椅高: 38, 身高下限: 150, 身高上限: 164,   范围: '150～164' },
  { 型号: '5号',  桌高: 64, 椅高: 36, 身高下限: 143, 身高上限: 157,   范围: '143～157' },
  { 型号: '6号',  桌高: 61, 椅高: 34, 身高下限: 135, 身高上限: 149,   范围: '135～149' },
  { 型号: '7号',  桌高: 58, 椅高: 32, 身高下限: 128, 身高上限: 142,   范围: '128～142' },
  { 型号: '8号',  桌高: 55, 椅高: 30, 身高下限: 120, 身高上限: 134,   范围: '120～134' },
  { 型号: '9号',  桌高: 52, 椅高: 29, 身高下限: 113, 身高上限: 127,   范围: '113～127' },
  { 型号: '10号', 桌高: 49, 椅高: 27, 身高下限: null,  身高上限: 119,   范围: '≤119' },
];

const DEFAULT_GROUP_COUNT = 10;

const FIELD_LIMITS: Record<string, { min: number; max: number }> = {
  studentHeight: { min: 100, max: 199 },
  deskHeight: { min: 400, max: 900 },
  chairHeight: { min: 200, max: 600 },
};

interface GroupData {
  studentHeight: string;   // 身高 cm
  deskHeight: string;      // 桌高 mm
  chairHeight: string;     // 椅高 mm
}

interface GroupResult {
  index: number;
  studentHeight: number;
  deskHeight: number;     // mm
  chairHeight: number;    // mm
  heightModels: string[];  // 身高匹配的所有型号
  deskModel: string;      // 课桌号（就近）
  chairModel: string;     // 课椅号（就近）
  stdDeskHeight: number;   // 标准桌高 cm
  stdChairHeight: number; // 标准椅高 cm
  deskDiff: number;        // mm
  chairDiff: number;       // mm
  deskFit: boolean;        // true=符合, false=不符合
  chairFit: boolean;       // true=符合, false=不符合
  overallFit: boolean;     // true=均符合, false=不均符合
}

function inRange(height: number, d: SchoolDesk): boolean {
  if (d.身高下限 !== null && height < d.身高下限) return false;
  if (d.身高上限 !== null && height > d.身高上限) return false;
  return true;
}

function findMatchedModels(height: number): SchoolDesk[] {
  if (height < 113) return [];
  if (height >= 180) return [schoolData[0]];
  return schoolData.filter(d => inRange(height, d));
}

// 就近向下取号：小于标准值则取下一个（更小型号）；低于标准下限则返回 "—"
function findClosestDeskModel(deskMm: number): string {
  if (deskMm < 490) return '—';
  const exact = schoolData.find(d => d.桌高 * 10 === deskMm);
  if (exact) return exact.型号;
  let best = schoolData[0];
  let bestDiff = Math.abs(deskMm - best.桌高 * 10);
  for (const d of schoolData) {
    const diff = Math.abs(deskMm - d.桌高 * 10);
    if (diff < bestDiff) { bestDiff = diff; best = d; }
  }
  if (deskMm < best.桌高 * 10) {
    const idx = schoolData.indexOf(best);
    if (idx < schoolData.length - 1) best = schoolData[idx + 1];
  }
  return best.型号;
}

function findClosestChairModel(chairMm: number): string {
  if (chairMm < 270) return '—';
  const exact = schoolData.find(d => d.椅高 * 10 === chairMm);
  if (exact) return exact.型号;
  let best = schoolData[0];
  let bestDiff = Math.abs(chairMm - best.椅高 * 10);
  for (const d of schoolData) {
    const diff = Math.abs(chairMm - d.椅高 * 10);
    if (diff < bestDiff) { bestDiff = diff; best = d; }
  }
  if (chairMm < best.椅高 * 10) {
    const idx = schoolData.indexOf(best);
    if (idx < schoolData.length - 1) best = schoolData[idx + 1];
  }
  return best.型号;
}

// 符合标准：桌高偏差≤20mm，椅高偏差≤10mm
function evalFit(diff: number, type: 'desk' | 'chair'): boolean {
  const abs = Math.abs(diff);
  if (type === 'desk') return abs <= 20;
  return abs <= 10;
}

function buildResult(g: GroupData, idx: number): GroupResult | null {
  const h = parseInt(g.studentHeight);
  const dh = parseInt(g.deskHeight);
  const ch = parseInt(g.chairHeight);
  if (isNaN(h) || isNaN(dh) || isNaN(ch)) return null;

  const matched = findMatchedModels(h);
  // 身高低于113cm时，身高号固定为10号
  const heightModels: string[] = matched.length > 0 ? matched.map(m => m.型号) : ['10号'];
  const deskModel = findClosestDeskModel(dh);
  const chairModel = findClosestChairModel(ch);

  // 计算符合判断（身高113以下时 matched 为空，也需要正常计算）
  const std = matched.length > 0 ? matched[0] : schoolData[schoolData.length - 1];
  const stdDeskMm = std.桌高 * 10;
  const stdChairMm = std.椅高 * 10;
  const deskDiff = dh - stdDeskMm;
  const chairDiff = ch - stdChairMm;
  const deskFit = deskModel === '—' ? false : heightModels.includes(deskModel);
  const chairFit = chairModel === '—' ? false : heightModels.includes(chairModel);

  // 课桌椅均符合
  let overallFit = false;
  if (deskFit && chairFit) {
    if (heightModels.length === 1) {
      overallFit = deskModel === chairModel;
    } else if (heightModels.length === 2) {
      const [smallModel, bigModel] = heightModels;
      overallFit = (
        (deskModel === smallModel && chairModel === smallModel) ||
        (deskModel === bigModel && chairModel === bigModel) ||
        (deskModel === smallModel && chairModel === bigModel)
      );
    }
  }

  return {
    index: idx,
    studentHeight: h,
    deskHeight: dh,
    chairHeight: ch,
    heightModels,
    deskModel,
    chairModel,
    stdDeskHeight: std.桌高,
    stdChairHeight: std.椅高,
    deskDiff,
    chairDiff,
    deskFit,
    chairFit,
    overallFit,
  };
}

interface Props { embedded?: boolean; }
export default function DeskChairBatchPage({ embedded = false }: Props) {
  const [groups, setGroups] = useState<GroupData[]>(() => {
    try {
      const saved = sessionStorage.getItem('dcb_groups');
      if (saved) return JSON.parse(saved);
    } catch {}
    return Array.from({ length: DEFAULT_GROUP_COUNT }, () => ({ studentHeight: '', deskHeight: '', chairHeight: '' }));
  });
  const [results, setResults] = useState<GroupResult[]>(() => {
    try {
      const saved = sessionStorage.getItem('dcb_results');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleGroupChange = (idx: number, field: keyof GroupData, rawVal: string) => {
    let val = rawVal.replace(/\D/g, '');
    setGroups(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      try { sessionStorage.setItem('dcb_groups', JSON.stringify(next)); } catch {}
      return next;
    });
    const key = `${idx}-${field}`;
    if (errors[key]) {
      setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, boolean> = {};
    let hasEmpty = false;
    groups.forEach((g, idx) => {
      (['studentHeight', 'deskHeight', 'chairHeight'] as const).forEach(field => {
        const key = `${idx}-${field}`;
        if (g[field] === '') { hasEmpty = true; newErrors[key] = true; }
      });
    });
    if (hasEmpty) {
      setModalMsg('请填写所有必填项，身高、桌高、椅高每一项都不能为空！');
      setShowModal(true);
    }
    setErrors(newErrors);
    return !hasEmpty;
  };

  const handleCalc = () => {
    if (!validateAll()) return;
    const mapped = groups
      .map((g, idx) => buildResult(g, idx))
      .filter((r): r is GroupResult => r !== null);
    setResults(mapped);
    try { sessionStorage.setItem('dcb_results', JSON.stringify(mapped)); } catch {}
  };

  const handleClear = () => {
    setGroups(Array.from({ length: DEFAULT_GROUP_COUNT }, () => ({ studentHeight: '', deskHeight: '', chairHeight: '' })));
    setResults([]);
    setErrors({});
    try { sessionStorage.removeItem('dcb_groups'); sessionStorage.removeItem('dcb_results'); } catch {}
  };

  const total = results.length;
  const deskFitCount = results.filter(r => r.deskFit).length;
  const chairFitCount = results.filter(r => r.chairFit).length;
  const bothFitCount = results.filter(r => r.overallFit).length;

  return (
    <div className="page" style={{ padding: '0 16px 32px' }}>
      {!embedded && (
        <div className="page-header">
          <h2 className="page-title">📐 教室课桌分配符合率</h2>
          <div className="page-desc">批量分析学生身高与课桌椅高度匹配情况</div>
        </div>
      )}

      {/* 输入表格 */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 14 }}>📝 输入学生整数身高和课桌椅高度</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="animal-table-Os4fM">
            <thead className="animal-thead-2ge5M">
              <tr className="animal-headerRow-sAsWX">
                {['序号', '学生身高(cm)', '课桌高度(mm)', '课椅高度(mm)'].map((h, i) => (
                  <th key={i} className="animal-headerCell-LhL6h" style={{ textAlign: 'center' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="animal-tbody-3RGsp">
              {groups.map((g, idx) => {
                const rowErrors = (['studentHeight', 'deskHeight', 'chairHeight'] as const).map(f => errors[`${idx}-${f}`]);
                const hasErr = rowErrors.some(Boolean);
                return (
                  <tr key={idx} className="animal-row-iDOMw" style={hasErr ? { background: 'rgba(232,64,64,0.08)' } : undefined}>
                    <td className="animal-cell-4PAU2" style={{ textAlign: 'center', fontWeight: 500 }}>{idx + 1}</td>
                    {(['studentHeight', 'deskHeight', 'chairHeight'] as const).map(field => {
                      const key = `${idx}-${field}`;
                      const hasE = errors[key];
                      return (
                        <td key={field} className="animal-cell-4PAU2" style={{ padding: '4px' }}>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={g[field]}
                            ref={el => { inputRefs.current[`${idx}-${field}`] = el; }}
                            onChange={e => handleGroupChange(idx, field, e.target.value)}
                            onBlur={e => {
                              const v = e.target.value;
                              const n = parseInt(v);
                              if (v !== '' && (isNaN(n) || n < FIELD_LIMITS[field].min || n > FIELD_LIMITS[field].max)) {
                                setModalMsg('数值超过正常范围');
                                setShowModal(true);
                                const el = e.target as HTMLInputElement;
                                // 直接操作 state 和 sessionStorage
                                setGroups(prev => {
                                  const next = [...prev];
                                  next[idx] = { ...next[idx], [field]: '' };
                                  try { sessionStorage.setItem('dcb_groups', JSON.stringify(next)); } catch {}
                                  return next;
                                });
                                el.value = '';
                                setTimeout(() => {
                                  el.focus();
                                  el.select();
                                }, 0);
                              }
                            }}
                            placeholder={''}
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              textAlign: 'center',
                              padding: '6px 4px',
                              fontSize: 13,
                              color: 'var(--text-body)',
                              background: '#fff',
                              border: hasE ? '1.5px solid #e84040' : '1px solid var(--border-light)',
                              borderRadius: 6,
                              outline: 'none',
                              MozAppearance: 'textfield',
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <Button type="primary" onClick={() => handleCalc()}>🧮 开始分析</Button>
          <Button type="default" onClick={handleClear}>🔄 清空</Button>
        </div>
      </Card>

      {/* 结果 */}
      {results.length > 0 && (
        <>
          {/* 三个符合率卡片 */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            {[
              { label: '课桌符合率', count: deskFitCount, bg: '#82d5bb', color: '#fff' },
              { label: '课椅符合率', count: chairFitCount, bg: '#889df0', color: '#fff' },
              { label: '课桌椅符合率', count: bothFitCount, bg: '#e59266', color: '#fff' },
            ].map(card => {
              const pct = total > 0 ? Math.round((card.count / total) * 100) : 0;
              return (
                <div key={card.label} style={{ flex: 1, minWidth: 120, borderRadius: 16, textAlign: 'center', padding: '20px 12px', background: card.bg, color: card.color }}>
                  <div style={{ fontSize: 13, marginBottom: 8, opacity: 0.9 }}>{card.label}</div>
                  <div style={{ fontSize: 36, fontWeight: 800 }}>{pct}%</div>
                </div>
              );
            })}
          </div>

          {/* 明细表格 */}
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 14 }}>📋 详细结果</div>
            <div style={{ overflowX: 'auto' }}>
              <table className="animal-table-Os4fM">
                <thead className="animal-thead-2ge5M">
                  <tr className="animal-headerRow-sAsWX">
                    {['序号', '学生身高(cm)', '课桌高度(mm)', '课椅高度(mm)', '身高号', '课桌号', '课椅号', '课桌符合', '课椅符合', '课桌椅均符合'].map(h => (
                      <th key={h} className="animal-headerCell-LhL6h" style={{ textAlign: 'center' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="animal-tbody-3RGsp">
                  {results.map(r => {
                    const fitBg = '#f0fff4';
                    const noBg = '#fff0f0';
                    const fitBorder = '#30c758';
                    const noBorder = '#e84040';
                    return (
                      <tr key={r.index} className="animal-row-iDOMw">
                        <td className="animal-cell-4PAU2" style={{ textAlign: 'center', fontWeight: 600 }}>{r.index + 1}</td>
                        <td className="animal-cell-4PAU2" style={{ textAlign: 'center' }}>{r.studentHeight}</td>
                        <td className="animal-cell-4PAU2" style={{ textAlign: 'center' }}>{r.deskHeight}</td>
                        <td className="animal-cell-4PAU2" style={{ textAlign: 'center' }}>{r.chairHeight}</td>
                        <td className="animal-cell-4PAU2" style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                          {r.heightModels.length > 0 ? r.heightModels.join('、') : '—'}
                        </td>
                        <td className="animal-cell-4PAU2" style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>{r.deskModel}</td>
                        <td className="animal-cell-4PAU2" style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>{r.chairModel}</td>
                        <td className="animal-cell-4PAU2" style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 10px', borderRadius: 10, fontWeight: 700, fontSize: 12,
                            background: r.deskFit ? fitBg : noBg, color: r.deskFit ? fitBorder : noBorder,
                            border: `1.5px solid ${r.deskFit ? fitBorder : noBorder}`,
                          }}>
                            {r.deskFit ? '✓' : '✗'}
                          </span>
                        </td>
                        <td className="animal-cell-4PAU2" style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 10px', borderRadius: 10, fontWeight: 700, fontSize: 12,
                            background: r.chairFit ? fitBg : noBg, color: r.chairFit ? fitBorder : noBorder,
                            border: `1.5px solid ${r.chairFit ? fitBorder : noBorder}`,
                          }}>
                            {r.chairFit ? '✓' : '✗'}
                          </span>
                        </td>
                        <td className="animal-cell-4PAU2" style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 10px', borderRadius: 10, fontWeight: 700, fontSize: 12,
                            background: r.overallFit ? fitBg : noBg, color: r.overallFit ? fitBorder : noBorder,
                            border: `1.5px solid ${r.overallFit ? fitBorder : noBorder}`,
                          }}>
                            {r.overallFit ? '✓' : '✗'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <Modal
        open={showModal}
        title="⚠️ 数据错误"
        maskClosable
        footer={null}
        typewriter={false}
        onClose={() => setShowModal(false)}
      >
        {modalMsg}
      </Modal>
    </div>
  );
}
