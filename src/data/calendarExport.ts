import { File, Paths } from 'expo-file-system';

export async function exportCalendarFile(contents: string, filename: string): Promise<string> {
  const file = new File(Paths.cache, `${Date.now()}-${filename}`);
  try {
    file.create({ overwrite: true });
    await file.write(contents);
    if (!await file.canPreview({ mimeType: 'text/calendar' })) {
      throw new Error('No compatible calendar app was found. Open HomeHearts in a browser to download the calendar file, or add the task manually.');
    }
    await file.preview({ mimeType: 'text/calendar', title: 'Import HomeHearts task' });
    return 'Calendar file opened. Finish importing it and check any alert in your calendar. Nothing is confirmed as scheduled by HomeHearts.';
  } catch (error) {
    try { file.delete(); } catch { /* The OS also clears temporary cache files. */ }
    throw error;
  }
}
