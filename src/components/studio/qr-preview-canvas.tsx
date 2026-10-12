'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrType, getQrTypeMetadata } from '@/types/qr';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QrPreviewCanvasProps {
  selectedType: QrType;
  encodedValue: string | null;
  isValid: boolean;
  /**
   * QR Error Correction Level:
   * - 'L': ~7% recovery (lowest density, optimal for low-res screens / high data volume)
   * - 'M': ~15% recovery (default industry standard, balances module density and error tolerance)
   * - 'Q': ~25% recovery (elevated damage tolerance)
   * - 'H': ~30% recovery (highest redundancy, required when center logos/emblems are overlaid)
   */
  level?: 'L' | 'M' | 'Q' | 'H';
  /**
   * Quiet zone module size:
   * ISO/IEC 18004 QR specification recommends a minimum quiet zone of 4 modules to
   * prevent edge-detection failures across diverse mobile and physical optical sensors.
   */
  marginSize?: number;
}

export function QrPreviewCanvas({
  selectedType,
  encodedValue,
  isValid,
  level = 'M',
  marginSize = 4,
}: QrPreviewCanvasProps) {
  const metadata = getQrTypeMetadata(selectedType);
  const isSupportedType = selectedType === 'link' || selectedType === 'text';

  return (
    <Card className="flex flex-col items-center rounded-2xl p-6 shadow-xs bg-card/90 backdrop-blur-xs border-border/80">
      <div className="w-full flex items-center justify-between border-b border-border/50 pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Live Preview
        </span>
        <Badge
          variant={isValid ? 'success' : isSupportedType ? 'secondary' : 'warning'}
          size="sm"
        >
          {isValid ? 'Ready to Scan' : isSupportedType ? 'Awaiting Input' : 'Static Shell'}
        </Badge>
      </div>

      {/* QR Code Canvas Frame: Guaranteed opaque solid pure white surface for maximum scannability */}
      <div className="mt-6 flex flex-col items-center">
        <div
          className="relative flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-zinc-200 bg-white p-4 shadow-sm"
          role="region"
          aria-label="QR Code Preview"
        >
          {isValid && encodedValue ? (
            <div className="flex items-center justify-center p-2 bg-white rounded-lg">
              <QRCodeSVG
                value={encodedValue}
                size={220}
                level={level}
                marginSize={marginSize}
                bgColor="#ffffff"
                fgColor="#000000"
                aria-label={`Generated QR Code for ${metadata.label}`}
              />
            </div>
          ) : (
            <>
              {/* Decorative Corner Finder Patterns for Placeholder / Empty State */}
              <div className="absolute top-6 left-6 h-12 w-12 rounded-lg border-4 border-zinc-950 p-1 bg-white">
                <div className="h-full w-full rounded-xs bg-zinc-950" />
              </div>
              <div className="absolute top-6 right-6 h-12 w-12 rounded-lg border-4 border-zinc-950 p-1 bg-white">
                <div className="h-full w-full rounded-xs bg-zinc-950" />
              </div>
              <div className="absolute bottom-6 left-6 h-12 w-12 rounded-lg border-4 border-zinc-950 p-1 bg-white">
                <div className="h-full w-full rounded-xs bg-zinc-950" />
              </div>

              {/* Informative Center Badge */}
              <div className="z-10 flex flex-col items-center rounded-xl bg-zinc-900/90 px-3.5 py-2 text-center text-white backdrop-blur-xs shadow-xs">
                <span className="text-xs font-semibold">{metadata.label} QR</span>
                <span className="text-[10px] text-zinc-300">
                  {isSupportedType ? 'Enter content to preview' : 'Canvas Placeholder'}
                </span>
              </div>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground max-w-xs">
          {isValid
            ? `Live vector QR code generated for ${metadata.label}.`
            : isSupportedType
            ? `Provide a valid ${metadata.label.toLowerCase()} payload to generate a live QR code.`
            : `Live QR generation for ${metadata.label} will be integrated in Sub-phase 2.3.`}
        </p>
      </div>
    </Card>
  );
}
