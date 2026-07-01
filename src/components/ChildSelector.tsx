import { useState, useEffect } from 'react';
import { Button, Card } from '@/lib';
import {
  getChildren, removeChild, setActiveChildId,
  getActiveChildId, type ChildProfile,
} from '../data/children';

interface ChildSelectorProps {
  onChildChange?: (child: ChildProfile | null) => void;
}

export default function ChildSelector({ onChildChange }: ChildSelectorProps) {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);


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



  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeChild(id);
    load();
  };

  return (
    <Card className="child-selector" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: children.length > 0 ? '10px' : '0' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>👶 当前孩子：</span>

        {children.length === 0 && (
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


      </div>



      {activeChild && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {activeChild.name ? `生日：${activeChild.birthDate}` : `出生日期：${activeChild.birthDate}`}
          {activeChild.name && <span style={{ marginLeft: '8px' }}>（{activeChild.birthDate}）</span>}
        </div>
      )}
    </Card>
  );
}