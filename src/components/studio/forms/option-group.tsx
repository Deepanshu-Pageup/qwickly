import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OptionGroupProps<T extends string> {
  /** Accessible name for the group. */
  label: string;
  value: T;
  options: ReadonlyArray<{ id: T; label: string }>;
  onChange: (next: T) => void;
  className?: string;
}

/** Compact single-select button group (toggle semantics via `aria-pressed`). */
export function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: OptionGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((option) => {
        const isSelected = option.id === value;
        return (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={isSelected ? 'default' : 'outline'}
            aria-pressed={isSelected}
            onClick={() => onChange(option.id)}
            className="pointer-coarse:min-h-11"
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
