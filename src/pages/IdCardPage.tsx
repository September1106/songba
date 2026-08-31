import React, { useState, useRef } from 'react';
import { Button } from '@/lib';
import { Card } from 'animal-island-ui';
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
// 页面组件
// ============================================================
interface IdCardPageProps { embedded?: boolean; }
export default function IdCardPage({ embedded = false }: IdCardPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState(() => {
    try { return sessionStorage.getItem('idcard_filename') || ''; } catch { return ''; }
  });
  const [headers, setHeaders] = useState<string[]>(() => {
    try { const s = sessionStorage.getItem('idcard_headers'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [rows, setRows] = useState<Record<string, unknown>[]>(() => {
    try { const s = sessionStorage.getItem('idcard_rows'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [colIdx, setColIdx] = useState<number>(() => {
    try { return Number(sessionStorage.getItem('idcard_colidx') ?? -1); } catch { return -1; }
  });
  const [results, setResults] = useState<Array<{ _row: Record<string, unknown>; idCard: string; result: string }>>(() => {
    try { const s = sessionStorage.getItem('idcard_results'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveState = (field: string, val: unknown) => {
    try { sessionStorage.setItem('idcard_' + field, JSON.stringify(val)); } catch {}
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

      // 自动识别身份证列（前20行匹配率最高的列）
      const sampleSize = Math.min(20, json.length);
      let bestIdx = -1;
      let bestScore = 0;
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
        if (total > 0 && idCount / total > bestScore) {
          bestScore = idCount / total;
          bestIdx = idx;
        }
      });

      if (bestIdx !== -1 && bestScore >= 0.5) {
        setColIdx(bestIdx);
        saveState('colidx', bestIdx);
        setStatusMsg({ text: `已加载 ${nonEmpty.length} 列，${json.length} 行（已自动选择身份证列）`, type: 'success' });
      } else {
        setColIdx(0);
        saveState('colidx', 0);
        setStatusMsg({ text: `已加载 ${nonEmpty.length} 列，${json.length} 行`, type: 'success' });
      }
    } catch (err: unknown) {
      setStatusMsg({ text: '读取失败：' + (err instanceof Error ? err.message : String(err)), type: 'error' });
    } finally {
      setFileLoading(false);
    }
  };

  const handleCheck = () => {
    if (colIdx < 0 || rows.length === 0) return;
    const hdr = headers[colIdx];
    const mapped: Array<{ _row: Record<string, unknown>; idCard: string; result: string }> = [];
    rows.forEach(row => {
      const raw = row[hdr];
      if (raw == null || raw === '') return;
      const val = String(raw).trim();
      if (!val) return;
      const ck = checkIdCard(val);
      mapped.push({ _row: { ...row }, idCard: val, result: ck.ok ? '正确' : '错误' });
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
    try {
      ['filename','headers','rows','colidx','results'].forEach(k => sessionStorage.removeItem('idcard_' + k));
    } catch {}
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDownload = () => {
    if (results.length === 0) return;
    const origHeaders = Object.keys(results[0]._row);
    const wsData = [
      [...origHeaders, '身份证校验'],
      ...results.map(r => {
        const origVals = origHeaders.map(h => {
          const v = r._row[h];
          if (v instanceof Date) {
            const d = v as Date;
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          }
          return v ?? '';
        });
        return [...origVals, r.result];
      }),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const origColCount = origHeaders.length;
    const colWidths: Record<string, { wch: number }> = {};
    origHeaders.forEach((_, i) => { colWidths[i] = { wch: 15 }; });
    colWidths[origColCount] = { wch: 12 };
    ws['!cols'] = Object.values(colWidths);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '审核结果');
    XLSX.writeFile(wb, '审核结果.xlsx');
  };

  const okCount = results.filter(r => r.result === '正确').length;
  const errCount = results.filter(r => r.result === '错误').length;

  return (
    <div className="page" style={{ padding: '0 16px 32px' }}>
      {!embedded && (
        <div className="page-header">
          <h2 className="page-title">🪪 其他学段信息上传前审核</h2>
          <div className="page-desc">批量校验身份证号合法性（ISO 7064:1983 MOD 11-2）· 本地计算，不上传任何数据</div>
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
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 12 }}>⚙️ 步骤2：配置列</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>身份证号所在列</label>
            <select value={colIdx >= 0 ? colIdx : ''} onChange={e => { const v = Number(e.target.value); setColIdx(v); saveState('colidx', v); }} style={{ height: 38, border: '1.5px solid var(--border)', borderRadius: 8, padding: '0 10px', fontSize: 14, color: 'var(--text)', background: '#fff', outline: 'none', width: '100%' }}>
              {headers.length === 0 && <option value="">-- 请先上传文件 --</option>}
              {headers.map((h, i) => {
                const isRec = i === colIdx;
                return <option key={i} value={i}>{isRec ? '⭐ ' + h + ' (推荐)' : h}</option>;
              })}
            </select>
          </div>
        </div>
        <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 12 }}>
          📋 <strong>使用说明：</strong>身份证号必须为 <strong>18位</strong>，前17位为数字，最后1位可为数字或 X。上传之前注意删除空格等不可见字符
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button type="primary" disabled={headers.length === 0} onClick={handleCheck}>🚀 开始校验</Button>
          <Button type="default" disabled={results.length === 0} onClick={handleDownload}>📥 导出结果</Button>
          <Button type="default" disabled={results.length === 0 && !fileName} onClick={handleClear}>🗑️ 清除结果</Button>
        </div>
      </Card>

      {/* 统计卡片 */}
      {results.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 12 }}>📊 校验结果统计</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 100, padding: 14, borderRadius: 10, textAlign: 'center', background: '#f0fff4', border: '1.5px solid #30c758' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#30c758' }}>{okCount}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>校验正确</div>
            </div>
            <div style={{ flex: 1, minWidth: 100, padding: 14, borderRadius: 10, textAlign: 'center', background: '#fff0f0', border: '1.5px solid #e84040' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#e84040' }}>{errCount}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>校验错误</div>
            </div>
            <div style={{ flex: 1, minWidth: 100, padding: 14, borderRadius: 10, textAlign: 'center', background: '#f8f8f8', border: '1.5px solid #ccc' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#888' }}>{results.length}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>总校验数</div>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}
