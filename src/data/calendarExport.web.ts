export async function exportCalendarFile(contents: string, filename: string): Promise<string> {
  const url = URL.createObjectURL(new Blob([contents], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  try { link.click(); }
  finally {
    link.remove();
    // Give the browser time to consume the download before releasing the blob.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
  return 'Calendar file requested. Open the downloaded .ics file, import it, and check any alert in your calendar. HomeHearts cannot confirm the import.';
}
