'use client';

import React from 'react';
import { linkPayloadSchema } from '@/schemas/qr-payload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface LinkFormProps {
  value: string;
  onChange: (value: string, normalizedOutput: string | null, isValid: boolean) => void;
}

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
    const nextVal = e.target.value;
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
    <Card className="rounded-xl bg-card border-border/80">
      <CardHeader className="border-b border-border/60 pb-3.5">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            <CardTitle className="text-sm font-semibold">Link QR Configuration</CardTitle>
          </div>
          <Badge variant="outline" size="sm" className="font-mono text-[10px] h-5 px-1.5">
            {value.length}/2048
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Enter a website destination. URLs without a scheme will automatically use HTTPS.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        <Field className="w-full">
          <FieldLabel htmlFor="qr-link-input">
            Destination URL <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="qr-link-input"
            type="url"
            placeholder="example.com or https://example.com"
            value={value}
            onChange={handleChange}
            onBlur={() => setTouched(true)}
            aria-invalid={hasError}
            aria-describedby={hasError ? 'qr-link-error' : 'qr-link-desc'}
            className="font-mono text-sm"
          />
          {hasError ? (
            <FieldError id="qr-link-error">{validationResult.error}</FieldError>
          ) : (
            <FieldDescription id="qr-link-desc">
              {validationResult.success && validationResult.normalized ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  Encodes as: {validationResult.normalized}
                </span>
              ) : (
                'Accepts standard web destinations. Schemes like FTP or JavaScript are rejected.'
              )}
            </FieldDescription>
          )}
        </Field>
      </CardContent>
    </Card>
  );
}
