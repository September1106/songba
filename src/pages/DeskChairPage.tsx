import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/lib';
import { Select } from '@/lib/components/Select';
import 'animal-island-ui/dist/index.css';

/********************* 中小学生课桌椅数据（GB/T 3976-2014） *********************/
interface SchoolDesk {
  型号: string;
  桌高: number;
  椅高: number;
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

/********************* 幼儿园儿童桌椅数据 *********************/
interface KidDesk {
  型号: string;
  桌高: number;
  椅高: number;
  身高下限: number | null;
  身高上限: number | null;
  范围: string;
}

const kidData: KidDesk[] = [
  { 型号: '幼1号', 桌高: 52, 椅高: 29, 身高下限: 113, 身高上限: null,  范围: '≥113' },
  { 型号: '幼2号', 桌高: 49, 椅高: 27, 身高下限: 105, 身高上限: 119,   范围: '105～119' },
  { 型号: '幼3号', 桌高: 46, 椅高: 25, 身高下限: 98,  身高上限: 112,   范围: '98～112' },
  { 型号: '幼4号', 桌高: 43, 椅高: 23, 身高下限: 90,  身高上限: 104,   范围: '90～104' },
  { 型号: '幼5号', 桌高: 40, 椅高: 21, 身高下限: 83,  身高上限: 97,    范围: '83～97' },
  { 型号: '幼6号', 桌高: 37, 椅高: 19, 身高下限: 75,  身高上限: 89,    范围: '75～89' },
];

function inRange<T extends { 身高下限: number | null; 身高上限: number | null }>(height: number, d: T): boolean {
  if (d.身高下限 !== null && height < d.身高下限) return false;
  if (d.身高上限 !== null && height > d.身高上限) return false;
  return true;
}

function findMatches<T extends { 型号: string; 身高下限: number | null; 身高上限: number | null }>(height: number, data: T[]): T[] {
  if (!height || isNaN(height) || height < 1) return [];
  return data.filter(d => inRange(height, d));
}

interface SchoolRec { 桌型号: string; 椅型号: string; 桌高: number; 椅高: number; }
function buildSchoolRecs(matches: SchoolDesk[]): SchoolRec[] {
  if (matches.length === 0) return [];
  if (matches.length === 1) {
    const d = matches[0];
    return [{ 桌型号: d.型号, 椅型号: d.型号, 桌高: d.桌高, 椅高: d.椅高 }];
  }
  const [small, big] = matches;
  const recs: SchoolRec[] = [];
  recs.push({ 桌型号: small.型号, 椅型号: small.型号, 桌高: small.桌高, 椅高: small.椅高 });
  recs.push({ 桌型号: big.型号, 椅型号: big.型号, 桌高: big.桌高, 椅高: big.椅高 });
  if (small.型号 !== big.型号) {
    recs.push({ 桌型号: small.型号, 椅型号: big.型号, 桌高: small.桌高, 椅高: big.椅高 });
  }
  return recs;
}

interface KidRec { 桌型号: string; 椅型号: string; 桌高: number; 椅高: number; }
function buildKidRecs(matches: KidDesk[]): KidRec[] {
  return matches.map(d => ({ 桌型号: d.型号, 椅型号: d.型号, 桌高: d.桌高, 椅高: d.椅高 }));
}

type Stage = 'kindergarten' | 'school';

const STAGE_OPTIONS = [
  { key: 'kindergarten', label: '幼儿园' },
  { key: 'school', label: '中小学' },
];

export default function DeskChairPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage | ''>('');
  const [height, setHeight] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const h = parseFloat(height);

  const schoolMatches = findMatches(h, schoolData);
  const kidMatches = findMatches(h, kidData);
  const schoolRecs = buildSchoolRecs(schoolMatches);
  const kidRecs = buildKidRecs(kidMatches);

  const schoolTip = h && !isNaN(h) && h > 187 ? '身高超过187cm，建议使用0号课桌椅，或咨询学校/厂家定制' : null;
  const kidTip = h && !isNaN(h) && h < 75 ? '身高低于75cm，相关标准数据暂未覆盖' : null;

  const canSubmit = stage !== '' && height !== '';

  const handleStageChange = (s: Stage | '') => {
    setStage(s);
    setHeight('');
    setSubmitted(false);
  };

