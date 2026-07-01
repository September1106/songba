import { useState, useEffect, useCallback } from 'react';
import ImageViewer from '@/components/ImageViewer';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Select } from '@/lib';
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

type Mode = 'browse' | 'search' | 'rank' | 'towers';

const DRI_KEY_MAP: Record<string, string> = {
  energy_kcal: 'energy_kcal',
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

function NutrientTable({ food, ageGroup }: { food: CnFood; ageGroup: string }) {
  const dris = getDRI(ageGroup);

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-header)', fontWeight: 600 }}>营养素</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-header)', fontWeight: 600 }}>每100g</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-header)', fontWeight: 600 }}>占日需%</th>
            </tr>
          </thead>
          <tbody>
            {CN_NUTRIENT_DISPLAY.map((n, idx) => {
              const rawVal = (food as unknown as Record<string, unknown>)[n.key];
              const val = typeof rawVal === 'number' ? rawVal : null;
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
                <tr key={n.key} style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-content)' }}>
                  <td style={{ padding: '8px 10px', color: 'var(--text-body)' }}>{n.label}</td>
                  <td style={{
                    padding: '8px 10px', textAlign: 'right',
                    color: n.key === 'vitC_mg' && val !== null && val > 0 ? '#e05a5a' : 'var(--text-body)',
                    fontWeight: (n.key === 'vitC_mg' && val !== null && val > 0) ? 700 : 500,
                  }}>
                    {val !== null ? `${fmt(val)} ${n.unit}` : '—'}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                    {drv > 0 && val !== null && val > 0 ? (
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
      <div style={{ marginTop: '12px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          💡 占日需% = 100g该食物 ÷ 该年龄段推荐摄入量。<br />
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

  // ── 膳食宝塔模式 ───────────────────────────────────────
  if (mode === 'towers') {
    return (
      <div className="nutrition-page ac-fade-up">
        <div className="page-header">
          <Button size="small" onClick={() => navigate('/')} className="back-btn">← 返回</Button>
          <h2 className="page-title">🏯 膳食宝塔</h2>
        </div>
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

  // ── 营养素排名模式 ─────────────────────────────────────
  if (mode === 'rank') {
    return (
      <div className="nutrition-page ac-fade-up">
        <div className="page-header">
          <Button size="small" onClick={() => navigate('/')} className="back-btn">← 返回</Button>
          <h2 className="page-title">🏆 营养素排名</h2>
        </div>
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

  // ── 主界面（浏览 + 搜索） ────────────────────────────────
  return (
    <div className="nutrition-page ac-fade-up">
      <div className="page-header">
        <Button size="small" onClick={() => navigate('/')} className="back-btn">← 返回</Button>
        <h2 className="page-title">🥗 营养查询</h2>
      </div>

      <Card className="mb-16">
        <div className="form-group">
          <label className="form-label">选择孩子年龄（计算占日需百分比）</label>
          <div style={{ marginTop: '8px' }}>
            <AgeSelector value={ageGroup} onChange={setAgeGroup} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <Button type={mode === 'browse' ? 'primary' : 'default'} onClick={() => { setMode('browse'); setSelectedFood(null); }} size="small">📂 分类浏览</Button>
          <Button type={mode === 'search' ? 'primary' : 'default'} onClick={() => { setMode('search'); setSelectedFood(null); }} size="small">🔍 搜索食物</Button>
          <Button type={(mode as Mode) === 'rank' ? 'primary' : 'default'} onClick={() => setMode('rank')} size="small">🏆 营养素排名</Button>
          <Button type={(mode as Mode) === 'towers' ? 'primary' : 'default'} onClick={() => setMode('towers')} size="small">🏯 膳食宝塔</Button>
        </div>
      </Card>

      {/* ── 分类浏览 ──────────────────────────────────── */}
      {mode === 'browse' && !selectedFood && (
        <>
          {/* 未选分类 → 显示 16 大类网格 */}
          {!selectedCat && (
            <div style={{ background: 'var(--bg-content)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                共 16 个食物大类，点击进入
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                {CN_FOOD_CATEGORIES.map(cat => (
                  <Card
                    key={cat.id}
                    color="default"
                    className="food-stage"
                    onClick={() => handleCatChange(cat.id)}
                    style={{ cursor: 'pointer', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>{cat.name.split(' ')[0]}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-header)', lineHeight: 1.2, marginBottom: '2px' }}>
                      {cat.name.replace(/^[^\s]+\s/, '')}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cat.count} 种</div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 已选大类 → 显示该类子类/食物列表 */}
          {selectedCat && !selectedFood && (
            <div style={{ background: 'var(--bg-content)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
              {/* 子类选择区 */}
              {(() => {
                const subcats = getSubCategories(selectedCat);
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px' }}>
                      <Button type="default" size="small" onClick={() => setSelectedCat('')}>← 全部</Button>
                      <span style={{ color: 'var(--text-muted)' }}>/</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-header)' }}>{selectedCat}</span>
                    </div>

                    {/* 如果子类 > 1 个，显示子类选择网格 */}
                    {subcats.length > 1 && !selectedSubCat && (
                      <div className="animal-zoom-in">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                          {subcats.map(sub => (
                            <Card
                              key={sub.name}
                              color="default"
                              className="food-stage"
                              onClick={() => handleSubCatChange(sub.name)}
                              style={{ cursor: 'pointer', textAlign: 'center' }}
                            >
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-header)', lineHeight: 1.2 }}>{sub.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{sub.count} 种</div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 子类已选或仅有一个子类，直接展示食物列表 */}
                    {(selectedSubCat || subcats.length === 1) && (
                      <div className="animal-zoom-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px' }}>
                          {subcats.length > 1 && (
                            <>
                              <Button type="default" size="small" onClick={() => setSelectedSubCat('')}>← 子类</Button>
                              <span style={{ color: 'var(--text-muted)' }}>/</span>
                            </>
                          )}
                          <span style={{ fontWeight: 600, color: 'var(--text-header)' }}>{selectedSubCat || subcats[0].name}</span>
                        </div>
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
      {mode === 'search' && !selectedFood && (
        <div>
          <Card className="mb-16">
            <Input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="输入食物名称，如：冬枣、鸡胸肉、三文鱼..."
            />
            {query.trim().length > 0 && (
              <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                找到 {searchResults.length} 条结果
              </p>
            )}
          </Card>
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
          <NutrientTable food={selectedFood} ageGroup={ageGroup} />
          <div style={{ marginTop: '16px' }}>
            <Button type="default" size="small" onClick={() => setSelectedFood(null)}>重新选择</Button>
          </div>
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
