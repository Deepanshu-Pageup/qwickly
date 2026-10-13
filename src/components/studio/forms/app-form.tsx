'use client';

import React from 'react';
import { appPayloadSchema, AppPlatform } from '@/schemas/qr-payload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface AppFormValue {
  platform: AppPlatform;
  input: string;
}

interface AppFormProps {
  value: AppFormValue;
  onChange: (value: AppFormValue, encodedOutput: string | null, isValid: boolean) => void;
}

export function AppForm({ value, onChange }: AppFormProps) {
  const [touched, setTouched] = React.useState(false);

  const validationResult = React.useMemo(() => {
    if (!value.input.trim()) {
      return { success: false as const, error: 'Please enter an App ID, Package Name, or Store URL' };
    }

    const result = appPayloadSchema.safeParse(value);
    if (result.success) {
      return { success: true as const, error: null, normalized: result.data };
    }
    const issue = result.error.issues[0];
    return {
      success: false as const,
      error: issue ? issue.message : 'Invalid app store identifier',
      normalized: null,
    };
  }, [value]);

  const updateFields = (platform: AppPlatform, input: string) => {
    if (!touched) setTouched(true);
    const nextVal = { platform, input };
    const result = appPayloadSchema.safeParse(nextVal);
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
            <CardTitle className="text-sm font-semibold">App Store QR Configuration</CardTitle>
          </div>
          <Badge variant="outline" size="sm" className="text-[10px] h-5 px-1.5">
            {value.platform === 'ios' ? 'Apple App Store' : 'Google Play'}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Direct scanners to your app download page on the Apple App Store or Google Play Store.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        <Field>
          <FieldLabel>Target App Store</FieldLabel>
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant={value.platform === 'ios' ? 'default' : 'outline'}
              onClick={() => updateFields('ios', value.input)}
              className="text-xs"
            >
              Apple App Store (iOS)
            </Button>
            <Button
              type="button"
              size="sm"
              variant={value.platform === 'android' ? 'default' : 'outline'}
              onClick={() => updateFields('android', value.input)}
              className="text-xs"
            >
              Google Play Store (Android)
            </Button>
          </div>
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="app-identifier">
              {value.platform === 'ios' ? 'App Store ID or Store URL' : 'Android Package Name or Store URL'}
            </FieldLabel>
            <span className="text-[10px] text-muted-foreground">
              {value.platform === 'ios' ? 'e.g. 1234567890' : 'e.g. com.example.app'}
            </span>
          </div>
          <Input
            id="app-identifier"
            type="text"
            placeholder={
              value.platform === 'ios'
                ? 'e.g. 1234567890 or https://apps.apple.com/app/id1234567890'
                : 'e.g. com.example.app or https://play.google.com/store/apps/details?id=com.example.app'
            }
            value={value.input}
            onChange={(e) => updateFields(value.platform, e.target.value)}
            aria-invalid={hasError}
            className={hasError ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          <FieldDescription>
            {value.platform === 'ios'
              ? 'Paste the numeric App ID (found in App Store Connect / URL) or paste the complete Apple App Store URL.'
              : 'Paste your reverse-DNS Android package name (e.g. com.company.app) or paste the full Google Play link.'}
          </FieldDescription>
          {hasError && <FieldError>{validationResult.error}</FieldError>}
        </Field>
      </CardContent>
    </Card>
  );
}
