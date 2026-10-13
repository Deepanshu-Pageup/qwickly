'use client';

import React from 'react';
import { textPayloadSchema } from '@/schemas/qr-payload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface TextFormProps {
  value: string;
  onChange: (value: string, preservedOutput: string | null, isValid: boolean) => void;
}

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
    const nextVal = e.target.value;
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
  const isOverLimit = value.length > 1000;

  return (
    <Card className="rounded-xl bg-card border-border/80">
      <CardHeader className="border-b border-border/60 pb-3.5">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            <CardTitle className="text-sm font-semibold">Text QR Configuration</CardTitle>
          </div>
          <Badge
            variant={isOverLimit ? 'destructive' : 'outline'}
            size="sm"
            className="font-mono text-[10px] h-5 px-1.5"
          >
            {value.length}/1000
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Enter plain text, notes, or messages. Line breaks and whitespace are preserved exactly.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        <Field className="w-full">
          <FieldLabel htmlFor="qr-text-input">
            Content Text <span className="text-destructive">*</span>
          </FieldLabel>
          <Textarea
            id="qr-text-input"
            rows={5}
            placeholder="Type or paste plain text here..."
            value={value}
            onChange={handleChange}
            onBlur={() => setTouched(true)}
            aria-invalid={hasError}
            aria-describedby={hasError ? 'qr-text-error' : 'qr-text-desc'}
            className="font-sans text-sm resize-y"
          />
          {hasError ? (
            <FieldError id="qr-text-error">{validationResult.error}</FieldError>
          ) : (
            <FieldDescription id="qr-text-desc">
              Whitespace and line breaks are retained. The 1000 character limit is a product constraint for reliable preview.
            </FieldDescription>
          )}
        </Field>
      </CardContent>
    </Card>
  );
}
