import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  BackupFileParams,
  BackupFileResult,
  FileBackupService,
} from '../../application/ports/file-backup.port.js';
import { AttachmentOrmEntity } from '../persistence/entities/attachment.orm-entity.js';

@Injectable()
export class FileBackupAdapter implements FileBackupService {
  private readonly logger = new Logger(FileBackupAdapter.name);
  private readonly s3Client: S3Client | null = null;
  private readonly bucketName: string | null;

  constructor(private readonly dataSource: DataSource) {
    this.bucketName =
      process.env.AWS_S3_BUCKET ?? process.env.S3_BUCKET_NAME ?? null;

    if (this.bucketName && process.env.AWS_REGION) {
      try {
        this.s3Client = new S3Client({
          region: process.env.AWS_REGION,
        });
      } catch (err) {
        this.logger.warn(
          `No se pudo inicializar S3Client: ${(err as Error).message}`,
        );
      }
    }
  }

  async backupFile(params: BackupFileParams): Promise<BackupFileResult> {
    const timestamp = Date.now();
    const safeFilename = params.originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const s3Key = `imports/clientes/${timestamp}-${safeFilename}`;

    // 1. Subir a S3 si está configurado
    if (this.s3Client && this.bucketName) {
      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
            Body: params.buffer,
            ContentType: params.mimeType,
          }),
        );
      } catch (err) {
        this.logger.warn(
          `Error al subir respaldo a S3: ${(err as Error).message}`,
        );
      }
    }

    // 2. Registrar en tabla attachments (ADJUNTO N-1)
    let attachmentId: number | undefined;
    try {
      const repo = this.dataSource.getRepository(AttachmentOrmEntity);
      const entity = repo.create({
        visitId: null,
        category: params.category || 'IMPORTACION_CLIENTES',
        s3Key,
        originalName: params.originalName,
        mimeType: params.mimeType,
        size: params.buffer.length,
        user: params.user,
      });
      const saved = await repo.save(entity);
      attachmentId = saved.id;
    } catch (err) {
      this.logger.warn(
        `Error al registrar attachment en base de datos: ${(err as Error).message}`,
      );
    }

    return { attachmentId, s3Key };
  }
}
