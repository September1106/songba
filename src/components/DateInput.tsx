import { Select } from '@/lib';

interface DateInputProps {
  year: string;
  month: string;
  day: string;
  onYearChange: (val: string) => void;
  onMonthChange: (val: string) => void;
  onDayChange: (val: string) => void;
  maxYearsBack?: number; // 往前最多多少年（以今天为基准），默认0
  maxMonthsBack?: number; // 往前最多多少个月（以今天为基准，会覆盖 maxYearsBack）
  minYear?: number; // 精确控制：最小的可选年份
  maxYear?: number; // 精确控制：最大的可选年份
  minDate?: string; // 最早可选日期，格式 YYYY-MM-DD，优先级最高
  maxDate?: string; // 最晚可选日期，格式 YYYY-MM-DD
}

export default function DateInput({
  year, month, day,
  onYearChange, onMonthChange, onDayChange,
  maxYearsBack = 0,
  maxMonthsBack,
  minYear: minYearProp,
  maxYear: maxYearProp,
  minDate,
  maxDate,
}: DateInputProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // minDate: 精确的最早日期（优先级最高）
  const minDateObj = minDate ? new Date(minDate + 'T00:00:00') : null;
  const maxDateObj = maxDate ? new Date(maxDate + 'T00:00:00') : null;

  // minAllowedDate: 最早的可选日期（往前 maxYearsBack 年，或往前 maxMonthsBack 月）
  const minAllowedDate = maxMonthsBack !== undefined
    ? new Date(today.getFullYear(), today.getMonth() - maxMonthsBack, today.getDate())
    : new Date(currentYear - maxYearsBack, currentMonth - 1, currentDay);

  // 年份范围：minDate 精确值 > minYearProp > minAllowedDate
  const minYear = minDateObj ? minDateObj.getFullYear() : (minYearProp ?? minAllowedDate.getFullYear());
  const maxYear = maxDateObj ? maxDateObj.getFullYear() : (maxYearProp ?? currentYear);
  const minMonth = minDateObj ? minDateObj.getMonth() + 1 : minAllowedDate.getMonth() + 1;
  const minDay = minDateObj ? minDateObj.getDate() : minAllowedDate.getDate();

  const selectedYear = parseInt(year) || 0;
  const selectedMonthNum = parseInt(month) || 0;

  // 年份下拉
  const yearOptions = [
    { key: '', label: '—选择年—' },
    ...Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
      const y = maxYear - i;
      return { key: String(y), label: `${y}年` };
    }),
  ];

  // 月份下拉：根据已选年份动态
  const monthOptions = (() => {
    const opts: { key: string; label: string }[] = [{ key: '', label: '—选择月—' }];
    if (!year) return opts;

    const isSelectedMinYear = parseInt(year) === minYear;
    const isCurrentYear = parseInt(year) === currentYear;
    const minMonthOfYear = isSelectedMinYear ? minMonth : 1;
    const isMaxYear = parseInt(year) === maxYear;
    const maxMonthOfYear = isMaxYear && maxDateObj ? maxDateObj.getMonth() + 1 : (isCurrentYear ? currentMonth : 12);

    for (let m = minMonthOfYear; m <= maxMonthOfYear; m++) {
      opts.push({ key: String(m), label: `${m}月` });
    }
    return opts;
  })();

  // 日下拉：动态 + 边界限制
  const isMinYear = parseInt(year) === minYear;
  const isMaxYearSel = parseInt(year) === maxYear;
  const minDayOfMonth = (isMinYear && selectedMonthNum === minMonth) ? minDay : 1;
  const computedMaxDay = selectedYear > 0 && selectedMonthNum > 0
    ? new Date(selectedYear, selectedMonthNum, 0).getDate()
    : 31;
  const maxDayOfMonth = (isMaxYearSel && maxDateObj && selectedMonthNum === maxDateObj.getMonth() + 1)
    ? maxDateObj.getDate()
    : computedMaxDay;
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
