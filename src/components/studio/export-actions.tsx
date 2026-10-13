'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fileService } from '@/lib/file-service';
import { QrDesignSettings } from '@/schemas/qr-design';
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

export function ExportActions({
  encodedValue,
  isValid,
  designSettings,
}: ExportActionsProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isExportReady = isValid && Boolean(encodedValue && encodedValue.trim().length > 0);
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
        });
      } else if (format === 'svg') {
        await fileService.exportSVG({
          value: encodedValue,
          designSettings,
          filename: 'qr-code.svg',
        });
      } else if (format === 'pdf') {
        await fileService.exportPDF({
          value: encodedValue,
          designSettings,
          filename: 'qr-code.pdf',
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
    <div className="space-y-3 border-t border-border pt-5">
      <h2 className="text-base font-semibold leading-none tracking-tight">Export</h2>

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

      {!isExportReady && (
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
