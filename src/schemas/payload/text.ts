import { z } from 'zod';

export const textPayloadSchema = z
  .string()
  .refine((val) => val.trim().length > 0, {
    message: 'Please enter text to generate a QR code',
  })
  .refine((val) => val.length <= 1000, {
    message: 'Text exceeds maximum product limit of 1000 characters for QR studio preview',
  });

export type TextPayloadOutput = z.infer<typeof textPayloadSchema>;
