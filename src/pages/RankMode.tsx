import { useState } from 'react';
import { Button, Card, Select } from '@/lib';
import { NUTRIENT_RANK_CATEGORIES } from '@/data/nutrition';
import { CN_FOOD_CATEGORIES } from '@/data/cnFoodCategories';
import RankTable from './RankTable';

interface RankModeProps {
  ageGroup: string;
}

export default function RankMode({ ageGroup }: RankModeProps) {
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedNutrient, setSelectedNutrient] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [filterCat, setFilterCat] = useState('');

  const currentCat = NUTRIENT_RANK_CATEGORIES.find(c => c.id === selectedCat);
  const isCholesterol = selectedCat === 'cholesterol';

  return (
    <div style={{ background: 'var(--bg-content)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
      {/* ── Step 1: 选择营养大类 ───────────────────── */}
      {!selectedCat && (
        <>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            选择营养素大类，看看数据库里哪些食物含量最高
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {NUTRIENT_RANK_CATEGORIES.map(cat => (
              <Card
                key={cat.id}
                color="default"
                className="food-stage"
                onClick={() => {
                  setSelectedCat(cat.id);
                  if (cat.id === 'cholesterol') {
                    setSelectedNutrient('cholesterol_mg');
                  }
                }}
                style={{ cursor: 'pointer', marginBottom: 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '20px', marginRight: '10px' }}>{cat.icon}</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-header)' }}>{cat.name}</span>
                  </div>
                  <span style={{ fontSize: '20px' }}>→</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ── Step 2: 选择具体营养素（非胆固醇）──────── */}
      {selectedCat && !isCholesterol && !selectedNutrient && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
            <Button type="default" size="small" onClick={() => setSelectedCat('')}>← 返回</Button>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-header)' }}>
              {currentCat?.icon} {currentCat?.name}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {currentCat?.nutrients.map(n => (
              <Card
                key={n.key}
                color="default"
                className="food-stage"
                onClick={() => setSelectedNutrient(n.key)}
                style={{ cursor: 'pointer', marginBottom: 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-header)' }}>{n.label}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>({n.unit})</span>
                  </div>
                  <span style={{ fontSize: '20px' }}>→</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ── Step 3: 营养素排名（分页 + 筛选）───────── */}
      {selectedNutrient && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button type="default" size="small" onClick={() => {
                if (isCholesterol) {
                  setSelectedCat('');
                  setSelectedNutrient('');
                } else {
                  setSelectedNutrient('');
                }
                setFilterCat('');
              }}>
                ← {isCholesterol ? '返回' : '营养素'}
              </Button>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-header)' }}>
                {isCholesterol
                  ? `🥚 胆固醇含量排名`
                  : `${currentCat?.nutrients.find(n => n.key === selectedNutrient)?.label} ${currentCat?.nutrients.find(n => n.key === selectedNutrient)?.unit} 含量排名`}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Select
                options={[
                  { key: '', label: '全部大类' },
                  ...CN_FOOD_CATEGORIES.map(c => {
                    let label = c.name.replace(/^[^\s]+\s/, '');
                    if (c.id === '糖、果脯和蜜饯、蜂蜜') label = '糖、果脯和\n蜜饯、蜂蜜';
                    return { key: c.id, label };
                  }),
                ]}
                value={filterCat}
                onChange={v => setFilterCat(v as string)}
                aria-label="筛选食物大类"
              />
              <Button
                type={sortDesc ? 'primary' : 'default'}
                size="small"
                onClick={() => setSortDesc(d => !d)}
              >
                {sortDesc ? '⬇️ 降序' : '⬆️ 升序'}
              </Button>
            </div>
          </div>

          <RankTable
            nutrientKey={selectedNutrient}
            ageGroup={ageGroup}
            sortDesc={sortDesc}
            filterCat={filterCat}
            onFilterCatChange={setFilterCat}
          />
        </>
      )}
    </div>
  );
}
