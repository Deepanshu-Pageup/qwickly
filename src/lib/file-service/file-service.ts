import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrDesignSettings,
  getEffectiveErrorLevel,
  evaluateContrast,
} from '@/schemas/qr-design';
import {
  ExportOptions,
  ExportResult,
} from './file-service.types';

interface SvgElementTree {
  type: string;
  props: {
    [key: string]: unknown;
    children?: unknown;
  };
}

interface ForwardRefQRCodeSVG {
  render: (
    props: React.ComponentProps<typeof QRCodeSVG>,
    ref: null
  ) => SvgElementTree;
}

export class FileService {
  private static instance: FileService | null = null;

  // Enforce singleton pattern via private constructor
  private constructor() {}

  public static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  /**
   * Serializes a ReactElement tree (like QRCodeSVG's element tree) to valid SVG XML
   * without requiring react-dom/server, ensuring zero runtime conflicts across
   * both client and React Server Component environments.
   */
  private serializeElementToXml(node: unknown): string {
    if (!node) return '';
    if (typeof node === 'string') {
      return node
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
    if (typeof node === 'number') {
      return String(node);
    }

    const element = node as SvgElementTree;
    if (!element.type || !element.props) return '';

    const { type, props } = element;
    let attrs = '';
    const children: unknown[] = [];

    for (const [key, val] of Object.entries(props)) {
      if (key === 'children') {
        if (Array.isArray(val)) {
          children.push(...val.filter(Boolean));
        } else if (val) {
          children.push(val);
        }
      } else if (val !== undefined && val !== null && typeof val !== 'function') {
        let attrName = key;
        if (key === 'shapeRendering') attrName = 'shape-rendering';
        else if (key === 'preserveAspectRatio') attrName = 'preserveAspectRatio';
        else if (key === 'viewBox') attrName = 'viewBox';
        else if (key === 'crossOrigin') attrName = 'crossorigin';

        const escapedVal = String(val)
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        attrs += ` ${attrName}="${escapedVal}"`;
        // In SVG 1.1/standard viewers, xlink:href is required for <image> tags
        if (key === 'href') {
          attrs += ` xlink:href="${escapedVal}"`;
        }
      }
    }

    if (children.length === 0) {
      return `<${type}${attrs}/>`;
    }

    const inner = children
      .map((child) => this.serializeElementToXml(child))
      .join('');

    return `<${type}${attrs}>${inner}</${type}>`;
  }

  /**
   * Generates a standards-compliant SVG string representing the QR code
   * with current design settings, colors, quiet zone, and optional logo.
   */
  public generateSvgString(
    value: string,
    designSettings?: QrDesignSettings,
    targetSize: number = 1024
  ): string {
    this.validateValue(value);
    this.validateContrast(designSettings);

    const fgColor = designSettings?.fgColor ?? '#000000';
    const bgColor = designSettings?.bgColor ?? '#ffffff';
    const effectiveMargin = designSettings?.marginSize ?? 4;
    const effectiveLevel = designSettings
      ? getEffectiveErrorLevel(designSettings)
      : 'M';

    let imageSettings:
      | {
          src: string;
          height: number;
          width: number;
          excavate: boolean;
        }
      | undefined = undefined;

    if (designSettings?.logo?.src) {
      const ratio = Math.min(designSettings.logo.sizeRatio ?? 0.18, 0.2);
      const pixelSize = Math.round(targetSize * ratio);
      imageSettings = {
        src: designSettings.logo.src,
        height: pixelSize,
        width: pixelSize,
        excavate: designSettings.logo.excavate ?? true,
      };
    }

    // Ensure React dispatcher internals for hook evaluation in test / server / client runners
    const reactAny = React as unknown as {
      __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE?: {
        H: unknown;
      };
      __SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE?: {
        H: unknown;
      };
    };

    const internals =
      reactAny.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ||
      reactAny.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

    const previousH = internals ? internals.H : null;

    if (internals) {
      internals.H = {
        useMemo: (fn: () => unknown) => fn(),
        useRef: (v: unknown) => ({ current: v }),
        useCallback: (fn: (...args: unknown[]) => unknown) => fn,
        useState: (v: unknown) => [v, () => {}],
        useEffect: () => {},
        useLayoutEffect: () => {},
      };
    }

    let qrElementTree: SvgElementTree;
    try {
      qrElementTree = (
        QRCodeSVG as unknown as ForwardRefQRCodeSVG
      ).render(
        {
          value,
          size: targetSize,
          level: effectiveLevel,
          marginSize: effectiveMargin,
          bgColor,
          fgColor,
          imageSettings,
        },
        null
      );
    } finally {
      if (internals) {
        internals.H = previousH;
      }
    }

    let svgMarkup = this.serializeElementToXml(qrElementTree);

    // Ensure standard xmlns and xmlns:xlink XML namespaces are present
    if (!svgMarkup.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgMarkup = svgMarkup.replace(
        '<svg ',
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
      );
    } else if (!svgMarkup.includes('xmlns:xlink="http://www.w3.org/1999/xlink"')) {
      svgMarkup = svgMarkup.replace(
        '<svg ',
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink" '
      );
    }

    // Prepend standard XML declaration for valid standalone vector files
    return `<?xml version="1.0" encoding="UTF-8"?>\n${svgMarkup}`;
  }

  /**
   * Exports and downloads the current QR code as an SVG vector file.
   */
  public async exportSVG(options: ExportOptions): Promise<ExportResult> {
    const filename = options.filename ?? 'qr-code.svg';
    const svgString = this.generateSvgString(
      options.value,
      options.designSettings,
      options.size ?? 1024
    );

    const blob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });
    this.triggerDownload(blob, filename);

