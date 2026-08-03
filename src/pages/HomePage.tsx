import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IslandPage from './IslandPage';

export default function HomePage() {
  const navigate = useNavigate();
  const [showIsland, setShowIsland] = useState(false);

  const handleStart = () => {
    setShowIsland(true); // 先把岛屿内容渲染到底层
    setTimeout(() => {
      // 动画结束后跳岛
      navigate('/island');
    }, 1600);
  };

  return (
    <div className="home-landing">
      {/* 左下角卡通形象 */}
      <div className="home-char-left">🐻</div>

      {/* 中心内容 */}
      <div className="home-center">
        <h1 className="home-title">怂爸小岛</h1>
        <p className="home-desc">
          这里汇集了怂爸制作的科学育儿小工具<br />
          帮助爸爸妈妈轻松应对儿童生长发育和营养常见问题
        </p>
        <button className="home-btn" onClick={handleStart}>
          开始使用
        </button>
      </div>

      {/* 底层：岛屿页面内容（z-index 低，圆形遮罩扩散后露出） */}
      <div
        className={`home-island-underlay ${showIsland ? 'island-visible' : ''}`}
        style={showIsland ? {} : { visibility: 'hidden' }}
      >
        <IslandPage embedded />
      </div>

      {/* 遮罩层：点击后从中心扩散的圆形遮罩 */}
      <div className={`home-loading-mask ${showIsland ? 'mask-expand' : ''}`} />
    </div>
  );
}
