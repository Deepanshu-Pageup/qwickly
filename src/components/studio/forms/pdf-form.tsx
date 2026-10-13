'use client';

import React from 'react';
import { pdfPayloadSchema, hasPdfExtension } from '@/schemas/qr-payload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PdfFormProps {
  value: string;
  onChange: (value: string, encodedOutput: string | null, isValid: boolean) => void;
}

export function PdfForm({ value, onChange }: PdfFormProps) {
  const [touched, setTouched] = React.useState(false);

  const validationResult = React.useMemo(() => {
    if (!value.trim()) {
      return { success: false as const, error: 'Please enter a direct HTTPS URL to your PDF document' };
    }
    const result = pdfPayloadSchema.safeParse(value);
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
    const nextVal = e.target.value;
    if (!touched) setTouched(true);

    if (!nextVal.trim()) {
      onChange(nextVal, null, false);
      return;
    }

    const result = pdfPayloadSchema.safeParse(nextVal);
    if (result.success) {
      onChange(nextVal, result.data, true);
    } else {
      onChange(nextVal, null, false);
    }
  };

  const hasError = touched && !validationResult.success;
  const isMissingExtension = validationResult.success && !hasPdfExtension(value);

  return (
    <Card className="rounded-xl bg-card border-border/80">
      <CardHeader className="border-b border-border/60 pb-3.5">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            <CardTitle className="text-sm font-semibold">PDF Document QR Configuration</CardTitle>
          </div>
          <Badge variant="outline" size="sm" className="text-[10px] h-5 px-1.5">
            Direct URL Mode
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Provide a direct, publicly accessible HTTPS web link to your online PDF menu, flyer, or manual.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        {/* URL Configuration Notice */}
        <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs text-muted-foreground flex items-start gap-2">
          <span>
            Provide an existing public HTTPS link. Client-side validation checks URL format; it does not verify server reachability or file existence.
          </span>
        </div>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="pdf-url">Public PDF URL (HTTPS Required)</FieldLabel>
            <span className="text-[10px] text-muted-foreground">e.g. .pdf extension</span>
          </div>
          <Input
            id="pdf-url"
            type="url"
            placeholder="https://example.com/assets/menu.pdf"
            value={value}
            onChange={handleChange}
            aria-invalid={hasError}
            className={hasError ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          <FieldDescription>
            Preserves full query strings, authentication tokens, and hash parameters.
          </FieldDescription>
          {hasError && <FieldError>{validationResult.error}</FieldError>}

          {isMissingExtension && (
            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
              Advisory: URL pathname does not end with .pdf. Ensure the target web server serves a direct document or accessible viewer.
            </p>
          )}
        </Field>
      </CardContent>
    </Card>
  );
}
