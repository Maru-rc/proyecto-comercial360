import { apiClient } from './client';

export interface IS3UploadResponse {
  s3_key: string;
  url: string;
  originalName: string;
  size: number;
}

interface UploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
  expiresInSeconds: number;
  headers: Record<string, string>;
}

/**
 * HU-19: the backend signs a short-lived URL (content type and size included)
 * and the browser uploads straight to S3. `fetch` is used instead of axios so
 * the session cookie and API interceptors never reach the bucket.
 */
export const uploadFileToS3 = async (
  file: File,
): Promise<IS3UploadResponse> => {
  const { data } = await apiClient.post<UploadUrlResponse>(
    '/storage/upload-url',
    {
      contentType: file.type,
      fileSize: file.size,
      purpose: 'visit-evidence',
    },
  );

  const res = await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: data.headers,
    body: file,
  });
  if (!res.ok) {
    throw new Error(`S3 upload failed with status ${res.status}`);
  }

  return {
    s3_key: data.s3Key,
    url: URL.createObjectURL(file),
    originalName: file.name,
    size: file.size,
  };
};

export const getSignedS3Url = async (s3_key: string): Promise<string> => {
  const { data } = await apiClient.get<{ downloadUrl: string }>(
    '/storage/download-url',
    { params: { s3Key: s3_key } },
  );
  return data.downloadUrl;
};
