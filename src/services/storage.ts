export type StorageProvider = 's3' | 'local' | 'gcs';

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  mimetype: string;
}

export interface IStorageService {
  upload(file: File | Blob | Buffer, path: string, options?: unknown): Promise<UploadResult>;
  delete(path: string): Promise<boolean>;
  getSignedUrl(path: string, expiresIn?: number): Promise<string>;
}

export class StorageService implements IStorageService {
  private provider: StorageProvider;

  constructor(provider: StorageProvider = 'local') {
    this.provider = provider;
  }

  async upload(_file: File | Blob | Buffer, path: string, _options?: unknown): Promise<UploadResult> {
    // Implementation would handle actual upload logic based on provider
    console.log(`Uploading file to ${path} using ${this.provider}`);
    return {
      url: `https://storage.example.com/${path}`,
      path,
      size: 1024,
      mimetype: 'application/octet-stream'
    };
  }

  async delete(path: string): Promise<boolean> {
    console.log(`Deleting file at ${path}`);
    return true;
  }

  async getSignedUrl(path: string, _expiresIn = 3600): Promise<string> {
    return `https://storage.example.com/${path}?sig=demo`;
  }
}
