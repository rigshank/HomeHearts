import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, HText, ProgressBar, Reveal, Screen, SectionHeading } from '../../src/components/ui';
import { colors, radii, spacing } from '../../src/design/tokens';
import { useCatalogStore } from '../../src/state/useCatalogStore';
import { updatePlanTasks } from '../../src/domain/planning';
import { useHomeHeartsStore } from '../../src/state/useHomeHeartsStore';
import { VisualMark } from '../../src/components/visuals';
import { ProgramRecovery } from '../../src/components/programRecovery';
import { TaskCalendar } from '../../src/components/taskCalendar';
import { formatTaskDate } from '../../src/domain/planDates';
import { PlanTask, Program } from '../../src/domain/types';

export default function PlanScreen() {
  const router = useRouter();
  const selectedProgramId = useHomeHeartsStore((state) => state.savedPlanProgramId);
  const tasks = useHomeHeartsStore((state) => state.planTasks);
  const setPlanTasks = useHomeHeartsStore((state) => state.setPlanTasks);
  const toggleTask = useHomeHeartsStore((state) => state.toggleTask);
  const skipTask = useHomeHeartsStore((state) => state.skipTask);
  const allPrograms = useCatalogStore((state) => state.allPrograms);
  const program = allPrograms.find((item) => item.id === selectedProgramId);
  useEffect(() => {
    if (!program) return;
    const updatedTasks = updatePlanTasks(program, tasks);
    if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) setPlanTasks(program.id, updatedTasks);
  }, [program, tasks, setPlanTasks]);
  if (!program && selectedProgramId) return <ProgramRecovery message="Your saved provider is unavailable." showSavedPlan={false} />;
  if (!program) return <Screen><View style={styles.empty}><VisualMark icon="checkbox-outline" size="large" label="A saved plan checklist" /><HText variant="title">Your plan starts here.</HText><HText variant="body" color={colors.muted} style={styles.emptyBody}>Choose a match to get next steps.</HText><Button onPress={() => router.push('/intake')} icon="sparkles-outline">Find a match</Button></View></Screen>;
  const done = tasks.filter((task) => task.status === 'done').length;
  return <Screen bottomActionOffset={76} bottomAction={<Button variant="secondary" icon="document-text-outline" onPress={() => router.push({ pathname: '/matches/[programId]/application', params: { programId: program.id } })}>{program.requiredDocuments.length ? 'Open documents' : 'Open prep'}</Button>}><Reveal><View style={styles.header}><View style={styles.headerCopy}><HText variant="micro" color={colors.primary}>SAVED PLAN</HText><HText variant="title">Your next steps</HText></View><View style={styles.progressNumber}><HText variant="headline" color={colors.primary}>{done}/{tasks.length}</HText><HText variant="micro" color={colors.muted}>DONE</HText></View></View><HText variant="caption" color={colors.muted}>Saved here · not submitted.</HText><HText variant="caption" color={colors.muted}>Task dates are planning suggestions, not provider deadlines. Use Date &amp; calendar to change a date or export.</HText><Card tone="purple" style={styles.programCard}><View style={styles.programRow}><VisualMark icon="home-outline" size="small" label="Selected housing path" /><View style={styles.programCopy}><HText variant="micro" color={colors.primaryDark}>YOUR PATH</HText><HText variant="headline">{program.name}</HText><HText variant="caption" color={colors.muted}>{program.provider}</HText></View></View><ProgressBar value={tasks.length ? done / tasks.length : 0} label={`${done} of ${tasks.length} next steps complete`} /></Card>{program.phone && <Button icon="call-outline" style={styles.callScriptButton} accessibilityLabel={`Open call script for ${program.name}`} onPress={() => router.push({ pathname: '/matches/[programId]/call-script', params: { programId: program.id } })}>Open call script</Button>}</Reveal><SectionHeading eyebrow="FLEXIBLE CHECKLIST" title="Do what you can" />{tasks.map((task, index) => <Reveal key={task.id} index={index}><PressableTask key={program.id + task.id} program={program} task={task} onPress={() => toggleTask(task.id)} onSkip={() => skipTask(task.id)} /></Reveal>)}</Screen>;
}

