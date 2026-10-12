'use client';

import React from 'react';
import {
  QrDesignSettings,
  ErrorCorrectionLevel,
  evaluateContrast,
  hexColorSchema,
} from '@/schemas/qr-design';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DesignCustomizationPanelProps {
  settings: QrDesignSettings;
  onChange: (nextSettings: QrDesignSettings) => void;
  savedLevelBeforeLogo: ErrorCorrectionLevel;
  onSavedLevelChange: (level: ErrorCorrectionLevel) => void;
}

const FG_PRESETS = [
  { label: 'Black', hex: '#000000' },
  { label: 'Slate', hex: '#0f172a' },
  { label: 'Indigo', hex: '#3730a3' },
  { label: 'Emerald', hex: '#065f46' },
  { label: 'Crimson', hex: '#881337' },
];

const BG_PRESETS = [
  { label: 'White', hex: '#ffffff' },
  { label: 'Off-White', hex: '#f8fafc' },
  { label: 'Cream', hex: '#fefce8' },
];

// Clean built-in SVG icon data URIs for reliable offline logo embedding
const PRESET_LOGOS = [
  {
    id: 'link',
    label: 'Link Icon',
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/%3E%3Cpath d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/%3E%3C/svg%3E",
  },
  {
    id: 'globe',
    label: 'Globe Icon',
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='2' y1='12' x2='22' y2='12'/%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E",
  },
  {
    id: 'star',
    label: 'Star Icon',
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000' stroke='%23000000' stroke-width='1.5'%3E%3Cpolygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/%3E%3C/svg%3E",
  },
];

export function DesignCustomizationPanel({
  settings,
  onChange,
  savedLevelBeforeLogo,
  onSavedLevelChange,
}: DesignCustomizationPanelProps) {
  const contrast = evaluateContrast(settings.fgColor, settings.bgColor);
  const isLogoActive = Boolean(settings.logo?.src);

  const handleFgPreset = (hex: string) => {
    onChange({ ...settings, fgColor: hex });
  };

  const handleBgPreset = (hex: string) => {
    onChange({ ...settings, bgColor: hex });
  };

  const handleFgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const parsed = hexColorSchema.safeParse(val);
    if (parsed.success) {
      onChange({ ...settings, fgColor: parsed.data });
    }
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const parsed = hexColorSchema.safeParse(val);
    if (parsed.success) {
      onChange({ ...settings, bgColor: parsed.data });
    }
  };

  const handleLevelSelect = (newLevel: ErrorCorrectionLevel) => {
    if (isLogoActive) return; // Locked while logo is active
    onSavedLevelChange(newLevel);
    onChange({ ...settings, level: newLevel });
  };

  const handleMarginSelect = (m: number) => {
    onChange({ ...settings, marginSize: m });
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
    <Card className="rounded-2xl bg-card/90 backdrop-blur-xs border-border/80">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-base">Design & Customization</CardTitle>
          <Badge
            variant={contrast.isLowContrast || contrast.isInverted ? 'warning' : 'outline'}
            size="sm"
          >
            Contrast: {contrast.ratio.toFixed(1)}:1
          </Badge>
        </div>
        <CardDescription>
          Customize colors, error correction, quiet zones, and center logo embedding without altering payload data.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Color Palette Section */}
        <div className="space-y-4">
          <Field>
            <FieldLabel>Foreground Color (QR Modules)</FieldLabel>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {FG_PRESETS.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => handleFgPreset(p.hex)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-shadow ${
                    settings.fgColor.toLowerCase() === p.hex.toLowerCase()
                      ? 'border-primary ring-2 ring-primary/20 font-semibold'
                      : 'border-border/60 hover:bg-muted/40'
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: p.hex }}
                  />
                  <span>{p.label}</span>
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-auto">
                <Input
                  type="text"
                  value={settings.fgColor}
                  onChange={handleFgChange}
                  className="h-7 w-24 text-xs font-mono uppercase"
                  placeholder="#000000"
                />
              </div>
            </div>
          </Field>

          <Field>
            <FieldLabel>Background Surface Color</FieldLabel>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {BG_PRESETS.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => handleBgPreset(p.hex)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-shadow ${
                    settings.bgColor.toLowerCase() === p.hex.toLowerCase()
                      ? 'border-primary ring-2 ring-primary/20 font-semibold'
                      : 'border-border/60 hover:bg-muted/40'
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: p.hex }}
                  />
                  <span>{p.label}</span>
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-auto">
                <Input
                  type="text"
                  value={settings.bgColor}
                  onChange={handleBgChange}
                  className="h-7 w-24 text-xs font-mono uppercase"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </Field>

          {contrast.warningMessage && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {contrast.warningMessage}
            </p>
          )}
        </div>

        {/* Error Correction & Margins Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel>Error Correction</FieldLabel>
              {isLogoActive && (
                <span className="text-[10px] text-amber-600 font-medium">Locked to H (Logo)</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1 pt-1">
              {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((lvl) => {
                const isSelected = settings.level === lvl;
                return (
                  <Button
                    key={lvl}
                    type="button"
                    size="sm"
                    variant={isSelected ? 'default' : 'outline'}
                    disabled={isLogoActive && lvl !== 'H'}
                    onClick={() => handleLevelSelect(lvl)}
                    className="text-xs"
                  >
                    {lvl}
                  </Button>
                );
              })}
            </div>
            <FieldDescription>
              L (~7%), M (~15%), Q (~25%), H (~30% redundancy).
            </FieldDescription>
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel>Quiet Zone Margin</FieldLabel>
              <span className="text-[10px] text-muted-foreground font-mono">
                {settings.marginSize} modules {settings.marginSize === 4 ? '(ISO standard)' : ''}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 pt-1">
              {[0, 2, 4, 6].map((m) => (
                <Button
                  key={m}
                  type="button"
                  size="sm"
                  variant={settings.marginSize === m ? 'default' : 'outline'}
                  onClick={() => handleMarginSelect(m)}
                  className="text-xs"
                >
                  {m}m
                </Button>
              ))}
            </div>
            <FieldDescription>
              ISO/IEC 18004 specifies 4 modules to ensure edge detection against surrounding layouts.
            </FieldDescription>
          </Field>
        </div>

        {/* Center Logo Embedding Section */}
        <div className="pt-2 border-t border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Center Logo Embedding</h4>
              <p className="text-xs text-muted-foreground">
                Embed a brand icon. Modules behind the logo are safely excavated.
              </p>
            </div>
            {isLogoActive && (
              <Button
                type="button"
                variant="destructive-outline"
                size="xs"
                onClick={handleClearLogo}
              >
                Remove Logo
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Presets:</span>
            {PRESET_LOGOS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                size="sm"
                variant={settings.logo?.src === preset.src ? 'default' : 'outline'}
                onClick={() => handleLogoSelect(preset.src)}
                className="text-xs gap-1.5"
              >
                <span>{preset.label}</span>
              </Button>
            ))}
          </div>

          <Field>
            <Input
              type="url"
              placeholder="Or paste an image URL (e.g. https://example.com/logo.png)"
              value={settings.logo?.src && !settings.logo.src.startsWith('data:') ? settings.logo.src : ''}
              onChange={(e) => {
                const val = e.target.value.trim();
                if (val) handleLogoSelect(val);
                else handleClearLogo();
              }}
              className="text-xs"
            />
            <FieldDescription>
              External image URLs must allow cross-origin access (CORS). Built-in presets render reliably offline.
            </FieldDescription>
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
