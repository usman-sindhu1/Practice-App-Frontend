import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, type ImageStyle, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { getDisplayImageUrl } from '../utils/imagePreviewCache';

interface UserAvatarProps {
  imageUrl?: string | null;
  initials: string;
  size?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  textColor?: string;
  backgroundColor?: string;
}

export default function UserAvatar({
  imageUrl,
  initials,
  size = 54,
  style,
  imageStyle,
  textColor = colors.primary,
  backgroundColor = colors.primaryLight,
}: UserAvatarProps) {
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

  const showImage = Boolean(displayUrl) && !imageError;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: displayUrl as string }}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.34, color: textColor }]}>
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: '700',
  },
});
