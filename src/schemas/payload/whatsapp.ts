import { z } from 'zod';

export interface WhatsAppPayloadInput {
  phone: string;
  message?: string;
}

/**
 * WhatsApp QR Schema
 * Note: Syntax validation establishes formatting compliance with E.164-compatible
 * digits. It does NOT establish that a phone number actually exists or is registered with WhatsApp.
 */
export const whatsappPayloadSchema = z
  .object({
    phone: z
      .string()
      .trim()
      .min(1, 'Please enter a phone number with country code')
      // Reject letters and unsupported symbols; allow spaces, parens, hyphens, and optional leading plus
      .refine((val) => /^(\+)?[\d\s\-()]+$/.test(val), {
        message: 'Phone number can only contain digits, spaces, parentheses, hyphens, and an optional leading plus (+)',
      })
      .transform((val, ctx) => {
        const digits = val.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Phone number must contain between 7 and 15 digits including country code',
          });
          return z.NEVER;
        }
        if (digits.startsWith('0')) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'International phone numbers must not start with a leading zero (0)',
          });
          return z.NEVER;
        }
        return digits;
      }),
    message: z
      .string()
      .max(500, 'Pre-filled message cannot exceed 500 characters')
      .optional()
      .default(''),
  })
  .transform(({ phone, message }) => {
    const trimmedMessage = message ? message.trim() : '';
    if (!trimmedMessage) {
      return `https://wa.me/${phone}`;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(trimmedMessage)}`;
  });

export type WhatsAppPayloadOutput = z.infer<typeof whatsappPayloadSchema>;
