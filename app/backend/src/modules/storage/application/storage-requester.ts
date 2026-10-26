/** Who asks for a presigned URL: decides key ownership and access. */
export interface StorageRequester {
  id: string;
  role: string;
}
