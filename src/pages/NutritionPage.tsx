import { useState, useEffect, useCallback } from 'react';
import ImageViewer from '@/components/ImageViewer';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Select } from '@/lib';
import { Typewriter } from 'animal-island-ui';
import { getDRIOptions, getDRI } from '../data/nutrition';
import RankMode from './RankMode';
import {
  CN_FOOD_CATEGORIES,
  searchCnFoods,
  getCnFoodsByCategory,
  getSubCategories,
  CN_NUTRIENT_DISPLAY,
} from '../data/cnFoodCategories';
import type { CnFood } from '../data/cnFoodsTypes';
import 'animal-island-ui/dist/index.css';

type Mode = 'browse' | 'search' | 'rank' | 'towers';

const DRI_KEY_MAP: Record<string, string> = {
  energy_kcal: 'energy_kJ', // 食品数据用 kJ，显示时转 kcal
  protein_g: 'protein_g',
  fat_g: 'fat_g',
  carbs_g: 'carbohydrate_g',
  fiber_g: 'fiber_g',
  calcium_mg: 'calcium_mg',
  iron_mg: 'iron_mg',
  zinc_mg: 'zinc_mg',
  vitA_ug: 'vitaminA_ug',
  vitC_mg: 'vitaminC_mg',
  vitB1_mg: 'vitaminB1_mg',
  vitB2_mg: 'vitaminB2_mg',
  niacin_mg: 'niacin_mg',
  selenium_ug: 'selenium_ug',
  copper_mg: 'copper_mg',
  magnesium_mg: 'magnesium_mg',
  phosphorus_mg: 'phosphorus_mg',
  potassium_mg: 'potassium_mg',
  sodium_mg: 'sodium_mg',
};

function fmt(v: number | null): string {
  if (v === null || v === undefined) return '—';
  if (v === 0) return '0';
  if (Math.abs(v - Math.round(v)) < 0.01) return String(Math.round(v));
  return String(Math.round(v * 10) / 10);
}

