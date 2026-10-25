import type { AllowedMimeType } from './storage.constants.js';

/** What an object is for: decides the key prefix and who may upload it. */
export const STORAGE_PURPOSES = ['visit-evidence', 'client-import'] as const;
export type StoragePurpose = (typeof STORAGE_PURPOSES)[number];

const EXTENSION_BY_MIME: Record<AllowedMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'text/csv': 'csv',
};

// <purpose>/<ownerId>/<yyyy>/<mm>/<uuid>.<ext>: nothing else is a valid key,
// which also rules out path tricks such as "../".
const KEY_PATTERN =
  /^(visit-evidence|client-import)\/([A-Za-z0-9_-]{1,64})\/(\d{4})\/(\d{2})\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.(jpg|png|webp|pdf|xlsx|xls|csv)$/;

export interface StorageKeyParts {
  purpose: StoragePurpose;
  ownerId: string;
}

export function buildStorageKey(input: {
  purpose: StoragePurpose;
  ownerId: string;
  mimeType: AllowedMimeType;
  now: Date;
  uuid: string;
}): string {
  const year = input.now.getUTCFullYear();
  const month = String(input.now.getUTCMonth() + 1).padStart(2, '0');
  const extension = EXTENSION_BY_MIME[input.mimeType];
  return `${input.purpose}/${input.ownerId}/${year}/${month}/${input.uuid}.${extension}`;
}

/** The key's owner and purpose, or null when the key was not built here. */
export function parseStorageKey(key: string): StorageKeyParts | null {
  const match = KEY_PATTERN.exec(key);
  if (!match) {
    return null;
  }
  return { purpose: match[1] as StoragePurpose, ownerId: match[2] };
}
