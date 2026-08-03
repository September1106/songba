import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Typewriter, Card } from 'animal-island-ui';

const tools = [
  { key: 'science',      label: '怂爸科普',              desc: '公众号文章索引，科学育儿有料又有趣' },
  { key: 'vaccine',      label: '疫苗接种计算器',         desc: '输入出生日期，自动计算每种疫苗的接种时间' },
  { key: 'food',         label: '辅食月龄对照表',         desc: '根据月龄推荐辅食性状、餐次和食材' },
  { key: 'growth-china', label: '0~7岁身高体重曲线',      desc: '根据WHO和中国标准，评估生长发育水平' },
  { key: 'bmi-evaluation', label: '6~18岁发育评价',      desc: '计算BMI值，评估消瘦、超重与肥胖' },
  { key: 'nutrition',    label: '营养素查询',             desc: '查食物营养素含量，了解孩子每日所需' },
  { key: 'desk-chair',   label: '课桌椅搭配',             desc: '根据身高选择合适的课桌椅型号' },
];

import VaccinePage from './VaccinePage';
import FoodPage from './FoodPage';
import GrowthChinaPage from './GrowthChinaPage';
import BMIEvaluationPage from './BMIEvaluationPage';
import NutritionPage from './NutritionPage';
import DeskChairPage from './DeskChairPage';
import SciencePage from './SciencePage';

const pageMap: Record<string, React.ReactNode> = {
  vaccine:          <VaccinePage embedded />,
  food:             <FoodPage embedded />,
  'growth-china':   <GrowthChinaPage embedded />,
  'bmi-evaluation': <BMIEvaluationPage embedded />,
  nutrition:        <NutritionPage embedded />,
  'desk-chair':     <DeskChairPage embedded />,
  science:          <SciencePage embedded />,
};

interface IslandPageProps {
  embedded?: boolean;
}

export default function IslandPage({ embedded = false }: IslandPageProps) {
  const navigate = useNavigate();
  const [active, setActive] = useState('science');

  const currentTool = tools.find(t => t.key === active);

  return (
    <div className="island-page">
      {/* 侧边栏 */}
      <div className="sidebar-sticky-wrapper">
        <aside className="island-sidebar">
          <div className="sidebar-header" onClick={() => navigate('/')}>
            <Icon name="icon-miles" size={36} className="sidebar-logo-icon" />
            <span className="sidebar-title">怂爸小岛</span>
          </div>

          <nav className="sidebar-menu">
            {tools.map(t => (
              <div
                key={t.key}
                className={`menu-item ${active === t.key ? 'active' : ''}`}
                onClick={() => setActive(t.key)}
              >
                <span className="menu-label">{t.label}</span>
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
      </main>
    </div>
  );
}
