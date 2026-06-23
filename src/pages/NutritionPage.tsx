import { useState, useEffect, useCallback } from 'react';
import ImageViewer from '@/components/ImageViewer';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Select } from '@/lib';
import { FOOD_CATEGORIES, searchFoods, getFoodNutrients, VEGGIE_SUBCATEGORIES, FRUIT_SUBCATEGORIES, MEAT_SUBCATEGORIES, SEAFOOD_SUBCATEGORIES, MILK_LEGUMES_SUBCATEGORIES, GRAINS_SUBCATEGORIES } from '../data/foodCategories';
import { getDRIOptions, getDRI, NUTRIENT_LABELS } from '../data/nutrition';
import { searchUSDAFoods, convertUSDANutrients, formatFoodDescription, cnFoodName, type USDASearchResult } from '../data/usdaApi';
import { USDA_FOUNDATION_FOODS, USDA_FOUNDATION_BY_CAT } from '../data/usdaFoundation';
import { prepareSearchQuery } from '../data/cnToEn';
import type { DRIValue } from '../data/nutrition';

type Mode = 'browse' | 'search' | 'towers';

interface DisplayFood {
  id: string;
  name: string;
  source: 'usda' | 'local';
  nutrients: Record<string, number>;
  categoryPath?: string;
  fdcId?: number;
  description?: string;
}

