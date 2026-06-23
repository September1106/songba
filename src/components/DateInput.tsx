import { Select } from '@/lib';

interface DateInputProps {
  year: string;
  month: string;
  day: string;
  onYearChange: (val: string) => void;
  onMonthChange: (val: string) => void;
  onDayChange: (val: string) => void;
  maxYearsBack?: number; // 往前最多多少年，默认0（仅今天）
  maxMonthsBack?: number; // 往前最多多少个月（会覆盖 maxYearsBack），默认 undefined
}

export default function DateInput({ 
  year, month, day, 
  onYearChange, onMonthChange, onDayChange,
  maxYearsBack = 0,
  maxMonthsBack
}: DateInputProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // minAllowedDate: 最早的可选日期
  const minAllowedDate = maxMonthsBack !== undefined
    ? new Date(today.getFullYear(), today.getMonth() - maxMonthsBack, today.getDate())
    : new Date(currentYear - maxYearsBack, currentMonth - 1, currentDay);
  const minYear = minAllowedDate.getFullYear();
  const minMonth = minAllowedDate.getMonth() + 1; // 1-12
  const minDay = minAllowedDate.getDate();

  const selectedYear = parseInt(year) || 0;
  const selectedMonthNum = parseInt(month) || 0;

  // 动态计算日期天数
  const daysInMonth = selectedYear > 0 && selectedMonthNum > 0
    ? new Date(selectedYear, selectedMonthNum, 0).getDate()
    : 31;

  // 年份下拉
  const yearOptions = [
    { key: '', label: '—选择年—' },
    ...Array.from({ length: currentYear - minYear + 1 }, (_, i) => {
      const y = currentYear - i;
      return { key: String(y), label: `${y}年` };
    }),
  ];

  // 月份下拉：根据已选年份动态
  const monthOptions = (() => {
    const opts: { key: string; label: string }[] = [{ key: '', label: '—选择月—' }];
    if (!year) return opts;
    
    const minMonthOfYear = parseInt(year) === minYear ? minMonth : 1;
    const maxMonthOfYear = parseInt(year) === currentYear ? currentMonth : 12;
    
    for (let m = minMonthOfYear; m <= maxMonthOfYear; m++) {
      opts.push({ key: String(m), label: `${m}月` });
    }
    return opts;
  })();

  // 日下拉：动态 + 边界限制
  const maxDayOfMonth = selectedYear > 0 && selectedMonthNum > 0
    ? new Date(selectedYear, selectedMonthNum, 0).getDate()
    : 31;
  const minDayOfMonth = (parseInt(year) === minYear && selectedMonthNum === minMonth) ? minDay : 1;
  const dayOptions = [
    { key: '', label: '—选择日—' },
    ...Array.from({ length: maxDayOfMonth - minDayOfMonth + 1 }, (_, i) => ({
      key: String(minDayOfMonth + i),
      label: `${minDayOfMonth + i}日`,
    })),
  ];

  const handleYearChange = (val: string) => {
    onYearChange(val);
    onMonthChange('');
    onDayChange('');
  };

  const handleMonthChange = (val: string) => {
    onMonthChange(val);
    onDayChange('');
  };

  const selectStyle = (hasValue: boolean) => ({
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    color: hasValue ? 'var(--text-body)' : 'var(--text-muted)',
    background: '#fff',
    border: '1px solid var(--border-light)',
    borderRadius: '8px',
    cursor: 'pointer',
    outline: 'none',
  });

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <div style={{ flex: 1.2 }}>
        <select value={year} onChange={e => handleYearChange(e.target.value)} style={selectStyle(!!year)}>
          {yearOptions.map(o => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <select value={month} onChange={e => handleMonthChange(e.target.value)} style={selectStyle(!!month)} disabled={!year}>
          {monthOptions.map(o => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <select value={day} onChange={e => onDayChange(e.target.value)} style={selectStyle(!!day)} disabled={!month}>
          {dayOptions.map(o => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
