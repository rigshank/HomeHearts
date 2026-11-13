import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, HText, ProgressBar, Reveal, Screen, SectionHeading } from '../../src/components/ui';
import { colors, radii, spacing } from '../../src/design/tokens';
import { PROGRAMS } from '../../src/data/programs';
import { updatePlanTasks } from '../../src/domain/planning';
import { useHomeHeartsStore } from '../../src/state/useHomeHeartsStore';
import { VisualMark } from '../../src/components/visuals';

export default function PlanScreen() {
  const router = useRouter();
  const selectedProgramId = useHomeHeartsStore((state) => state.savedPlanProgramId);
  const tasks = useHomeHeartsStore((state) => state.planTasks);
  const setPlanTasks = useHomeHeartsStore((state) => state.setPlanTasks);
  const toggleTask = useHomeHeartsStore((state) => state.toggleTask);
  const skipTask = useHomeHeartsStore((state) => state.skipTask);
  const rescheduleTask = useHomeHeartsStore((state) => state.rescheduleTask);
  const program = PROGRAMS.find((item) => item.id === selectedProgramId);
  useEffect(() => {
    if (!program) return;
    const updatedTasks = updatePlanTasks(program, tasks);
    if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) setPlanTasks(updatedTasks);
  }, [program, tasks, setPlanTasks]);
  if (!program) return <Screen><View style={styles.empty}><VisualMark icon="checkbox-outline" size="large" label="A saved plan checklist" /><HText variant="title">Your plan starts here.</HText><HText variant="body" color={colors.muted} style={styles.emptyBody}>Choose a match to get next steps.</HText><Button onPress={() => router.push('/intake')} icon="sparkles-outline">Find a match</Button></View></Screen>;
  const done = tasks.filter((task) => task.status === 'done').length;
  return <Screen bottomActionOffset={76} bottomAction={<Button variant="secondary" icon="document-text-outline" onPress={() => router.push({ pathname: '/matches/[programId]/application', params: { programId: program.id } })}>{program.requiredDocuments.length ? 'Open documents' : 'Open prep'}</Button>}><Reveal><View style={styles.header}><View><HText variant="micro" color={colors.primary}>SAVED PLAN</HText><HText variant="title">Your next steps</HText></View><View style={styles.progressNumber}><HText variant="headline" color={colors.primary}>{done}/{tasks.length}</HText><HText variant="micro" color={colors.muted}>DONE</HText></View></View><HText variant="caption" color={colors.muted}>Saved here · not submitted.</HText><Card tone="purple" style={styles.programCard}><View style={styles.programRow}><VisualMark icon="home-outline" size="small" label="Selected housing path" /><View style={styles.programCopy}><HText variant="micro" color={colors.primaryDark}>YOUR PATH</HText><HText variant="headline">{program.name}</HText><HText variant="caption" color={colors.muted}>{program.provider}</HText></View></View><ProgressBar value={tasks.length ? done / tasks.length : 0} label={`${done} of ${tasks.length} next steps complete`} /></Card></Reveal><SectionHeading eyebrow="FLEXIBLE CHECKLIST" title="Do what you can" action={program.phone ? <Button variant="ghost" onPress={() => router.push({ pathname: '/matches/[programId]/call-script', params: { programId: program.id } })}>Call script</Button> : undefined} />{tasks.map((task, index) => <Reveal key={task.id} index={index}><PressableTask task={task} onPress={() => toggleTask(task.id)} onSkip={() => skipTask(task.id)} onReschedule={() => rescheduleTask(task.id)} /></Reveal>)}</Screen>;
}

function PressableTask({ task, onPress, onSkip, onReschedule }: { task: { title: string; detail: string; dueLabel: string; status: string }; onPress: () => void; onSkip: () => void; onReschedule: () => void }) {
  return <Card style={styles.taskCard}><Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityLabel={`${task.title}. ${task.status === 'done' ? 'Done' : task.status === 'skipped' ? 'Skipped' : 'Not done'}. Due ${task.dueLabel}.`} accessibilityState={{ checked: task.status === 'done' }} style={styles.taskMain}><View style={[styles.taskCheck, task.status === 'done' && styles.taskCheckDone, task.status === 'skipped' && styles.taskCheckSkipped]}>{task.status === 'done' && <Ionicons name="checkmark" size={17} color={colors.white} />}{task.status === 'skipped' && <Ionicons name="remove" size={17} color={colors.muted} />}</View><View style={styles.taskCopy}><HText variant="bodyStrong" style={(task.status === 'done' || task.status === 'skipped') && styles.taskDone}>{task.title}</HText><HText variant="caption" color={colors.muted}>{task.detail}</HText></View><HText variant="micro" color={colors.muted}>{task.dueLabel.toUpperCase()}</HText></Pressable><View style={styles.taskActions}><Button variant="ghost" onPress={onReschedule} style={styles.taskAction}>Move</Button>{task.status !== 'skipped' && <Button variant="ghost" onPress={onSkip} style={styles.taskAction}>Skip</Button>}</View></Card>;
}

const styles = StyleSheet.create({ empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingTop: 120, paddingHorizontal: spacing.md }, emptyBody: { textAlign: 'center', maxWidth: 320, marginBottom: spacing.sm }, header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.sm }, progressNumber: { alignItems: 'flex-end', gap: 2 }, programCard: { marginTop: spacing.lg, marginBottom: spacing.xxl, gap: spacing.md }, programRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, programCopy: { flex: 1, gap: 2 }, taskCard: { marginBottom: spacing.sm, paddingVertical: spacing.sm }, taskMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, taskCheck: { width: 28, height: 28, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, taskCheckDone: { backgroundColor: colors.success, borderColor: colors.success }, taskCheckSkipped: { backgroundColor: colors.surfaceMuted, borderColor: colors.border }, taskCopy: { flex: 1, gap: 2 }, taskDone: { color: colors.muted, textDecorationLine: 'line-through' }, taskActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.xs }, taskAction: { minHeight: 44 }, bottomButton: { marginTop: spacing.md },
});

