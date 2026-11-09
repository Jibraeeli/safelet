import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colours } from '../../constants/colours';
import { complianceItems } from '../../constants/compliance';
import {
  getProof,
  getProofDraft,
  removeProof,
  saveProof,
  saveProofDraft,
  SelectedProofFile,
} from '../../lib/proof';

/** Delay after a successful save before returning to the fix screen. */
const SUCCESS_DELAY_MS = 1500;

/** Human-readable file size. */
function formatSize(bytes?: number): string {
  if (bytes === undefined) {
    return '';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [file, setFile] = useState<SelectedProofFile | null>(null);
  const [sendToTenant, setSendToTenant] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  // Rehydrate on mount: a pending draft (survives a remount mid-pick) takes
  // precedence, otherwise show any previously saved proof for this item.
  useEffect(() => {
    let active = true;
    (async () => {
      const draft = await getProofDraft(id);
      if (draft) {
        if (active) {
          setFile(draft);
        }
        return;
      }
      const proof = await getProof(id);
      if (proof && active) {
        setFile({
          uri: proof.fileUri,
          name: proof.fileName,
          size: proof.fileSize,
          mimeType: proof.mimeType,
          kind: proof.kind,
        });
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // Persist the selection immediately so it survives a remount.
  const selectFile = (selected: SelectedProofFile) => {
    setFile(selected);
    void saveProofDraft(id, selected);
  };

  const removeFile = () => {
    setFile(null);
    // Fully delete: proof record, proven flag, and any pending draft.
    void removeProof(id);
  };

  const item = complianceItems.find((entry) => entry.id === id);

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.topSection}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colours.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Compliance item not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const requiresAck = item.requiresTenantAcknowledgement;

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Camera access needed',
        'Please allow camera access to photograph your document.',
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      const asset = result.assets[0];
      selectFile({
        uri: asset.uri,
        name: asset.fileName ?? 'photo.jpg',
        size: asset.fileSize,
        mimeType: asset.mimeType,
        kind: 'image',
      });
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const isPdf =
        asset.mimeType === 'application/pdf' ||
        asset.name.toLowerCase().endsWith('.pdf');
      selectFile({
        uri: asset.uri,
        name: asset.name,
        size: asset.size ?? undefined,
        mimeType: asset.mimeType,
        kind: isPdf ? 'pdf' : 'image',
      });
    }
  };

  const handleSave = async () => {
    if (!file || saved) {
      return;
    }
    await saveProof({
      id: item.id,
      fileName: file.name,
      fileUri: file.uri,
      fileSize: file.size,
      mimeType: file.mimeType,
      kind: file.kind,
      timestamp: new Date().toISOString(),
    });
    setSaved(true);
    timer.current = setTimeout(() => {
      router.back();
    }, SUCCESS_DELAY_MS);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.topSection}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colours.white} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Upload Proof</Text>
        <Text style={styles.pageSubtitle}>{item.name}</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload options */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.85}
            onPress={takePhoto}
          >
            <Ionicons name="camera" size={36} color={colours.green} />
            <Text style={styles.optionTitle}>Take Photo</Text>
            <Text style={styles.optionSubtitle}>
              Photo of certificate or document
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.85}
            onPress={pickFile}
          >
            <Ionicons name="document" size={36} color={colours.green} />
            <Text style={styles.optionTitle}>Upload File</Text>
            <Text style={styles.optionSubtitle}>PDF or image from your files</Text>
          </TouchableOpacity>
        </View>

        {/* Empty state - fills the space and cues where proof will appear */}
        {!file && (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-outline"
              size={44}
              color="rgba(255,255,255,0.3)"
            />
            <Text style={styles.emptyStateText}>Your proof will appear here</Text>
          </View>
        )}

        {/* Preview + timestamp */}
        {file && (
          <>
            <View style={styles.previewCard}>
              {file.kind === 'image' ? (
                <Image source={{ uri: file.uri }} style={styles.thumbnail} />
              ) : (
                <View style={styles.pdfIcon}>
                  <Ionicons
                    name="document-text"
                    size={40}
                    color={colours.green}
                  />
                </View>
              )}
              <View style={styles.previewText}>
                <Text style={styles.fileName} numberOfLines={2}>
                  {file.name}
                </Text>
                {formatSize(file.size) !== '' && (
                  <Text style={styles.fileSize}>{formatSize(file.size)}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                activeOpacity={0.85}
                onPress={removeFile}
                accessibilityRole="button"
                accessibilityLabel="Remove file"
              >
                <Ionicons name="close" size={16} color={colours.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.timestampRow}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colours.green}
              />
              <Text style={styles.timestampText}>
                Proof will be timestamped at time of upload
              </Text>
            </View>
          </>
        )}

        {/* Tenant acknowledgement */}
        {requiresAck && (
          <View style={styles.ackCard}>
            <Text style={styles.ackLabel}>TENANT ACKNOWLEDGEMENT</Text>
            <Text style={styles.ackText}>
              After uploading you can send this to your tenant to get a digital
              confirmation they received it
            </Text>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>
                Also send to tenant for acknowledgement
              </Text>
              <Switch
                value={sendToTenant}
                onValueChange={setSendToTenant}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: colours.green }}
                thumbColor={colours.white}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky save button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.button, !file && styles.buttonDisabled]}
          activeOpacity={0.85}
          disabled={!file || saved}
          onPress={handleSave}
        >
          {saved ? (
            <View style={styles.savedRow}>
              <Ionicons name="checkmark" size={20} color={colours.white} />
              <Text style={styles.savedText}>Proof Saved ✓</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Save Proof</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colours.navy,
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  pageTitle: {
    color: colours.white,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  pageSubtitle: {
    color: colours.white,
    fontSize: 15,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 4,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: colours.white,
    fontSize: 16,
    opacity: 0.7,
  },
  scroll: {
    flex: 1,
    marginTop: 32,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '47%',
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: colours.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  optionTitle: {
    color: colours.white,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  optionSubtitle: {
    color: colours.white,
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    marginTop: 24,
    minHeight: 160,
  },
  emptyStateText: {
    color: colours.white,
    opacity: 0.3,
    fontSize: 15,
    marginTop: 8,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colours.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  pdfIcon: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  previewText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  fileName: {
    color: colours.white,
    fontSize: 15,
    fontWeight: '600',
  },
  fileSize: {
    color: colours.white,
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colours.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  timestampText: {
    color: colours.white,
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 8,
    flex: 1,
  },
  ackCard: {
    backgroundColor: '#1a3a2a',
    borderWidth: 1,
    borderColor: colours.green,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  ackLabel: {
    color: colours.green,
    fontSize: 12,
    letterSpacing: 1,
  },
  ackText: {
    color: colours.white,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  toggleLabel: {
    color: colours.white,
    fontSize: 15,
    flex: 1,
    marginRight: 12,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    backgroundColor: colours.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: colours.white,
    fontSize: 18,
    fontWeight: '600',
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedText: {
    color: colours.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
