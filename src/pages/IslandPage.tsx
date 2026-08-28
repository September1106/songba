import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Typewriter, Card } from 'animal-island-ui';
import FloatingIsland from '../components/FloatingIsland';

const toolGroups = [
  {
    group: '知识学习',
    items: [
      { key: 'science',      label: '怂爸科普',              desc: '公众号文章索引，科学育儿有料又有趣' },
    ],
  },
  {
    group: '疾病预防',
    items: [
      { key: 'vaccine',      label: '疫苗接种计算器',         desc: '输入出生日期，自动计算每种疫苗的接种时间' },
    ],
  },
  {
    group: '营养',
    items: [
      { key: 'food',         label: '辅食月龄对照表',         desc: '根据月龄推荐辅食性状、餐次和食材' },
      { key: 'nutrition',    label: '营养素查询',             desc: '查食物营养素含量，了解孩子每日所需' },
    ],
  },
  {
    group: '生长发育',
    items: [
      { key: 'growth-china', label: '0~7岁身高体重曲线',      desc: '根据WHO和中国标准，评估生长发育水平' },
      { key: 'bmi-evaluation', label: '6~18岁发育评价',     desc: '计算BMI值，评估消瘦、超重与肥胖' },
    ],
  },
  {
    group: '学习用品',
    items: [
      { key: 'desk-chair',   label: '课桌椅搭配',             desc: '根据身高选择合适的课桌椅型号' },
    ],
  },
  {
    group: '监测工具',
    items: [
      { key: 'age-check',    label: '幼儿园年龄判断',         desc: '批量判断是否在5.5~6.5岁范围' },
      { key: 'id-card',      label: '身份证号码校验',         desc: '批量校验身份证号合法性（MOD 11-2）' },
      { key: 'noise',         label: '教室噪声计算',           desc: '非周期非稳态噪声·连续12次测量值计算' },
    ],
  },
];

const tools = toolGroups.flatMap(g => g.items);

import VaccinePage from './VaccinePage';
import FoodPage from './FoodPage';
import GrowthChinaPage from './GrowthChinaPage';
import BMIEvaluationPage from './BMIEvaluationPage';
import NutritionPage from './NutritionPage';
import DeskChairPage from './DeskChairPage';
import SciencePage from './SciencePage';
import AgeCheckPage from './AgeCheckPage';
import IdCardPage from './IdCardPage';
import NoisePage from './NoisePage';

const pageMap: Record<string, React.ReactNode> = {
  vaccine:          <VaccinePage embedded />,
  food:             <FoodPage embedded />,
  'growth-china':   <GrowthChinaPage embedded />,
  'bmi-evaluation': <BMIEvaluationPage embedded />,
  nutrition:        <NutritionPage embedded />,
  'desk-chair':     <DeskChairPage embedded />,
  science:          <SciencePage embedded />,
  'age-check':      <AgeCheckPage embedded />,
  'id-card':       <IdCardPage embedded />,
  'noise':          <NoisePage embedded />,
};

interface IslandPageProps {
  embedded?: boolean;
}

export default function IslandPage({ embedded = false }: IslandPageProps) {
  const navigate = useNavigate();
  const [active, setActive] = useState('science');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentTool = tools.find(t => t.key === active);

  const handleMenuClick = (key: string) => {
    setActive(key);
    setSidebarOpen(false);
  };

  return (
    <div className="island-page">
      {/* 窄屏顶部导航栏 */}
      <div className="mobile-header">
        <div className="mobile-header-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="打开菜单"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>
        <div className="mobile-header-title">{currentTool?.label || ''}</div>
        <div className="mobile-header-right" />
      </div>

      {/* 遮罩层 */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* 侧边栏 */}
      <div className={`sidebar-sticky-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <aside className="island-sidebar">
          <div className="sidebar-header" onClick={() => { navigate('/'); setSidebarOpen(false); }}>
            <Icon name="icon-miles" size={36} className="sidebar-logo-icon" />
            <span className="sidebar-title">怂爸小岛</span>
          </div>

          <nav className="sidebar-menu">
            {toolGroups.map(group => (
              <div key={group.group} className="menu-group">
                <div className="menu-group-title">{group.group}</div>
                {group.items.map(t => (
                  <div
                    key={t.key}
                    className={`menu-item ${active === t.key ? 'active' : ''}`}
                    onClick={() => handleMenuClick(t.key)}
                  >
                    <span className="menu-label">{t.label}</span>
                  </div>
                ))}
              </div>
            ))}
          </nav>
        </aside>
      </div>

      {/* 主内容区 */}
      <main className="island-main">
        {/* 工具名 + 简介（卡片外） */}
        {currentTool && (
          <div className="tool-header">
            <h2 className="page-title">{currentTool.label}</h2>
            <div className="page-desc">
              <Typewriter speed={60}>{currentTool.desc}</Typewriter>
            </div>
          </div>
        )}
        {/* 工具内容（卡片内） */}
        <Card className="tool-content-card">
          {pageMap[active]}
        </Card>

        <FloatingIsland />
      </main>
    </div>
  );
}
