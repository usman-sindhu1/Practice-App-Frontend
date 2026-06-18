export function getFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split('/');
    return decodeURIComponent(segments[segments.length - 1] || 'document');
  } catch {
    const segments = url.split('/');
    return segments[segments.length - 1] || 'document';
  }
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}
