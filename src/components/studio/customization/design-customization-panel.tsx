'use client';

import React, { useState, useRef } from 'react';
import { Check, ChevronDown, X, Upload, AlertCircle } from 'lucide-react';
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
import {
  validateLogoFile,
  readLogoAsDataUrl,
  verifyImageCanDecode,
} from '@/lib/logo-upload';

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

/** Color field: circular named swatches, interactive color picker, and an editable hex input that tolerates partial typing. */
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

  // Format 6-digit hex for native input[type="color"]
  const normalizedPickerHex = React.useMemo(() => {
    const clean = value.trim().replace(/^#/, '');
    if (clean.length === 3) {
      return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`.toLowerCase();
    }
    if (clean.length === 6) {
      return `#${clean}`.toLowerCase();
    }
    return '#000000';
  }, [value]);

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
      <div className="flex items-center gap-2">
        <label
          htmlFor={`${idPrefix}-picker`}
          className="relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-background p-1 shadow-xs transition-colors hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
          title={`Choose custom ${label.toLowerCase()} color`}
        >
          <span
            className="size-full rounded-sm border border-black/10"
            style={{ backgroundColor: normalizedPickerHex }}
            aria-hidden="true"
          />
          <input
            id={`${idPrefix}-picker`}
            type="color"
            value={normalizedPickerHex}
            onChange={(e) => {
              setDraft(null);
              onCommit(e.target.value.toLowerCase());
            }}
            className="sr-only"
            aria-label={`${label} visual color picker`}
          />
        </label>
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
      </div>
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Identify whether active logo is a custom uploaded image vs a built-in preset
  const isCustomLogo =
    isLogoActive &&
    !PRESET_LOGOS.some((preset) => preset.src === settings.logo?.src);

  const handleLevelSelect = (newLevel: ErrorCorrectionLevel) => {
    if (isLogoActive) return; // Locked while logo is active
    onSavedLevelChange(newLevel);
    onChange({ ...settings, level: newLevel });
  };

  const handleLogoSelect = (src: string) => {
    setUploadError(null);
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
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange({
      ...settings,
      level: savedLevelBeforeLogo, // Restore previously selected error correction
      logo: null,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setUploadError(validation.error ?? 'Invalid image file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const dataUrl = await readLogoAsDataUrl(file);
      await verifyImageCanDecode(dataUrl);
      handleLogoSelect(dataUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process logo image.';
      setUploadError(msg);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsUploading(false);
    }
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

        {/* Upload Logo Action & Presets */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              className="sr-only"
              id="qr-logo-upload-input"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Button
              type="button"
              variant={isCustomLogo ? 'default' : 'outline'}
              size="sm"
              loading={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="pointer-coarse:min-h-11"
              title="Upload PNG, JPEG, or WebP logo (max 1.5 MB)"
            >
              <Upload className="size-3.5" aria-hidden="true" />
              {isCustomLogo ? 'Replace logo' : 'Upload logo'}
            </Button>

            {/* Custom Uploaded Logo Thumbnail Badge */}
            {isCustomLogo && settings.logo?.src && (
              <div
                className="relative flex size-9 items-center justify-center rounded-md border-2 border-primary bg-background p-1 shadow-xs"
                title="Active custom uploaded logo"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.logo.src}
                  alt="Custom uploaded logo preview"
                  className="size-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Validation Error Banner */}
          {uploadError && (
            <div
              className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive-foreground"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" aria-hidden="true" />
              <span>{uploadError}</span>
            </div>
          )}

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
