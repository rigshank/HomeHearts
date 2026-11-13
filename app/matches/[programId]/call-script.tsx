import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Button, Card, FloatingBack, HText, Pill, Reveal, Screen, SectionHeading } from '../../../src/components/ui';
import { colors, spacing } from '../../../src/design/tokens';
import { PROGRAMS } from '../../../src/data/programs';
import { issueLabel } from '../../../src/domain/matching';
import { useHomeHeartsStore } from '../../../src/state/useHomeHeartsStore';
import { VisualMark } from '../../../src/components/visuals';

export default function CallScriptScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const router = useRouter();
  const intake = useHomeHeartsStore((state) => state.intake);
  const program = PROGRAMS.find((item) => item.id === programId);
  const [feedback, setFeedback] = useState<string | null>(null);
  if (!program) return <Screen><FloatingBack /><HText variant="title">Program unavailable.</HText></Screen>;
  const spokenIntro = `Hi, I’m calling because I’m facing ${issueLabel(intake.issue)}${intake.zipCode ? ' near ZIP code ' + intake.zipCode : ''}. I’d like to understand whether your program is accepting applications and what I should prepare.`;
  const script = `${spokenIntro} Could you tell me: 1) whether I may qualify, 2) what documents you need, 3) how much help may be available, and 4) what happens after I apply?`;
  const copy = async () => { try { await Clipboard.setStringAsync(script); setFeedback('Copied. You can paste this into your notes.'); } catch { setFeedback('Copy was unavailable. You can press and hold the script to select it.'); } };
  const call = async () => { if (!program.phone) return; const url = `tel:${program.phone.replace(/[^0-9+]/g, '')}`; try { if (await Linking.canOpenURL(url)) await Linking.openURL(url); else setFeedback(`Calling is unavailable here. Use ${program.phone}.`); } catch { setFeedback(`Calling is unavailable here. Use ${program.phone}.`); } };
  return <Screen bottomAction={<Button variant="secondary" icon="checkbox-outline" onPress={() => router.push('/plan')}>Save my next step</Button>}><View style={styles.nav}><FloatingBack /></View><Reveal><View style={styles.titleRow}><VisualMark icon="chatbubble-ellipses-outline" size="small" label="Personalized call script" /><View style={styles.titleCopy}><HText variant="micro" color={colors.primary}>CALL SCRIPT</HText><HText variant="title" style={styles.title}>Know what to ask</HText></View></View><HText variant="body" color={colors.muted}>Read this, then ask one question at a time.</HText></Reveal><Reveal index={1}><Card tone="purple" style={styles.scriptCard}><View style={styles.scriptTop}><Pill tone="purple">FOR YOUR CALL</Pill><Ionicons name="chatbubble-ellipses-outline" size={23} color={colors.primary} /></View><HText variant="headline" style={styles.quote}>{spokenIntro}</HText></Card></Reveal><Reveal index={2}><SectionHeading eyebrow="ASK THESE" title="Leave with clarity" /><Card style={styles.questions}><Question number="1" text="Are you accepting applications?" /><Question number="2" text="What documents do you need?" /><Question number="3" text="How much help may be available?" /><Question number="4" text="What happens next?" /></Card></Reveal><Button icon="copy-outline" variant="secondary" onPress={copy}>Copy full script</Button><Button icon="call-outline" onPress={call} disabled={!program.phone} style={styles.callButton}>Call {program.phone ?? 'provider'}</Button>{feedback && <HText variant="caption" color={colors.muted} style={styles.feedback}>{feedback}</HText>}</Screen>;
}
function Question({ number, text }: { number: string; text: string }) { return <View style={styles.question}><View style={styles.number}><HText variant="micro" color={colors.primary}>{number}</HText></View><HText variant="bodyStrong" style={styles.questionText}>{text}</HText></View>; }
const styles = StyleSheet.create({ nav: { marginBottom: spacing.lg }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, titleCopy: { flex: 1, gap: 2 }, title: { marginTop: spacing.xs, marginBottom: spacing.sm }, scriptCard: { marginTop: spacing.xl, marginBottom: spacing.xxl, gap: spacing.md }, scriptTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, quote: { lineHeight: 28 }, questions: { gap: spacing.md, marginBottom: spacing.xl }, question: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }, number: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, questionText: { flex: 1 }, callButton: { marginTop: spacing.sm, marginBottom: spacing.xs }, feedback: { backgroundColor: colors.successSoft, color: colors.success, padding: spacing.sm, borderRadius: 10, marginBottom: spacing.sm },
});

