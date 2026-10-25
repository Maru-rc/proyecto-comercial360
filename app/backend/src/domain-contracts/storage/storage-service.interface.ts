export interface GenerateUploadUrlParams {
  readonly s3Key: string;
  readonly contentType: string;
  /** Exact object size in bytes; signed, so S3 rejects any other length. */
  readonly fileSize: number;
  readonly expiresInSeconds: number;
}

export interface GenerateDownloadUrlParams {
  readonly s3Key: string;
  readonly expiresInSeconds: number;
}

export interface IStorageService {
  generateUploadUrl(params: GenerateUploadUrlParams): Promise<string>;
  generateDownloadUrl(params: GenerateDownloadUrlParams): Promise<string>;
  deleteObject(s3Key: string): Promise<void>;
}
