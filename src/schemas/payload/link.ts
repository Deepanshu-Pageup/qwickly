import { z } from 'zod';
import { normalizeWebUrl } from './shared';

export const linkPayloadSchema = z
  .string()
  .trim()
  .min(1, 'Please enter a website URL')
  .max(2048, 'URL exceeds maximum length of 2048 characters')
  .transform((val, ctx) => {
    try {
      return normalizeWebUrl(val, false);
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err instanceof Error ? err.message : 'Invalid URL format',
      });
      return z.NEVER;
    }
  });

export type LinkPayloadOutput = z.infer<typeof linkPayloadSchema>;
