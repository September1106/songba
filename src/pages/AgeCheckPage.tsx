import React, { useState, useRef } from 'react';
import { Button } from '@/lib';
import { Card, DatePicker } from 'animal-island-ui';
import 'animal-island-ui/dist/index.css';
import * as XLSX from 'xlsx';

// ============================================================
// 核心算法
// ============================================================
function parseDate(val: unknown): Date | null {
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return new Date(val.getFullYear(), val.getMonth(), val.getDate());
  }
  if (!val) return null;
  const str = String(val).trim();
  if (!str || str === 'Invalid Date' || str === 'NaN') return null;
  let d: Date | null = null;
  const m1 = str.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);
  if (m1) {
    d = new Date(parseInt(m1[1]), parseInt(m1[2]) - 1, parseInt(m1[3]));
    if (!isNaN(d.getTime())) return d;
  }
  const m2 = str.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m2) {
    d = new Date(parseInt(m2[1]), parseInt(m2[2]) - 1, parseInt(m2[3]));
    if (!isNaN(d.getTime())) return d;
  }
  d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  return null;
}

function calcAgeDetail(birth: unknown, measure: unknown) {
  const b = parseDate(birth);
  const m = parseDate(measure);
  if (!b || !m) return null;
  let years = m.getFullYear() - b.getFullYear();
  let months = m.getMonth() - b.getMonth();
  let totalMonths = years * 12 + months;
  let extraDays = m.getDate() - b.getDate();
  if (extraDays < 0) {
    totalMonths -= 1;
    const prev = new Date(m.getFullYear(), m.getMonth(), 0);
    extraDays = prev.getDate() + extraDays;
  }
  if (totalMonths < 0) return null;
  const yr = Math.floor(totalMonths / 12);
  const mo = totalMonths % 12;
  let display = '';
  if (yr > 0) display += yr + '岁';
  if (mo > 0) display += mo + '个月';
  if (extraDays > 0) display += extraDays + '天';
  if (!display) display = '0天';
  return { totalMonths, extraDays, years: yr, months: mo, display };
}

function isInRange(birth: unknown, measure: unknown): boolean | null {
  const d = calcAgeDetail(birth, measure);
  if (!d) return null;
  const { totalMonths, extraDays } = d;
  if (totalMonths < 66) return false;
  if (totalMonths > 78) return false;
  if (totalMonths === 78 && extraDays > 0) return false;
  if (totalMonths === 66 && extraDays < 0) return false;
  return true;
}

