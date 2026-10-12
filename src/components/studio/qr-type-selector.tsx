'use client';

import React from 'react';
import { QrType, QR_TYPES } from '@/types/qr';

interface QrTypeSelectorProps {
  selectedType: QrType;
  onSelectType: (type: QrType) => void;
}

export function QrTypeSelector({
  selectedType,
  onSelectType,
}: QrTypeSelectorProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Select QR Code Type
        </h2>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          9 Types Available
        </span>
      </div>

      <div
        role="group"
        aria-label="QR Code Types"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2.5"
      >
        {QR_TYPES.map((type) => {
          const isSelected = selectedType === type.id;

          return (
            <button
              key={type.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectType(type.id)}
              className={`relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-200 ${
                isSelected
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-1 mb-1">
                <span className="text-sm font-medium leading-none">
                  {type.label}
                </span>
                {type.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                      isSelected
                        ? 'bg-zinc-800 text-zinc-300 dark:bg-zinc-200 dark:text-zinc-800'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {type.badge}
                  </span>
                )}
              </div>
              <p
                className={`text-xs line-clamp-2 leading-tight ${
                  isSelected
                    ? 'text-zinc-300 dark:text-zinc-600'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {type.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