function PressableTask({ program, task, onPress, onSkip }: { program: Program; task: PlanTask; onPress: () => void; onSkip: () => void }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const due = task.dueDate ? formatTaskDate(task.dueDate) : task.dueLabel;
  return <Card style={styles.taskCard}>
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityLabel={`${task.title}. ${task.status === 'done' ? 'Done' : task.status === 'skipped' ? 'Skipped' : 'Not done'}. Due ${due}.`} accessibilityState={{ checked: task.status === 'done' }} aria-checked={task.status === 'done'} style={styles.taskMain}>
      <View style={[styles.taskCheck, task.status === 'done' && styles.taskCheckDone, task.status === 'skipped' && styles.taskCheckSkipped]}>
        {task.status === 'done' && <Ionicons name="checkmark" size={17} color={colors.white} />}
        {task.status === 'skipped' && <Ionicons name="remove" size={17} color={colors.muted} />}
      </View>
      <View style={styles.taskCopy}>
        <HText variant="bodyStrong" style={(task.status === 'done' || task.status === 'skipped') && styles.taskDone}>{task.title}</HText>
        <HText variant="caption" color={colors.muted}>{task.detail}</HText>
        <HText variant="caption" color={colors.primary}>Due: {due}</HText>
      </View>
    </Pressable>
    <View style={styles.taskActions}>
      {task.status === 'todo' && <Button variant="ghost" icon="calendar-outline" onPress={() => setCalendarOpen(!calendarOpen)} accessibilityLabel={`Date and calendar for ${task.title}`} style={styles.taskAction}>Date & calendar</Button>}
      {task.status !== 'skipped' && <Button variant="ghost" onPress={onSkip} accessibilityLabel={`Skip ${task.title}`} style={styles.taskAction}>Skip</Button>}
    </View>
    {task.calendarExportedDate && <HText variant="caption" color={colors.warning}>
      {task.status !== 'todo' ? 'This task is done or skipped. Delete its event and alert in your calendar.'
        : task.calendarExportedDate !== task.dueDate ? `Your last calendar file used ${formatTaskDate(task.calendarExportedDate)}. Edit/delete that calendar event before importing a new file.`
        : `Last calendar file: ${formatTaskDate(task.calendarExportedDate)}. Import and alerts are managed in your calendar; HomeHearts does not sync changes.`}
    </HText>}
    {calendarOpen && task.status === 'todo' && <TaskCalendar program={program} task={task} onCancel={() => setCalendarOpen(false)} />}
  </Card>;
}

const styles = StyleSheet.create({ empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingTop: 120, paddingHorizontal: spacing.md }, emptyBody: { textAlign: 'center', maxWidth: 320, marginBottom: spacing.sm }, headerCopy: { flex: 1, minWidth: 140 }, callScriptButton: { marginBottom: spacing.xl }, header: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.sm }, progressNumber: { alignItems: 'flex-end', gap: 2 }, programCard: { marginTop: spacing.lg, marginBottom: spacing.xxl, gap: spacing.md }, programRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, programCopy: { flex: 1, minWidth: 0, gap: 2 }, taskCard: { marginBottom: spacing.sm, paddingVertical: spacing.sm }, taskMain: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, taskCheck: { width: 28, height: 28, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, taskCheckDone: { backgroundColor: colors.success, borderColor: colors.success }, taskCheckSkipped: { backgroundColor: colors.surfaceMuted, borderColor: colors.border }, taskCopy: { flex: 1, minWidth: 0, gap: 2 }, taskDone: { color: colors.muted, textDecorationLine: 'line-through' }, taskActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'flex-end', marginTop: spacing.xs }, taskAction: { minHeight: 44 }, bottomButton: { marginTop: spacing.md },
});

