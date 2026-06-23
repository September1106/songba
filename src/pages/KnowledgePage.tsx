import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/lib';

interface KnowledgeCard {
  id: string;
  icon: string;
  title: string;
  summary: string;
  tags: string[];
}

const knowledgeCards: KnowledgeCard[] = [
  {
    id: 'age',
    icon: '⏰',
    title: '各疫苗接种年龄上限',
    summary: '每种疫苗都有最晚接种年龄上限，超龄后补种规则不同。乙肝第1剂出生24小时内，卡介苗小于3月龄，麻腮风第1剂12月龄内，乙脑第2剂3周岁内，脊灰第4剂5周岁内，白破等6岁内。超过年龄需按补种原则处理。',
    tags: ['接种年龄', '最晚时间', '补种'],
  },
  {
    id: 'simultaneous',
    icon: '💉',
    title: '同时接种原则',
    summary: '两种及以上注射类疫苗可在不同部位同时接种，严禁混合吸入同一注射器。灭活疫苗与灭活疫苗、灭活与口服减毒活疫苗之间没有间隔限制。注射类减毒活疫苗之间需间隔至少28天。免疫球蛋白与减毒活疫苗需间隔3个月以上。',
    tags: ['同时接种', '间隔', '联合接种'],
  },
  {
    id: 'remedy',
    icon: '🔧',
    title: '补种通用原则',
    summary: '未按时完成接种者，应尽早补种尽快完成全程。只需补种未完成剂次，无需从头再来。无法使用同厂家疫苗时，可用不同厂家同种疫苗完成后续接种。优先保证国家免疫规划疫苗的全程接种。',
    tags: ['补种', '剂次', '疫苗衔接'],
  },
  {
    id: 'preterm',
    icon: '👶',
    title: '早产儿与低出生体重儿',
    summary: '胎龄小于37周或出生体重小于2500g的宝宝，如果医学评估稳定且无需持续治疗的严重感染、代谢性疾病等，可按照出生后实际月龄接种疫苗。卡介苗需胎龄大于31周且评估稳定后接种。',
    tags: ['早产儿', '低体重儿', '特殊情况'],
  },
  {
    id: 'allergy',
    icon: '🤧',
    title: '过敏与疫苗接种',
    summary: '"过敏性体质"不是疫苗接种禁忌。真正禁忌：对疫苗成分严重过敏，或既往接种发生喉头水肿、过敏性休克及其他全身性严重过敏反应者，禁忌继续接种同种疫苗。其他过敏情况可正常接种。',
    tags: ['过敏', '禁忌', '疫苗成分'],
  },
  {
    id: 'hiv',
    icon: '🛡️',
    title: 'HIV感染母亲所生儿童',
    summary: 'HIV感染母亲所生婴儿，接种前不必常规进行HIV抗体筛查。HIV感染儿童：暂缓接种卡介苗，确认感染后不予接种；无艾滋病相关症状可接种含麻疹成分疫苗。可接种乙肝、百白破、流脑、白破等灭活疫苗。',
    tags: ['HIV', '母亲', '特殊情况'],
  },
  {
    id: 'immune',
    icon: '⚠️',
    title: '免疫功能异常儿童',
    summary: '除HIV外的其他免疫缺陷或正在接受全身免疫抑制治疗者：可以接种灭活疫苗，原则上不予接种减毒活疫苗（补体缺陷患者除外）。具体需由医生评估后决定。',
    tags: ['免疫缺陷', '减毒活疫苗', '治疗'],
  },
  {
    id: 'not-contraindication',
    icon: '✅',
    title: '这些疾病不作为禁忌',
    summary: '以下常见情况不作为疫苗接种禁忌：生理性和母乳性黄疸、单纯性热性惊厥史、癫痫控制稳定期、病情稳定的脑疾病、肝脏疾病、常见先天性疾病（先天性甲状腺功能减低、苯丙酮尿症、唐氏综合征、先天性心脏病）、先天性感染（梅毒、巨细胞病毒和风疹病毒）。',
    tags: ['禁忌', '黄疸', '惊厥', '先天性疾病'],
  },
  {
    id: 'autism',
    icon: '🧠',
    title: '接种疫苗会导致自闭症？',
    summary: '不会。1998年英国《柳叶刀》论文早已被撤稿，作者被吊销执照，研究被证明造假。后续大量研究（涉及数百万儿童）均未发现疫苗与自闭症之间存在任何关联。自闭症是一种先天的神经发育差异，通常在宝宝出生后早期就已决定。',
    tags: ['自闭症', '疫苗安全', '谣言'],
  },
];

export default function KnowledgePage() {
  const navigate = useNavigate();

  return (
    <div className="knowledge-page ac-fade-up">
      <div className="page-header">
        <Button size="small" onClick={() => navigate('/')} className="back-btn">← 返回</Button>
        <h2 className="page-title">📚 接种知识</h2>
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
        💡 以下内容依据《国家免疫规划疫苗儿童免疫程序说明（2021年版）》整理，帮助家长了解接种规则与注意事项。
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '12px',
      }}>
        {knowledgeCards.map(card => (
          <Card key={card.id} color="default" style={{ cursor: 'default' }}>
            <div style={{ marginBottom: '10px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                background: 'var(--primary-bg)',
                borderRadius: '10px',
                fontSize: '20px',
                marginBottom: '8px',
              }}>
                {card.icon}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-header)', marginBottom: '6px' }}>
                {card.title}
              </div>
              <p style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '10px',
              }}>
                {card.summary}
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {card.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '20px',
                  color: 'var(--text-muted)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-content)', borderRadius: '12px' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          📖 参考文献：《国家免疫规划疫苗儿童免疫程序说明（2021年版）》
        </p>
      </div>
    </div>
  );
}