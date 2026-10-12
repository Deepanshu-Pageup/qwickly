import { z } from 'zod';

export const linkPayloadSchema = z
  .string()
  .trim()
  .min(1, 'Please enter a website URL')
  .max(2048, 'URL exceeds maximum length of 2048 characters')
  .transform((val, ctx) => {
    // Detect if protocol is present
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(val);
    const candidate = hasScheme ? val : `https://${val}`;

    try {
      const parsed = new URL(candidate);

      // Only HTTP and HTTPS protocols are accepted
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Only HTTP and HTTPS web URLs are supported',
        });
        return z.NEVER;
      }

      // Reject empty or invalid hostnames (e.g., "https://", "http://.com", "http://.")
      if (!parsed.hostname || parsed.hostname.startsWith('.') || !parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter a valid website hostname',
        });
        return z.NEVER;
      }

      return parsed.toString();
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please enter a valid website URL (e.g. example.com or https://example.com)',
      });
      return z.NEVER;
    }
  });

export type LinkPayloadOutput = z.infer<typeof linkPayloadSchema>;

export const textPayloadSchema = z
  .string()
  // Reject empty or whitespace-only inputs without trimming or altering the original value
  .refine((val) => val.trim().length > 0, {
    message: 'Please enter text to generate a QR code',
  })
  // Product constraint: 1000 characters
  .refine((val) => val.length <= 1000, {
    message: 'Text exceeds maximum product limit of 1000 characters for QR studio preview',
  });

export type TextPayloadOutput = z.infer<typeof textPayloadSchema>;
