import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { File } from 'expo-file-system';
import { Button, Card, FloatingBack, HText, Pill, Reveal, Screen, SectionHeading } from '../../../src/components/ui';
import { colors, spacing } from '../../../src/design/tokens';
import { DALLAS_PROGRAMS } from '../../../src/data/programs';
import { DOCUMENT_HINTS, DOCUMENT_LABELS, DocumentKind } from '../../../src/domain/types';
import { pickAndStageDocument, removeStagedDocument } from '../../../src/data/uploadRepository';
import { createPlanTasks } from '../../../src/domain/planning';
import { useHomeHeartsStore } from '../../../src/state/useHomeHeartsStore';
import { VisualMark } from '../../../src/components/visuals';

export default function ApplicationPrepScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const router = useRouter();
  const program = DALLAS_PROGRAMS.find((item) => item.id === programId);
  const documents = useHomeHeartsStore((state) => state.documents);
  const upsertDocument = useHomeHeartsStore((state) => state.upsertDocument);
  const setPlanTasks = useHomeHeartsStore((state) => state.setPlanTasks);
  const setSavedPlanProgram = useHomeHeartsStore((state) => state.setSavedPlanProgram);
  const savedPlanProgramId = useHomeHeartsStore((state) => state.savedPlanProgramId);
  const removeDocument = useHomeHeartsStore((state) => state.removeDocument);
  const [busyKind, setBusyKind] = useState<DocumentKind | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  useEffect(() => { if (program && savedPlanProgramId !== program.id) { setSavedPlanProgram(program.id); setPlanTasks(createPlanTasks(program)); } }, [program, savedPlanProgramId, setPlanTasks, setSavedPlanProgram]);
  if (!program) return <Screen><FloatingBack /><HText variant="title">Program unavailable.</HText></Screen>;
  const addDocument = async (kind: DocumentKind) => { setBusyKind(kind); setUploadError(null); try { const record = await pickAndStageDocument(kind); if (record) { const previous = documents[kind]; if (previous) { try { await removeStagedDocument(previous); } catch (error) { setUploadError(error instanceof Error ? error.message : 'The previous file could not be removed.'); } } upsertDocument(record); } } catch (error) { setUploadError(error instanceof Error ? error.message : 'The file could not be added. Please try again.'); } finally { setBusyKind(null); } };
  const removeDocumentFile = async (kind: DocumentKind) => { const record = documents[kind]; if (!record) return; setBusyKind(kind); setUploadError(null); try { await removeStagedDocument(record); removeDocument(kind); } catch (error) { setUploadError(error instanceof Error ? error.message : 'The file could not be removed.'); } finally { setBusyKind(null); } };
  const previewDocument = async (kind: DocumentKind) => {
    const record = documents[kind];
    if (!record?.localUri) return;
    setUploadError(null);
    try {
      if (Platform.OS !== 'web') {
        const file = new File(record.localUri);
        if (await file.canPreview(record.mimeType ? { mimeType: record.mimeType } : undefined)) {
          await file.preview(record.mimeType ? { mimeType: record.mimeType, title: record.name } : { title: record.name });
          return;
        }
        const shareableUri = file.contentUri || file.uri;
        if (await Linking.canOpenURL(shareableUri)) {
          await Linking.openURL(shareableUri);
          return;
        }
      } else if (await Linking.canOpenURL(record.localUri)) {
        await Linking.openURL(record.localUri);
        return;
      }
      throw new Error('Preview is unavailable on this device. Use Replace or open the file from your Files app.');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Preview is unavailable on this device. Use Replace or open the file from your Files app.');
    }
  };
  const uploadedCount = program.requiredDocuments.filter((kind) => documents[kind]?.state === 'uploaded').length;
  const hasPrivateCloudDocument = Object.values(documents).some((record) => record?.storageMode === 'supabase_private');
  return <Screen bottomAction={<View style={styles.bottomActions}><Button icon="call-outline" onPress={() => router.push({ pathname: '/matches/[programId]/call-script', params: { programId: program.id } })}>Open call script</Button><Button variant="ghost" onPress={() => router.push('/plan')}>View plan</Button></View>}><View style={styles.nav}><FloatingBack /></View><Reveal><View style={styles.titleRow}><VisualMark icon="document-text-outline" size="small" label="Document checklist" /><View style={styles.titleCopy}><HText variant="micro" color={colors.primary}>APPLY EASY</HText><HText variant="title" style={styles.title}>Get ready to call</HText></View></View><HText variant="body" color={colors.muted}>Add the files you already have.</HText><Card tone="success" style={styles.safety}><Ionicons name="lock-closed-outline" size={19} color={colors.success} /><View style={styles.safetyCopy}><HText variant="bodyStrong">{hasPrivateCloudDocument ? 'Private cloud staging' : 'Private on this device'}</HText><HText variant="caption" color={colors.muted}>{hasPrivateCloudDocument ? 'Uploaded to private storage for this session. Nothing is submitted to the provider.' : 'Files stay in the app cache. Nothing is submitted to the provider.'}</HText></View></Card></Reveal>{uploadError && <Card tone="coral" style={styles.errorCard}><Ionicons name="warning-outline" size={18} color={colors.danger} /><HText variant="caption" color={colors.danger}>{uploadError}</HText></Card>}<SectionHeading eyebrow={`${uploadedCount}/${program.requiredDocuments.length} READY`} title="Documents" action={<Pill tone={uploadedCount === program.requiredDocuments.length ? 'success' : 'neutral'}>{uploadedCount === program.requiredDocuments.length ? 'Ready' : 'In progress'}</Pill>} />{program.requiredDocuments.map((kind, index) => <Reveal key={kind} index={index}><DocumentRow kind={kind} record={documents[kind]} busy={busyKind === kind} onAdd={() => addDocument(kind)} onPreview={() => previewDocument(kind)} onRemove={() => removeDocumentFile(kind)} /></Reveal>)}</Screen>;
}