function NutrientTable({ food, ageGroup, onAgeGroupChange }: { food: CnFood; ageGroup: string; onAgeGroupChange: (v: string) => void }) {
  const dris = getDRI(ageGroup);

  return (
    <div style={{ background: '#F7F3DF', borderRadius: 16, padding: 16, position: 'relative', overflow: 'visible' }}>
      <div className="animal-scrollable-5Wnhh">
        <table className="animal-table-Os4fM">
          <thead className="animal-thead-2ge5M">
            <tr className="animal-headerRow-sAsWX">
              <th className="animal-headerCell-LhL6h" style={{ fontSize: 15 }}>营养素</th>
              <th className="animal-headerCell-LhL6h" style={{ fontSize: 15, textAlign: 'right' }}>每100g</th>
              <th className="animal-headerCell-LhL6h" style={{ fontSize: 15, textAlign: 'right', whiteSpace: 'nowrap' }}>
                占每日需求量%
                <AgeSelectorInline value={ageGroup} onChange={onAgeGroupChange} />
              </th>
            </tr>
          </thead>
          <tbody className="animal-tbody-3RGsp">
            {CN_NUTRIENT_DISPLAY.map((n) => {
              const rawVal = (food as unknown as Record<string, unknown>)[n.key];
              const val = n.key === 'energy_kcal'
                ? (typeof rawVal === 'number' ? rawVal / 4.184 : null)
                : (typeof rawVal === 'number' ? rawVal : null);
              const drv = n.dri_key
                ? (dris as unknown as Record<string, number>)[DRI_KEY_MAP[n.key] || n.key] || 0
                : 0;
              const pct = drv > 0 && val !== null && val > 0 ? Math.round((val / drv) * 100) : 0;

              let pctColor = 'var(--text-muted)';
              let pctBg = 'transparent';
              if (pct > 0 && pct <= 33) { pctColor = '#fff'; pctBg = 'var(--error)'; }
              else if (pct > 33 && pct <= 66) { pctColor = '#fff'; pctBg = 'var(--warning)'; }
              else if (pct > 66) { pctColor = '#fff'; pctBg = 'var(--success)'; }

              return (
                <tr key={n.key} className="animal-row-iDOMw">
                  <td className="animal-cell-4PAU2">{n.label}</td>
                  <td className="animal-cell-4PAU2" style={{ textAlign: 'right', fontWeight: 500 }}>
                    {val !== null ? `${fmt(val)} ${n.unit}` : '—'}
                  </td>
                  <td className="animal-cell-4PAU2" style={{ textAlign: 'right' }}>
                    {drv > 0 && val !== null && val > 0 ? (
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
                        background: pctBg, color: pctColor, fontWeight: 600, fontSize: 12, minWidth: 40, textAlign: 'center',
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
      <div style={{ marginTop: 12, padding: 10, background: 'var(--bg-secondary)', borderRadius: 8 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          💡 占每日需求量% = 100g该食物 ÷ 该年龄段推荐摄入量。<br />
          数据来源：中国疾病预防控制中心营养与健康所。
        </p>
      </div>
    </div>
  );
}

function AgeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = getDRIOptions();
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      aria-label="选择孩子年龄"
    />
  );
}

function AgeSelectorInline({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = getDRIOptions();
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        fontSize: '11px',
        color: 'var(--text-secondary)',
        background: 'transparent',
        border: '1px solid var(--border-light)',
        borderRadius: '6px',
        padding: '2px 4px',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {options.map(opt => (
        <option key={opt.key} value={opt.key}>{opt.label}</option>
      ))}
    </select>
  );
}

export default function NutritionPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('browse');
  const [ageGroup, setAgeGroup] = useState<string>('1-3y');
  const [query, setQuery] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [selectedSubCat, setSelectedSubCat] = useState<string>('');
  const [selectedFood, setSelectedFood] = useState<CnFood | null>(null);
  const [searchResults, setSearchResults] = useState<CnFood[]>([]);
  const [towerModal, setTowerModal] = useState<string>('');

  const handleCatChange = useCallback((cat1: string) => {
    setSelectedCat(cat1);
    setSelectedSubCat('');
    setSelectedFood(null);
  }, []);

  const handleSubCatChange = useCallback((subCat: string) => {
    setSelectedSubCat(subCat);
    setSelectedFood(null);
  }, []);

  // ── 搜索防抖 ────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'search' || query.trim().length < 1) { setSearchResults([]); return; }
    const timer = setTimeout(() => setSearchResults(searchCnFoods(query.trim())), 300);
    return () => clearTimeout(timer);
  }, [query, mode]);

  // ── 营养素排名模式（条件渲染） ────────────────────────
  if (mode === 'rank') {
    return (
      <div className="nutrition-page ac-fade-up">
        <div className="page-header">
          <h2 className="page-title">🏆 营养素排名</h2>
          <div className="page-desc"><Typewriter speed={60}>查食物营养素含量，了解孩子每日所需</Typewriter></div>
        </div>

        <Card className="mb-16">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button type={(mode as Mode) === 'browse' ? 'primary' : 'default'} onClick={() => { setMode('browse'); setSelectedFood(null); setSelectedCat(''); setSelectedSubCat(''); }}>📂 分类浏览</Button>
            <Button type={(mode as Mode) === 'search' ? 'primary' : 'default'} onClick={() => { setMode('search'); setSelectedFood(null); }}>🔍 搜索食物</Button>
            <Button type={(mode as Mode) === 'rank' ? 'primary' : 'default'} onClick={() => setMode('rank')}>🏆 营养素排名</Button>
            <Button type={(mode as Mode) === 'towers' ? 'primary' : 'default'} onClick={() => setMode('towers')}>🏯 膳食宝塔</Button>
          </div>
        </Card>

        <Card className="mb-16">
          <div className="form-group">
            <label className="form-label">选择孩子年龄（计算占日需百分比）</label>
            <div style={{ marginTop: '8px' }}>
              <AgeSelector value={ageGroup} onChange={setAgeGroup} />
            </div>
          </div>
        </Card>
        <RankMode ageGroup={ageGroup} />
        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-content)', borderRadius: '12px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            ⚠️ 数据来源于中国疾病预防控制中心营养与健康所，仅供参考。
          </p>
        </div>
      </div>
    );
  }

  // ── 膳食宝塔模式（条件渲染） ──────────────────────────
  if (mode === 'towers') {
    return (
      <div className="nutrition-page ac-fade-up">
        <div className="page-header">
          <Button size="small" onClick={() => navigate('/')} className="back-btn">← 返回</Button>
          <h2 className="page-title">🏯 膳食宝塔</h2>
        </div>

        <Card className="mb-16">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button type={(mode as Mode) === 'browse' ? 'primary' : 'default'} onClick={() => { setMode('browse'); setSelectedFood(null); setSelectedCat(''); setSelectedSubCat(''); }} size="small">📂 分类浏览</Button>
            <Button type={(mode as Mode) === 'search' ? 'primary' : 'default'} onClick={() => { setMode('search'); setSelectedFood(null); }} size="small">🔍 搜索食物</Button>
            <Button type={(mode as Mode) === 'rank' ? 'primary' : 'default'} onClick={() => setMode('rank')} size="small">🏆 营养素排名</Button>
            <Button type={(mode as Mode) === 'towers' ? 'primary' : 'default'} onClick={() => setMode('towers')} size="small">🏯 膳食宝塔</Button>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {[
            { key: 'tower-toddler', label: '中国学龄前儿童\n平衡膳食宝塔', img: '/images/diet-tower-toddler.jpg' },
            { key: 'tower-child', label: '6~10岁学龄儿童\n平衡膳食宝塔', img: '/images/diet-tower-child.jpg' },
            { key: 'tower-teen', label: '11~13岁学龄儿童\n平衡膳食宝塔', img: '/images/diet-tower-teen.jpg' },
            { key: 'tower-teen-old', label: '14~17岁学龄儿童\n平衡膳食宝塔', img: '/images/diet-tower-teen-old.jpg' },
          ].map(item => (
            <div
              key={item.key}
              onClick={() => setTowerModal(item.img)}
              style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-color)', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = ''; }}
            >
              <img src={item.img} alt={item.label} style={{ width: '100%', height: '160px', objectFit: 'cover', objectPosition: 'top' }} />
              <div style={{ padding: '8px 10px', fontSize: '12px', color: 'var(--text-body)', background: 'var(--bg-primary)', whiteSpace: 'pre-line', textAlign: 'center', lineHeight: 1.4 }}>{item.label}</div>
            </div>
          ))}
        </div>
        {towerModal && <ImageViewer src={towerModal} alt="膳食宝塔" onClose={() => setTowerModal('')} />}
      </div>
    );
  }

  // ── 主界面（浏览 + 搜索） ────────────────────────────────
  return (
    <div className="nutrition-page ac-fade-up">
      <div className="page-header">
        <h2 className="page-title">🥗 营养查询</h2>
        <div className="page-desc"><Typewriter speed={60}>查食物营养素含量，了解孩子每日所需</Typewriter></div>
      </div>

      <Card className="mb-16">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button type={mode === 'browse' ? 'primary' : 'default'} onClick={() => { setMode('browse'); setSelectedFood(null); setSelectedCat(''); setSelectedSubCat(''); }}>📂 分类浏览</Button>
          <Button type={mode === 'search' ? 'primary' : 'default'} onClick={() => { setMode('search'); setSelectedFood(null); }}>🔍 搜索食物</Button>
          <Button type={(mode as Mode) === 'rank' ? 'primary' : 'default'} onClick={() => setMode('rank')}>🏆 营养素排名</Button>
          <Button type={(mode as Mode) === 'towers' ? 'primary' : 'default'} onClick={() => setMode('towers')}>🏯 膳食宝塔</Button>
        </div>
      </Card>

      {/* ── 分类浏览 ──────────────────────────────────── */}
      {mode === 'browse' && (
        <>
          {/* 未选分类 → 显示 16 大类网格 */}
          {!selectedCat && (
            <div style={{ background: 'var(--bg-content)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                共 16 个食物大类，点击进入
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {CN_FOOD_CATEGORIES.map(cat => (
                  <Button
                    key={cat.id}
                    type="default"
                    onClick={() => handleCatChange(cat.id)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 已选大类 → 显示该类子类/食物列表（选中食物时也保留，方便后退） */}
          {selectedCat && (
            <div style={{ background: 'var(--bg-content)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
              {/* 子类选择区 */}
              {(() => {
                const subcats = getSubCategories(selectedCat);
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px' }}>
                      <Button type="default" size="small" onClick={() => { setSelectedCat(''); setSelectedSubCat(''); setSelectedFood(null); }}>返回全部</Button>
                      <span style={{ color: 'var(--text-muted)' }}>/</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-header)' }}>{selectedCat}</span>
                      {selectedSubCat && (
                        <>
                          <span style={{ color: 'var(--text-muted)' }}>/</span>
                          <Button type="default" size="small" onClick={() => { setSelectedSubCat(''); setSelectedFood(null); }}>返回子类</Button>
                          <span style={{ color: 'var(--text-muted)' }}>/</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-header)' }}>{selectedSubCat}</span>
                        </>
                      )}
                    </div>

                    {/* 如果子类 > 1 个，显示子类选择网格 */}
                    {subcats.length > 1 && !selectedSubCat && (
                      <div className="animal-zoom-in">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                          {subcats.map(sub => (
                            <Button
                              key={sub.name}
                              type="default"
                              onClick={() => handleSubCatChange(sub.name)}
                            >
                              {sub.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 子类已选或仅有一个子类，直接展示食物列表 */}
                    {(selectedSubCat || subcats.length === 1) && !selectedFood && (
                      <div className="animal-zoom-in">
                        {(() => {
                          const targetSub = selectedSubCat || subcats[0].name;
                          const foods = getCnFoodsByCategory(selectedCat).filter(f => (f.cat2 || '（无子类）') === targetSub);
                          return (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                              共 {foods.length} 种
                            </div>
                          );
                        })()}
                        {getCnFoodsByCategory(selectedCat)
                          .filter(f => (f.cat2 || '（无子类）') === (selectedSubCat || subcats[0].name))
                          .map(food => (
                            <Card
                              key={food.food_name}
                              color="default"
                              className="food-stage"
                              onClick={() => setSelectedFood(food)}
                              style={{ marginBottom: '8px', cursor: 'pointer' }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-header)' }}>{food.food_name}</div>
                                <span style={{ fontSize: '20px' }}>→</span>
                              </div>
                            </Card>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* ── 搜索模式 ──────────────────────────────────── */}
      {mode === 'search' && (
        <div>
          <Card className="mb-16">
            <Input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); if (e.target.value) setSelectedFood(null); }}
              placeholder="输入食物名称，如：冬枣、鸡胸肉、三文鱼..."
            />
            {query.trim().length > 0 && !selectedFood && (
              <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                找到 {searchResults.length} 条结果
              </p>
            )}
          </Card>

          {/* 搜索结果列表（选中食物后隐藏） */}
          {!selectedFood && (
            <div className="animal-zoom-in">
              {query.trim().length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>🔍 输入食物名称开始搜索</div>
              )}
              {query.trim().length > 0 && searchResults.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>没有找到「{query}」，试试其他关键词</div>
              )}
              {searchResults.map(food => (
                <Card
                  key={food.food_name}
                  color="default"
                  className="food-stage"
                  onClick={() => setSelectedFood(food)}
                  style={{ marginBottom: '8px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-header)' }}>{food.food_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{food.cat1}</div>
                    </div>
                    <span style={{ fontSize: '20px' }}>→</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 食物营养详情 ──────────────────────────────── */}
      {selectedFood && (
        <Card color="app-blue" className="animal-zoom-in">
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-header)', marginBottom: '4px' }}>
              🍽️ {selectedFood.food_name}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {selectedFood.cat1} · 每100g可食部分营养含量
            </p>
          </div>
          <NutrientTable food={selectedFood} ageGroup={ageGroup} onAgeGroupChange={setAgeGroup} />
        </Card>
      )}

      <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-content)', borderRadius: '12px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          ⚠️ 数据来源于中国疾病预防控制中心营养与健康所，仅供参考。
        </p>
      </div>
    </div>
  );
}
