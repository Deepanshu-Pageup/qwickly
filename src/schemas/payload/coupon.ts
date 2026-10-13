import { z } from 'zod';
import { normalizeWebUrl } from './shared';

export interface CouponPayloadInput {
  code: string;
  description: string;
  terms?: string;
  redeemUrl: string;
}

export const couponPayloadSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, 'Please enter a coupon code')
      .max(32, 'Coupon code cannot exceed 32 characters')
      .transform((val) => val.toUpperCase())
      .refine((val) => /^[A-Z0-9_-]{1,32}$/.test(val), {
        message: 'Coupon code can only contain uppercase letters, numbers, hyphens, and underscores',
      }),
    description: z
      .string()
      .trim()
      .min(1, 'Please enter an offer description')
      .max(100, 'Description cannot exceed 100 characters')
      // Normalize internal line breaks to avoid multi-line corruption
      .transform((val) => val.replace(/[\r\n]+/g, ' ').trim()),
    terms: z
      .string()
      .max(200, 'Terms cannot exceed 200 characters')
      .optional()
      .default('')
      .transform((val) => (val ? val.replace(/[\r\n]+/g, ' ').trim() : '')),
    redeemUrl: z
      .string()
      .trim()
      .min(1, 'Please enter a redeem URL')
      .max(2048, 'URL exceeds maximum length of 2048 characters'),
  })
  .transform(({ code, redeemUrl }, ctx) => {
    // The redeem URL is mandatory: validate it as a web URL and inject the coupon query parameter
    try {
      const normalized = normalizeWebUrl(redeemUrl, false);
      const url = new URL(normalized);
      // Deterministically set or overwrite coupon parameter
      url.searchParams.set('coupon', code);
      return url.toString();
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['redeemUrl'],
        message: err instanceof Error ? err.message : 'Invalid redeem URL format',
      });
      return z.NEVER;
    }
  });

export type CouponPayloadOutput = z.infer<typeof couponPayloadSchema>;