  const handleHeightChange = (v: string) => {
    setHeight(v);
    setSubmitted(false);
  };

  const handleConfirm = () => {
    if (!canSubmit) return;
    setSubmitted(true);
  };

  return (
    <div className="page" style={{ padding: '0 16px 32px' }}>
      <div className="page-header">
        <Button size="small" onClick={() => navigate('/')} className="back-btn" style={{ marginBottom: 8 }}>← 返回</Button>
        <h2 className="page-title">🪑 课桌椅搭配</h2>
      </div>

      {/* 学段选择 + 身高输入 — 同一个圆角矩形背景 */}
      <div style={{ background: '#F7F3DF', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>请选择孩子所在学段和身高</p>

        {/* 学段下拉 */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
            学段
          </label>
          <Select
            options={STAGE_OPTIONS}
            value={stage}
            onChange={(v) => handleStageChange(v as Stage)}
            placeholder="请选择学段"
          />
        </div>

        {/* 身高输入框 — 手动输入，限制 75~199 整数 */}
        <div>
          <label style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
            孩子身高（cm）
          </label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={height}
              onChange={(e) => {
                // 只允许数字，可自由输入/删除，范围校验放到 blur 时做
                const filtered = e.target.value.replace(/\D/g, '');
                handleHeightChange(filtered);
              }}
              onBlur={(e) => {
                const n = parseInt(e.target.value, 10);
                if (!isNaN(n) && n >= 75 && n <= 199) {
                  handleHeightChange(String(n));
                  e.target.value = String(n);
                } else {
                  // 超出范围则取最近的边界值
                  const clamped = Math.min(199, Math.max(75, n || 75));
                  handleHeightChange(String(clamped));
                  e.target.value = String(clamped);
                }
              }}
              placeholder={stage === '' ? '请先选择学段' : '75 ~ 199'}
              disabled={stage === ''}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                color: 'var(--text-body)',
                background: '#fff',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                outline: 'none',
                MozAppearance: 'textfield',
              }}
            />
            <Button
              type="primary"
              onClick={handleConfirm}
              disabled={!canSubmit}
              style={{ borderRadius: 12, fontSize: 14, padding: '0 16px', height: 44, flexShrink: 0 }}
            >
              确认
            </Button>
          </div>
        </div>

        {/* 匹配结果 */}
        {submitted && (
          <div style={{ marginTop: 16, padding: '16px', background: '#fff', borderRadius: 12, textAlign: 'center' }}>
            {/* 中小学模式 */}
            {stage === 'school' && (
              schoolTip ? (
                <>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>可适配桌椅型号</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    <span style={{ padding: '4px 12px', background: 'var(--primary)', color: '#fff', borderRadius: 20, fontSize: 14, fontWeight: 700 }}>0号</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>推荐搭配方案</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    <div style={{ padding: '10px 16px', background: 'var(--bg-content)', borderRadius: 10, fontSize: 14 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>桌高：79cm　椅高：46cm</span>
                      <span style={{ color: 'var(--text-muted)' }}>　（0号桌 + 0号椅）</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#c0392b', marginTop: 12 }}>{schoolTip}</p>
                </>
              ) : schoolRecs.length > 0 ? (
                <>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>可适配桌椅型号</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    {schoolMatches.map(d => (
                      <span key={d.型号} style={{ padding: '4px 12px', background: 'var(--primary)', color: '#fff', borderRadius: 20, fontSize: 14, fontWeight: 700 }}>{d.型号}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>推荐搭配方案</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    {schoolRecs.map((rec, i) => (
                      <div key={i} style={{ padding: '10px 16px', background: 'var(--bg-content)', borderRadius: 10, fontSize: 14 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text)' }}>桌高：{rec.桌高}cm　椅高：{rec.椅高}cm</span>
                        <span style={{ color: 'var(--text-muted)' }}>　（{rec.桌型号}桌 + {rec.椅型号}椅）</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>请输入有效身高（113～187cm）</p>
              )
            )}

            {/* 幼儿园模式 */}
            {stage === 'kindergarten' && (
              kidTip ? (
                <>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>匹配结果</p>
                  <p style={{ fontSize: 13, color: '#c0392b' }}>{kidTip}</p>
                </>
              ) : kidRecs.length > 0 ? (
                <>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>可适配桌椅型号</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    {kidMatches.map(d => (
                      <span key={d.型号} style={{ padding: '4px 12px', background: 'var(--primary)', color: '#fff', borderRadius: 20, fontSize: 14, fontWeight: 700 }}>{d.型号}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>推荐搭配方案</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    {kidRecs.map((rec, i) => (
                      <div key={i} style={{ padding: '10px 16px', background: 'var(--bg-content)', borderRadius: 10, fontSize: 14 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text)' }}>桌高：{rec.桌高}cm　椅高：{rec.椅高}cm</span>
                        <span style={{ color: 'var(--text-muted)' }}>　（{rec.桌型号}桌 + {rec.椅型号}椅）</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>请输入有效身高（≥75cm）</p>
              )
            )}
          </div>
        )}
      </div>

      {/* 中小学生桌椅型号对照表 */}
      <div style={{ padding: 16, background: 'var(--bg-content)', borderRadius: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-header)', marginBottom: 14 }}>📋 中小学生桌椅型号对照表</h3>
        <div className="animal-scrollable-5Wnhh">
          <table className="animal-table-Os4fM">
            <thead className="animal-thead-2ge5M">
              <tr className="animal-headerRow-sAsWX">
                {['课桌椅型号', '标准桌面高(cm)', '标准坐面高(cm)', '学生身高范围(cm)'].map((h, i) => (
                  <th key={i} className="animal-headerCell-LhL6h" style={{ textAlign: 'center' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="animal-tbody-3RGsp">
              {schoolData.map((row) => {
                const matched = stage === 'school' && schoolMatches.some(m => m.型号 === row.型号) || (h > 187 && row.型号 === '0号');
                return (
                  <tr key={row.型号} className="animal-row-iDOMw" style={matched ? { background: 'rgba(229,146,102,0.15)' } : undefined}>
                    <td className="animal-cell-4PAU2" style={{ textAlign: 'center', fontWeight: matched ? 700 : 500, color: matched ? 'var(--primary)' : undefined }}>{row.型号}</td>
                    <td className="animal-cell-4PAU2" style={{ textAlign: 'center' }}>{row.桌高}</td>
                    <td className="animal-cell-4PAU2" style={{ textAlign: 'center' }}>{row.椅高}</td>
                    <td className="animal-cell-4PAU2" style={{ textAlign: 'center', fontWeight: matched ? 700 : 500, color: matched ? 'var(--primary)' : undefined }}>{row.范围}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 儿童桌椅型号对照表 */}
      <div style={{ padding: 16, background: 'var(--bg-content)', borderRadius: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-header)', marginBottom: 14 }}>📋 儿童桌椅型号对照表</h3>
        <div className="animal-scrollable-5Wnhh">
          <table className="animal-table-Os4fM">
            <thead className="animal-thead-2ge5M">
              <tr className="animal-headerRow-sAsWX">
                {['课桌椅型号', '桌面高(cm)', '座面高(cm)', '学生身高范围(cm)'].map((h, i) => (
                  <th key={i} className="animal-headerCell-LhL6h" style={{ textAlign: 'center' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="animal-tbody-3RGsp">
              {kidData.map((row) => {
                const matched = stage === 'kindergarten' && kidMatches.some(m => m.型号 === row.型号);
                return (
                  <tr key={row.型号} className="animal-row-iDOMw" style={matched ? { background: 'rgba(229,146,102,0.15)' } : undefined}>
                    <td className="animal-cell-4PAU2" style={{ textAlign: 'center', fontWeight: matched ? 700 : 500, color: matched ? 'var(--primary)' : undefined }}>{row.型号}</td>
                    <td className="animal-cell-4PAU2" style={{ textAlign: 'center' }}>{row.桌高}</td>
                    <td className="animal-cell-4PAU2" style={{ textAlign: 'center' }}>{row.椅高}</td>
                    <td className="animal-cell-4PAU2" style={{ textAlign: 'center', fontWeight: matched ? 700 : 500, color: matched ? 'var(--primary)' : undefined }}>{row.范围}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6 }}>
          📌 数据来源：GB/T 3976-2014《学校课桌椅功能尺寸及技术要求》<br/>
          ⚠️ 每个身高通常可适配2个相邻型号，实际选择请结合孩子体型、教室环境综合考虑，具体请遵学校或厂家指导。
        </p>
      </div>
    </div>
  );
}