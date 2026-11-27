import { beforeEach, describe, expect, it, vi } from 'vitest';

const file = vi.hoisted(() => ({ create: vi.fn(), write: vi.fn(), canPreview: vi.fn(), preview: vi.fn(), delete: vi.fn() }));
vi.mock('expo-file-system', () => ({
  Paths: { cache: 'file:///cache/' },
  File: class { constructor() { return file; } },
}));
import { exportCalendarFile } from './calendarExport';

beforeEach(() => {
  vi.resetAllMocks();
  file.write.mockResolvedValue(undefined);
  file.canPreview.mockResolvedValue(true);
  file.preview.mockResolvedValue(undefined);
});

describe('native calendar file handoff', () => {
  it('hands off a calendar file without claiming an imported or scheduled event', async () => {
    const message = await exportCalendarFile('BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n', 'task.ics');
    expect(file.write).toHaveBeenCalledWith('BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n');
    expect(file.preview).toHaveBeenCalledWith({ mimeType: 'text/calendar', title: 'Import HomeHearts task' });
    expect(message).toContain('Nothing is confirmed as scheduled');
    expect(file.delete).not.toHaveBeenCalled();
  });

  it('gives a browser/manual fallback and cleans up when no calendar handler is available', async () => {
    file.canPreview.mockResolvedValue(false);
    await expect(exportCalendarFile('calendar', 'task.ics')).rejects.toThrow('Open HomeHearts in a browser');
    expect(file.preview).not.toHaveBeenCalled();
    expect(file.delete).toHaveBeenCalledOnce();
  });

  it('surfaces handoff failures and leaves no false success', async () => {
    file.preview.mockRejectedValue(new Error('Calendar viewer unavailable'));
    await expect(exportCalendarFile('calendar', 'task.ics')).rejects.toThrow('Calendar viewer unavailable');
    expect(file.delete).toHaveBeenCalledOnce();
  });
});
