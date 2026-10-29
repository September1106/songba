import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/lib';
import { Typewriter } from 'animal-island-ui';
import 'animal-island-ui/dist/index.css';
import {
  AGE_OPTIONS,
  CATEGORY_META,
  CATEGORY_ORDER,
  toys,
  type ToyItem,
} from '../data/toys';

const ALL = 'all';

const AGE_SELECT_OPTIONS = [
  { key: ALL, label: '选择孩子年龄' },
  ...AGE_OPTIONS.map(o => ({ key: String(o.months), label: o.label })),
];

interface ToyGuidePageProps { embedded?: boolean; }

export default function ToyGuidePage({ embedded = false }: ToyGuidePageProps) {
  const navigate = useNavigate();
  const [ageKey, setAgeKey] = useState<string>(ALL);

  const filtered = useMemo<ToyItem[]>(() => {
    if (ageKey === ALL) return toys;
    const months = parseInt(ageKey, 10);
    return toys.filter(t => t.minAgeMonths === months);
  }, [ageKey]);

  const grouped = useMemo(() => {
    const map = new Map<string, ToyItem[]>();
    filtered.forEach(t => {
      const arr = map.get(t.category) || [];
      arr.push(t);
      map.set(t.category, arr);
    });
    const cats = CATEGORY_ORDER.filter(c => map.has(c));
    const others = Array.from(map.keys()).filter(c => !CATEGORY_ORDER.includes(c));
    return [...cats, ...others].map(c => ({ category: c, items: map.get(c)! }));
  }, [filtered]);

  const isAll = ageKey === ALL;

  return (
    <div className="page" style={{ padding: '0 16px 32px' }}>
      {!embedded && (
        <div className="page-header">
          <h2 className="page-title">🧸 玩具选购参考</h2>
          <div className="page-desc">
            <Typewriter speed={60}>选择孩子年龄，查看适合该年龄段的玩具及类别</Typewriter>
          </div>
        </div>
      )}

      {/* 年龄选择 */}
      <div style={{ background: '#F7F3DF', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-header)' }}>请选择孩子的年龄</span>
          <select
            value={ageKey}
            onChange={e => setAgeKey(e.target.value)}
            aria-label="选择孩子年龄"
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-header)',
              background: 'transparent',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {AGE_SELECT_OPTIONS.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 完整表格 */}
      {isAll && (
        <Card style={{ marginBottom: 12, overflowX: 'auto' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-header)', marginBottom: 10 }}>
            📋 全部玩具一览
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
              （共{grouped.length}个类别，{filtered.length}种玩具）
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--border-light)', whiteSpace: 'nowrap' }}>起始年龄</th>
                <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--border-light)' }}>描述与示例</th>
                <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--border-light)', whiteSpace: 'nowrap' }}>类别</th>
              </tr>
            </thead>
            <tbody>
              {toys.map((item, i) => {
                const meta = CATEGORY_META[item.category] || { icon: '🧸', color: '#54A0FF' };
                return (
                  <tr key={i}>
                    <td style={{ padding: '8px 10px', borderBottom: '1px dashed var(--border-light)', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {item.minAgeText}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px dashed var(--border-light)', color: 'var(--text-body)', lineHeight: 1.6 }}>
                      {item.desc}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px dashed var(--border-light)', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 12, color: meta.color, fontWeight: 600 }}>
                        <span>{meta.icon}</span>{item.category}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* 按类别分组 → 同样用三列表格展示 */}
      {!isAll && grouped.length === 0 && (
        <Card>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            该年龄段暂无玩具数据
          </p>
        </Card>
      )}

      {!isAll && grouped.length > 0 && (
        <Card style={{ marginBottom: 12, overflowX: 'auto' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-header)', marginBottom: 10 }}>
            📋 适合该年龄段的玩具
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
              （共{grouped.length}个类别，{filtered.length}种玩具）
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--border-light)', whiteSpace: 'nowrap' }}>起始年龄</th>
                <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--border-light)' }}>描述与示例</th>
                <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--border-light)', whiteSpace: 'nowrap' }}>类别</th>
              </tr>
            </thead>
            <tbody>
              {grouped.flatMap(g => g.items).map((item, i) => {
                const meta = CATEGORY_META[item.category] || { icon: '🧸', color: '#54A0FF' };
                return (
                  <tr key={i}>
                    <td style={{ padding: '8px 10px', borderBottom: '1px dashed var(--border-light)', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {item.minAgeText}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px dashed var(--border-light)', color: 'var(--text-body)', lineHeight: 1.6 }}>
                      {item.desc}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px dashed var(--border-light)', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 12, color: meta.color, fontWeight: 600 }}>
                        <span>{meta.icon}</span>{item.category}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <div style={{ marginTop: 12, padding: 10, background: 'var(--bg-secondary)', borderRadius: 8 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          ⚠️ 玩具适龄只是参考，选购时还需注意：材质是否安全、有无小零件误吞风险、是否符合
          GB 6675 玩具安全标准；电玩具、塑胶玩具、金属玩具、乘骑车辆玩具还要检查是否有CCC认证标志。<br />
          数据来源：GB/T 28022-2021《玩具适用年龄判定指南》。
        </p>
      </div>

      {!embedded && (
        <div style={{ marginTop: 16 }}>
          <Button type="primary" onClick={() => navigate('/island')}>← 返回工具栏</Button>
        </div>
      )}
    </div>
  );
}
