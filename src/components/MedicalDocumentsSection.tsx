import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import type { PickedFile } from '../types/file';
import { deleteFiles, uploadFileViaPresignedUrl } from '../services/fileService';
import { getApiErrorMessage } from '../utils/apiError';
import { getFileNameFromUrl } from '../utils/file';

interface MedicalDocumentsSectionProps {
  documentUrls: string[];
  onChange: (urls: string[]) => void;
}

async function pickDocument(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/*'],
    multiple: false,
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? 'application/octet-stream',
  };
}

async function pickImage(): Promise<PickedFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission required', 'Allow photo library access to upload medical documents.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.9,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.fileName ?? `medical-${Date.now()}.jpg`,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}

export default function MedicalDocumentsSection({
  documentUrls,
  onChange,
}: MedicalDocumentsSectionProps) {
  const [uploading, setUploading] = useState(false);

  const uploadDocument = async (file: PickedFile) => {
    setUploading(true);
    try {
      const uploaded = await uploadFileViaPresignedUrl({
        fileUri: file.uri,
        fileName: file.name,
        fileType: file.mimeType,
        directory: 'medical-documents',
      });

      onChange([...documentUrls, uploaded.fileUrl]);
    } catch (error) {
      Alert.alert('Upload failed', getApiErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const handleAddDocument = () => {
    Alert.alert('Add document', 'Choose a source for your medical document.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Photo library',
        onPress: () => {
          void (async () => {
            const file = await pickImage();
            if (file) await uploadDocument(file);
          })();
        },
      },
      {
        text: 'Files (PDF/image)',
        onPress: () => {
          void (async () => {
            const file = await pickDocument();
            if (file) await uploadDocument(file);
          })();
        },
      },
    ]);
  };

  const handleRemove = (url: string) => {
    Alert.alert('Remove document', 'Delete this document?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setUploading(true);
            try {
              await deleteFiles({ fileUrls: [url] });
              onChange(documentUrls.filter((item) => item !== url));
            } catch (error) {
              Alert.alert('Remove failed', getApiErrorMessage(error));
            } finally {
              setUploading(false);
            }
          })();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Medical documents (optional)</Text>
      <Text style={styles.hint}>Upload PDFs or images of reports, prescriptions, or forms.</Text>

      {documentUrls.map((url) => (
        <View key={url} style={styles.docRow}>
          <Text style={styles.docName} numberOfLines={1}>
            {getFileNameFromUrl(url)}
          </Text>
          <Pressable onPress={() => handleRemove(url)} disabled={uploading}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      ))}

      <Pressable style={styles.addButton} onPress={handleAddDocument} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.addButtonText}>Add document</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  docName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  removeText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
  },
  addButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});
