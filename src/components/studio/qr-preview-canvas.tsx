'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrType, getQrTypeMetadata } from '@/types/qr';
import { Badge } from '@/components/ui/badge';
import {
  QrDesignSettings,
  ErrorCorrectionLevel,
  evaluateContrast,
  getEffectiveErrorLevel,
} from '@/schemas/qr-design';

interface QrPreviewCanvasProps {
  selectedType: QrType;
  encodedValue: string | null;
  isValid: boolean;
  level?: ErrorCorrectionLevel;
  marginSize?: number;
  designSettings?: QrDesignSettings;
}

const PREVIEW_SIZE = 240;

export function QrPreviewCanvas({
  selectedType,
  encodedValue,
  isValid,
  level = 'M',
  marginSize = 4,
  designSettings,
}: QrPreviewCanvasProps) {
  const metadata = getQrTypeMetadata(selectedType);

  const fgColor = designSettings?.fgColor ?? '#000000';
  const bgColor = designSettings?.bgColor ?? '#ffffff';
  const effectiveMargin = designSettings?.marginSize ?? marginSize;
  const effectiveLevel = designSettings ? getEffectiveErrorLevel(designSettings) : level;

  const contrastEval = React.useMemo(() => {
    return evaluateContrast(fgColor, bgColor);
  }, [fgColor, bgColor]);

  const imageSettings = React.useMemo(() => {
    if (!designSettings?.logo?.src) return undefined;
    const ratio = Math.min(designSettings.logo.sizeRatio ?? 0.18, 0.2); // Strict 20% max cap
    const pixelSize = Math.round(PREVIEW_SIZE * ratio);
    return {
      src: designSettings.logo.src,
      height: pixelSize,
      width: pixelSize,
      excavate: designSettings.logo.excavate ?? true,
    };
  }, [designSettings]);

  const isLogoActive = Boolean(designSettings?.logo?.src);
  const hasQr = isValid && Boolean(encodedValue);

  return (
    <div className="space-y-3">
      {/* Preview toolbar - the only glass surface in the right column */}
      <div className="glass-panel flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
        <h2 className="text-base font-semibold leading-none tracking-tight">Preview</h2>
        <div className="flex items-center gap-1.5">
          {isLogoActive && (
            <Badge variant="secondary" size="sm">
              Logo · EC High
            </Badge>
          )}
          <Badge variant={hasQr ? 'success' : 'secondary'} size="sm">
            {hasQr ? 'Content valid' : 'Waiting for content'}
          </Badge>
        </div>
      </div>

      {/* QR surface: always an opaque solid color, never glass, blur or theme-dependent transparency */}
      <div
        className="mx-auto flex aspect-square w-full max-w-72 items-center justify-center overflow-hidden rounded-lg border border-border"
        role="img"
        aria-label={hasQr ? `Generated QR code for ${metadata.label}` : 'QR code preview, waiting for content'}
        style={hasQr ? { backgroundColor: bgColor } : undefined}
      >
        {hasQr && encodedValue ? (
          <QRCodeSVG
            value={encodedValue}
            size={PREVIEW_SIZE}
            level={effectiveLevel}
            marginSize={effectiveMargin}
            bgColor={bgColor}
            fgColor={fgColor}
            imageSettings={imageSettings}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 bg-muted/40 px-6 text-center text-muted-foreground h-full w-full justify-center">
            <svg
              className="size-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4" />
            </svg>
            <p className="text-sm font-medium text-foreground">No QR code yet</p>
            <p className="text-xs">Enter valid content to generate your QR code.</p>
          </div>
        )}
      </div>

      {hasQr && (
        <p className="text-center text-xs text-muted-foreground">
          Contrast {contrastEval.ratio.toFixed(1)}:1. Always test-scan before printing.
        </p>
      )}

      {/* Advisory warnings (non-blocking heuristics) */}
      <div className="space-y-2" aria-live="polite">
        {contrastEval.warningMessage && (
          <p className="rounded-md border border-warning/40 bg-warning/10 p-2.5 text-xs text-warning-foreground">
            {contrastEval.warningMessage}
          </p>
        )}
        {effectiveMargin < 4 && (
          <p className="rounded-md border border-border bg-muted/50 p-2.5 text-xs text-muted-foreground">
            Quiet zone below 4 modules is outside the ISO/IEC 18004 recommendation and may fail on dark or busy surfaces.
          </p>
        )}
      </div>
    </div>
  );
}
