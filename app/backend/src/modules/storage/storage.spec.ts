import { beforeEach, describe, expect, it } from 'vitest';
import { ForbiddenOperationException } from '../../domain-contracts/index.js';
import { GenerateDownloadUrlUseCase } from './application/generate-download-url/generate-download-url.use-case.js';
import { GenerateUploadUrlUseCase } from './application/generate-upload-url/generate-upload-url.use-case.js';
import { parseStorageKey } from './domain/storage-key.js';
import {
  DOWNLOAD_URL_TTL_SECONDS,
  MAX_FILE_SIZE_BYTES,
  UPLOAD_URL_TTL_SECONDS,
} from './domain/storage.constants.js';
import { InMemoryStorageAdapter } from './infrastructure/storage/in-memory-storage.adapter.js';

const advisor = { id: 'advisorA1', role: 'ADVISOR' };
const otherAdvisor = { id: 'advisorB2', role: 'ADVISOR' };
const director = { id: 'director9', role: 'DIRECTOR' };

describe('Storage (HU-19)', () => {
  let storage: InMemoryStorageAdapter;
  let upload: GenerateUploadUrlUseCase;
  let download: GenerateDownloadUrlUseCase;

  beforeEach(() => {
    storage = new InMemoryStorageAdapter();
    upload = new GenerateUploadUrlUseCase(storage);
    download = new GenerateDownloadUrlUseCase(storage);
  });

  describe('upload URL', () => {
    it('builds the key on the server, under the requester and purpose', async () => {
      const result = await upload.execute({
        requester: advisor,
        purpose: 'visit-evidence',
        contentType: 'image/jpeg',
        fileSize: 1024,
      });

      expect(result.s3Key).toMatch(
        /^visit-evidence\/advisorA1\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.jpg$/,
      );
      expect(parseStorageKey(result.s3Key)).toEqual({
        purpose: 'visit-evidence',
        ownerId: 'advisorA1',
      });
      expect(storage.hasObject(result.s3Key)).toBe(true);
    });

    it('signs the exact size and type, with a fixed short expiry', async () => {
      const result = await upload.execute({
        requester: advisor,
        purpose: 'visit-evidence',
        contentType: 'application/PDF',
        fileSize: 2048,
      });

      expect(result.expiresInSeconds).toBe(UPLOAD_URL_TTL_SECONDS);
      expect(result.headers).toEqual({ 'Content-Type': 'application/pdf' });
      expect(result.uploadUrl).toContain(`expires=${UPLOAD_URL_TTL_SECONDS}`);
      expect(result.uploadUrl).toContain('size=2048');
      expect(result.s3Key.endsWith('.pdf')).toBe(true);
    });

    it('gives every upload a different key', async () => {
      const input = {
        requester: advisor,
        purpose: 'visit-evidence' as const,
        contentType: 'image/png',
        fileSize: 10,
      };
      const first = await upload.execute(input);
      const second = await upload.execute(input);
      expect(first.s3Key).not.toBe(second.s3Key);
    });

    it.each(['application/x-msdownload', 'text/html'])(
      'rejects %s',
      async (contentType) => {
        await expect(
          upload.execute({
            requester: advisor,
            purpose: 'visit-evidence',
            contentType,
            fileSize: 10,
          }),
        ).rejects.toThrow('File type not allowed');
      },
    );

    it.each([0, -1, 1.5, MAX_FILE_SIZE_BYTES + 1])(
      'rejects a file size of %s',
      async (fileSize) => {
        await expect(
          upload.execute({
            requester: advisor,
            purpose: 'visit-evidence',
            contentType: 'image/png',
            fileSize,
          }),
        ).rejects.toThrow(/fileSize|15MB/);
      },
    );

    it('allows client import files for a director only', async () => {
      const input = {
        purpose: 'client-import' as const,
        contentType: 'text/csv',
        fileSize: 100,
      };
      await expect(
        upload.execute({ ...input, requester: advisor }),
      ).rejects.toBeInstanceOf(ForbiddenOperationException);
      await expect(
        upload.execute({ ...input, requester: director }),
      ).resolves.toMatchObject({
        s3Key: expect.stringMatching(/^client-import\/director9\//),
      });
    });
  });

  describe('download URL', () => {
    const ownKey = async () =>
      (
        await upload.execute({
          requester: advisor,
          purpose: 'visit-evidence',
          contentType: 'image/webp',
          fileSize: 10,
        })
      ).s3Key;

    it('lets the owner download with a fixed short expiry', async () => {
      const s3Key = await ownKey();
      const result = await download.execute({ requester: advisor, s3Key });
      expect(result.expiresInSeconds).toBe(DOWNLOAD_URL_TTL_SECONDS);
      expect(result.downloadUrl).toContain(encodeURIComponent(s3Key));
    });

    it('forbids another advisor (403)', async () => {
      const s3Key = await ownKey();
      await expect(
        download.execute({ requester: otherAdvisor, s3Key }),
      ).rejects.toBeInstanceOf(ForbiddenOperationException);
    });

    it('lets a director download any file', async () => {
      const s3Key = await ownKey();
      await expect(
        download.execute({ requester: director, s3Key }),
      ).resolves.toHaveProperty('downloadUrl');
    });

    it.each([
      '',
      'evidence/123_file.jpg',
      'visit-evidence/advisorA1/../other/2026/10/x.jpg',
      'visit-evidence/advisorA1/2026/10/not-a-uuid.jpg',
    ])(
      'rejects a key that was not built by the server: "%s"',
      async (s3Key) => {
        await expect(
          download.execute({ requester: director, s3Key }),
        ).rejects.toThrow('not a valid storage key');
      },
    );
  });
});
