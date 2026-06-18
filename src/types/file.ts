export type UploadDirectory = 'profile-avatars' | 'medical-documents' | 'uploads';

export interface RequestUploadUrlPayload {
  fileName: string;
  fileType: string;
  directory?: UploadDirectory;
}

export interface PresignedUploadData {
  uploadUrl: string;
  key: string;
  fileUrl: string;
  previewUrl: string;
  expiresAt: string;
}

export interface RequestUploadUrlResponse {
  message: string;
  data: PresignedUploadData;
}

export interface DeleteFilesPayload {
  fileUrls: string[];
}

export interface DeleteFilesResponse {
  message: string;
  data: {
    deleted: string[];
    failed: string[];
  };
}

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
}
