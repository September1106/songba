import { useNavigate } from 'react-router-dom';
import { Card } from '@/lib';

const tools = [
  {
    path: '/science',
    icon: '📖',
    title: '怂爸科普',
    desc: '公众号文章索引，科学育儿有料又有趣',
    color: 'app-blue' as const,
  },
  {
    path: '/vaccine',
    icon: '💉',
    title: '疫苗接种计算器',
    desc: '计算孩子应种疫苗，追踪接种进度',
    color: 'app-teal' as const,
  },
  {
    path: '/food',
    icon: '🍎',
    title: '辅食月龄对照表',
    desc: '根据月龄查看辅食喂养指南',
    color: 'app-yellow' as const,
  },
  {
    path: '/growth-china',
    icon: '📈',
    title: '身高体重曲线',
    desc: '记录生长数据，查看儿童生长发育百分位',
    color: 'app-pink' as const,
  },
  {
    path: '/nutrition',
    icon: '🥗',
    title: '营养素查询',
    desc: '查食物营养含量，算一餐占日需百分比',
    color: 'app-green' as const,
  },
  {
    path: '/desk-chair',
    icon: '🪑',
    title: '课桌椅搭配',
    desc: '根据身高自动推荐合适高度的课桌椅',
    color: 'app-orange' as const,
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page animal-zoom-in">
      <section className="hero">
        <p>
          这里汇集了怂爸制作的科学育儿小工具，帮助爸爸妈妈轻松应对儿童生长发育和营养常见问题。
        </p>
      </section>

      <section className="tools-grid">
        {tools.map(tool => (
          <Card
            key={tool.path}
            color={tool.color}
            className="tool-card"
            onClick={() => navigate(tool.path)}
          >
            <div className="tool-card-content">
              <div className="tool-card-icon">{tool.icon}</div>
              <h3 style={{ color: '#fff' }}>{tool.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.88)' }}>{tool.desc}</p>
            </div>
          </Card>
        ))}
      </section>

      <section style={{ textAlign: 'center', marginTop: '32px' }}>
        <p className="text-sm text-muted">
          🌟 数据仅供参考，具体请遵医嘱
        </p>
      </section>
    </div>
  );
}
