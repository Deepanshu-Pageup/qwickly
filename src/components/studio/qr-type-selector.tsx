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
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          QR Code Type
        </h2>
      </div>

      <div
        role="group"
        aria-label="QR Code Types"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2"
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
                'group relative flex flex-col items-start p-3 rounded-lg border text-left transition-all duration-150 outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',
                isSelected
                  ? 'border-primary/80 bg-accent/70 text-foreground ring-1 ring-primary/40 shadow-xs'
                  : 'border-border/70 bg-card text-card-foreground hover:border-border hover:bg-accent/40'
              )}
            >
              <div className="flex w-full items-center justify-between gap-1 mb-1">
                <span className="flex items-center gap-1.5 text-sm font-medium leading-none">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-colors',
                      isSelected ? 'bg-primary' : 'bg-muted-foreground/40 group-hover:bg-muted-foreground/70'
                    )}
                    aria-hidden="true"
                  />
                  {type.label}
                </span>
                {type.badge && (
                  <Badge
                    size="sm"
                    variant={isSelected ? 'default' : 'outline'}
                    className="text-[10px] uppercase font-semibold h-4 px-1"
                  >
                    {type.badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1 leading-tight mt-0.5">
                {type.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