    return {
      success: true,
      filename,
      format: 'svg',
      mimeType: 'image/svg+xml',
    };
  }

  /**
   * Generates a high-resolution raster image Blob from the SVG markup using
   * an in-memory client-side canvas without upscaling artifacts.
   */
  public async generatePngBlob(
    value: string,
    designSettings?: QrDesignSettings,
    targetSize: number = 1024
  ): Promise<Blob> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('PNG raster generation is only supported in browser environments.');
    }

    const svgString = this.generateSvgString(value, designSettings, targetSize);
    const svgBlob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    try {
      const img = await this.loadImage(url);
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Unable to acquire 2D canvas context for PNG export.');
      }

      // Draw background explicitly to ensure opacity
      ctx.fillStyle = designSettings?.bgColor ?? '#ffffff';
      ctx.fillRect(0, 0, targetSize, targetSize);
      ctx.drawImage(img, 0, 0, targetSize, targetSize);

      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to PNG blob conversion failed.'));
          }
        }, 'image/png');
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Exports and downloads the current QR code as a crisp high-res PNG file.
   */
  public async exportPNG(options: ExportOptions): Promise<ExportResult> {
    const filename = options.filename ?? 'qr-code.png';
    const targetSize = options.size ?? 1024;
    const blob = await this.generatePngBlob(
      options.value,
      options.designSettings,
      targetSize
    );

    this.triggerDownload(blob, filename);

    return {
      success: true,
      filename,
      format: 'png',
      mimeType: 'image/png',
    };
  }

  /**
   * Builds an ISO standard A4 PDF document containing the centered QR code image.
   * A4 dimensions at 72 pt/in = 595.28 x 841.89 points.
   * Embeds binary image stream with strict PDF 1.4 cross-reference table and trailer.
   */
  public buildPdfDocument(
    imageBytes: Uint8Array,
    imgWidth: number,
    imgHeight: number,
    pageWidth: number = 595.28,
    pageHeight: number = 841.89
  ): Uint8Array {
    // Center QR code on A4 page; display at 350x350 pt (approx 123.5 mm) with safe print margins
    const displaySize = Math.min(350, pageWidth - 100);
    const x = (pageWidth - displaySize) / 2;
    const y = (pageHeight - displaySize) / 2;

    const enc = new TextEncoder();
    const parts: Uint8Array[] = [];
    const offsets: number[] = [];
    let currentLength = 0;

    const pushChunk = (chunk: Uint8Array | string) => {
      const bytes = typeof chunk === 'string' ? enc.encode(chunk) : chunk;
      parts.push(bytes);
      currentLength += bytes.length;
    };

    // Header (PDF-1.4 with binary comment indicator)
    pushChunk('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

    // Object 1: Catalog
    offsets[1] = currentLength;
    pushChunk('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    // Object 2: Pages
    offsets[2] = currentLength;
    pushChunk(
      `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] >>\nendobj\n`
    );

    // Object 4: Image XObject
    offsets[4] = currentLength;
    const imgObjHeader = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`;
    pushChunk(imgObjHeader);
    pushChunk(imageBytes);
    pushChunk('\nendstream\nendobj\n');

    // Object 5: Page Content Stream (draw centered image)
    offsets[5] = currentLength;
    const streamContent = `q\n${displaySize.toFixed(2)} 0 0 ${displaySize.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im1 Do\nQ\n`;
    const streamContentBytes = enc.encode(streamContent);
    pushChunk(
      `5 0 obj\n<< /Length ${streamContentBytes.length} >>\nstream\n${streamContent}endstream\nendobj\n`
    );

    // Object 3: Page
    offsets[3] = currentLength;
    pushChunk(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
    );

    // Cross-Reference Table
    const startXref = currentLength;
    pushChunk('xref\n0 6\n0000000000 65535 f \n');
    for (let i = 1; i <= 5; i++) {
      const offsetStr = String(offsets[i]).padStart(10, '0');
      pushChunk(`${offsetStr} 00000 n \n`);
    }

    // Trailer
    pushChunk(
      `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`
    );

    // Concatenate all parts into a single Uint8Array
    const pdfData = new Uint8Array(currentLength);
    let offset = 0;
    for (const part of parts) {
      pdfData.set(part, offset);
      offset += part.length;
    }

    return pdfData;
  }

  /**
   * Generates a print-ready A4 PDF containing the centered vector-rendered QR code.
   */
  public async generatePdfBlob(
    value: string,
    designSettings?: QrDesignSettings,
    targetSize: number = 1024
  ): Promise<Blob> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('PDF document generation is only supported in browser environments.');
    }

    const svgString = this.generateSvgString(value, designSettings, targetSize);
    const svgBlob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    try {
      const img = await this.loadImage(url);
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Unable to acquire 2D canvas context for PDF generation.');
      }

      ctx.fillStyle = designSettings?.bgColor ?? '#ffffff';
      ctx.fillRect(0, 0, targetSize, targetSize);
      ctx.drawImage(img, 0, 0, targetSize, targetSize);

      const jpegBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to JPEG blob conversion failed.'));
            }
          },
          'image/jpeg',
          0.95
        );
      });

      const buffer = await jpegBlob.arrayBuffer();
      const imageBytes = new Uint8Array(buffer);

      const pdfBytes = this.buildPdfDocument(
        imageBytes,
        targetSize,
        targetSize
      );

      return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Exports and downloads the current QR code as a print-ready PDF document.
   */
  public async exportPDF(options: ExportOptions): Promise<ExportResult> {
    const filename = options.filename ?? 'qr-code.pdf';
    const targetSize = options.size ?? 1024;
    const blob = await this.generatePdfBlob(
      options.value,
      options.designSettings,
      targetSize
    );

    this.triggerDownload(blob, filename);

    return {
      success: true,
      filename,
      format: 'pdf',
      mimeType: 'application/pdf',
    };
  }

  /**
   * Shared helper: Loads an image element from an Object URL and waits for full decoding.
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          if ('decode' in img && typeof img.decode === 'function') {
            await img.decode();
          }
          resolve(img);
        } catch {
          // If decode fails or is not applicable, resolve the loaded image
          resolve(img);
        }
      };
      img.onerror = () =>
        reject(new Error('Failed to load SVG markup into image element.'));
      img.src = src;
    });
  }

  /**
   * Shared helper: Triggers client-side browser file download and cleans up URL.
   */
  private triggerDownload(blob: Blob, filename: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('Download triggers are only supported in browser environments.');
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release object URL after user agent processes download trigger
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  }

  /**
   * Validates QR string payload prior to generation.
   */
  private validateValue(value: string): void {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('Cannot export empty or invalid QR code payload.');
    }
  }

  /**
   * Validates color contrast prior to export. Blocks inverted colors and contrast < 4.5:1.
   */
  private validateContrast(designSettings?: QrDesignSettings): void {
    if (!designSettings) return;
    const contrast = evaluateContrast(designSettings.fgColor, designSettings.bgColor);
    if (!contrast.isDownloadAllowed) {
      if (contrast.isInverted) {
        throw new Error('Cannot export QR code with inverted color scheme (light foreground on dark background).');
      }
      throw new Error(
        `Cannot export QR code with insufficient contrast (${contrast.ratio.toFixed(1)}:1 is below the required 4.5:1 threshold).`
      );
    }
  }
}

export const fileService = FileService.getInstance();
