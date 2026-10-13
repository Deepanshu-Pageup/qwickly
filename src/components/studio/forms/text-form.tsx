'use client';

import React from 'react';
import { textPayloadSchema } from '@/schemas/qr-payload';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { FormSection, CharCounter } from './form-section';

interface TextFormProps {
  value: string;
  onChange: (value: string, preservedOutput: string | null, isValid: boolean) => void;
}

const MAX_TEXT_LENGTH = 1000;

export function TextForm({ value, onChange }: TextFormProps) {
  const [touched, setTouched] = React.useState(false);

  const validationResult = React.useMemo(() => {
    if (!value) {
      return { success: false as const, error: 'Please enter text to generate a QR code' };
    }
    const result = textPayloadSchema.safeParse(value);
    if (result.success) {
      return { success: true as const, error: null };
    }
    const issue = result.error.issues[0];
    return {
      success: false as const,
      error: issue ? issue.message : 'Invalid text format',
    };
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value.slice(0, MAX_TEXT_LENGTH);
    if (!touched) setTouched(true);

    const result = textPayloadSchema.safeParse(nextVal);
    if (result.success) {
      // Preserves original text exact byte-for-byte including whitespace and newlines
      onChange(nextVal, nextVal, true);
    } else {
      onChange(nextVal, null, false);
    }
  };

  const hasError = touched && !validationResult.success;

  return (
    <FormSection title="Content" tag="Text">
      <Field className="w-full">
        <div className="flex w-full items-center justify-between">
          <FieldLabel htmlFor="qr-text-input">Text</FieldLabel>
          <CharCounter length={value.length} max={MAX_TEXT_LENGTH} />
        </div>
        <Textarea
          id="qr-text-input"
          rows={5}
          maxLength={MAX_TEXT_LENGTH}
          placeholder="Type or paste plain text"
          value={value}
          onChange={handleChange}
          onBlur={() => value && setTouched(true)}
          aria-invalid={hasError}
          aria-describedby={hasError ? 'qr-text-error' : 'qr-text-desc'}
          className="resize-y"
        />
        {hasError ? (
          <FieldError match id="qr-text-error">{validationResult.error}</FieldError>
        ) : (
          <FieldDescription id="qr-text-desc">
            Line breaks and spaces are kept exactly as typed.
          </FieldDescription>
        )}
      </Field>
    </FormSection>
  );
}