export default function NutritionPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('browse');
  const [ageGroup, setAgeGroup] = useState<string>('1-3y');
  const [query, setQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedVeggieSubcat, setSelectedVeggieSubcat] = useState<string>('');
  const [selectedFruitSubcat, setSelectedFruitSubcat] = useState<string>('');
  const [selectedMeatSubcat, setSelectedMeatSubcat] = useState<string>('');
  const [selectedSeafoodSubcat, setSelectedSeafoodSubcat] = useState<string>('');
  const [selectedMilkLegumesSubcat, setSelectedMilkLegumesSubcat] = useState<string>('');
  const [selectedGrainSubcat, setSelectedGrainSubcat] = useState<string>('');
  const [selectedFood, setSelectedFood] = useState<DisplayFood | null>(null);
  const [towerModal, setTowerModal] = useState<string>('');
  const [searchResults, setSearchResults] = useState<DisplayFood[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const ageOptions = getDRIOptions();
  const dris = getDRI(ageGroup);

  const handleCategoryChange = useCallback((catId: string) => {
    setSelectedCategory(catId);
    setSelectedVeggieSubcat('');
    setSelectedMilkLegumesSubcat('');
    setSelectedGrainSubcat('');
    setSelectedFruitSubcat('');
    setSelectedMeatSubcat('');
    setSelectedSeafoodSubcat('');
    setSelectedFood(null);
  }, []);

  const handleVeggieSubcatChange = useCallback((subcat: string) => {
    setSelectedVeggieSubcat(subcat);
    setSelectedFood(null);
  }, []);

  const handleFruitSubcatChange = useCallback((subcat: string) => {
    setSelectedFruitSubcat(subcat);
    setSelectedFood(null);
  }, []);

  const handleMeatSubcatChange = useCallback((subcat: string) => {
    setSelectedMeatSubcat(subcat);
    setSelectedFood(null);
  }, []);

  const handleSeafoodSubcatChange = useCallback((subcat: string) => {
    setSelectedSeafoodSubcat(subcat);
    setSelectedFood(null);
  }, []);

  const handleMilkLegumesSubcatChange = useCallback((subcat: string) => {
    setSelectedMilkLegumesSubcat(subcat);
    setSelectedFood(null);
  }, []);

  const handleGrainSubcatChange = useCallback((subcat: string) => {
    setSelectedGrainSubcat(subcat);
    setSelectedFood(null);
  }, []);

  const doSearch = useCallback((q: string) => {
    if (q.length < 1) {
      setSearchResults([]);
      return;
    }
    const results = searchFoods(q).map(f => ({ ...f, source: 'local' as const }));
    setSearchResults(results);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mode === 'search' && query.length > 0) {
        const englishQuery = prepareSearchQuery(query);
        doSearch(englishQuery);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, mode, doSearch]);

  const NutrientDisplay = ({ nutrients }: { nutrients: Record<string, number> | null }) => {
    if (!nutrients || Object.keys(nutrients).length === 0) return null;

    const nutrientKeys = ['energy_kcal', 'protein_g', 'fat_g', 'carbohydrate_g', 'fiber_g', 'calcium_mg', 'iron_mg', 'zinc_mg', 'vitaminA_ug', 'vitaminC_mg', 'vitaminD_ug'] as (keyof DRIValue)[];

    return (
      <div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-header)', fontWeight: 600 }}>营养素</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-header)', fontWeight: 600 }}>每100g含量</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-header)', fontWeight: 600 }}>占日需%</th>
              </tr>
            </thead>
            <tbody>
              {nutrientKeys.map((key, idx) => {
                const val = nutrients[key] || 0;
                const drv = dris[key];
                const pct = drv > 0 ? Math.round((val / drv) * 100) : 0;

                let pctColor = 'var(--text-muted)';
                let pctBg = 'transparent';
                if (pct > 0 && pct <= 33) { pctColor = '#fff'; pctBg = 'var(--error)'; }
                else if (pct > 33 && pct <= 66) { pctColor = '#fff'; pctBg = 'var(--warning)'; }
                else if (pct > 66) { pctColor = '#fff'; pctBg = 'var(--success)'; }

                return (
                  <tr key={key} style={{ borderBottom: '1px solid var(--border-light)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-content)' }}>
                    <td style={{ padding: '8px 10px', color: 'var(--text-body)' }}>
                      {NUTRIENT_LABELS[key].label}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-body)', fontWeight: 500 }}>
                      {val} {NUTRIENT_LABELS[key].unit}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      {drv > 0 ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          background: pctBg,
                          color: pctColor,
                          fontWeight: 600,
                          fontSize: '12px',
                          minWidth: '40px',
                          textAlign: 'center',
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
          <p className="text-sm text-muted" style={{ fontSize: '12px' }}>
            💡 占日需% = 100g该食物 ÷ 该年龄段推荐摄入量。日需量参考《中国居民膳食指南2022》。营养数据来源于 USDA FoodData Central。
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="nutrition-page ac-fade-up">
      <div className="page-header">
        <Button size="small" onClick={() => navigate('/')} className="back-btn">← 返回</Button>
        <h2 className="page-title">🥗 营养查询</h2>
      </div>

      <Card className="mb-16">
        <div className="form-group">
          <label className="form-label">选择孩子年龄（计算日需百分比）</label>
          <Select
            value={ageGroup}
            onChange={val => setAgeGroup(val)}
            options={ageOptions}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <Button
            type={mode === 'browse' ? 'primary' : 'default'}
            onClick={() => setMode('browse')}
            size="small"
          >
            📂 分类浏览
          </Button>
          <Button
            type={mode === 'search' ? 'primary' : 'default'}
            onClick={() => setMode('search')}
            size="small"
          >
            🔍 搜索食物
          </Button>
          <Button
            type={mode === 'towers' ? 'primary' : 'default'}
            onClick={() => setMode('towers')}
            size="small"
          >
🏯 膳食宝塔
          </Button>
        </div>
      </Card>

      {/* 膳食宝塔模式 */}
      {mode === 'towers' && (
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
              style={{
                cursor: 'pointer',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid var(--border-color)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = '';
                el.style.boxShadow = '';
              }}
            >
              <img
                src={item.img}
                alt={item.label}
                style={{
                  width: '100%',
                  height: '160px',
                  objectFit: 'cover',
                  objectPosition: 'top',
                }}
              />
              <div style={{
                padding: '8px 10px',
                fontSize: '12px',
                color: 'var(--text-body)',
                background: 'var(--bg-primary)',
                whiteSpace: 'pre-line',
                textAlign: 'center',
                lineHeight: 1.4,
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分类浏览模式 */}
      {mode === 'browse' && (
        <div style={{ background: 'var(--bg-content)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
          {/* 第一行：一级分类卡片 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {FOOD_CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryChange(isActive ? '' : cat.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-base)',
                    background: isActive ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: isActive ? '#fff' : 'var(--text-body)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    border: isActive ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                    userSelect: 'none',
                  }}
                >
                  {cat.name.replace(/^[\S]+\s/, ' ')}
                </div>
              );
            })}
          </div>

          {/* 蔬菜类：悬停时显示6个子类横向栏 */}
          {selectedCategory === 'vegetables' && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '12px',
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-base)',
            }}>
              {Object.entries(VEGGIE_SUBCATEGORIES).map(([key, subcat]) => {
                const isActive = selectedVeggieSubcat === key;
                return (
                  <div
                    key={key}
                    onClick={() => handleVeggieSubcatChange(isActive ? '' : key)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: isActive ? 'var(--primary)' : 'var(--bg-content)',
                      color: isActive ? '#fff' : 'var(--text-body)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      border: '1.5px solid ' + (isActive ? 'var(--primary)' : 'var(--border-color)'),
                      userSelect: 'none',
                    }}
                  >
                    {subcat.name.replace(/^[\S]+\s/, ' ')}
                  </div>
                );
              })}
            </div>
          )}

          {/* 水果类：显示6个子类横向栏 */}
          {selectedCategory === 'fruits' && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '12px',
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-base)',
            }}>
              {Object.entries(FRUIT_SUBCATEGORIES).map(([key, subcat]) => {
                const isActive = selectedFruitSubcat === key;
                return (
                  <div
                    key={key}
                    onClick={() => handleFruitSubcatChange(isActive ? '' : key)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: isActive ? 'var(--primary)' : 'var(--bg-content)',
                      color: isActive ? '#fff' : 'var(--text-body)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      border: '1.5px solid ' + (isActive ? 'var(--primary)' : 'var(--border-color)'),
                      userSelect: 'none',
                    }}
                  >
                    {subcat.name.replace(/^[\S]+\s/, ' ')}
                  </div>
                );
              })}
            </div>
          )}

          {/* 肉类：显示4个子类横向栏 */}
          {selectedCategory === 'meats' && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '12px',
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-base)',
            }}>
              {Object.entries(MEAT_SUBCATEGORIES).map(([key, subcat]) => {
                const isActive = selectedMeatSubcat === key;
                return (
                  <div
                    key={key}
                    onClick={() => handleMeatSubcatChange(isActive ? '' : key)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: isActive ? 'var(--primary)' : 'var(--bg-content)',
                      color: isActive ? '#fff' : 'var(--text-body)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      border: '1.5px solid ' + (isActive ? 'var(--primary)' : 'var(--border-color)'),
                      userSelect: 'none',
                    }}
                  >
                    {subcat.name.replace(/^[\S]+\s/, ' ')}
                  </div>
                );
              })}
            </div>
          )}

          {/* 非蔬菜/水果/肉类：直接显示食物列表 */}
          {!selectedFood && selectedCategory && selectedCategory !== 'vegetables' && selectedCategory !== 'fruits' && selectedCategory !== 'meats' && (
            <div className="animal-zoom-in">
              {FOOD_CATEGORIES.find(c => c.id === selectedCategory)?.children?.map(food => (
                <Card
                  key={food.id}
                  color={'default'}
                  className={'food-stage'}
                  onClick={() => setSelectedFood({
                    id: food.id,
                    name: food.name,
                    source: 'local',
                    nutrients: getFoodNutrients(food.id) || {},
                  })}
                  style={{ marginBottom: '8px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-header)' }}>{food.name}</div>
                    </div>
                    <span style={{ fontSize: '20px' }}>→</span>
                  </div>
                </Card>
              ))}
              {(selectedCategory in USDA_FOUNDATION_BY_CAT) &&
                USDA_FOUNDATION_BY_CAT[selectedCategory].children.map(food => (
                <Card
                  key={food.id}
                  color={'default'}
                  className={'food-stage'}
                  onClick={() => setSelectedFood({
                    id: food.id,
                    name: food.name,
                    source: 'usda',
                    nutrients: USDA_FOUNDATION_FOODS[food.id] || {},
                  })}
                  style={{ marginBottom: '8px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-header)' }}>
                        {food.name}
                        <span style={{ fontSize: '11px', color: '#888', marginLeft: '6px' }}>USDA</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '20px' }}>→</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 水果类：选中小类后显示水果列表 */}
          {!selectedFood && selectedCategory === 'fruits' && selectedFruitSubcat && (
            <div className="animal-zoom-in">
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                {FRUIT_SUBCATEGORIES[selectedFruitSubcat]?.name.replace(/^[\S]+\s/, ' ')} · {FRUIT_SUBCATEGORIES[selectedFruitSubcat]?.items.length} 种
              </div>
              {FRUIT_SUBCATEGORIES[selectedFruitSubcat]?.items.map(item => (
                <Card
                  key={item.id}
                  color={'default'}
                  className={'food-stage'}
                  onClick={() => setSelectedFood({
                    id: item.id,
                    name: item.name,
                    source: 'local',
                    nutrients: getFoodNutrients(item.id) || {},
                  })}
                  style={{ marginBottom: '8px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-header)' }}>{item.name}</div>
                    </div>
                    <span style={{ fontSize: '20px' }}>→</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 水果类：未选中小类时显示提示 */}
          {selectedCategory === 'fruits' && !selectedFruitSubcat && (
            <div className="empty-state">
              <div className="empty-state-icon">🍎</div>
              <p>请从上方选择水果子类</p>
            </div>
          )}

          {/* 肉类：选中小类后显示肉类列表 */}
          {/* 水产品：显示2个子类横向栏 */}
          {selectedCategory === 'seafoods' && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '12px',
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-base)',
            }}>
              {Object.entries(SEAFOOD_SUBCATEGORIES).map(([key, subcat]) => {
                const isActive = selectedSeafoodSubcat === key;
                return (
                  <div
                    key={key}
                    onClick={() => handleSeafoodSubcatChange(isActive ? '' : key)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: isActive ? 'var(--primary)' : 'var(--bg-content)',
                      color: isActive ? '#fff' : 'var(--text-body)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      border: '1.5px solid ' + (isActive ? 'var(--primary)' : 'var(--border-color)'),
                      userSelect: 'none',
                    }}
                  >
                    {subcat.name.replace(/^[\S]+\s/, ' ')}
                  </div>
                );
              })}
            </div>
          )}

          {/* 水产品：选中小类后显示列表 */}
          {!selectedFood && selectedCategory === 'seafoods' && selectedSeafoodSubcat && (
            <div className="animal-zoom-in">
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                {SEAFOOD_SUBCATEGORIES[selectedSeafoodSubcat]?.name.replace(/^[\S]+\s/, ' ')} · {SEAFOOD_SUBCATEGORIES[selectedSeafoodSubcat]?.items.length} 种
              </div>
              {SEAFOOD_SUBCATEGORIES[selectedSeafoodSubcat]?.items.map(item => (
                <Card
                  key={item.id}
                  color={'default'}
                  className={'food-stage'}
                  onClick={() => setSelectedFood({
                    id: item.id,
                    name: item.name,
                    source: 'local',
                    nutrients: getFoodNutrients(item.id) || {},
                  })}
                  style={{ marginBottom: '8px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-header)' }}>{item.name}</div>
                    </div>
                    <span style={{ fontSize: '20px' }}>→</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 水产品：未选中小类时显示提示 */}
          {selectedCategory === 'seafoods' && !selectedSeafoodSubcat && (
            <div className="empty-state">
              <div className="empty-state-icon">🐟</div>
              <p>请从上方选择水产品子类</p>
            </div>
          )}

          {/* 奶豆类：显示2个子类横向栏 */}
          {selectedCategory === 'milk_legumes' && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '12px',
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-base)',
            }}>
              {Object.entries(MILK_LEGUMES_SUBCATEGORIES).map(([key, subcat]) => {
                const isActive = selectedMilkLegumesSubcat === key;
                return (
                  <div
                    key={key}
                    onClick={() => handleMilkLegumesSubcatChange(isActive ? '' : key)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: isActive ? 'var(--primary)' : 'var(--bg-content)',
                      color: isActive ? '#fff' : 'var(--text-body)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      border: '1.5px solid ' + (isActive ? 'var(--primary)' : 'var(--border-color)'),
                      userSelect: 'none',
                    }}
                  >
                    {subcat.name.replace(/^[_\S]+\s/, ' ')}
                  </div>
                );
              })}
            </div>
          )}

          {/* 奶豆类：选中小类后显示列表 */}
          {!selectedFood && selectedCategory === 'milk_legumes' && selectedMilkLegumesSubcat && (
            <div className="animal-zoom-in">
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                {MILK_LEGUMES_SUBCATEGORIES[selectedMilkLegumesSubcat]?.name.replace(/^[\S]+\s/, ' ')} · {MILK_LEGUMES_SUBCATEGORIES[selectedMilkLegumesSubcat]?.items.length} 种
              </div>
              {MILK_LEGUMES_SUBCATEGORIES[selectedMilkLegumesSubcat]?.items.map(item => (
                <Card
                  key={item.id}
                  color={'default'}
                  className={'food-stage'}
                  onClick={() => setSelectedFood({
                    id: item.id,
                    name: item.name,
                    source: 'local',
                    nutrients: getFoodNutrients(item.id) || {},
                  })}
                  style={{ marginBottom: '8px', cursor: 'pointer' }}
                >
                  <div className="food-name">{item.name}</div>
                </Card>
              ))}
            </div>
          )}

          {/* 奶豆类：未选中小类时显示提示 */}
          {selectedCategory === 'milk_legumes' && !selectedMilkLegumesSubcat && (
            <div className="empty-state">
              <div className="empty-state-icon">🥛🫘</div>
              <p>请从上方选择奶类或豆类</p>
            </div>
          )}

          {/* 肉类：选中小类后显示肉类列表 */}
          {!selectedFood && selectedCategory === 'meats' && selectedMeatSubcat && (
            <div className="animal-zoom-in">
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                {MEAT_SUBCATEGORIES[selectedMeatSubcat]?.name.replace(/^[\S]+\s/, ' ')} · {MEAT_SUBCATEGORIES[selectedMeatSubcat]?.items.length} 种
              </div>
              {MEAT_SUBCATEGORIES[selectedMeatSubcat]?.items.map(item => (
                <Card
                  key={item.id}
                  color={'default'}
                  className={'food-stage'}
                  onClick={() => setSelectedFood({
                    id: item.id,
                    name: item.name,
                    source: 'local',
                    nutrients: getFoodNutrients(item.id) || {},
                  })}
                  style={{ marginBottom: '8px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-header)' }}>{item.name}</div>
                    </div>
                    <span style={{ fontSize: '20px' }}>→</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 肉类：未选中小类时显示提示 */}
          {selectedCategory === 'meats' && !selectedMeatSubcat && (
            <div className="empty-state">
              <div className="empty-state-icon">🍖</div>
              <p>请从上方选择肉类子类</p>
            </div>
          )}

          {/* 蔬菜类：选中小类后显示蔬菜列表 */}
          {!selectedFood && selectedCategory === 'vegetables' && selectedVeggieSubcat && (
            <div className="animal-zoom-in">
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                {VEGGIE_SUBCATEGORIES[selectedVeggieSubcat]?.name.replace(/^[\S]+\s/, ' ')} · {VEGGIE_SUBCATEGORIES[selectedVeggieSubcat]?.items.length} 种
              </div>
              {VEGGIE_SUBCATEGORIES[selectedVeggieSubcat]?.items.map(item => (
                <Card
                  key={item.id}
                  color={'default'}
                  className={'food-stage'}
                  onClick={() => setSelectedFood({
                    id: item.id,
                    name: item.name,
                    source: 'local',
                    nutrients: getFoodNutrients(item.id) || {},
                  })}
                  style={{ marginBottom: '8px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-header)' }}>{item.name}</div>
                    </div>
                    <span style={{ fontSize: '20px' }}>→</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 蔬菜类：未选中小类时显示提示 */}
          {selectedCategory === 'vegetables' && !selectedVeggieSubcat && (
            <div className="empty-state">
              <div className="empty-state-icon">🥬</div>
              <p>请从上方选择蔬菜子类</p>
            </div>
          )}

          {/* 谷物类：显示3个子类横向栏 */}
          {selectedCategory === 'grains' && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '12px',
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-base)',
            }}>
              {Object.entries(GRAINS_SUBCATEGORIES).map(([key, subcat]) => {
                const isActive = selectedGrainSubcat === key;
                return (
                  <div
                    key={key}
                    onClick={() => handleGrainSubcatChange(isActive ? '' : key)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: isActive ? 'var(--primary)' : 'var(--bg-content)',
                      color: isActive ? '#fff' : 'var(--text-body)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      border: '1.5px solid ' + (isActive ? 'var(--primary)' : 'var(--border-color)'),
                      userSelect: 'none',
                    }}
                  >
                    {subcat.name.replace(/^[\S]+\s/, ' ')}
                  </div>
                );
              })}
            </div>
          )}

          {/* 谷物类：选中小类后显示列表 */}
          {!selectedFood && selectedCategory === 'grains' && selectedGrainSubcat && (
            <div className="animal-zoom-in">
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
                {GRAINS_SUBCATEGORIES[selectedGrainSubcat]?.name.replace(/^[\S]+\s/, ' ')} · {GRAINS_SUBCATEGORIES[selectedGrainSubcat]?.items.length} 种
              </div>
              {GRAINS_SUBCATEGORIES[selectedGrainSubcat]?.items.map(item => (
                <Card
                  key={item.id}
                  color={'default'}
                  className={'food-stage'}
                  onClick={() => setSelectedFood({
                    id: item.id,
                    name: item.name,
                    source: 'local',
                    nutrients: getFoodNutrients(item.id) || {},
                  })}
                  style={{ marginBottom: '8px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-header)' }}>{item.name}</div>
                    </div>
                    <span style={{ fontSize: '20px' }}>→</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 谷物类：未选中小类时显示提示 */}
          {selectedCategory === 'grains' && !selectedGrainSubcat && (
            <div className="empty-state">
              <div className="empty-state-icon">🍚</div>
              <p>请从上方选择谷物子类</p>
            </div>
          )}

          {!selectedCategory && (
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <p>请选择食物分类开始浏览</p>
            </div>
          )}
        </div>
      )}

      {/* 搜索模式 */}
      {mode === 'search' && (
        <div>
          <Card className="mb-16">
            <Input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="输入食物名称，如：苹果、鸡胸肉、三文鱼..."
            />
            {isSearching && (
              <p className="text-sm text-muted" style={{ marginTop: '6px' }}>🔄 搜索中...</p>
            )}
          </Card>

          {!selectedFood && (!isSearching || searchResults.length > 0) && (
            <div className="animal-zoom-in">
              {searchResults.length === 0 && !isSearching && query.length > 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <p>没有找到「{query}」，试试其他关键词</p>
                </div>
              )}
              {searchResults.length === 0 && query.length === 0 && !isSearching && (
                <div className="empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <p>输入食物名称开始搜索</p>
                </div>
              )}
              {searchResults.length > 0 && searchResults.map(food => (
                <Card
                  key={food.id}
                  color={'default'}
                  className={'food-stage'}
                  onClick={() => setSelectedFood(food)}
                  style={{ marginBottom: '8px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-header)' }}>
                        {food.name}
                        {food.source === 'usda' && <span style={{ fontSize: '11px', marginLeft: '6px', color: 'var(--primary)' }}>🌐USDA</span>}
                      </div>
                      {food.categoryPath && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{food.categoryPath}</div>
                      )}
                    </div>
                    <span style={{ fontSize: '20px' }}>→</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 营养结果显示 */}
      {selectedFood && selectedFood.nutrients && Object.keys(selectedFood.nutrients).length > 0 && (
        <Card className="animal-zoom-in" color="app-blue">
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-header)', marginBottom: '4px' }}>
              🍽️ {selectedFood.name}
            </h3>
            <p className="text-sm text-muted">
              每100g可食部分营养含量 · 约占日需%
              {selectedFood.source === 'usda' && <span style={{ marginLeft: '8px', color: 'var(--primary)' }}>（实时USDA数据）</span>}
            </p>
          </div>

          <NutrientDisplay nutrients={selectedFood.nutrients} />

          <div style={{ marginTop: '16px' }}>
            <Button type="default" size="small" onClick={() => setSelectedFood(null)}>
              重新选择
            </Button>
          </div>
        </Card>
      )}

      <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-content)', borderRadius: '12px' }}>
        <p className="text-sm text-muted">
          ⚠️ 营养数据来源于 USDA FoodData Central，仅供参考。实际营养成分因品种、产地不同而有差异。
        </p>
      </div>

      {/* 膳食宝塔大图弹窗 */}
      {towerModal && (
        <ImageViewer
          src={towerModal}
          alt="膳食宝塔"
          onClose={() => setTowerModal('')}
        />
      )}
    </div>
  );
}