import * as FileSystem from 'expo-file-system/legacy';
import { API_CONFIG } from '../config/api';
import type {
  DeleteFilesPayload,
  DeleteFilesResponse,
  PresignedUploadData,
  RequestUploadUrlPayload,
  RequestUploadUrlResponse,
  UploadDirectory,
} from '../types/file';
import { api } from './api';

export async function requestUploadUrl(
  payload: RequestUploadUrlPayload,
): Promise<PresignedUploadData> {
  const { data } = await api.post<RequestUploadUrlResponse>(
    API_CONFIG.ENDPOINTS.FILES_UPLOAD_URL,
    payload,
  );
  return data.data;
}

export async function deleteFiles(payload: DeleteFilesPayload): Promise<DeleteFilesResponse> {
  const { data } = await api.delete<DeleteFilesResponse>(API_CONFIG.ENDPOINTS.FILES, {
    data: payload,
  });
  return data;
}

export async function uploadFileToS3(
  fileUri: string,
  uploadUrl: string,
  mimeType: string,
): Promise<void> {
  const uploadResponse = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      'Content-Type': mimeType,
    },
  });

  if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
    throw new Error(`S3 upload failed: ${uploadResponse.status}`);
  }
}

export async function uploadFileViaPresignedUrl(params: {
  fileUri: string;
  fileName: string;
  fileType: string;
  directory: UploadDirectory;
}): Promise<PresignedUploadData> {
  const presigned = await requestUploadUrl({
    fileName: params.fileName,
    fileType: params.fileType,
    directory: params.directory,
  });

  await uploadFileToS3(params.fileUri, presigned.uploadUrl, params.fileType);
  return presigned;
}
