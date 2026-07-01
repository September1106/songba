import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/lib';
import { CN_FOODS_DATA } from '@/data/cnFoods_data';
import { getDRI, RANK_DRI_KEY_MAP } from '@/data/nutrition';

interface RankTableProps {
  nutrientKey: string;
  ageGroup: string;
  sortDesc: boolean;
  filterCat: string;
  onFilterCatChange: (v: string) => void;
}

const PAGE_SIZE = 10;

export default function RankTable({ nutrientKey, ageGroup, sortDesc, filterCat }: RankTableProps) {
  const [page, setPage] = useState(0);

  // 筛选变化时重置页码
  useEffect(() => setPage(0), [filterCat]);

  const dris = getDRI(ageGroup);
  const driKey = RANK_DRI_KEY_MAP[nutrientKey] || nutrientKey;
  const drv = (dris as unknown as Record<string, number>)[driKey] ?? 0;

  const allEntries = useMemo(() => {
    const entries: { name: string; cat1: string; value: number }[] = [];
    for (const food of CN_FOODS_DATA) {
      let raw = (food as unknown as Record<string, unknown>)[nutrientKey];
      // energy_kcal 在原始数据里是 energy_kJ（千焦），需要换算
      if (nutrientKey === 'energy_kcal') {
        const kJ = (food as unknown as Record<string, unknown>)['energy_kJ'];
        if (typeof kJ === 'number' && kJ > 0) raw = kJ / 4.184;
        else raw = null;
      }
      if (typeof raw === 'number' && raw > 0) {
        entries.push({ name: food.food_name || '', cat1: food.cat1 || '', value: raw });
      }
    }
    entries.sort((a, b) => sortDesc ? b.value - a.value : a.value - b.value);
    return entries;
  }, [nutrientKey, sortDesc]);

  // 应用大类筛选
  const filteredEntries = filterCat
    ? allEntries.filter(e => e.cat1 === filterCat)
    : allEntries;

  const total = filteredEntries.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  // 重置到第一页当筛选变化时
  const visible = filteredEntries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const unit = getUnit(nutrientKey);

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
        📊 暂无该营养素数据
      </div>
    );
  }

  return (
    <div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-header)', fontWeight: 600, width: '40px' }}>#</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-header)', fontWeight: 600 }}>食物</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-header)', fontWeight: 600, whiteSpace: 'nowrap' }}>每100g</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-header)', fontWeight: 600 }}>占日需%</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item, idx) => {
              const pct = drv > 0 ? Math.round((item.value / drv) * 100) : 0;
              let pctColor = 'var(--text-muted)';
              let pctBg = 'transparent';
              if (pct > 0 && pct <= 33) { pctColor = '#fff'; pctBg = 'var(--error)'; }
              else if (pct > 33 && pct <= 66) { pctColor = '#fff'; pctBg = 'var(--warning)'; }
              else if (pct > 66) { pctColor = '#fff'; pctBg = 'var(--success)'; }

              return (
                <tr key={item.name + idx} style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-content)' }}>
                  <td style={{ padding: '8px 10px', color: 'var(--text-muted)', fontWeight: 500 }}>{page * PAGE_SIZE + idx + 1}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-body)' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.cat1}</div>
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-body)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {item.value.toFixed(1)} {unit}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                    {drv > 0 ? (
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
                        background: pctBg, color: pctColor, fontWeight: 600, fontSize: '12px', minWidth: '40px', textAlign: 'center',
                      }}>
                        {pct}%
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-disabled)' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
          <Button
            size="small"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            ← 上一页
          </Button>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '80px', textAlign: 'center' }}>
            {page + 1} / {totalPages}
          </span>
          <Button
            size="small"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          >
            下一页 →
          </Button>
        </div>
      )}

      <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
        💡 {filterCat ? `${filterCat} 共` : '共'} {total} 种有数据食物 · 按每100g所含{sortDesc ? '从高到低' : '从低到高'}排列
      </p>
    </div>
  );
}

function getUnit(key: string): string {
  const units: Record<string, string> = {
    energy_kcal: 'kcal', protein_g: 'g', fat_g: 'g', carbs_g: 'g', fiber_g: 'g',
    calcium_mg: 'mg', phosphorus_mg: 'mg', potassium_mg: 'mg', sodium_mg: 'mg',
    magnesium_mg: 'mg', iron_mg: 'mg', zinc_mg: 'mg', selenium_ug: 'μg',
    copper_mg: 'mg', manganese_mg: 'mg',
    vitA_ug: 'μg', vitB1_mg: 'mg', vitB2_mg: 'mg', niacin_mg: 'mg',
    vitC_mg: 'mg', vitE_mg_alpha: 'mg',
    cholesterol_mg: 'mg',
  };
  return units[key] || '';
}
