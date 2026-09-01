import React, { useState, useRef } from 'react';
import { Button } from '@/lib';
import { Card, DatePicker } from 'animal-island-ui';
import 'animal-island-ui/dist/index.css';
import * as XLSX from 'xlsx';

// ============================================================
// 身份证校验核心：ISO 7064:1983 MOD 11-2
// ============================================================
function checkIdCard(id: string): { ok: boolean; msg: string } {
  id = id.trim().toUpperCase();
  if (id.length !== 18) return { ok: false, msg: '长度错误' };
  if (!/^\d{17}[\dX]$/.test(id)) return { ok: false, msg: '格式错误' };
  const weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const code = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += parseInt(id[i]) * weight[i];
  const mod = sum % 11;
  const correct = code[mod];
  const last = id[17];
  if (correct !== last) return { ok: false, msg: '校验位错误' };
  return { ok: true, msg: '正确' };
}

function isIdCardFormat(str: string): boolean {
  if (!str) return false;
  str = String(str).trim().toUpperCase();
  if (str.length !== 18) return false;
  return /^\d{17}[\dX]$/.test(str);
}

// ============================================================
// 出生日期解析 & 年龄计算
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

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
  const [birthColIdx, setBirthColIdx] = useState<number>(() => {
    try { return Number(sessionStorage.getItem('agecheck_birthcolidx') ?? -1); } catch { return -1; }
  });
  const [idColIdx, setIdColIdx] = useState<number>(() => {
    try { return Number(sessionStorage.getItem('agecheck_idcolidx') ?? -1); } catch { return -1; }
  });
  const [certTypeColIdx, setCertTypeColIdx] = useState<number>(() => {
    try { return Number(sessionStorage.getItem('agecheck_certtypecolidx') ?? -1); } catch { return -1; }
  });
  const [measureDate, setMeasureDate] = useState(() => {
    try { return sessionStorage.getItem('agecheck_measure') || ''; } catch { return ''; }
  });
  const [results, setResults] = useState<Array<{
    _row: Record<string, unknown>; // 原始行数据
    idCard: string; idCardResult: string; birthDate: string; measure: string;
    age: string; months: number; valid: boolean; inRange: boolean | null;
    noBirth: boolean;
  }>>(() => {
    try { const s = sessionStorage.getItem('agecheck_results'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

      // 自动识别出生日期列
      const dateKw = ['出生', '生日', 'birth', 'date', '日期', '年月日', 'DOB'];
      const autoBirth = nonEmpty.findIndex(h => dateKw.some(k => h.toLowerCase().includes(k.toLowerCase())));
      // 自动识别证件类型列
      const certTypeKw = ['证件类型', 'certtype', 'certificate_type'];
      const autoCertType = nonEmpty.findIndex(h => certTypeKw.some(k => h.toLowerCase().includes(k.toLowerCase())));
      // 自动识别身份证列
      const idKw = ['身份证', '证件号', 'idcard', 'id', '证件', 'identity'];
      const sampleSize = Math.min(20, json.length);
      let bestIdIdx = -1;
      let bestIdScore = 0;
      nonEmpty.forEach((h, idx) => {
        let idCount = 0;
        let total = 0;
        for (let i = 0; i < sampleSize; i++) {
          const val = json[i][h];
          if (val !== null && val !== undefined && val !== '' && val !== ' ') {
            total++;
            if (isIdCardFormat(String(val).trim())) idCount++;
          }
        }
        if (total > 0 && idCount / total > bestIdScore) {
          bestIdScore = idCount / total;
          bestIdIdx = idx;
        }
      });

      const bIdx = autoBirth !== -1 ? autoBirth : 0;
      const iIdx = bestIdIdx !== -1 && bestIdScore >= 0.5 ? bestIdIdx : -1;
      const ctIdx = autoCertType !== -1 ? autoCertType : -1;

      setBirthColIdx(bIdx);
      saveState('birthcolidx', bIdx);
      if (iIdx !== -1) {
        setIdColIdx(iIdx);
        saveState('idcolidx', iIdx);
      }
      if (ctIdx !== -1) {
        setCertTypeColIdx(ctIdx);
        saveState('certtypecolidx', ctIdx);
      }

      let hint = `已加载 ${nonEmpty.length} 列，${json.length} 行`;
      if (autoBirth !== -1) hint += '（已自动选择出生日期列）';
      if (ctIdx !== -1) hint += '（已自动选择证件类型列）';
      if (iIdx !== -1) hint += '（已自动选择身份证列）';
      setStatusMsg({ text: hint, type: 'success' });
    } catch (err: unknown) {
      setStatusMsg({ text: '读取失败：' + (err instanceof Error ? err.message : String(err)), type: 'error' });
    } finally {
      setFileLoading(false);
    }
  };

  const handleCalc = () => {
    if (birthColIdx < 0 || !measureDate || rows.length === 0) return;
    saveState('measure', measureDate);
    const birthHdr = headers[birthColIdx];
    const idHdr = idColIdx >= 0 ? headers[idColIdx] : '';
    const certTypeHdr = certTypeColIdx >= 0 ? headers[certTypeColIdx] : '';
    const hasCertTypeCol = certTypeColIdx >= 0;

    const mapped = rows.map((row) => {
      // 证件类型
      let certType = '';
      if (certTypeHdr) {
        const rawCertType = row[certTypeHdr];
        if (rawCertType !== null && rawCertType !== undefined && rawCertType !== '') {
          certType = String(rawCertType).trim();
        }
      }
      // 判断是否需要校验身份证
      // - 有证件类型列：只对"身份证"或空值校验，其他类型跳过
      // - 无证件类型列：始终校验
      let needValidateId = true;
      if (hasCertTypeCol) {
        needValidateId = !certType || certType === '身份证';
      }

      // 身份证号校验（先做，因为后面要用它提取出生日期）
      let idCardStr = '';
      let idCardResult = '';
      if (needValidateId) {
        const rawId = row[idHdr];
        if (rawId !== null && rawId !== undefined && rawId !== '') {
          idCardStr = String(rawId).trim().toUpperCase();
          if (idCardStr) {
            const ck = checkIdCard(idCardStr);
            idCardResult = ck.ok ? '正确' : ck.msg;
          }
        }
      } else {
        idCardResult = '（非身份证，跳过校验）';
        const rawId = row[idHdr];
        if (rawId !== null && rawId !== undefined && rawId !== '') {
          idCardStr = String(rawId).trim().toUpperCase();
        }
      }

      // 出生日期：优先用填写字段，为空则从身份证号提取
      let birthStr = '';
      const rawBirth = row[birthHdr];
      if (rawBirth instanceof Date) {
        birthStr = fmtDate(rawBirth as Date);
      } else if (rawBirth !== null && rawBirth !== undefined && rawBirth !== '') {
        birthStr = String(rawBirth).trim();
      }
      let noBirth = false;
      if (!birthStr && idCardStr && checkIdCard(idCardStr).ok) {
        const y = idCardStr.substring(6, 10);
        const m = idCardStr.substring(10, 12);
        const d = idCardStr.substring(12, 14);
        birthStr = `${y}-${m}-${d}`;
      }
      if (!birthStr) noBirth = true;

      const detail = calcAgeDetail(birthStr, measureDate);
      const inRange = isInRange(birthStr, measureDate);
      return {
        _row: { ...row },
        idCard: idCardStr || '（空）',
        idCardResult: idCardResult || '（未检测）',
        birthDate: birthStr,
        measure: measureDate,
        age: detail?.display || '（无法计算）',
        months: detail?.totalMonths ?? -1,
        valid: detail !== null,
        inRange,
        noBirth,
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
    setBirthColIdx(-1);
    setIdColIdx(-1);
    setMeasureDate('');
    try {
      ['filename','headers','rows','birthcolidx','idcolidx','measure','results'].forEach(k => sessionStorage.removeItem('agecheck_' + k));
    } catch {}
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDownload = () => {
    if (results.length === 0) return;
    // 原始列标题 + 新增列
    const newCols = ['身份证校验', '计算年龄', '是否在5.5~6.5岁范围内'];
    const origHeaders = Object.keys(results[0]._row);
    const wsData = [
      [...origHeaders, ...newCols],
      ...results.map(r => {
        const origVals = origHeaders.map(h => {
          const v = r._row[h];
          if (v instanceof Date) return fmtDate(v);
          return v ?? '';
        });
        return [
          ...origVals,
          r.idCardResult === '校验位错误' ? '错误' : r.idCardResult,
          r.noBirth ? '身份证号错误，无法计算' : r.age,
          r.inRange === true ? '是' : r.inRange === false ? '否' : '日期无效',
        ];
      }),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const origColCount = origHeaders.length;
    const colWidths: Record<string, { wch: number; t?: string; z?: string }> = {};
    origHeaders.forEach((_, i) => { colWidths[i] = { wch: 15 }; });
    colWidths[origColCount] = { wch: 12 }; // 身份证校验
    colWidths[origColCount + 1] = { wch: 22 }; // 计算年龄
    colWidths[origColCount + 2] = { wch: 22 }; // 是否在范围
    ws['!cols'] = Object.values(colWidths);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '审核结果');
    XLSX.writeFile(wb, `审核结果_${measureDate || '未知'}.xlsx`);
  };

  const inside = results.filter(r => r.inRange === true).length;
  const outside = results.filter(r => r.inRange === false).length;
  const idError = results.filter(r => r.idCardResult !== '' && r.idCardResult !== '正确' && r.idCardResult !== '（未检测）' && r.idCardResult !== '（非身份证，跳过校验）').length;
  const total = results.length;

  return (
    <div className="page" style={{ padding: '0 16px 32px' }}>
      {!embedded && (
        <div className="page-header">
          <h2 className="page-title">🏫 幼儿园信息上传前审核</h2>
          <div className="page-desc">批量判断年龄范围并校验身份证号</div>
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
            <select value={birthColIdx >= 0 ? birthColIdx : ''} onChange={e => { const v = Number(e.target.value); setBirthColIdx(v); saveState('birthcolidx', v); }} style={{ height: 38, border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 10px', fontSize: 14, color: 'var(--text)', background: '#fff', outline: 'none' }}>
              {headers.length === 0 && <option value="">-- 请先上传文件 --</option>}
              {headers.map((h, i) => {
                const dateKw = ['出生', '生日', 'birth', 'date', '日期', '年月日', 'DOB'];
                const isDate = dateKw.some(k => h.toLowerCase().includes(k.toLowerCase()));
                return <option key={i} value={i}>{isDate ? '⭐ ' + h + ' (推荐)' : h}</option>;
              })}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>身份证号所在列</label>
            <select value={idColIdx >= 0 ? idColIdx : ''} onChange={e => { const v = Number(e.target.value); setIdColIdx(v); saveState('idcolidx', v); }} style={{ height: 38, border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 10px', fontSize: 14, color: 'var(--text)', background: '#fff', outline: 'none' }}>
              {headers.length === 0 && <option value="">-- 请先上传文件 --</option>}
              {headers.length > 0 && headers.map((h, i) => {
                const isRec = i === idColIdx;
                return <option key={i} value={i}>{isRec ? '⭐ ' + h + ' (推荐)' : h}</option>;
              })}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>体检日期</label>
            <input type="date" value={measureDate} onChange={e => { setMeasureDate(e.target.value); saveState('measure', e.target.value); }} style={{ height: 38, border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 10px', fontSize: 14, color: 'var(--text)', background: '#fff', outline: 'none' }} />
          </div>
        </div>
        <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 12 }}>
          📋 <strong>使用说明：</strong>支持 YYYY-MM-DD、YYYY/MM/DD、YYYYMMDD、YYYY.MM.DD 等格式 | 身份证号必须为 <strong>18位</strong>，遵循 ISO 7064:1983 MOD 11-2 标准
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button type="primary" disabled={headers.length === 0 || !measureDate || birthColIdx < 0 || idColIdx < 0} onClick={handleCalc}>🚀 开始审核</Button>
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
            <div style={{ flex: 1, minWidth: 100, padding: 14, borderRadius: 10, textAlign: 'center', background: '#fff8f0', border: '1.5px solid #f5a623' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f5a623' }}>{idError}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>身份证号错误</div>
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
