import React from 'react';
import { QrType, getQrTypeMetadata } from '@/types/qr';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PayloadPlaceholderProps {
  selectedType: QrType;
}

export function PayloadPlaceholder({ selectedType }: PayloadPlaceholderProps) {
  const metadata = getQrTypeMetadata(selectedType);

  return (
    <Card className="rounded-2xl bg-card/90 backdrop-blur-xs border-border/80">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
            <CardTitle>{metadata.label} Payload Configuration</CardTitle>
          </div>
          <Badge variant="secondary" size="sm">
            Sub-phase 2.2
          </Badge>
        </div>
        <CardDescription>{metadata.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 p-8 text-center">
          <div className="rounded-full bg-muted p-3 text-muted-foreground">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h4 className="mt-3 text-sm font-medium text-foreground">
            Payload Form Placeholder
          </h4>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Form inputs, live validation schemas, and real-time payload encoding for{' '}
            <strong className="text-foreground">{metadata.label}</strong> will be
            implemented in Sub-phase 2.2.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomizationPlaceholder() {
  return (
    <Card className="rounded-2xl opacity-90 bg-card/90 backdrop-blur-xs border-border/80">
      <CardHeader className="border-b border-border/50 pb-3">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-base">Design & Customization</CardTitle>
          <Badge variant="secondary" size="sm">
            Sub-phase 2.2
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {['Colors & Contrast', 'Frame & Eyes', 'Body Pattern', 'Logo Embedding'].map(
            (feature) => (
              <div
                key={feature}
                className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-muted/20 p-3 text-center"
              >
                <span className="text-xs font-medium text-foreground/80">
                  {feature}
                </span>
                <span className="mt-1 text-[10px] text-muted-foreground">
                  Upcoming
                </span>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface PreviewPlaceholderProps {
  selectedType: QrType;
}

export function PreviewPlaceholder({ selectedType }: PreviewPlaceholderProps) {
  const metadata = getQrTypeMetadata(selectedType);

  return (
    <Card className="flex flex-col items-center rounded-2xl p-6 shadow-xs bg-card/90 backdrop-blur-xs border-border/80">
      <div className="w-full flex items-center justify-between border-b border-border/50 pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Live Preview
        </span>
        <Badge variant="warning" size="sm">
          Static Shell
        </Badge>
      </div>

      {/* QR Code Canvas Frame Placeholder: Always opaque solid white surface for scannability */}
      <div className="mt-6 flex flex-col items-center">
        <div className="relative flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-zinc-200 bg-white p-6 shadow-sm">
          {/* Decorative Corner Finder Patterns (High contrast dark elements on white background) */}
          <div className="absolute top-6 left-6 h-12 w-12 rounded-lg border-4 border-zinc-950 p-1 bg-white">
            <div className="h-full w-full rounded-xs bg-zinc-950" />
          </div>
          <div className="absolute top-6 right-6 h-12 w-12 rounded-lg border-4 border-zinc-950 p-1 bg-white">
            <div className="h-full w-full rounded-xs bg-zinc-950" />
          </div>
          <div className="absolute bottom-6 left-6 h-12 w-12 rounded-lg border-4 border-zinc-950 p-1 bg-white">
            <div className="h-full w-full rounded-xs bg-zinc-950" />
          </div>

          {/* Center Informative Badge */}
          <div className="z-10 flex flex-col items-center rounded-xl bg-zinc-900/90 px-3.5 py-2 text-center text-white backdrop-blur-xs shadow-xs">
            <span className="text-xs font-semibold">{metadata.label} QR</span>
            <span className="text-[10px] text-zinc-300">Canvas Placeholder</span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Live QR matrix generation will be integrated in Sub-phase 2.2.
        </p>
      </div>
    </Card>
  );
}

export function ExportActionsPlaceholder() {
  return (
    <Card className="flex flex-col gap-3 rounded-xl p-5 shadow-xs bg-card border-border/80">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Export & Download
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Button
          variant="outline"
          disabled
          className="h-9 cursor-not-allowed text-xs font-medium"
        >
          Download PNG
        </Button>
        <Button
          variant="outline"
          disabled
          className="h-9 cursor-not-allowed text-xs font-medium"
        >
          Download SVG
        </Button>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Direct vector and raster image download options will be available upon export engine connection.
      </p>
    </Card>
  );
}
