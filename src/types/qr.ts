export type QrType =
  | 'link'
  | 'text'
  | 'pdf'
  | 'image'
  | 'whatsapp'
  | 'social'
  | 'map'
  | 'coupon'
  | 'app';

export interface QrTypeMetadata {
  id: QrType;
  label: string;
  description: string;
  badge?: string;
  icon: string;
}

export const QR_TYPES: readonly QrTypeMetadata[] = [
  {
    id: 'link',
    label: 'Link',
    description: 'Open a website or web page destination',
    icon: 'link',
  },
  {
    id: 'text',
    label: 'Text',
    description: 'Display plain, raw text or simple notes',
    icon: 'text',
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Direct link or hosted PDF document',
    badge: 'Hosted',
    icon: 'file-text',
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Photo gallery, banner, or single image',
    badge: 'Hosted',
    icon: 'image',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Open a pre-filled chat conversation directly',
    icon: 'message-circle',
  },
  {
    id: 'social',
    label: 'Social Media',
    description: 'Connect to social profiles or link-in-bio',
    icon: 'share-2',
  },
  {
    id: 'map',
    label: 'Map Address',
    description: 'Physical location or Google Maps navigation',
    icon: 'map-pin',
  },
  {
    id: 'coupon',
    label: 'Coupon',
    description: 'Promotional discount code and offer details',
    icon: 'tag',
  },
  {
    id: 'app',
    label: 'App Link',
    description: 'Redirect to Google Play or Apple App Store',
    icon: 'smartphone',
  },
] as const;

export function getQrTypeMetadata(type: QrType): QrTypeMetadata {
  const metadata = QR_TYPES.find((item) => item.id === type);
  if (!metadata) {
    throw new Error(`Unknown QR type: ${type}`);
  }
  return metadata;
}
