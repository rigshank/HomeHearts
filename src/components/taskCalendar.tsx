import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Field, HText } from './ui';
import { colors, spacing } from '../design/tokens';
import { createTaskCalendar } from '../domain/calendar';
import { isTaskDate, localTaskDate } from '../domain/planDates';
import { PlanTask, Program } from '../domain/types';
import { exportCalendarFile } from '../data/calendarExport';
import { useHomeHeartsStore } from '../state/useHomeHeartsStore';

export function TaskCalendar({ program, task, onCancel }: { program: Program; task: PlanTask; onCancel: () => void }) {
  const [date, setDate] = useState(task.dueDate ?? localTaskDate());
  const [alert, setAlert] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const reschedule = useHomeHeartsStore((state) => state.rescheduleTask);
  const recordExport = useHomeHeartsStore((state) => state.recordCalendarExport);

  function saveDate() {
    if (!isTaskDate(date)) { setError('Enter a real date as YYYY-MM-DD, for example 2026-12-08.'); return false; }
    reschedule(task.id, date);
    setError('');
    setFeedback('Task date saved. Existing calendar copies are unchanged.');
    return true;
  }

  async function exportEvent() {
    if (!saveDate()) return;
    setBusy(true);
    setFeedback('');
    try {
      const calendar = createTaskCalendar(program, task, date, alert);
      const message = await exportCalendarFile(calendar.contents, calendar.filename);
      recordExport(program.id, task.id, date);
      setFeedback(message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Calendar export failed. Your task date is saved; please try again.');
    } finally { setBusy(false); }
  }

  return <View style={styles.panel}>
    <HText variant="bodyStrong">Date & calendar</HText>
    <HText variant="caption" color={colors.muted}>Choose a date for this task. Calendar files contain the provider name and next step, with no attached documents or personal intake answers.</HText>
    <Field label={`Task date for ${task.title}`} helper="YYYY-MM-DD. Calendar event: 9 a.m. in your calendar’s local time, for 15 minutes."
      value={date} onChangeText={(value) => { setDate(value); setError(''); setFeedback(''); }}
      placeholder="2026-12-08" maxLength={10} autoCapitalize="none" editable={!busy} error={error || undefined} />
    <Pressable accessibilityRole="checkbox" accessibilityLabel="Request a 9 a.m. calendar alert" accessibilityState={{ checked: alert, disabled: busy }} aria-checked={alert} aria-disabled={busy}
      disabled={busy} onPress={() => setAlert(!alert)} style={styles.alertOption}>
      <HText variant="bodyStrong" color={colors.primary}>{alert ? '☑' : '☐'} Request a 9 a.m. calendar alert</HText>
    </Pressable>
    <HText variant="caption" color={colors.muted}>This is your planning time, not a provider appointment or deadline. Import the file and confirm the alert in your calendar; some apps ignore imported alerts. HomeHearts sends no notifications.</HText>
    <Button variant="secondary" disabled={busy} onPress={saveDate}>Save task date</Button>
    <Button icon="calendar-outline" disabled={busy} onPress={() => void exportEvent()}>{busy ? 'Preparing…' : 'Export calendar file (.ics)'}</Button>
    <View accessibilityLiveRegion="polite">{feedback ? <HText variant="caption" color={colors.success}>{feedback}</HText> : null}</View>
    <HText variant="caption" color={colors.muted}>After rescheduling, completing or skipping: edit/delete the old event and alert in your calendar. Re-import only if needed; importing again may create a duplicate. No automatic sync.</HText>
    <Button variant="ghost" disabled={busy} onPress={onCancel}>Close calendar options</Button>
  </View>;
}

const styles = StyleSheet.create({ panel: { gap: spacing.sm, marginTop: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }, alertOption: { minHeight: 44, justifyContent: 'center' } });
