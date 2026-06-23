import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/lib';
import { foodStages, type FoodStage } from '../data/foods';
import DateInput from '../components/DateInput';

function calcAgeMonths(birthYear: string, birthMonth: string, birthDay: string): number {
  if (!birthYear || !birthMonth || !birthDay) return 0;
  const birth = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
  const today = new Date();

  let months = (today.getFullYear() - birth.getFullYear()) * 12
    + (today.getMonth() - birth.getMonth());

  if (today.getDate() < birth.getDate()) months--;

  return Math.max(0, months);
}

function FoodStageCard({ stage }: { stage: FoodStage }) {
  return (
    <Card color="app-teal" className="food-stage active">
      <div className="food-stage-header">
        <span className="food-stage-icon">
          {stage.id === 'stage1' ? '🥔' : stage.id === 'stage2' ? '🥕' : '🍳'}
        </span>
        <div>
          <div className="food-stage-title">{stage.name}</div>
          <div className="food-stage-subtitle">
            {stage.monthsMin === stage.monthsMax
              ? `${stage.monthsMin}月龄`
              : `${stage.monthsMin}~${stage.monthsMax}月龄`}
          </div>
        </div>
        <span style={{
          marginLeft: 'auto',
          padding: '4px 12px',
          background: 'var(--primary)',
          color: '#fff',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
        }}>
          当前阶段
        </span>
      </div>

      <table className="food-table">
        <tbody>
          <tr>
            <th>食物性状</th>
            <td>{stage.texture}</td>
          </tr>
          <tr>
            <th>每餐用量</th>
            <td>{stage.amount}</td>
          </tr>
          <tr>
            <th>每日餐数</th>
            <td>{stage.mealsPerDay}</td>
          </tr>
        </tbody>
      </table>

      <h4 style={{ fontSize: '14px', color: 'var(--text-header)', marginTop: '12px', marginBottom: '6px' }}>
        🌱 推荐食物
      </h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {stage.foods.map((food, i) => (
          <span key={i} style={{
            padding: '4px 10px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '20px',
            fontSize: '13px',
            color: 'var(--text-body)',
          }}>
            {food}
          </span>
        ))}
      </div>

      <h4 style={{ fontSize: '14px', color: 'var(--text-header)', marginBottom: '6px' }}>
        📝 喂养要点
      </h4>
      <ul className="food-points">
        {stage.keyPoints.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>

      {stage.notes.length > 0 && (
        <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
          <p className="text-sm text-muted" style={{ fontStyle: 'italic' }}>
            💡 {stage.notes[0]}
          </p>
        </div>
      )}
    </Card>
  );
}

export default function FoodPage() {
  const navigate = useNavigate();
  const [birthYear, setBirthYear] = useState<string>('');
  const [birthMonth, setBirthMonth] = useState<string>('');
  const [birthDay, setBirthDay] = useState<string>('');


  const ageMonths = useMemo(() => calcAgeMonths(birthYear, birthMonth, birthDay), [birthYear, birthMonth, birthDay]);

  const currentStage = ageMonths >= 6 ? foodStages.find(s => ageMonths >= s.monthsMin && ageMonths <= s.monthsMax) : null;

  return (
    <div className="food-page ac-fade-up">
      <div className="page-header">
        <Button size="small" onClick={() => navigate('/')} className="back-btn">← 返回</Button>
        <h2 className="page-title">🍎 辅食添加指南</h2>
      </div>

      <Card className="mb-16">
        <div className="form-group">
          <label className="form-label">孩子的出生日期</label>
          <DateInput
            year={birthYear}
            month={birthMonth}
            day={birthDay}
            onYearChange={setBirthYear}
            onMonthChange={setBirthMonth}
            onDayChange={setBirthDay}
            maxYearsBack={2}
          />
          {ageMonths > 0 && (
            <p className="form-hint" style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '6px' }}>
              孩子目前 {ageMonths} 月龄
            </p>
          )}
        </div>
      </Card>

      {/* 4~5月龄：尚未到添加年龄 */}
      {ageMonths > 0 && ageMonths < 6 && (
        <Card color="app-blue">
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🍼</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-header)', marginBottom: '8px' }}>
              还不到添加辅食的时候
            </p>
            <p className="text-sm text-muted" style={{ lineHeight: 1.7 }}>
              辅食添加推荐从<strong>满6月龄</strong>开始，此时消化系统发育更成熟。<br />
              继续母乳或配方奶喂养，按需喂养即可。
            </p>
          </div>
          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(0,0,0,0.04)', borderRadius: '8px' }}>
            <p className="text-sm text-muted">
              💡 4~6月龄是辅食添加的准备期，可在医生指导下提前至4月龄开始尝试高铁米粉。
            </p>
          </div>
        </Card>
      )}

      {/* 6月龄及以上：显示当前阶段 */}
      {ageMonths >= 6 && (
        <div>
          <div style={{
            padding: '16px',
            background: 'var(--primary-bg)',
            border: '2px solid var(--primary)',
            borderRadius: 'var(--radius-base)',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>孩子当前月龄</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{ageMonths} 个月</p>
          </div>

          {currentStage && <FoodStageCard stage={currentStage} />}
        </div>
      )}

      {ageMonths === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🍼</div>
          <p>请输入孩子出生日期，自动计算月龄并显示辅食建议</p>
        </div>
      )}

      <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-content)', borderRadius: '12px' }}>
        <p className="text-sm text-muted">
          ⚠️ 本工具参考WS/T 678-2020《婴幼儿辅食添加营养指南》及WHO指引，具体添加时间和方式请遵医嘱。如有过敏反应应立即停止并就医。
        </p>
      </div>
    </div>
  );
}
