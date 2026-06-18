import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { deleteFiles, uploadFileViaPresignedUrl } from '../services/fileService';
import { getApiErrorMessage } from '../utils/apiError';
import {
  cacheImagePreview,
  getDisplayImageUrl,
  removeCachedImagePreview,
} from '../utils/imagePreviewCache';

interface ProfileAvatarPickerProps {
  imageUrl: string | null | undefined;
  initials: string;
  onImageUploaded: (fileUrl: string | null) => Promise<void>;
  size?: number;
}

export default function ProfileAvatarPicker({
  imageUrl,
  initials,
  onImageUploaded,
  size = 96,
}: ProfileAvatarPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);

    if (!imageUrl) {
      setDisplayUrl(null);
      return;
    }

    let cancelled = false;

    void getDisplayImageUrl(imageUrl).then((url) => {
      if (!cancelled) setDisplayUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  const pickAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo library access to upload a profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `profile-${Date.now()}.jpg`;
    const mimeType = asset.mimeType ?? 'image/jpeg';

    setUploading(true);
    try {
      const uploaded = await uploadFileViaPresignedUrl({
        fileUri: asset.uri,
        fileName,
        fileType: mimeType,
        directory: 'profile-avatars',
      });

      await cacheImagePreview(uploaded.fileUrl, uploaded.previewUrl, uploaded.expiresAt);
      setImageError(false);
      setDisplayUrl(uploaded.previewUrl);
      await onImageUploaded(uploaded.fileUrl);
    } catch (error) {
      Alert.alert('Upload failed', getApiErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (!imageUrl) return;

    Alert.alert('Remove photo', 'Remove your profile photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setUploading(true);
            try {
              await deleteFiles({ fileUrls: [imageUrl] });
              await removeCachedImagePreview(imageUrl);
              setDisplayUrl(null);
              setImageError(false);
              await onImageUploaded(null);
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

  const showImage = Boolean(displayUrl) && !imageError;

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        {uploading ? (
          <ActivityIndicator color={colors.primary} />
        ) : showImage ? (
          <Image
            source={{ uri: displayUrl as string }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{initials}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={pickAndUpload} disabled={uploading}>
          <Text style={styles.buttonText}>{imageUrl ? 'Change photo' : 'Upload photo'}</Text>
        </Pressable>
        {imageUrl ? (
          <Pressable style={styles.removeButton} onPress={handleRemove} disabled={uploading}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.primary,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  removeButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
