import React from 'react';
import { QrType, getQrTypeMetadata } from '@/types/qr';

interface PayloadPlaceholderProps {
  selectedType: QrType;
}

export function PayloadPlaceholder({ selectedType }: PayloadPlaceholderProps) {
  const metadata = getQrTypeMetadata(selectedType);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs">
      <div className="flex flex-col gap-1 border-b border-zinc-100 pb-4 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {metadata.label} Payload Configuration
          </h3>
          <span className="ml-auto rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Sub-phase 2.2
          </span>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {metadata.description}
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="rounded-full bg-zinc-100 p-3 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
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
        <h4 className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Payload Form Placeholder
        </h4>
        <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
          Form inputs, live validation schemas, and real-time payload encoding for{' '}
          <strong className="text-zinc-700 dark:text-zinc-300">
            {metadata.label}
          </strong>{' '}
          will be implemented in Sub-phase 2.2.
        </p>
      </div>
    </div>
  );
}

export function CustomizationPlaceholder() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs opacity-80">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800/80">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Design & Customization
        </h3>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          Sub-phase 2.2
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {['Colors & Contrast', 'Frame & Eyes', 'Body Pattern', 'Logo Embedding'].map(
          (feature) => (
            <div
              key={feature}
              className="flex flex-col items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 text-center dark:border-zinc-800/60 dark:bg-zinc-900/30"
            >
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {feature}
              </span>
              <span className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                Upcoming
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

interface PreviewPlaceholderProps {
  selectedType: QrType;
}

export function PreviewPlaceholder({ selectedType }: PreviewPlaceholderProps) {
  const metadata = getQrTypeMetadata(selectedType);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs">
      <div className="w-full flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800/80">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Live Preview
        </span>
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
          Static Shell
        </span>
      </div>

      {/* QR Code Canvas Frame Placeholder */}
      <div className="mt-6 flex flex-col items-center">
        <div className="relative flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-zinc-200 bg-white p-4 shadow-inner dark:border-zinc-800 dark:bg-zinc-900">
          {/* Decorative Corner Finder Patterns */}
          <div className="absolute top-4 left-4 h-12 w-12 rounded-lg border-4 border-zinc-800 p-1 dark:border-zinc-200">
            <div className="h-full w-full rounded bg-zinc-800 dark:bg-zinc-200" />
          </div>
          <div className="absolute top-4 right-4 h-12 w-12 rounded-lg border-4 border-zinc-800 p-1 dark:border-zinc-200">
            <div className="h-full w-full rounded bg-zinc-800 dark:bg-zinc-200" />
          </div>
          <div className="absolute bottom-4 left-4 h-12 w-12 rounded-lg border-4 border-zinc-800 p-1 dark:border-zinc-200">
            <div className="h-full w-full rounded bg-zinc-800 dark:bg-zinc-200" />
          </div>

          {/* Center Informative Badge */}
          <div className="z-10 flex flex-col items-center rounded-xl bg-zinc-900/90 px-3 py-2 text-center text-white backdrop-blur-xs dark:bg-zinc-100/90 dark:text-zinc-900">
            <span className="text-xs font-semibold">{metadata.label} QR</span>
            <span className="text-[10px] opacity-80">Canvas Placeholder</span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Live QR matrix generation will be integrated in Sub-phase 2.2.
        </p>
      </div>
    </div>
  );
}

export function ExportActionsPlaceholder() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Export & Download
        </h4>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Sub-phase 2.4
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex h-11 cursor-not-allowed items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100/80 px-4 text-xs font-medium text-zinc-400 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
        >
          Download PNG
        </button>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex h-11 cursor-not-allowed items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100/80 px-4 text-xs font-medium text-zinc-400 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
        >
          Download SVG
        </button>
      </div>

      <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
        Export features will be activated once the vector engine is added.
      </p>
    </div>
  );
}
