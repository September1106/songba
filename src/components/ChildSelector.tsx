import { useState, useEffect } from 'react';
import { Button, Card, Input } from '@/lib';
import {
  getChildren, addChild, removeChild, setActiveChildId,
  getActiveChildId, type ChildProfile,
} from '../data/children';
import DateInput from './DateInput';

interface ChildSelectorProps {
  onChildChange?: (child: ChildProfile | null) => void;
}

export default function ChildSelector({ onChildChange }: ChildSelectorProps) {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addYear, setAddYear] = useState('');
  const [addMonth, setAddMonth] = useState('');
  const [addDay, setAddDay] = useState('');

  const load = () => {
    const kids = getChildren();
    setChildren(kids);
    const active = getActiveChildId();
    // 确保active在kids里，否则选第一个
    const validActive = kids.find(c => c.id === active)?.id ?? kids[0]?.id ?? null;
    setActiveId(validActive);
    if (validActive !== active) setActiveChildId(validActive);
    const child = kids.find(c => c.id === validActive) ?? null;
    onChildChange?.(child);
  };

  useEffect(() => { load(); }, []);

  const activeChild = children.find(c => c.id === activeId) ?? null;

  const handleSelect = (id: string) => {
    setActiveChildId(id);
    setActiveId(id);
    const child = children.find(c => c.id === id) ?? null;
    onChildChange?.(child);
  };

  const handleAdd = () => {
    if (!addYear || !addMonth || !addDay) return;
    const birthDate = `${addYear}-${addMonth.padStart(2, '0')}-${addDay.padStart(2, '0')}`;
    const child = addChild(birthDate, addName.trim() || undefined);
    if (!child) return;
    setAddName('');
    setAddYear('');
    setAddMonth('');
    setAddDay('');
    setShowAdd(false);
    load();
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeChild(id);
    load();
  };

  return (
    <Card className="child-selector" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: children.length > 0 ? '10px' : '0' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>👶 当前孩子：</span>

        {children.length === 0 && !showAdd && (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>暂无，请添加</span>
        )}

        {children.map(child => (
          <Button
            key={child.id}
            size="small"
            type={child.id === activeId ? 'primary' : 'default'}
            onClick={() => handleSelect(child.id)}
            style={{ position: 'relative' }}
          >
            {child.name || child.birthDate}
            {children.length > 1 && (
              <span
                onClick={(e) => handleRemove(e, child.id)}
                style={{
                  marginLeft: '6px',
                  fontSize: '11px',
                  opacity: 0.7,
                  cursor: 'pointer',
                }}
                title="删除"
              >×</span>
            )}
          </Button>
        ))}

        {children.length < 3 && !showAdd && (
          <Button size="small" type="default" onClick={() => setShowAdd(true)} style={{ background: '#f0f0f0' }}>
            ＋ 添加孩子
          </Button>
        )}
        {children.length >= 3 && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>（最多3个孩子）</span>
        )}
      </div>

      {/* 添加孩子表单 */}
      {showAdd && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'var(--bg-content)',
          borderRadius: '8px',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-header)', marginBottom: '10px' }}>
            添加孩子
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Input
              size="small"
              value={addName}
              onChange={e => setAddName(e.target.value)}
              placeholder="名字（选填）"
              style={{ width: '90px' }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>出生日期：</span>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <DateInput
                year={addYear}
                month={addMonth}
                day={addDay}
                onYearChange={val => { setAddYear(val); setAddMonth(''); setAddDay(''); }}
                onMonthChange={val => { setAddMonth(val); setAddDay(''); }}
                onDayChange={setAddDay}
                maxYearsBack={6}
              />
            </div>
            <Button size="small" type="primary" onClick={handleAdd}>保存</Button>
            <Button size="small" type="default" onClick={() => setShowAdd(false)}>取消</Button>
          </div>
          {!addYear || !addMonth || !addDay ? (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>请选择完整的出生日期</p>
          ) : null}
        </div>
      )}

      {activeChild && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {activeChild.name ? `生日：${activeChild.birthDate}` : `出生日期：${activeChild.birthDate}`}
          {activeChild.name && <span style={{ marginLeft: '8px' }}>（{activeChild.birthDate}）</span>}
        </div>
      )}
    </Card>
  );
}