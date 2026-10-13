'use client';

import React from 'react';
import { socialPayloadSchema, SocialPlatform } from '@/schemas/qr-payload';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { FormSection } from './form-section';
import { OptionGroup } from './option-group';

export interface SocialFormValue {
  platform: SocialPlatform;
  input: string;
}

interface SocialFormProps {
  value: SocialFormValue;
  onChange: (value: SocialFormValue, encodedOutput: string | null, isValid: boolean) => void;
}

const MAX_INPUT_LENGTH = 2048;

const PLATFORMS: Array<{ id: SocialPlatform; label: string; placeholder: string; prefixHint: string }> = [
  { id: 'instagram', label: 'Instagram', placeholder: '@username or profile/post URL', prefixHint: 'instagram.com/' },
  { id: 'x', label: 'X (Twitter)', placeholder: '@username or profile/post URL', prefixHint: 'x.com/' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'profile-slug or profile/post URL', prefixHint: 'linkedin.com/in/' },
  { id: 'youtube', label: 'YouTube', placeholder: '@channel or channel/video URL', prefixHint: 'youtube.com/@' },
  { id: 'facebook', label: 'Facebook', placeholder: 'username or profile/post URL', prefixHint: 'facebook.com/' },
  { id: 'tiktok', label: 'TikTok', placeholder: '@username or profile/post URL', prefixHint: 'tiktok.com/@' },
  { id: 'github', label: 'GitHub', placeholder: 'username or profile/post URL', prefixHint: 'github.com/' },
  { id: 'custom', label: 'Custom URL', placeholder: 'https://linktr.ee/yourbrand', prefixHint: 'web URL' },
];

export function SocialForm({ value, onChange }: SocialFormProps) {
  const [touched, setTouched] = React.useState(false);

  const activePlatform = PLATFORMS.find((p) => p.id === value.platform) || PLATFORMS[0];

  const validationResult = React.useMemo(() => {
    if (!value.input.trim()) {
      return { success: false as const, error: 'Please enter a profile username or URL' };
    }
    const result = socialPayloadSchema.safeParse(value);
    if (result.success) {
      return { success: true as const, error: null, normalized: result.data };
    }
    const issue = result.error.issues[0];
    return {
      success: false as const,
      error: issue ? issue.message : 'Invalid profile identifier',
      normalized: null,
    };
  }, [value]);

  const updateFields = (platform: SocialPlatform, input: string) => {
    if (!touched) setTouched(true);
    const nextVal = { platform, input: input.slice(0, MAX_INPUT_LENGTH) };
    const result = socialPayloadSchema.safeParse(nextVal);
    if (result.success) {
      onChange(nextVal, result.data, true);
    } else {
      onChange(nextVal, null, false);
    }
  };

  const hasError = touched && !validationResult.success;

  return (
    <FormSection title="Content" tag="Social Media">
      <Field>
        <FieldLabel>Platform</FieldLabel>
        <OptionGroup
          label="Social platform"
          value={value.platform}
          options={PLATFORMS}
          onChange={(platform) => updateFields(platform, value.input)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="social-input">
          {value.platform === 'custom' ? 'Profile URL' : `${activePlatform.label} handle or URL`}
        </FieldLabel>
        <Input
          id="social-input"
          type="text"
          maxLength={MAX_INPUT_LENGTH}
          placeholder={activePlatform.placeholder}
          value={value.input}
          onChange={(e) => updateFields(value.platform, e.target.value)}
          onBlur={() => value.input && setTouched(true)}
          aria-invalid={hasError}
          aria-describedby={hasError ? 'social-input-error' : 'social-input-desc'}
        />
        {hasError ? (
          <FieldError match id="social-input-error">{validationResult.error}</FieldError>
        ) : (
          <FieldDescription id="social-input-desc">
            {value.platform === 'custom'
              ? 'Any HTTP or HTTPS link-in-bio or portfolio page.'
              : `Username (with or without @), a profile link, or a post link from ${activePlatform.label}.`}
          </FieldDescription>
        )}
      </Field>
    </FormSection>
  );
}
