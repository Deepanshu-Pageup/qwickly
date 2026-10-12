'use client';

import React, { useState } from 'react';
import { QrType } from '@/types/qr';
import { QrTypeSelector } from '@/components/studio/qr-type-selector';
import {
  PayloadPlaceholder,
  CustomizationPlaceholder,
  PreviewPlaceholder,
  ExportActionsPlaceholder,
} from '@/components/studio/studio-placeholders';

export default function Home() {
  const [selectedType, setSelectedType] = useState<QrType>('link');

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
      {/* Studio Header */}
      <header className="border-b border-zinc-200/80 bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold text-base shadow-xs dark:bg-white dark:text-zinc-950">
              Q
            </div>
            <div>
              <h1 className="text-base font-semibold leading-none tracking-tight">
                Qwikly Studio
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                QR Code Generation & Design
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Studio Foundation Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Studio Workstation Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Type Selection & Configuration Area */}
          <div className="lg:col-span-7 space-y-6">
            <section aria-label="Type Selection">
              <QrTypeSelector
                selectedType={selectedType}
                onSelectType={setSelectedType}
              />
            </section>

            <section aria-label="Payload Configuration">
              <PayloadPlaceholder selectedType={selectedType} />
            </section>

            <section aria-label="Design Customization">
              <CustomizationPlaceholder />
            </section>
          </div>

          {/* Right Column: Live Inspector, Preview & Export Area */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <section aria-label="Live Preview">
              <PreviewPlaceholder selectedType={selectedType} />
            </section>

            <section aria-label="Export Actions">
              <ExportActionsPlaceholder />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
