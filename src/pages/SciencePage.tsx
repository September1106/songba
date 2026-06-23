import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@/lib';
import articles from '../data/articles';

export default function SciencePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="science-page ac-fade-up">
      <div className="page-header">
        <Button size="small" onClick={() => navigate('/')} className="back-btn">← 返回</Button>
        <h2 className="page-title">📖 怂爸科普</h2>
      </div>

      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-base)',
        marginBottom: '20px',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
      }}>
        💡 这里是怂爸的精选科普文章，点击卡片阅读原文，更多精彩请关注微信公众号：怂爸的养娃攻略
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Input
          type="text"
          placeholder="搜索文章标题、摘要或标签..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            找到 {filtered.length} 篇匹配文章
            <Button size="small" onClick={() => setQuery('')} style={{ marginLeft: '12px' }}>清除</Button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
          <p>没有找到匹配的文章，试试其他关键词</p>
        </div>
      ) : (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
      }}>
        {filtered.map(article => (
          <Card
            key={article.id}
            color="app-blue"
            style={{ cursor: 'pointer' }}
            onClick={() => window.open(article.url, '_blank')}
          >
            <div style={{ marginBottom: '10px' }}>
              <div style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '8px',
                lineHeight: 1.4,
              }}>
                {article.title}
              </div>
              <p style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.6,
                marginBottom: '10px',
              }}>
                {article.summary}
              </p>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {article.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '20px',
                    color: 'rgba(255,255,255,0.9)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <span style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.7)',
              }}>
                {article.date}
              </span>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
