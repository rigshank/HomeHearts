import { isTaskDate } from './planDates';
import { PlanTask, Program } from './types';

const escapeText = (value: string) => value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n')
  .replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '');

// RFC 5545 limits content lines to 75 UTF-8 octets. Fold on code-point
// boundaries so provider names containing multibyte characters stay intact.
function foldLine(line: string): string {
  let result = '';
  let bytes = 0;
  for (const character of line) {
    const code = character.codePointAt(0)!;
    const size = code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
    if (bytes + size > 75) { result += '\r\n '; bytes = 1; }
    result += character;
    bytes += size;
  }
  return result;
}

/** One personal planning event, not an application or confirmed appointment. */
export function createTaskCalendar(program: Program, task: PlanTask, date: string, alert = false, now = new Date()) {
  if (!isTaskDate(date)) throw new Error('Enter a real date as YYYY-MM-DD.');
  if (task.status !== 'todo') throw new Error('Only incomplete tasks can be exported.');
  const [year, month, day] = date.split('-').map(Number);
  if (alert && new Date(year, month - 1, day, 9).getTime() <= now.getTime()) {
    throw new Error('9 a.m. on that date has passed. Choose a later date for an alert.');
  }
  const description = `Provider: ${program.name}\nNext step: ${task.detail}\nPersonal planning reminder, not a provider appointment or application deadline.\nHomeHearts does not sync calendar copies. Edit or delete this event in your calendar after changing, completing or skipping the task.`;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HomeHearts//Task Calendar//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${encodeURIComponent(program.id)}-${encodeURIComponent(task.id)}@homehearts.local`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
    `DTSTART:${date.replace(/-/g, '')}T090000`, 'DURATION:PT15M',
    `SUMMARY:${escapeText(`HomeHearts: ${task.title}`)}`, `DESCRIPTION:${escapeText(description)}`,
    'CLASS:PRIVATE', 'TRANSP:TRANSPARENT',
    ...(alert ? ['BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:HomeHearts task reminder', 'END:VALARM'] : []),
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return {
    contents: lines.map(foldLine).join('\r\n') + '\r\n',
    filename: `homehearts-${program.id}-${task.id}.ics`.replace(/[^a-zA-Z0-9._-]/g, '-'),
  };
}
