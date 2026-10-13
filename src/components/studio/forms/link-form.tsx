'use client';

import React from 'react';
import { linkPayloadSchema } from '@/schemas/qr-payload';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { FormSection } from './form-section';

interface LinkFormProps {
  value: string;
  onChange: (value: string, normalizedOutput: string | null, isValid: boolean) => void;
}

const MAX_URL_LENGTH = 2048;

export function LinkForm({ value, onChange }: LinkFormProps) {
  const [touched, setTouched] = React.useState(false);

  // Validate and normalize on the fly
  const validationResult = React.useMemo(() => {
    if (!value.trim()) {
      return { success: false as const, error: 'Please enter a website URL', normalized: null };
    }
    const result = linkPayloadSchema.safeParse(value);
    if (result.success) {
      return { success: true as const, error: null, normalized: result.data };
    }
    const issue = result.error.issues[0];
    return {
      success: false as const,
      error: issue ? issue.message : 'Invalid URL format',
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

    const result = linkPayloadSchema.safeParse(nextVal);
    if (result.success) {
      onChange(nextVal, result.data, true);
    } else {
      onChange(nextVal, null, false);
    }
  };

  const hasError = touched && !validationResult.success;

  return (
    <FormSection title="Content" tag="Link">
      <Field className="w-full">
        <FieldLabel htmlFor="qr-link-input">Destination URL</FieldLabel>
        <Input
          id="qr-link-input"
          type="url"
          maxLength={MAX_URL_LENGTH}
          placeholder="https://example.com"
          value={value}
          onChange={handleChange}
          onBlur={() => value && setTouched(true)}
          aria-invalid={hasError}
          aria-describedby={hasError ? 'qr-link-error' : 'qr-link-desc'}
        />
        {hasError ? (
          <FieldError match id="qr-link-error">{validationResult.error}</FieldError>
        ) : (
          <FieldDescription id="qr-link-desc">
            {validationResult.success && validationResult.normalized ? (
              <span className="break-all font-mono text-success-foreground">
                Encodes as {validationResult.normalized}
              </span>
            ) : (
              'Web address people land on when they scan. https:// is added if missing.'
            )}
          </FieldDescription>
        )}
      </Field>
    </FormSection>
  );
}
