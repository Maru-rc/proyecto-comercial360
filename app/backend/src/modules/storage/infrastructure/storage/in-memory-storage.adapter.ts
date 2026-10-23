import type {
  GenerateDownloadUrlParams,
  GenerateUploadUrlParams,
  IStorageService,
} from '../../../../domain-contracts/index.js';

export class InMemoryStorageAdapter implements IStorageService {
  private readonly storedObjects = new Set<string>();

  async generateUploadUrl(params: GenerateUploadUrlParams): Promise<string> {
    this.storedObjects.add(params.s3Key);
    return `https://mock-s3.local/upload/${encodeURIComponent(params.s3Key)}?expires=${params.expiresInSeconds ?? 900}`;
  }

  async generateDownloadUrl(
    params: GenerateDownloadUrlParams,
  ): Promise<string> {
    return `https://mock-s3.local/download/${encodeURIComponent(params.s3Key)}?expires=${params.expiresInSeconds ?? 3600}`;
  }

  async deleteObject(s3Key: string): Promise<void> {
    this.storedObjects.delete(s3Key);
  }

  hasObject(s3Key: string): boolean {
    return this.storedObjects.has(s3Key);
  }

  clear(): void {
    this.storedObjects.clear();
  }
}
