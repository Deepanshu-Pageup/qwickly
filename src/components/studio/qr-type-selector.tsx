'use client';

import React from 'react';
import { QrType, QR_TYPES } from '@/types/qr';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Select QR Code Type
        </h2>
        <Badge variant="outline" size="sm">
          9 Types Available
        </Badge>
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
              className={cn(
                'relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border bg-card text-card-foreground hover:border-border/80 hover:bg-accent/40'
              )}
            >
              <div className="flex w-full items-center justify-between gap-1 mb-1">
                <span className="text-sm font-medium leading-none">
                  {type.label}
                </span>
                {type.badge && (
                  <Badge
                    size="sm"
                    variant={isSelected ? 'secondary' : 'outline'}
                    className="text-[10px] uppercase font-semibold"
                  >
                    {type.badge}
                  </Badge>
                )}
              </div>
              <p
                className={cn(
                  'text-xs line-clamp-2 leading-tight',
                  isSelected
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                )}
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
