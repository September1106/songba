import { Routes, Route } from 'react-router-dom';
import { Footer } from '@/lib';
import '@/lib/dist/index.css';
import './index.css';

import IslandPage from './pages/IslandPage';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<IslandPage />} />
      </Routes>

      <Footer type="tree" />
    </div>
  );
}

export default App;
