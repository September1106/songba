import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Radio, Modal } from 'animal-island-ui';
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

function isValidNoise(v: number): boolean {
  return v >= 30 && v <= 120;
}

// ============================================================
// 页面组件
// ============================================================
const POINT_COUNT_OPTIONS = [
  { value: '1', label: '1 个（＜50m²）' },
  { value: '2', label: '2 个（50~200m²）' },
];

interface Props { embedded?: boolean; }
export default function NoisePage({ embedded = false }: Props) {
  const [pointCount, setPointCount] = useState<string>(() => {
    try { return sessionStorage.getItem('noise_pointCount') || '1'; } catch { return '1'; }
  });
  const [point1, setPoint1] = useState<string[]>(Array(12).fill(''));
  const [point2, setPoint2] = useState<string[]>(Array(12).fill(''));
  const [pointResults, setPointResults] = useState<number[]>([]);
  const [finalResult, setFinalResult] = useState<number | null>(null);

  // 初始化：从 sessionStorage 恢复数据
  useEffect(() => {
    try {
// pointCount restored via lazy init above
      const p1 = sessionStorage.getItem('noise_point1');
      if (p1) setPoint1(JSON.parse(p1));
      const p2 = sessionStorage.getItem('noise_point2');
      if (p2) setPoint2(JSON.parse(p2));
      const pr = sessionStorage.getItem('noise_results');
      if (pr) setPointResults(JSON.parse(pr));
      const fr = sessionStorage.getItem('noise_final');
      if (fr !== null) setFinalResult(JSON.parse(fr));
    } catch {}
  }, []);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');

  const saveState = (field: string, val: unknown) => {
    try { sessionStorage.setItem('noise_' + field, JSON.stringify(val)); } catch {}
  };

  const handlePointCountChange = (v: string) => {
    setPointCount(v);
    try { sessionStorage.setItem('noise_pointCount', v); } catch {}
  };

  const handleInputChange = useCallback((point: number, idx: number, rawVal: string) => {
    let val = rawVal.replace(/[^\d.]/g, '');
    const dotIdx = val.indexOf('.');
    if (dotIdx !== -1) {
      val = val.slice(0, dotIdx + 1) + val.slice(dotIdx + 1).replace(/\./g, '').slice(0, 1);
    }
    // 范围限制：超过120弹窗并清空
    if (val !== '' && val !== '.') {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 120) {
        setModalMsg('教室噪声数值错误');
        setShowModal(true);
        val = '';
      }
    }

    const key = `${point}-${idx}`;
    const setter = point === 1 ? setPoint1 : setPoint2;
    setter(prev => {
      const next = [...prev];
      next[idx] = val;
      saveState(point === 1 ? 'point1' : 'point2', next);
      return next;
    });

    // 清除错误
    const num = parseFloat(val);
    if (errors[key] && val !== '' && !isNaN(num) && isValidNoise(num)) {
      setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  }, [errors]);

  const handleInputBlur = useCallback((point: number, idx: number, rawVal: string) => {
    if (rawVal === '') return;
    const num = parseFloat(rawVal);
    if (isNaN(num) || num < 30 || num > 120) {
      setModalMsg('教室噪声数值错误');
      setShowModal(true);
      const setter = point === 1 ? setPoint1 : setPoint2;
      setter(prev => {
        const next = [...prev];
        next[idx] = '';
        saveState(point === 1 ? 'point1' : 'point2', next);
        return next;
      });
    }
  }, []);

  const handleCalc = () => {
    const count = parseInt(pointCount);
    const newErrors: Record<string, boolean> = {};
    let hasEmpty = false;

    for (let p = 1; p <= count; p++) {
      const vals = p === 1 ? point1 : point2;
      for (let i = 0; i < 12; i++) {
        const key = `${p}-${i}`;
        const v = vals[i];
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
      const vals = p === 1 ? point1 : point2;
      const nums = vals.map(Number);
      const r = calcPointNoise(nums);
      if (r !== null) results.push(r);
    }

    if (results.length !== count) {
      alert('每个测点需要填写12个有效测量值！');
      return;
    }

    setPointResults(results);
    saveState('results', results);
    const avg = results.reduce((a, b) => a + b, 0) / count;
    const rounded = Math.round(avg * 10) / 10;
    setFinalResult(rounded);
    saveState('final', rounded);
  };

  const handleClear = () => {
    setPoint1(Array(12).fill(''));
    setPoint2(Array(12).fill(''));
    setPointResults([]);
    setFinalResult(null);
    setErrors({});
    try {
      sessionStorage.removeItem('noise_pointCount');
      sessionStorage.removeItem('noise_point1');
      sessionStorage.removeItem('noise_point2');
      sessionStorage.removeItem('noise_results');
      sessionStorage.removeItem('noise_final');
    } catch {}
  };

  const getValues = (p: number) => p === 1 ? point1 : point2;

  const hasValidCount = parseInt(pointCount) >= 1;
  const allFilled = hasValidCount && Array.from({ length: parseInt(pointCount) }, (_, p) => p + 1).every(pNum => {
    const vals = getValues(pNum);
    return vals.every(v => v !== '');
  });

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
        <div style={{ marginBottom: 16 }}>
          <Radio
            options={POINT_COUNT_OPTIONS}
            value={pointCount}
            onChange={v => handlePointCountChange(v as string)}
            direction="horizontal"
          />
        </div>

        {/* 测点输入框 - 左右排列 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: parseInt(pointCount) }, (_, p) => p + 1).map(pNum => (
            <div key={pNum} style={{ background: '#f8fafc', border: '1.5px solid var(--border)', borderRadius: 10, padding: '14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--primary)', minWidth: 160, textAlign: 'center', flexShrink: 0, alignSelf: 'flex-start', paddingTop: 4 }}>测点 {pNum}<br/>噪声测量值（dB）</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {Array.from({ length: 12 }, (_, i) => {
                  const vals = getValues(pNum);
                  const key = `${pNum}-${i}`;
                  const val = vals[i] ?? '';
                  const hasErr = errors[key];
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{i + 1}</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={val}
                        onChange={e => handleInputChange(pNum, i, e.target.value)}
                        onBlur={e => handleInputBlur(pNum, i, e.target.value)}
                        style={{
                          textAlign: 'center',
                          width: 52,
                          height: 34,
                          padding: '0 4px',
                          fontSize: 14,
                          color: 'var(--text-body)',
                          background: '#fff',
                          border: hasErr ? '1.5px solid #e84040' : '1px solid var(--border-light)',
                          borderRadius: 8,
                          outline: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          MozAppearance: 'textfield',
                          WebkitAppearance: 'textfield',
                          appearance: 'textfield',
                          display: 'block',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <Button type="primary" disabled={!allFilled} onClick={handleCalc}>🧮 计算</Button>
          <Button type="default" disabled={!allFilled} onClick={handleClear}>🔄 清空所有值</Button>
        </div>
      </Card>

      {/* 结果 */}
      {finalResult !== null && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 12 }}>📊 计算结果</div>
          {parseInt(pointCount) === 2 && pointResults.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
              {pointResults.map((r, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>测点 {i + 1}</div>
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
