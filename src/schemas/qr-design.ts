import { z } from 'zod';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

// Standard WCAG 2.1 relative luminance calculation
export function parseHexColor(hex: string): [number, number, number] | null {
  const cleanHex = hex.trim().replace(/^#/, '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return [r, g, b];
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

export function getRelativeLuminance(rgb: [number, number, number]): number {
  const [rs, gs, bs] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const fgRgb = parseHexColor(fgHex) || [0, 0, 0];
  const bgRgb = parseHexColor(bgHex) || [255, 255, 255];
  const L1 = getRelativeLuminance(fgRgb);
  const L2 = getRelativeLuminance(bgRgb);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ContrastEvaluation {
  ratio: number;
  isLowContrast: boolean;
  isInverted: boolean;
  warningMessage: string | null;
}

/**
 * Evaluates contrast between QR foreground and background.
 * Note: The 4.5:1 ratio is a typographic advisory heuristic; it does NOT guarantee
 * optical camera scannability under real-world lighting or physical sensors.
 */
export function evaluateContrast(fgHex: string, bgHex: string): ContrastEvaluation {
  const fgRgb = parseHexColor(fgHex) || [0, 0, 0];
  const bgRgb = parseHexColor(bgHex) || [255, 255, 255];
  const L1 = getRelativeLuminance(fgRgb);
  const L2 = getRelativeLuminance(bgRgb);

  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  const isInverted = L1 > L2; // Light modules on dark background
  const isLowContrast = ratio < 4.5;

  let warningMessage: string | null = null;
  if (isInverted) {
    warningMessage =
      'Inverted color scheme detected (light foreground on dark background). Many optical barcode scanners and camera apps fail to decode inverted QR finder patterns.';
  } else if (isLowContrast) {
    warningMessage = `Low contrast ratio (${ratio.toFixed(1)}:1 is below the recommended 4.5:1 advisory threshold). Subtle colors may fail in dim lighting or on lower-quality camera sensors.`;
  }

  return {
    ratio,
    isLowContrast,
    isInverted,
    warningMessage,
  };
}

export const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color code (e.g. #000000 or #FFF)');

export const logoSettingsSchema = z.object({
  src: z.string().trim().min(1, 'Logo URI or source required'),
  sizeRatio: z
    .number()
    .min(0.1, 'Logo size ratio must be at least 10%')
    .max(0.2, 'Logo size ratio must not exceed the approved 20% safe boundary')
    .default(0.18),
  excavate: z.boolean().default(true),
});

export const qrDesignSchema = z.object({
  fgColor: hexColorSchema.default('#000000'),
  bgColor: hexColorSchema.default('#ffffff'),
  level: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  marginSize: z
    .number()
    .int('Margin size must be an integer')
    .min(0, 'Margin cannot be negative')
    .max(6, 'Margin cannot exceed 6 modules')
    .default(4),
  logo: logoSettingsSchema.nullable().default(null),
});

export type QrDesignSettings = z.infer<typeof qrDesignSchema>;
export type LogoSettings = z.infer<typeof logoSettingsSchema>;

/**
 * Resolves the effective error correction level.
 * When an embedded logo is active, effective error correction is strictly elevated to 'H'
 * to preserve Reed-Solomon redundancy for the excavated central area.
 */
export function getEffectiveErrorLevel(settings: QrDesignSettings): ErrorCorrectionLevel {
  if (settings.logo && settings.logo.src) {
    return 'H';
  }
  return settings.level;
}
