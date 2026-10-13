import { Globe, Link2, Star, type LucideIcon } from 'lucide-react';

/**
 * Built-in center-logo presets. Every preset is an offline SVG data URI (monochrome black, so it
 * stays readable on the white excavated area of the QR code).
 */
export interface LogoPreset {
  id: string;
  label: string;
  /** Data URI embedded into the QR code. */
  src: string;
  /** lucide icon for the picker button (generic presets). */
  Icon?: LucideIcon;
  /** Inline 24x24 SVG markup for the picker button (brand presets, rendered with currentColor). */
  glyph?: string;
}

const svgUri = (inner: string, attrs: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${attrs}>${inner}</svg>`,
  )}`;

const FILL = 'fill="#000000"';
const STROKE = 'fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

const YOUTUBE = '<path fill-rule="evenodd" d="M5 5h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zm5 4v6l5-3z"/>';
const X = '<path d="M3 3h4.6l4.4 6.2L17.4 3H21l-7.4 8.6L21.5 21h-4.6l-4.7-6.6L6.6 21H3l7.9-9z"/>';
const INSTAGRAM = '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6"/>';
const FACEBOOK = '<path d="M14 8V6.5c0-.7.3-1 1-1h2V2h-3c-3 0-4 2-4 4.2V8H8v3.5h2V22h4V11.5h2.7L17 8z"/>';
const LINKEDIN =
  '<rect x="3" y="9" width="4" height="12"/><circle cx="5" cy="5" r="2"/><path d="M10 9h3.8v1.7c.6-1.1 2-2 3.9-2 3.3 0 4.3 2 4.3 5V21h-4v-6c0-1.4-.3-2.6-1.9-2.6-1.7 0-2.1 1.2-2.1 2.7V21h-4z"/>';

const GITHUB =
  '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>';
const WHATSAPP =
  '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1.5-1.5-2-1.5-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1.5-2z"/>';

export const PRESET_LOGOS: readonly LogoPreset[] = [
  {
    id: 'link',
    label: 'Link icon',
    Icon: Link2,
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/%3E%3Cpath d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/%3E%3C/svg%3E",
  },
  {
    id: 'globe',
    label: 'Globe icon',
    Icon: Globe,
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='2' y1='12' x2='22' y2='12'/%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E",
  },
  {
    id: 'star',
    label: 'Star icon',
    Icon: Star,
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000' stroke='%23000000' stroke-width='1.5'%3E%3Cpolygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/%3E%3C/svg%3E",
  },
  { id: 'youtube', label: 'YouTube logo', glyph: YOUTUBE, src: svgUri(YOUTUBE, FILL) },
  { id: 'x', label: 'X (Twitter) logo', glyph: X, src: svgUri(X, FILL) },
  { id: 'instagram', label: 'Instagram logo', glyph: INSTAGRAM, src: svgUri(INSTAGRAM, STROKE) },
  { id: 'facebook', label: 'Facebook logo', glyph: FACEBOOK, src: svgUri(FACEBOOK, FILL) },
  { id: 'linkedin', label: 'LinkedIn logo', glyph: LINKEDIN, src: svgUri(LINKEDIN, FILL) },
  { id: 'github', label: 'GitHub logo', glyph: GITHUB, src: svgUri(GITHUB, STROKE) },
  { id: 'whatsapp', label: 'WhatsApp logo', glyph: WHATSAPP, src: svgUri(WHATSAPP, STROKE) },
];

const STROKE_GLYPHS = new Set(['instagram', 'github', 'whatsapp']);

/** Presentation attributes that make a preset glyph render correctly as a currentColor button icon. */
export const glyphAttrs = (id: string) =>
  STROKE_GLYPHS.has(id)
    ? { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
    : { fill: 'currentColor' };
