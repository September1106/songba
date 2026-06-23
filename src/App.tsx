import { Routes, Route } from 'react-router-dom';
import { Footer } from '@/lib';
import '@/lib/dist/index.css';
import './index.css';

import HomePage from './pages/HomePage';
import VaccinePage from './pages/VaccinePage';
import FoodPage from './pages/FoodPage';
import GrowthChinaPage from './pages/GrowthChinaPage';
import NutritionPage from './pages/NutritionPage';
import DeskChairPage from './pages/DeskChairPage';
import SciencePage from './pages/SciencePage';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="site-title">
            <span className="title-icon">🏝️</span>
            怂爸小岛
          </h1>
          <p className="site-subtitle">科学育儿小工具</p>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vaccine" element={<VaccinePage />} />
          <Route path="/food" element={<FoodPage />} />
          <Route path="/growth-china" element={<GrowthChinaPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/science" element={<SciencePage />} />
          <Route path="/desk-chair" element={<DeskChairPage />} />
        </Routes>
      </main>

      <Footer type="sea" />
    </div>
  );
}

export default App;
