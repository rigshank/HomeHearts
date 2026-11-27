/** Task dates are local calendar dates, never UTC instants. */
export function isTaskDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return year >= 2000 && year <= 9999 && date.getFullYear() === year &&
    date.getMonth() === month - 1 && date.getDate() === day;
}

export function localTaskDate(now = new Date(), days = 0): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, 12);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function dateForDueLabel(label: string, now = new Date()): string | undefined {
  const offsets: Record<string, number> = { Today: 0, Tomorrow: 1, 'This week': 3, 'Next week': 7 };
  return Object.prototype.hasOwnProperty.call(offsets, label) ? localTaskDate(now, offsets[label]) : undefined;
}

export function formatTaskDate(value: string): string {
  if (!isTaskDate(value)) return value;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
