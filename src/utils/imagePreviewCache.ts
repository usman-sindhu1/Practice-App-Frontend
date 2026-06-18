import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'image-preview-cache';

type CacheEntry = {
  previewUrl: string;
  expiresAt: string;
};

type PreviewCache = Record<string, CacheEntry>;

async function readCache(): Promise<PreviewCache> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PreviewCache;
  } catch {
    return {};
  }
}

async function writeCache(cache: PreviewCache): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function cacheImagePreview(
  fileUrl: string,
  previewUrl: string,
  expiresAt: string,
): Promise<void> {
  const cache = await readCache();
  cache[fileUrl] = { previewUrl, expiresAt };
  await writeCache(cache);
}

export async function removeCachedImagePreview(fileUrl: string): Promise<void> {
  const cache = await readCache();
  delete cache[fileUrl];
  await writeCache(cache);
}

export async function getCachedPreviewUrl(fileUrl: string): Promise<string | null> {
  const cache = await readCache();
  const entry = cache[fileUrl];
  if (!entry) return null;

  if (new Date(entry.expiresAt).getTime() <= Date.now()) {
    delete cache[fileUrl];
    await writeCache(cache);
    return null;
  }

  return entry.previewUrl;
}

export async function getDisplayImageUrl(
  fileUrl: string | null | undefined,
): Promise<string | null> {
  if (!fileUrl) return null;

  const cachedPreview = await getCachedPreviewUrl(fileUrl);
  if (cachedPreview) return cachedPreview;

  return fileUrl;
}
