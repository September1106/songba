import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/lib';

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

function filterInput(value: string): string {
  return value.replace(/[^0-9]/g, '').replace(/^(\d{3,}).*/, '$1').replace(/^(\d{2,3}).*/, '$1');
}

type Stage = 'school' | 'kindergarten';

export default function DeskChairPage() {
  const navigate = useNavigate();
  const [height, setHeight] = useState('');
  const [stage, setStage] = useState<Stage | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const h = parseFloat(height);

  const schoolMatches = findMatches(h, schoolData);
  const kidMatches = findMatches(h, kidData);
  const schoolRecs = buildSchoolRecs(schoolMatches);
  const kidRecs = buildKidRecs(kidMatches);

  const schoolTip = h && !isNaN(h) && h > 187 ? '身高超过187cm，建议使用0号课桌椅，或咨询学校/厂家定制' : null;
  const kidTip = h && !isNaN(h) && h < 75 ? '身高低于75cm，相关标准数据暂未覆盖' : null;

  const canSubmit = stage !== null && height !== '';

  const handleConfirm = () => {
    if (!canSubmit) return;
    setSubmitted(true);
  };

  const handleStageChange = (s: Stage) => {
    setStage(s);
    setHeight('');
    setSubmitted(false);
  };

  return (
    <div className="page" style={{ padding: '0 16px 32px' }}>
      <div className="page-header">
        <Button size="small" onClick={() => navigate('/')} className="back-btn" style={{ marginBottom: 8 }}>← 返回</Button>
        <h2 className="page-title">🪑 课桌椅搭配</h2>
      </div>

      {/* 学段选择 + 身高输入 — 同一个圆角矩形背景 */}
      <div style={{ background: '#F7F3DF', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>请先选择孩子所在学段</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div
            onClick={() => handleStageChange('kindergarten')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 'var(--radius-base)',
              background: stage === 'kindergarten' ? 'var(--primary)' : 'var(--bg-secondary)',
              color: stage === 'kindergarten' ? '#fff' : 'var(--text-body)',
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            幼儿园
          </div>
          <div
            onClick={() => handleStageChange('school')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 'var(--radius-base)',
              background: stage === 'school' ? 'var(--primary)' : 'var(--bg-secondary)',
              color: stage === 'school' ? '#fff' : 'var(--text-body)',
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            中小学
          </div>
        </div>

        {/* 身高输入 */}
        <div>
          <label style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
            孩子身高（cm）
          </label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
            <input
              type="number"
              value={height}
              onChange={e => { setHeight(filterInput(e.target.value)); setSubmitted(false); }}
              placeholder={stage === null ? '请先选择学段' : '请输入身高'}
              disabled={stage === null}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                border: '1.5px solid var(--border)',
                fontSize: 16,
                outline: 'none',
                background: stage === null ? 'var(--bg-secondary)' : '#fff',
                color: 'var(--text)',
                cursor: stage === null ? 'not-allowed' : 'text',
              }}
            />
            <Button
              type="primary"
              onClick={handleConfirm}
              disabled={!canSubmit}
              style={{ borderRadius: 12, fontSize: 14, padding: '0 16px', height: 44 }}
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
      <div style={{ padding: '16px', background: 'var(--bg-content)', borderRadius: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-header)', marginBottom: 14 }}>📋 中小学生桌椅型号对照表</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                {['课桌椅型号', '标准桌面高(cm)', '标准坐面高(cm)', '学生身高范围(cm)'].map((h, i) => (
                  <th key={i} style={{ padding: '8px 8px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schoolData.map((row) => {
                const matched = stage === 'school' && schoolMatches.some(m => m.型号 === row.型号) || (h > 187 && row.型号 === '0号');
                return (
                  <tr key={row.型号} style={{ borderBottom: '1px solid var(--border)', background: matched ? 'rgba(229,146,102,0.15)' : 'transparent' }}>
                    <td style={{ padding: '9px 8px', textAlign: 'center', fontWeight: matched ? 700 : 400, color: matched ? 'var(--primary)' : 'var(--text)' }}>{row.型号}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'center' }}>{row.桌高}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'center' }}>{row.椅高}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'center', color: matched ? 'var(--primary)' : 'var(--text)', fontWeight: matched ? 700 : 400 }}>{row.范围}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 儿童桌椅型号对照表 */}
      <div style={{ padding: '16px', background: 'var(--bg-content)', borderRadius: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-header)', marginBottom: 14 }}>📋 儿童桌椅型号对照表</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                {['课桌椅型号', '桌面高(cm)', '座面高(cm)', '学生身高范围(cm)'].map((h, i) => (
                  <th key={i} style={{ padding: '8px 8px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kidData.map((row) => {
                const matched = stage === 'kindergarten' && kidMatches.some(m => m.型号 === row.型号);
                return (
                  <tr key={row.型号} style={{ borderBottom: '1px solid var(--border)', background: matched ? 'rgba(229,146,102,0.15)' : 'transparent' }}>
                    <td style={{ padding: '9px 8px', textAlign: 'center', fontWeight: matched ? 700 : 400, color: matched ? 'var(--primary)' : 'var(--text)' }}>{row.型号}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'center' }}>{row.桌高}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'center' }}>{row.椅高}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'center', color: matched ? 'var(--primary)' : 'var(--text)', fontWeight: matched ? 700 : 400 }}>{row.范围}</td>
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
