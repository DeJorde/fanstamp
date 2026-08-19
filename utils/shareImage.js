import { Platform, Share } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';

// Android's Share intent needs a content:// URI (FileProvider) — a raw
// file:// path from captureRef is blocked by FileUriExposedException on
// API 24+. iOS has no such restriction and shares the tmpfile URI directly.
export async function shareViewAsImage(viewRef, caption) {
  const uri = await captureRef(viewRef, { format: 'png', quality: 1, result: 'tmpfile' });
  const shareUrl = Platform.OS === 'android' ? await FileSystem.getContentUriAsync(uri) : uri;
  await Share.share({ url: shareUrl, message: caption });
}
