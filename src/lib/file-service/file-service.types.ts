import { QrDesignSettings } from '@/schemas/qr-design';

export type ExportFormat = 'png' | 'svg' | 'pdf';

export interface ExportOptions {
  value: string;
  designSettings?: QrDesignSettings;
  filename?: string;
  size?: number; // Target pixel dimensions for PNG (defaults to 1024 for high-res crisp export)
}

export interface ExportResult {
  success: boolean;
  filename: string;
  format: ExportFormat;
  mimeType: string;
}
