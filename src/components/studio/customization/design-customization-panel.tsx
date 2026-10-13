'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import {
  QrDesignSettings,
  ErrorCorrectionLevel,
  hexColorSchema,
} from '@/schemas/qr-design';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { PRESET_LOGOS, glyphAttrs } from './logo-presets';

interface DesignCustomizationPanelProps {
  settings: QrDesignSettings;
  onChange: (nextSettings: QrDesignSettings) => void;
  savedLevelBeforeLogo: ErrorCorrectionLevel;
  onSavedLevelChange: (level: ErrorCorrectionLevel) => void;
}

interface Swatch {
  label: string;
  hex: string;
}

const FG_PRESETS: Swatch[] = [
  { label: 'Black', hex: '#000000' },
  { label: 'Slate', hex: '#0f172a' },
  { label: 'Indigo', hex: '#3730a3' },
  { label: 'Emerald', hex: '#065f46' },
  { label: 'Crimson', hex: '#881337' },
];

const BG_PRESETS: Swatch[] = [
  { label: 'White', hex: '#ffffff' },
  { label: 'Off-white', hex: '#f8fafc' },
  { label: 'Cream', hex: '#fefce8' },
];

const LEVELS: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];
const MARGINS = [0, 2, 4, 6] as const;

/** Color field: circular named swatches plus an editable hex input that tolerates partial typing. */
function ColorField({
  idPrefix,
  label,
  value,
  presets,
  onCommit,
}: {
  idPrefix: string;
  label: string;
  value: string;
  presets: Swatch[];
  onCommit: (hex: string) => void;
}) {
  // Draft text lets the user type a partial hex (e.g. "#12") without it snapping back.
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? value;
  const isInvalid = draft !== null && !hexColorSchema.safeParse(draft).success;

  return (
    <Field>
      <FieldLabel htmlFor={`${idPrefix}-hex`}>{label}</FieldLabel>
      <div role="group" aria-label={`${label} presets`} className="flex flex-wrap items-center gap-2 pt-1">
        {presets.map((p) => {
          const isSelected = value.toLowerCase() === p.hex.toLowerCase();
          const useLightCheck = p.hex !== '#ffffff' && p.hex !== '#f8fafc' && p.hex !== '#fefce8';
          return (
            <button
              key={p.hex}
              type="button"
              aria-label={`${p.label} ${p.hex}`}
              aria-pressed={isSelected}
              title={p.label}
              onClick={() => {
                setDraft(null);
                onCommit(p.hex);
              }}
              className={cn(
                'relative flex size-7 items-center justify-center rounded-full border border-input outline-none transition-shadow motion-reduce:transition-none pointer-coarse:size-9',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
              )}
              style={{ backgroundColor: p.hex }}
            >
              {isSelected && (
                <Check
                  className={cn('size-3.5', useLightCheck ? 'text-white' : 'text-black')}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
      <Input
        id={`${idPrefix}-hex`}
        type="text"
        maxLength={7}
        spellCheck={false}
        autoComplete="off"
        value={text}
        onChange={(e) => {
          const next = e.target.value;
          setDraft(next);
          const parsed = hexColorSchema.safeParse(next);
          if (parsed.success) onCommit(parsed.data);
        }}
        onBlur={() => setDraft(null)}
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? `${idPrefix}-hex-error` : undefined}
        className="font-mono uppercase"
        placeholder="#000000"
      />
      {isInvalid && (
        <p id={`${idPrefix}-hex-error`} className="text-xs text-destructive-foreground" role="alert">
          Enter a hex color such as #000000 or #FFF.
        </p>
      )}
    </Field>
  );
}

export function DesignCustomizationPanel({
  settings,
  onChange,
  savedLevelBeforeLogo,
  onSavedLevelChange,
}: DesignCustomizationPanelProps) {
  const isLogoActive = Boolean(settings.logo?.src);

  const handleLevelSelect = (newLevel: ErrorCorrectionLevel) => {
    if (isLogoActive) return; // Locked while logo is active
    onSavedLevelChange(newLevel);
    onChange({ ...settings, level: newLevel });
  };

  const handleLogoSelect = (src: string) => {
    if (!isLogoActive) {
      // Save current level before elevating to H
      onSavedLevelChange(settings.level);
    }
    onChange({
      ...settings,
      level: 'H', // Automatically elevated
      logo: {
        src,
        sizeRatio: 0.18,
        excavate: true,
      },
    });
  };

  const handleClearLogo = () => {
    onChange({
      ...settings,
      level: savedLevelBeforeLogo, // Restore previously selected error correction
      logo: null,
    });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold leading-none tracking-tight">Appearance</h2>

      {/* Colors */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ColorField
          idPrefix="fg"
          label="Foreground"
          value={settings.fgColor}
          presets={FG_PRESETS}
          onCommit={(hex) => onChange({ ...settings, fgColor: hex })}
        />
        <ColorField
          idPrefix="bg"
          label="Background"
          value={settings.bgColor}
          presets={BG_PRESETS}
          onCommit={(hex) => onChange({ ...settings, bgColor: hex })}
        />
      </div>

      {/* Logo */}
      <div className="space-y-3 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold leading-none">Logo</h3>
          {isLogoActive && (
            <Button type="button" variant="ghost" size="xs" onClick={handleClearLogo}>
              <X aria-hidden="true" />
              Remove logo
            </Button>
          )}
        </div>

        <div role="group" aria-label="Logo presets" className="flex flex-wrap items-center gap-2">
          {PRESET_LOGOS.map(({ id, label, Icon, glyph, src }) => {
            const isSelected = settings.logo?.src === src;
            return (
              <Button
                key={id}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="icon"
                aria-label={label}
                aria-pressed={isSelected}
                title={label}
                onClick={() => handleLogoSelect(src)}
                className="pointer-coarse:size-11"
              >
                {Icon ? (
                  <Icon aria-hidden="true" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    {...glyphAttrs(id)}
                    dangerouslySetInnerHTML={{ __html: glyph ?? '' }}
                  />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Advanced settings */}
      <Collapsible className="border-t border-border pt-4">
        <CollapsibleTrigger
          className="group flex w-full items-center justify-between rounded-md text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:min-h-11"
        >
          Advanced settings
          <ChevronDown
            className="size-4 transition-transform motion-reduce:transition-none group-data-panel-open:rotate-180"
            aria-hidden="true"
          />
        </CollapsibleTrigger>
        <CollapsiblePanel>
          <div className="grid grid-cols-1 gap-5 pt-4 sm:grid-cols-2">
            <Field>
              <div className="flex w-full items-center justify-between gap-2">
                <FieldLabel>Error Correction</FieldLabel>
                {isLogoActive && (
                  <span className="text-xs font-medium text-warning-foreground">Locked to H (Logo)</span>
                )}
              </div>
              <div role="group" aria-label="Error correction level" className="grid w-full grid-cols-4 gap-1.5 pt-1">
                {LEVELS.map((lvl) => {
                  const isSelected = settings.level === lvl;
                  return (
                    <Button
                      key={lvl}
                      type="button"
                      size="sm"
                      variant={isSelected ? 'default' : 'outline'}
                      aria-pressed={isSelected}
                      disabled={isLogoActive && lvl !== 'H'}
                      onClick={() => handleLevelSelect(lvl)}
                      className="pointer-coarse:min-h-11"
                    >
                      {lvl}
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">L (~7%), M (~15%), Q (~25%), H (~30% redundancy).</p>
            </Field>

            <Field>
              <div className="flex w-full items-center justify-between gap-2">
                <FieldLabel>Quiet Zone Margin</FieldLabel>
                <span className="font-mono text-xs text-muted-foreground">
                  {settings.marginSize} modules
                </span>
              </div>
              <div role="group" aria-label="Quiet zone margin in modules" className="grid w-full grid-cols-4 gap-1.5 pt-1">
                {MARGINS.map((m) => (
                  <Button
                    key={m}
                    type="button"
                    size="sm"
                    variant={settings.marginSize === m ? 'default' : 'outline'}
                    aria-pressed={settings.marginSize === m}
                    onClick={() => onChange({ ...settings, marginSize: m })}
                    className="pointer-coarse:min-h-11"
                  >
                    {m}m
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                ISO/IEC 18004 specifies 4 modules to ensure edge detection against surrounding layouts.
              </p>
            </Field>
          </div>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  );
}
