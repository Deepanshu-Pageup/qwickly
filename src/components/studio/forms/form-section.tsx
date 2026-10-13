import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  /** Short label for the active QR type, shown next to the heading. */
  tag?: string;
  className?: string;
  children: React.ReactNode;
}

/** Flat (card-less) section used by every payload form so headings and spacing stay consistent. */
export function FormSection({ title, tag, className, children }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold leading-none tracking-tight">{title}</h2>
        {tag && (
          <Badge variant="secondary" size="sm">
            {tag}
          </Badge>
        )}
      </div>
      {children}
    </div>
  );
}

interface CharCounterProps {
  length: number;
  max: number;
}

/** Subtle live character counter - use on long-text fields only. */
export function CharCounter({ length, max }: CharCounterProps) {
  return (
    <span
      className={cn(
        'font-mono text-xs tabular-nums',
        length >= max ? 'text-destructive-foreground' : 'text-muted-foreground',
      )}
      aria-live="off"
    >
      {length}/{max}
    </span>
  );
}
