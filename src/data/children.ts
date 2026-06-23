// 多孩子数据持久化模块
// 每个家庭可保存3组孩子数据，每组包含各工具页面的独立状态

export interface ChildProfile {
  id: string;           // 唯一ID
  name: string;         // 孩子名字（可选）
  birthDate: string;    // 出生日期 YYYY-MM-DD
  // 疫苗页数据
  vaccinated: string[]; // 已完成疫苗的 doseKey 列表
  jeChoice?: string;    // 乙脑选择
  hepaChoice?: string;  // 甲肝选择
  // 辅食页数据（未来扩展用）
}

const STORAGE_KEY = 'sentuncle-children';

export function getChildren(): ChildProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // 兼容旧格式：如果是旧疫苗页存储结构，先迁移
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export function saveChildren(children: ChildProfile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(children));
}

// 获取当前选中的孩子ID
const ACTIVE_KEY = 'sentuncle-active-child';

export function getActiveChildId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveChildId(id: string | null): void {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

// 获取当前孩子，如果没有或已满3个则返回null
export function addChild(birthDate: string, name?: string): ChildProfile | null {
  const children = getChildren();
  if (children.length >= 3) return null;
  const child: ChildProfile = {
    id: Date.now().toString(),
    name: name || '',
    birthDate,
    vaccinated: [],
  };
  children.push(child);
  saveChildren(children);
  setActiveChildId(child.id);
  return child;
}

export function removeChild(id: string): void {
  const children = getChildren().filter(c => c.id !== id);
  saveChildren(children);
  // 如果删除的是当前选中孩子，自动选第一个
  if (getActiveChildId() === id) {
    setActiveChildId(children.length > 0 ? children[0].id : null);
  }
}

export function updateChild(id: string, updates: Partial<ChildProfile>): void {
  const children = getChildren().map(c => c.id === id ? { ...c, ...updates } : c);
  saveChildren(children);
}

// 疫苗相关便捷操作
export function updateVaccinated(childId: string, vaccinated: string[]): void {
  updateChild(childId, { vaccinated });
}

export function updateJeChoice(childId: string, jeChoice: string | undefined): void {
  updateChild(childId, { jeChoice });
}

export function updateHepaChoice(childId: string, hepaChoice: string | undefined): void {
  updateChild(childId, { hepaChoice });
}