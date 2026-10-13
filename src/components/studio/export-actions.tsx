'use client';

import React, { useState, useMemo } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fileService } from '@/lib/file-service';
import { QrDesignSettings, evaluateContrast } from '@/schemas/qr-design';
import { ExportFormat } from '@/lib/file-service/file-service.types';
import { cn } from '@/lib/utils';

interface ExportActionsProps {
  encodedValue: string | null;
  isValid: boolean;
  designSettings: QrDesignSettings;
}

const FORMATS: ReadonlyArray<{ id: ExportFormat; label: string }> = [
  { id: 'png', label: 'PNG' },
  { id: 'svg', label: 'SVG' },
  { id: 'pdf', label: 'PDF' },
];

const RESOLUTIONS: ReadonlyArray<{ id: number; label: string; desc: string }> = [
  { id: 512, label: '512px', desc: 'Standard / Web' },
  { id: 1024, label: '1024px', desc: 'High-Res / Default' },
  { id: 2048, label: '2048px', desc: 'Print / 300 DPI' },
];

export function ExportActions({
  encodedValue,
  isValid,
  designSettings,
}: ExportActionsProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [resolution, setResolution] = useState<number>(1024);
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasValidContent = isValid && Boolean(encodedValue && encodedValue.trim().length > 0);
  const contrast = useMemo(() => {
    return evaluateContrast(designSettings.fgColor, designSettings.bgColor);
  }, [designSettings.fgColor, designSettings.bgColor]);

  const isContrastValid = contrast.isDownloadAllowed;
  const isExportReady = hasValidContent && isContrastValid;
  const formatLabel = format.toUpperCase();

  const handleExport = async () => {
    if (!isExportReady || !encodedValue) return;

    setLoadingFormat(format);
    setErrorMessage(null);

    try {
      if (format === 'png') {
        await fileService.exportPNG({
          value: encodedValue,
          designSettings,
          filename: 'qr-code.png',
          size: resolution,
        });
      } else if (format === 'svg') {
        await fileService.exportSVG({
          value: encodedValue,
          designSettings,
          filename: 'qr-code.svg',
          size: resolution,
        });
      } else if (format === 'pdf') {
        await fileService.exportPDF({
          value: encodedValue,
          designSettings,
          filename: 'qr-code.pdf',
          size: resolution,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed. Please check inputs and try again.';
      setErrorMessage(msg);
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <div className="space-y-4 border-t border-border pt-5">
      <h2 className="text-base font-semibold leading-none tracking-tight">Export</h2>

      {/* Format selector */}
      <div className="space-y-1.5">
        <span id="export-format-label" className="text-sm font-medium">
          Format
        </span>
        <div
          role="group"
          aria-labelledby="export-format-label"
          className="grid grid-cols-3 gap-0.5 rounded-lg bg-muted p-0.5"
        >
          {FORMATS.map((f) => {
            const isSelected = f.id === format;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={isSelected}
                disabled={loadingFormat !== null}
                onClick={() => setFormat(f.id)}
                className={cn(
                  'h-8 rounded-md text-sm font-medium outline-none transition-colors motion-reduce:transition-none pointer-coarse:h-11',
                  'focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60',
                  isSelected
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resolution & Print Presets (Option A) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span id="export-resolution-label" className="text-sm font-medium">
            Resolution
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {resolution}×{resolution} px
          </span>
        </div>
        <div
          role="group"
          aria-labelledby="export-resolution-label"
          className="grid grid-cols-3 gap-0.5 rounded-lg bg-muted p-0.5"
        >
          {RESOLUTIONS.map((r) => {
            const isSelected = r.id === resolution;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={isSelected}
                disabled={loadingFormat !== null}
                onClick={() => setResolution(r.id)}
                title={r.desc}
                className={cn(
                  'h-8 rounded-md text-xs font-medium outline-none transition-colors motion-reduce:transition-none pointer-coarse:h-11',
                  'focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60',
                  isSelected
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contrast validation alert and guidance */}
      {hasValidContent && !isContrastValid && (
        <div
          className="flex items-start gap-2.5 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive-foreground"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold">
              {contrast.isInverted
                ? 'Download disabled: Inverted colors detected'
                : 'Download disabled: Insufficient color contrast'}
            </p>
            <p className="leading-relaxed">
              {contrast.isInverted
                ? 'Light QR modules on a dark background fail on most optical camera scanners. To enable downloading, choose a dark foreground and a light background.'
                : `Contrast ratio is ${contrast.ratio.toFixed(1)}:1 (minimum 4.5:1 required). Optical scanners require sharp module separation to reliably decode. Select higher-contrast colors in Appearance to re-enable downloads.`}
            </p>
          </div>
        </div>
      )}

      {/* Download action button */}
      <Button
        type="button"
        size="lg"
        className="w-full pointer-coarse:min-h-11"
        disabled={!isExportReady || loadingFormat !== null}
        loading={loadingFormat !== null}
        onClick={handleExport}
        aria-describedby={!isExportReady ? 'export-disabled-reason' : undefined}
      >
        <Download aria-hidden="true" />
        Download {formatLabel}
      </Button>

      {/* State reason helper text */}
      {!hasValidContent && (
        <p id="export-disabled-reason" className="text-xs text-muted-foreground">
          Enter valid content to enable downloads.
        </p>
      )}

      {errorMessage && (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive-foreground"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
