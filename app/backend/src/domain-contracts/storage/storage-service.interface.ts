export interface GenerateUploadUrlParams {
  s3Key: string;
  contentType?: string;
  mimeType?: string;
  fileSize?: number;
  size?: number;
  expiresInSeconds?: number;
}

export interface GenerateDownloadUrlParams {
  s3Key: string;
  expiresInSeconds?: number;
}

export interface IStorageService {
  generateUploadUrl(params: GenerateUploadUrlParams): Promise<string>;
  generateDownloadUrl(params: GenerateDownloadUrlParams): Promise<string>;
  deleteObject(s3Key: string): Promise<void>;
}
