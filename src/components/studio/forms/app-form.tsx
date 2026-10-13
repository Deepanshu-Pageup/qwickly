'use client';

import React from 'react';
import { appPayloadSchema, AppPlatform } from '@/schemas/qr-payload';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { FormSection } from './form-section';
import { OptionGroup } from './option-group';

export interface AppFormValue {
  platform: AppPlatform;
  input: string;
}

interface AppFormProps {
  value: AppFormValue;
  onChange: (value: AppFormValue, encodedOutput: string | null, isValid: boolean) => void;
}

const MAX_INPUT_LENGTH = 2048;

const STORES: ReadonlyArray<{ id: AppPlatform; label: string }> = [
  { id: 'ios', label: 'App Store (iOS)' },
  { id: 'android', label: 'Google Play (Android)' },
];

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
    const nextVal = { platform, input: input.slice(0, MAX_INPUT_LENGTH) };
    const result = appPayloadSchema.safeParse(nextVal);
    if (result.success) {
      onChange(nextVal, result.data, true);
    } else {
      onChange(nextVal, null, false);
    }
  };

  const hasError = touched && !validationResult.success;
  const isIos = value.platform === 'ios';

  return (
    <FormSection title="Content" tag="App Link">
      <Field>
        <FieldLabel>Store</FieldLabel>
        <OptionGroup
          label="App store"
          value={value.platform}
          options={STORES}
          onChange={(platform) => updateFields(platform, value.input)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="app-identifier">
          {isIos ? 'App Store ID or URL' : 'Package name or Play Store URL'}
        </FieldLabel>
        <Input
          id="app-identifier"
          type="text"
          maxLength={MAX_INPUT_LENGTH}
          placeholder={isIos ? '1234567890 or https://apps.apple.com/app/id1234567890' : 'com.example.app'}
          value={value.input}
          onChange={(e) => updateFields(value.platform, e.target.value)}
          onBlur={() => value.input && setTouched(true)}
          aria-invalid={hasError}
          aria-describedby={hasError ? 'app-identifier-error' : 'app-identifier-desc'}
        />
        {hasError ? (
          <FieldError match id="app-identifier-error">{validationResult.error}</FieldError>
        ) : (
          <FieldDescription id="app-identifier-desc">
            {isIos
              ? 'The numeric App ID from App Store Connect, or the full apps.apple.com link.'
              : 'Reverse-DNS package name such as com.company.app, or the full Google Play link.'}
          </FieldDescription>
        )}
      </Field>
    </FormSection>
  );
}
