import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-landing">
      <div className="home-center">
        <div className="home-content-wrapper">
          <div className="home-text-block">
            <h1 className="home-title">怂爸小岛</h1>
            <p className="home-desc">
              这里汇集了怂爸制作的科学育儿小工具<br />
              帮助爸爸妈妈轻松应对儿童生长发育和营养常见问题
            </p>
            <button className="home-btn" onClick={() => navigate('/island')}>
              开始使用
            </button>
          </div>
          <img
            className="home-icon"
            src="/assets/animal_icon-DLUazIlq.png"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}
