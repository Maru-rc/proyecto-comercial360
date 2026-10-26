export interface BackupFileParams {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  user: string;
  category: string;
}

export interface BackupFileResult {
  attachmentId?: number;
  s3Key: string;
}

export interface FileBackupService {
  backupFile(params: BackupFileParams): Promise<BackupFileResult>;
}

export const FILE_BACKUP_SERVICE = Symbol('FILE_BACKUP_SERVICE');
