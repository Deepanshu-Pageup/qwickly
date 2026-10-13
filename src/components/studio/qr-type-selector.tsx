'use client';

import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Link2,
  MapPin,
  MessageCircle,
  Share2,
  Smartphone,
  Ticket,
  Type,
  type LucideIcon,
} from 'lucide-react';
import { QrType, QR_TYPES } from '@/types/qr';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QrTypeSelectorProps {
  selectedType: QrType;
  onSelectType: (type: QrType) => void;
}

/** Maps the registry's icon keys (src/types/qr.ts) to lucide components. */
const ICONS: Record<string, LucideIcon> = {
  link: Link2,
  text: Type,
  'file-text': FileText,
  image: ImageIcon,
  'message-circle': MessageCircle,
  'share-2': Share2,
  'map-pin': MapPin,
  tag: Ticket,
  smartphone: Smartphone,
};

export function QrTypeSelector({ selectedType, onSelectType }: QrTypeSelectorProps) {
  return (
    <div className="w-full space-y-3">
      <h2 className="text-base font-semibold leading-none tracking-tight">QR type</h2>

      <div
        role="group"
        aria-label="QR code type"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {QR_TYPES.map((type) => {
          const isSelected = selectedType === type.id;
          const Icon = ICONS[type.icon] ?? Link2;
          const descriptionId = `qr-type-desc-${type.id}`;

          return (
            <button
              key={type.id}
              type="button"
              aria-pressed={isSelected}
              aria-describedby={descriptionId}
              title={type.description}
              onClick={() => onSelectType(type.id)}
              className={cn(
                'flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium outline-none transition-colors duration-150 motion-reduce:transition-none pointer-coarse:min-h-11',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
                isSelected
                  ? 'border-primary bg-accent text-accent-foreground'
                  : 'border-input bg-background text-foreground hover:bg-muted',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{type.label}</span>
              {type.badge && (
                <Badge variant="secondary" size="sm" className="shrink-0">
                  {type.badge}
                </Badge>
              )}
              <span id={descriptionId} className="sr-only">
                {type.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
