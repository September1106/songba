import React, { useState, useEffect } from 'react';
import { Card, Button } from 'animal-island-ui';
import 'animal-island-ui/dist/index.css';

// ============================================================
// 核心计算：非周期非稳态噪声等效声级
// L_Aeq = 10 * lg(∑10^(0.1*L_Ai) / n)
// ============================================================
function calcPointNoise(values: number[]): number | null {
  if (values.length < 12) return null;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += Math.pow(10, 0.1 * values[i]);
  }
  return Math.round(10 * Math.log10(sum / values.length) * 10) / 10;
}

// 验证噪声值范围
function isValidNoise(v: number): boolean {
  return v >= 30 && v <= 120;
}

// ============================================================
// 页面组件
// ============================================================
const POINT_COUNT_OPTIONS = [
  { label: '1 个（＜50m²）', value: '1' },
  { label: '2 个（50~200m²）', value: '2' },
];

interface Props { embedded?: boolean; }
export default function NoisePage({ embedded = false }: Props) {
  const [pointCount, setPointCount] = useState<'1' | '2'>('2');
  const [values, setValues] = useState<Record<number, (string)[]>>({});
  const [pointResults, setPointResults] = useState<number[]>([]);
  const [finalResult, setFinalResult] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // 初始化测点数据
  useEffect(() => {
    const init: Record<number, string[]> = {};
    for (let i = 1; i <= 2; i++) {
      init[i] = Array(12).fill('');
    }
    setValues(init);
  }, []);

  const handlePointCountChange = (v: string) => {
    setPointCount(v as '1' | '2');
    setPointResults([]);
    setFinalResult(null);
    setErrors({});
  };

  const handleInputChange = (point: number, idx: number, val: string) => {
    // 只允许数字和最多一位小数
    const filtered = val.replace(/[^\d.]/g, '').match(/^\d*\.?\d{0,1}/)?.[0] || '';
    const num = parseFloat(filtered);

    setValues(prev => {
      const next = { ...prev };
      next[point] = [...prev[point]];
      next[point][idx] = filtered;
      return next;
    });

    // 清除错误
    const key = `${point}-${idx}`;
    if (errors[key] && filtered !== '' && !isNaN(num) && isValidNoise(num)) {
      setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  const handleInputBlur = (point: number, idx: number, val: string) => {
    const key = `${point}-${idx}`;
    if (val === '') return;
    const num = parseFloat(val);
    if (isNaN(num) || !isValidNoise(num)) {
      setErrors(prev => ({ ...prev, [key]: true }));
    }
  };

  const handleCalc = () => {
    const count = parseInt(pointCount);
    const newErrors: Record<string, boolean> = {};
    let hasEmpty = false;

    for (let p = 1; p <= count; p++) {
      for (let i = 0; i < 12; i++) {
        const key = `${p}-${i}`;
        const v = values[p]?.[i] ?? '';
        if (v === '') {
          hasEmpty = true;
        } else {
          const num = parseFloat(v);
          if (isNaN(num) || !isValidNoise(num)) {
            newErrors[key] = true;
          }
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('请输入正确的数值（30.0 ~ 120.0 之间的数字）！');
      return;
    }

    if (hasEmpty) {
      alert('请确保每个测点的12个测量值都已填写完整！');
      return;
    }

    const results: number[] = [];
    for (let p = 1; p <= count; p++) {
      const nums = (values[p] ?? []).map(Number);
      const r = calcPointNoise(nums);
      if (r !== null) results.push(r);
    }

    if (results.length !== count) {
      alert('每个测点需要填写12个有效测量值！');
      return;
    }

    setPointResults(results);
    const avg = results.reduce((a, b) => a + b, 0) / count;
    setFinalResult(Math.round(avg * 10) / 10);
  };

  const handleClear = () => {
    const cleared: Record<number, string[]> = {};
    for (let i = 1; i <= 2; i++) cleared[i] = Array(12).fill('');
    setValues(cleared);
    setPointResults([]);
    setFinalResult(null);
    setErrors({});
  };

  return (
    <div className="page" style={{ padding: '0 16px 32px' }}>
      {!embedded && (
        <div className="page-header">
          <h2 className="page-title">🔊 教室噪声计算</h2>
          <div className="page-desc">非周期非稳态噪声 · 连续12次测量值计算</div>
        </div>
      )}

      {/* 注意事项 */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 10 }}>📋 注意事项</div>
        <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#555', lineHeight: 1.8 }}>
          <strong>根据教室面积选择测量点数：</strong><br />
          • ＜50m² 设置 <strong>1个</strong> 测点，测点设置在教室中央<br />
          • 50m² ~ 200m² 设置 <strong>2个</strong> 测点，测点设置在教室对称点
        </div>
      </Card>

      {/* 设置测点数 */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 12 }}>⚙️ 设置测点数</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          {POINT_COUNT_OPTIONS.map(opt => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, color: 'var(--text-body)', padding: '8px 14px', border: '1.5px solid ' + (pointCount === opt.value ? 'var(--primary)' : 'var(--border)'), borderRadius: 8, background: pointCount === opt.value ? '#e8f0fe' : '#fff', transition: 'all 0.2s' }}>
              <input type="radio" name="pointCount" value={opt.value} checked={pointCount === opt.value} onChange={() => handlePointCountChange(opt.value)} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
              {opt.label}
            </label>
          ))}
        </div>

        {/* 测点输入框 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {Array.from({ length: parseInt(pointCount) }, (_, i) => i + 1).map(p => (
            <div key={p} style={{ background: '#f8fafc', border: '1.5px solid var(--border)', borderRadius: 10, padding: '14px 12px 16px' }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--primary)', marginBottom: 10, textAlign: 'center' }}>📍 测点 {p}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {Array.from({ length: 12 }, (_, i) => i).map(idx => {
                  const key = `${p}-${idx}`;
                  const val = values[p]?.[idx] ?? '';
                  const hasErr = errors[key];
                  return (
                    <input
                      key={idx}
                      type="text"
                      inputMode="decimal"
                      value={val}
                      placeholder={String(idx + 1)}
                      onChange={e => handleInputChange(p, idx, e.target.value)}
                      onBlur={e => handleInputBlur(p, idx, e.target.value)}
                      style={{
                        height: 32,
                        border: '1.5px solid ' + (hasErr ? '#e84040' : 'var(--border)'),
                        borderRadius: 6,
                        padding: '0 4px',
                        fontSize: 13,
                        textAlign: 'center',
                        width: '100%',
                        outline: 'none',
                        background: '#fff',
                        color: 'var(--text-body)',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <Button type="primary" onClick={handleCalc}>🧮 计算</Button>
          <Button type="default" onClick={handleClear}>🔄 清空所有值</Button>
        </div>
      </Card>

      {/* 结果 */}
      {pointResults.length > 0 && finalResult !== null ? (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 12 }}>📊 计算结果</div>
          {parseInt(pointCount) === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: pointResults.length > 0 ? 12 : 0 }}>
              {pointResults.map((r, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>📍 测点 {i + 1}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{r.toFixed(1)} <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>dB(A)</span></div>
                </div>
              ))}
            </div>
          )}
          <div style={{ background: '#e8f0fe', borderRadius: 10, padding: 16, textAlign: 'center', border: '2px solid var(--primary)' }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>🏫 教室噪声值</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary)' }}>{finalResult.toFixed(1)} <span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>dB(A)</span></div>
          </div>
        </Card>
      ) : (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔊</div>
            <div style={{ fontSize: 14 }}>请选择测点数并填写所有测量值后点击「计算」</div>
          </div>
        </Card>
      )}
    </div>
  );
}
