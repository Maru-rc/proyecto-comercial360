import { beforeEach, describe, expect, it } from 'vitest';
import { GenerateDownloadUrlUseCase } from './application/generate-download-url/generate-download-url.use-case.js';
import { GenerateUploadUrlUseCase } from './application/generate-upload-url/generate-upload-url.use-case.js';
import { InMemoryStorageAdapter } from './infrastructure/storage/in-memory-storage.adapter.js';

describe('Storage Module Unit Tests (HU-19)', () => {
  let storageAdapter: InMemoryStorageAdapter;
  let generateUploadUrlUseCase: GenerateUploadUrlUseCase;
  let generateDownloadUrlUseCase: GenerateDownloadUrlUseCase;

  beforeEach(() => {
    storageAdapter = new InMemoryStorageAdapter();
    generateUploadUrlUseCase = new GenerateUploadUrlUseCase(storageAdapter);
    generateDownloadUrlUseCase = new GenerateDownloadUrlUseCase(storageAdapter);
  });

  it('should generate a presigned upload URL for a valid JPEG image', async () => {
    const result = await generateUploadUrlUseCase.execute({
      filename: 'visit_evidence.jpg',
      contentType: 'image/jpeg',
      fileSize: 2 * 1024 * 1024, // 2 MB
    });

    expect(result.uploadUrl).toBeDefined();
    expect(result.uploadUrl).toContain('mock-s3.local/upload');
    expect(result.s3Key).toMatch(
      /^evidence\/\d+_[a-f0-9]{8}_visit_evidence\.jpg$/,
    );
    expect(storageAdapter.hasObject(result.s3Key)).toBe(true);
  });

  it('should generate a presigned upload URL for PDF documents and Excel sheets', async () => {
    const pdfResult = await generateUploadUrlUseCase.execute({
      filename: 'catalog.pdf',
      contentType: 'application/pdf',
      fileSize: 5 * 1024 * 1024,
    });
    expect(pdfResult.uploadUrl).toBeDefined();

    const excelResult = await generateUploadUrlUseCase.execute({
      filename: 'order.xlsx',
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileSize: 1 * 1024 * 1024,
    });
    expect(excelResult.uploadUrl).toBeDefined();
  });

  it('should reject unauthorized MIME types (.exe, .html)', async () => {
    await expect(
      generateUploadUrlUseCase.execute({
        filename: 'malware.exe',
        contentType: 'application/x-msdownload',
      }),
    ).rejects.toThrow('File type not allowed');

    await expect(
      generateUploadUrlUseCase.execute({
        filename: 'phishing.html',
        contentType: 'text/html',
      }),
    ).rejects.toThrow('File type not allowed');
  });

  it('should reject files exceeding the 15MB limit', async () => {
    const oversizedBytes = 16 * 1024 * 1024; // 16 MB > 15 MB
    await expect(
      generateUploadUrlUseCase.execute({
        filename: 'huge_video.mp4',
        contentType: 'image/jpeg',
        fileSize: oversizedBytes,
      }),
    ).rejects.toThrow('exceeds maximum allowed size of 15MB');
  });

  it('should generate a valid download URL from an s3Key', async () => {
    const result = await generateDownloadUrlUseCase.execute({
      s3Key: 'evidence/123456_photo.png',
      expiresInSeconds: 1800,
    });

    expect(result.downloadUrl).toContain(
      'mock-s3.local/download/evidence%2F123456_photo.png',
    );
    expect(result.downloadUrl).toContain('expires=1800');
  });

  it('should reject download request with empty s3Key', async () => {
    await expect(
      generateDownloadUrlUseCase.execute({
        s3Key: '   ',
      }),
    ).rejects.toThrow('s3Key is required');
  });
});
