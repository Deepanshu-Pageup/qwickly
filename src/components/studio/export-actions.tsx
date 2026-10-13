'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fileService } from '@/lib/file-service';
import { QrDesignSettings } from '@/schemas/qr-design';
import { ExportFormat } from '@/lib/file-service/file-service.types';
import { Download, FileImage, FileCode, FileText } from 'lucide-react';

interface ExportActionsProps {
  encodedValue: string | null;
  isValid: boolean;
  designSettings: QrDesignSettings;
}

export function ExportActions({
  encodedValue,
  isValid,
  designSettings,
}: ExportActionsProps) {
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isExportReady = isValid && Boolean(encodedValue && encodedValue.trim().length > 0);

  const handleExport = async (format: ExportFormat) => {
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
    <Card className="flex flex-col gap-3 rounded-xl p-5 shadow-xs bg-card border-border/80">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Download className="size-3.5" />
          Export & Download
        </h4>
        <span className="text-[11px] text-muted-foreground">
          {isExportReady ? 'Ready for download' : 'Enter payload first'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!isExportReady || loadingFormat !== null}
          loading={loadingFormat === 'png'}
          onClick={() => handleExport('png')}
          className="h-9 text-xs font-medium flex items-center justify-center gap-1.5"
          aria-label="Download PNG"
        >
          <FileImage className="size-3.5" />
          PNG
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={!isExportReady || loadingFormat !== null}
          loading={loadingFormat === 'svg'}
          onClick={() => handleExport('svg')}
          className="h-9 text-xs font-medium flex items-center justify-center gap-1.5"
          aria-label="Download SVG"
        >
          <FileCode className="size-3.5" />
          SVG
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={!isExportReady || loadingFormat !== null}
          loading={loadingFormat === 'pdf'}
          onClick={() => handleExport('pdf')}
          className="h-9 text-xs font-medium flex items-center justify-center gap-1.5"
          aria-label="Download PDF"
        >
          <FileText className="size-3.5" />
          PDF
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
          {errorMessage}
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground">
        Exports current design settings (colors, quiet zone, error correction, and logo) at high resolution.
      </p>
    </Card>
  );
}
