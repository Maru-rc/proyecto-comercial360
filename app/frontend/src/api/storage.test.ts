import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./client', () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
}));

import { apiClient } from './client';
import { getSignedS3Url, uploadFileToS3 } from './storage';

const post = vi.mocked(apiClient.post);
const get = vi.mocked(apiClient.get);

describe('storage service (HU-19)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    post.mockResolvedValue({
      data: {
        uploadUrl: 'https://bucket.s3/put?sig=1',
        s3Key: 'visit-evidence/u1/2026/10/abc.jpg',
        expiresInSeconds: 300,
        headers: { 'Content-Type': 'image/jpeg' },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('asks for a signed URL with type, size and purpose, then PUTs the file to S3', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    const file = new File(['x'.repeat(10)], 'foto.jpg', { type: 'image/jpeg' });

    const result = await uploadFileToS3(file);

    expect(post).toHaveBeenCalledWith('/storage/upload-url', {
      contentType: 'image/jpeg',
      fileSize: 10,
      purpose: 'visit-evidence',
    });
    expect(fetchMock).toHaveBeenCalledWith('https://bucket.s3/put?sig=1', {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: file,
    });
    expect(result.s3_key).toBe('visit-evidence/u1/2026/10/abc.jpg');
  });

  it('fails when S3 rejects the upload (e.g. size differs from the signed one)', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 });
    const file = new File(['x'], 'foto.jpg', { type: 'image/jpeg' });
    await expect(uploadFileToS3(file)).rejects.toThrow(/403/);
  });

  it('downloads through a short-lived signed URL for the key', async () => {
    get.mockResolvedValue({
      data: { downloadUrl: 'https://bucket.s3/get?sig=2' },
    });
    await expect(getSignedS3Url('visit-evidence/k.jpg')).resolves.toBe(
      'https://bucket.s3/get?sig=2',
    );
    expect(get).toHaveBeenCalledWith('/storage/download-url', {
      params: { s3Key: 'visit-evidence/k.jpg' },
    });
  });
});
