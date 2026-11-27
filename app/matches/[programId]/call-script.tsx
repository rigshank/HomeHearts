import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Button, Card, FloatingBack, HText, Pill, Reveal, Screen, SectionHeading } from '../../../src/components/ui';
import { colors, spacing } from '../../../src/design/tokens';
import { useCatalogStore } from '../../../src/state/useCatalogStore';
import { buildCallScript } from '../../../src/domain/callScript';
import { useHomeHeartsStore } from '../../../src/state/useHomeHeartsStore';
import { VisualMark } from '../../../src/components/visuals';

export default function CallScriptScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const router = useRouter();
  const intake = useHomeHeartsStore((state) => state.intake);
  const allPrograms = useCatalogStore((state) => state.allPrograms);
  const program = allPrograms.find((item) => item.id === programId);
  const [feedback, setFeedback] = useState<string | null>(null);
  if (!program) return <Screen><FloatingBack fallback="/matches" /><HText variant="title">Program unavailable.</HText></Screen>;
  const { intro: spokenIntro, questions, fullText: script } = buildCallScript(program, intake);
  const copy = async () => { try { await Clipboard.setStringAsync(script); setFeedback('Copied. You can paste this into your notes.'); } catch { setFeedback('Copy was unavailable. You can press and hold the script to select it.'); } };
  const call = async () => { if (!program.phone) return; const url = `tel:${program.phone.replace(/[^0-9+]/g, '')}`; try { if (await Linking.canOpenURL(url)) await Linking.openURL(url); else setFeedback(`Calling is unavailable here. Use ${program.phone}.`); } catch { setFeedback(`Calling is unavailable here. Use ${program.phone}.`); } };
  return <Screen bottomAction={<Button variant="secondary" icon="checkbox-outline" onPress={() => router.push('/plan')}>Save my next step</Button>}><View style={styles.nav}><FloatingBack fallback={{ pathname: "/matches/[programId]", params: { programId: program.id } }} /></View><Reveal><View style={styles.titleRow}><VisualMark icon="chatbubble-ellipses-outline" size="small" label="Personalized call script" /><View style={styles.titleCopy}><HText variant="micro" color={colors.primary}>CALL SCRIPT</HText><HText variant="title" style={styles.title}>Know what to ask</HText></View></View><HText variant="body" color={colors.muted}>Written for {program.name}. Read this, then ask one question at a time.</HText></Reveal><Reveal index={1}><Card tone="purple" style={styles.scriptCard}><View style={styles.scriptTop}><Pill tone="purple">FOR YOUR CALL</Pill><Ionicons name="chatbubble-ellipses-outline" size={23} color={colors.primary} /></View><HText variant="headline" style={styles.quote}>{spokenIntro}</HText></Card></Reveal><Reveal index={2}><SectionHeading eyebrow="ASK THESE" title="Leave with clarity" /><Card style={styles.questions}>{questions.map((text) => <Question key={text} text={text} />)}</Card></Reveal><Button icon="copy-outline" variant="secondary" onPress={copy}>Copy full script</Button><Button icon="call-outline" onPress={call} disabled={!program.phone} style={styles.callButton}>Call {program.phone ?? 'provider'}</Button>{feedback && <HText variant="caption" color={colors.muted} style={styles.feedback}>{feedback}</HText>}</Screen>;
}
function Question({ text }: { text: string }) {
  return <View style={styles.question}><HText variant="bodyStrong" style={styles.questionText}>{text}</HText></View>;
}

const styles = StyleSheet.create({ nav: { marginBottom: spacing.lg }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, titleCopy: { flex: 1, minWidth: 0, gap: 2 }, title: { marginTop: spacing.xs, marginBottom: spacing.sm }, scriptCard: { marginTop: spacing.xl, marginBottom: spacing.xxl, gap: spacing.md }, scriptTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, quote: { lineHeight: 28 }, questions: { gap: spacing.md, marginBottom: spacing.xl }, question: { borderLeftWidth: 3, borderLeftColor: colors.primarySoft, paddingLeft: spacing.sm }, questionText: { minWidth: 0 }, callButton: { marginTop: spacing.sm, marginBottom: spacing.xs }, feedback: { backgroundColor: colors.successSoft, color: colors.success, padding: spacing.sm, borderRadius: 10, marginBottom: spacing.sm },
});