function DocumentRow({ kind, record, busy, onAdd, onPreview, onRemove }: { kind: DocumentKind; record?: { state: string; name?: string; sizeBytes?: number }; busy: boolean; onAdd: () => void; onPreview: () => void; onRemove: () => void }) {
  const uploaded = record?.state === 'uploaded';
  return <Card style={styles.documentCard}><View style={[styles.documentIcon, uploaded && styles.documentIconDone]}><Ionicons name={uploaded ? 'checkmark' : 'document-text-outline'} size={21} color={uploaded ? colors.success : colors.primary} /></View><View style={styles.documentCopy}><HText variant="bodyStrong">{DOCUMENT_LABELS[kind]}</HText><HText variant="caption" color={colors.muted}>{uploaded ? `${record?.name} · ${formatBytes(record?.sizeBytes)}` : DOCUMENT_HINTS[kind].split('.')[0]}</HText><HText variant="micro" color={colors.muted}>{uploaded ? 'READY ON DEVICE' : 'PDF OR IMAGE'}</HText></View>{uploaded ? <View style={styles.documentActions}><Button variant="ghost" onPress={onPreview} disabled={busy} style={styles.smallButton}>Preview</Button><Button variant="ghost" onPress={onAdd} disabled={busy} style={styles.smallButton}>Replace</Button><Button variant="ghost" icon="trash-outline" accessibilityLabel={`Remove ${DOCUMENT_LABELS[kind]}`} onPress={onRemove} disabled={busy} style={styles.trashButton} /></View> : <Button variant="secondary" onPress={onAdd} disabled={busy} style={styles.addButton}>{busy ? 'Adding…' : 'Add file'}</Button>}</Card>;
}
function formatBytes(value?: number) { if (!value) return 'Size unknown'; if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`; return `${(value / 1024 / 1024).toFixed(1)} MB`; }
const styles = StyleSheet.create({ nav: { marginBottom: spacing.lg }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, titleCopy: { flex: 1, gap: 2 }, title: { marginTop: spacing.xs, marginBottom: spacing.sm }, safety: { marginTop: spacing.xl, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }, safetyCopy: { flex: 1, gap: 3 }, errorCard: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }, documentCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm, padding: spacing.md }, documentIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, documentIconDone: { backgroundColor: colors.successSoft }, documentCopy: { flex: 1, gap: 2 }, documentActions: { alignItems: 'flex-end', gap: 2 }, addButton: { minHeight: 44, paddingHorizontal: spacing.sm }, smallButton: { minHeight: 44, paddingHorizontal: spacing.xs }, trashButton: { minHeight: 44, paddingHorizontal: spacing.xs }, bottomActions: { gap: spacing.xs },
});

