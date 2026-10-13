'use client';

import React from 'react';
import { imagePayloadSchema, hasImageExtension } from '@/schemas/qr-payload';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { FormSection } from './form-section';

interface ImageFormProps {
  value: string;
  onChange: (value: string, encodedOutput: string | null, isValid: boolean) => void;
}

const MAX_URL_LENGTH = 2048;

export function ImageForm({ value, onChange }: ImageFormProps) {
  const [touched, setTouched] = React.useState(false);

  const validationResult = React.useMemo(() => {
    if (!value.trim()) {
      return { success: false as const, error: 'Please enter a direct HTTPS URL to your image file' };
    }
    const result = imagePayloadSchema.safeParse(value);
    if (result.success) {
      return { success: true as const, error: null, normalized: result.data };
    }
    const issue = result.error.issues[0];
    return {
      success: false as const,
      error: issue ? issue.message : 'Invalid HTTPS URL format',
      normalized: null,
    };
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value.slice(0, MAX_URL_LENGTH);
    if (!touched) setTouched(true);

    if (!nextVal.trim()) {
      onChange(nextVal, null, false);
      return;
    }

    const result = imagePayloadSchema.safeParse(nextVal);
    if (result.success) {
      onChange(nextVal, result.data, true);
    } else {
      onChange(nextVal, null, false);
    }
  };

  const hasError = touched && !validationResult.success;
  const isMissingExtension = validationResult.success && !hasImageExtension(value);

  return (
    <FormSection title="Content" tag="Image">
      <Field>
        <FieldLabel htmlFor="image-url">Image URL</FieldLabel>
        <Input
          id="image-url"
          type="url"
          maxLength={MAX_URL_LENGTH}
          placeholder="https://example.com/poster.jpg"
          value={value}
          onChange={handleChange}
          onBlur={() => value && setTouched(true)}
          aria-invalid={hasError}
          aria-describedby={hasError ? 'image-url-error' : 'image-url-desc'}
        />
        {hasError ? (
          <FieldError match id="image-url-error">{validationResult.error}</FieldError>
        ) : (
          <FieldDescription id="image-url-desc">
            A public HTTPS link to an image you host. Only the link format is checked, not that the file exists.
          </FieldDescription>
        )}
        {isMissingExtension && (
          <p className="mt-1.5 text-xs text-warning-foreground">
            This URL does not end in .png, .jpg, .webp, .svg or .gif. Make sure it serves an image.
          </p>
        )}
      </Field>
    </FormSection>
  );
}
