import { Routes, Route, useLocation } from 'react-router-dom';
import { Footer } from '@/lib';
import '@/lib/dist/index.css';
import './index.css';

import HomePage from './pages/HomePage';
import IslandPage from './pages/IslandPage';
import DeskChairBatchPage from './pages/DeskChairBatchPage';

function App() {
  const location = useLocation();
  const showFooter = true;

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/island" element={<IslandPage />} />
        <Route path="/desk-chair-batch" element={<DeskChairBatchPage />} />
      </Routes>

      {location.pathname === '/island' && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Footer type="tree" />
        </div>
      )}
    </div>
  );
}

export default App;