// ============================================================
// 页面组件
// ============================================================
interface AgeCheckPageProps { embedded?: boolean; }
export default function AgeCheckPage({ embedded = false }: AgeCheckPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState(() => {
    try { return sessionStorage.getItem('agecheck_filename') || ''; } catch { return ''; }
  });
  const [headers, setHeaders] = useState<string[]>(() => {
    try { const s = sessionStorage.getItem('agecheck_headers'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [rows, setRows] = useState<Record<string, unknown>[]>(() => {
    try { const s = sessionStorage.getItem('agecheck_rows'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [colIdx, setColIdx] = useState<number>(() => {
    try { return Number(sessionStorage.getItem('agecheck_colidx') ?? -1); } catch { return -1; }
  });
  const [measureDate, setMeasureDate] = useState(() => {
    try { return sessionStorage.getItem('agecheck_measure') || ''; } catch { return ''; }
  });
  const [results, setResults] = useState<Array<{
    idCard: string; measure: string; age: string; months: number; valid: boolean; inRange: boolean | null;
  }>>(() => {
    try { const s = sessionStorage.getItem('agecheck_results'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 持久化到 sessionStorage
  const saveState = (field: string, val: unknown) => {
    try { sessionStorage.setItem('agecheck_' + field, JSON.stringify(val)); } catch {}
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);
    saveState('filename', f.name);
    setStatusMsg(null);
    setResults([]);
    saveState('results', []);
    setFileLoading(true);

    try {
      const data = new Uint8Array(await f.arrayBuffer());
      const wb = XLSX.read(data, { type: 'array', cellDates: true, cellNF: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (json.length === 0) {
        setStatusMsg({ text: '文件内容为空', type: 'error' });
        return;
      }
      const allHeaders = Object.keys(json[0]);
      const nonEmpty = allHeaders.filter(h => json.some(r => r[h] !== null && r[h] !== undefined && r[h] !== ''));
      if (nonEmpty.length === 0) {
        setStatusMsg({ text: '未找到有效数据列', type: 'error' });
        return;
      }
      setHeaders(nonEmpty);
      saveState('headers', nonEmpty);
      setRows(json);
      saveState('rows', json);

      // 自动识别日期列
      const dateKw = ['出生', '生日', 'birth', 'date', '日期', '年月日', 'DOB'];
      const autoIdx = nonEmpty.findIndex(h => dateKw.some(k => h.toLowerCase().includes(k.toLowerCase())));
      const idx = autoIdx !== -1 ? autoIdx : 0;
      setColIdx(idx);
      saveState('colidx', idx);
      setStatusMsg({ text: `已加载 ${nonEmpty.length} 列，${json.length} 行${autoIdx !== -1 ? '（已自动选择出生日期列）' : ''}`, type: 'success' });
    } catch (err: unknown) {
      setStatusMsg({ text: '读取失败：' + (err instanceof Error ? err.message : String(err)), type: 'error' });
    } finally {
      setFileLoading(false);
    }
  };

  const handleCalc = () => {
    if (colIdx < 0 || !measureDate || rows.length === 0) return;
    saveState('measure', measureDate);
    const hdr = headers[colIdx];
    const mapped = rows.map((row, i) => {
      let val = row[hdr];
      let birthStr = '';
      if (val instanceof Date) {
        birthStr = (val as Date).toISOString().slice(0, 10);
      } else if (val !== null && val !== undefined && val !== '') {
        birthStr = String(val).trim();
      }
      const detail = calcAgeDetail(birthStr, measureDate);
      const inRange = isInRange(birthStr, measureDate);
      return {
        idCard: birthStr || '（空）',
        measure: measureDate,
        age: detail?.display || '（无法计算）',
        months: detail?.totalMonths ?? -1,
        valid: detail !== null,
        inRange,
      };
    });
    setResults(mapped);
    saveState('results', mapped);
  };

  const handleClear = () => {
    setResults([]);
    setFile(null);
    setFileName('');
    setHeaders([]);
    setRows([]);
    setColIdx(-1);
    setMeasureDate('');
    try {
      ['filename','headers','rows','colidx','measure','results'].forEach(k => sessionStorage.removeItem('agecheck_' + k));
    } catch {}
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDownload = () => {
    const wsData = [
      ['出生日期', '体检日期', '计算年龄', '足月数', '是否在5.5~6.5岁范围内'],
      ...results.map(r => [
        r.idCard,
        r.measure,
        r.age,
        r.months >= 0 ? r.months + '个月' : '日期无效',
        r.inRange === true ? '是' : r.inRange === false ? '否' : '日期无效',
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 15 }, { wch: 13 }, { wch: 18 }, { wch: 12 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '年龄筛选结果');
    XLSX.writeFile(wb, `年龄筛选结果_${measureDate || '未知'}.xlsx`);
  };

  const inside = results.filter(r => r.inRange === true).length;
  const outside = results.filter(r => r.inRange === false).length;
  const total = results.length;

  return (
    <div className="page" style={{ padding: '0 16px 32px' }}>
      {!embedded && (
        <div className="page-header">
          <h2 className="page-title">🏫 幼儿园年龄判断</h2>
          <div className="page-desc">批量判断是否在 5.5~6.5 岁范围内</div>
        </div>
      )}

      {/* 上传卡片 */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 12 }}>📂 步骤1：上传 Excel 文件</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Button type="default" loading={fileLoading} onClick={() => fileRef.current?.click()}>
            📂 {fileLoading ? '读取中...' : (fileName ? '重新选择文件' : '选择 Excel 文件')}
          </Button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>
        {statusMsg && (
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, fontSize: 13, background: statusMsg.type === 'error' ? '#fff5f5' : '#f0fff4', color: statusMsg.type === 'error' ? '#d93030' : '#28a745', border: '1px solid ' + (statusMsg.type === 'error' ? '#e84040' : '#30c758') }}>
            {statusMsg.text}
          </div>
        )}
      </Card>

      {/* 配置卡片 */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 12 }}>⚙️ 步骤2：配置列与日期</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>出生日期所在列</label>
            <select value={colIdx >= 0 ? colIdx : ''} onChange={e => { const v = Number(e.target.value); setColIdx(v); saveState('colidx', v); }} style={{ height: 38, border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 10px', fontSize: 14, color: 'var(--text)', background: '#fff', outline: 'none' }}>
              {headers.length === 0 && <option value="">-- 请先上传文件 --</option>}
              {headers.map((h, i) => {
                const dateKw = ['出生', '生日', 'birth', 'date', '日期', '年月日', 'DOB'];
                const isDate = dateKw.some(k => h.toLowerCase().includes(k.toLowerCase()));
                return <option key={i} value={i}>{isDate ? '⭐ ' + h + ' (推荐)' : h}</option>;
              })}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>体检日期</label>
            <input type="date" value={measureDate} onChange={e => { setMeasureDate(e.target.value); saveState('measure', e.target.value); }} style={{ height: 38, border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 10px', fontSize: 14, color: 'var(--text)', background: '#fff', outline: 'none' }} />
          </div>
        </div>
        <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 12 }}>
          📋 <strong>日期格式说明：</strong>支持 YYYY-MM-DD、YYYY/MM/DD、YYYYMMDD、YYYY.MM.DD 等格式
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button type="primary" disabled={headers.length === 0 || !measureDate} onClick={handleCalc}>🚀 开始计算</Button>
          <Button type="default" disabled={results.length === 0} onClick={handleDownload}>📥 导出结果</Button>
          <Button type="default" disabled={results.length === 0 && !fileName} onClick={handleClear}>🗑️ 清除结果</Button>
        </div>
      </Card>

      {/* 统计卡片 */}
      {results.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 12 }}>📊 筛选结果统计</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 100, padding: 14, borderRadius: 10, textAlign: 'center', background: '#f0fff4', border: '1.5px solid #30c758' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#30c758' }}>{inside}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>在 5.5~6.5 岁范围内</div>
            </div>
            <div style={{ flex: 1, minWidth: 100, padding: 14, borderRadius: 10, textAlign: 'center', background: '#fff0f0', border: '1.5px solid #e84040' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#e84040' }}>{outside}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>不在范围内</div>
            </div>
            <div style={{ flex: 1, minWidth: 100, padding: 14, borderRadius: 10, textAlign: 'center', background: '#f8f8f8', border: '1.5px solid #ccc' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#888' }}>{total}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>总人数</div>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}
