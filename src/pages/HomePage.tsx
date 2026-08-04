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

      {/* 首页底部备案文字 */}
      <div className="home-beian">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="home-beian-link"
        >
          陕ICP备2026016431号
        </a>
        <span className="home-beian-sep">·</span>
        <a
          href="https://beian.mps.gov.cn/#/query/webSearch?code=34011102004132"
          target="_blank"
          rel="noopener noreferrer"
          className="home-beian-link"
        >
          <img src="/备案图标.png" alt="公安网备案图标" className="home-beian-icon" />
          皖公网安备34011102004132号
        </a>
      </div>
    </div>
  );
}
