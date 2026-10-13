'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrType, getQrTypeMetadata } from '@/types/qr';
import { Card } from '@/components/ui/card';
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
    const pixelSize = Math.round(220 * ratio);
    return {
      src: designSettings.logo.src,
      height: pixelSize,
      width: pixelSize,
      excavate: designSettings.logo.excavate ?? true,
    };
  }, [designSettings]);

  const isLogoActive = Boolean(designSettings?.logo?.src);

  return (
    <Card className="flex flex-col items-center rounded-xl p-6 shadow-xs bg-card border-border/80">
      <div className="w-full flex items-center justify-between border-b border-border/60 pb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Live Preview
        </span>
        <div className="flex items-center gap-1.5">
          {isLogoActive && (
            <Badge variant="secondary" size="sm" className="text-[10px]">
              Logo Active (EC: H)
            </Badge>
          )}
          <Badge
            variant={isValid ? 'success' : 'secondary'}
            size="sm"
          >
            {isValid ? 'Payload Valid' : 'Awaiting Input'}
          </Badge>
        </div>
      </div>

      {/* QR Code Canvas Frame: Guaranteed opaque solid surface for maximum scannability */}
      <div className="mt-6 flex flex-col items-center w-full">
        <div
          className="relative flex h-64 w-64 items-center justify-center rounded-xl border border-border/80 bg-white p-4 shadow-xs"
          role="region"
          aria-label="QR Code Preview"
          style={{ backgroundColor: bgColor }}
        >
          {isValid && encodedValue ? (
            <div className="flex items-center justify-center p-2 rounded-lg" style={{ backgroundColor: bgColor }}>
              <QRCodeSVG
                value={encodedValue}
                size={220}
                level={effectiveLevel}
                marginSize={effectiveMargin}
                bgColor={bgColor}
                fgColor={fgColor}
                imageSettings={imageSettings}
                aria-label={`Generated QR Code for ${metadata.label}`}
              />
            </div>
          ) : (
            <div className="relative flex h-full w-full items-center justify-center">
              {/* Decorative Corner Finder Patterns for Placeholder / Empty State */}
              <div className="absolute top-2 left-2 h-12 w-12 rounded-lg border-4 border-zinc-950 p-1 bg-white">
                <div className="h-full w-full rounded-xs bg-zinc-950" />
              </div>
              <div className="absolute top-2 right-2 h-12 w-12 rounded-lg border-4 border-zinc-950 p-1 bg-white">
                <div className="h-full w-full rounded-xs bg-zinc-950" />
              </div>
              <div className="absolute bottom-2 left-2 h-12 w-12 rounded-lg border-4 border-zinc-950 p-1 bg-white">
                <div className="h-full w-full rounded-xs bg-zinc-950" />
              </div>

              {/* Informative Center Badge */}
              <div className="z-10 flex flex-col items-center rounded-lg bg-zinc-900/95 px-3 py-1.5 text-center text-white shadow-xs">
                <span className="text-xs font-medium">{metadata.label} QR</span>
                <span className="text-[10px] text-zinc-400">
                  Enter content to preview
                </span>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground max-w-xs">
          {isValid
            ? `Live vector QR code generated for ${metadata.label}.`
            : `Provide valid ${metadata.label.toLowerCase()} payload details to generate a live QR code.`}
        </p>

        {/* Advisory Warnings (Non-blocking Heuristics) */}
        <div className="w-full mt-3 space-y-2">
          {contrastEval.warningMessage && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-700 dark:text-amber-300">
              <span className="font-semibold block mb-0.5">Scannability Advisory:</span>
              {contrastEval.warningMessage}
            </div>
          )}

          {effectiveMargin < 4 && (
            <div className="rounded-lg border border-border/80 bg-muted/40 p-2 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">Quiet Zone Advisory:</span> Margins below 4 modules violate ISO/IEC 18004 standards and may fail on dark or textured surfaces.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
