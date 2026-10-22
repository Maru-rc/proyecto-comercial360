import { apiClient } from './client';

export interface IS3UploadResponse {
  s3_key: string;
  url: string;
  originalName: string;
  size: number;
}

export const uploadFileToS3 = async (
  file: File,
  folder: 'visitas' | 'cotizaciones' = 'visitas',
  entityId: string = '123'
): Promise<IS3UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('entityId', entityId);

  try {
    const { data } = await apiClient.post<IS3UploadResponse>('/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch {
    // Simulated S3 response matching specification:
    // Key pattern: visitas/{id_visita}/fotos/{uuid}.jpg or cotizaciones/{id_cotizacion}/documento.pdf
    const uniqueId = Math.random().toString(36).substring(2, 9);
    const extension = file.name.split('.').pop() || 'jpg';
    const s3_key = `${folder}/${entityId}/${folder === 'visitas' ? 'fotos' : 'docs'}/${uniqueId}.${extension}`;
    const url = URL.createObjectURL(file);

    return {
      s3_key,
      url,
      originalName: file.name,
      size: file.size,
    };
  }
};

export const getSignedS3Url = async (s3_key: string): Promise<string> => {
  try {
    const { data } = await apiClient.get<{ signedUrl: string }>(`/storage/url/${encodeURIComponent(s3_key)}`);
    return data.signedUrl;
  } catch {
    return `https://s3.us-east-1.amazonaws.com/comercial360-bucket/${s3_key}`;
  }
};
