'use client';

import React from 'react';
import { socialPayloadSchema, SocialPlatform } from '@/schemas/qr-payload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface SocialFormValue {
  platform: SocialPlatform;
  input: string;
}

interface SocialFormProps {
  value: SocialFormValue;
  onChange: (value: SocialFormValue, encodedOutput: string | null, isValid: boolean) => void;
}

const PLATFORMS: Array<{ id: SocialPlatform; label: string; placeholder: string; prefixHint: string }> = [
  { id: 'instagram', label: 'Instagram', placeholder: '@username or profile URL', prefixHint: 'instagram.com/' },
  { id: 'x', label: 'X (Twitter)', placeholder: '@username or profile URL', prefixHint: 'x.com/' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'profile-slug or profile URL', prefixHint: 'linkedin.com/in/' },
  { id: 'youtube', label: 'YouTube', placeholder: '@channel or channel URL', prefixHint: 'youtube.com/@' },
  { id: 'facebook', label: 'Facebook', placeholder: 'username or profile URL', prefixHint: 'facebook.com/' },
  { id: 'tiktok', label: 'TikTok', placeholder: '@username or profile URL', prefixHint: 'tiktok.com/@' },
  { id: 'github', label: 'GitHub', placeholder: 'username or profile URL', prefixHint: 'github.com/' },
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
    const nextVal = { platform, input };
    const result = socialPayloadSchema.safeParse(nextVal);
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
            <CardTitle className="text-sm font-semibold">Social Media QR Configuration</CardTitle>
          </div>
          <Badge variant="outline" size="sm" className="text-[10px] h-5 px-1.5">
            {activePlatform.label}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Connect users directly to your social profile, community channel, or link-in-bio hub.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        <Field>
          <FieldLabel>Select Platform</FieldLabel>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PLATFORMS.map((p) => {
              const isSelected = value.platform === p.id;
              return (
                <Button
                  key={p.id}
                  type="button"
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => updateFields(p.id, value.input)}
                  className="text-xs"
                >
                  {p.label}
                </Button>
              );
            })}
          </div>
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="social-input">
              {value.platform === 'custom' ? 'Direct Profile / Hub URL' : `${activePlatform.label} Handle or URL`}
            </FieldLabel>
            <span className="text-[10px] text-muted-foreground">{activePlatform.prefixHint}</span>
          </div>
          <Input
            id="social-input"
            type="text"
            placeholder={activePlatform.placeholder}
            value={value.input}
            onChange={(e) => updateFields(value.platform, e.target.value)}
            aria-invalid={hasError}
            className={hasError ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          <FieldDescription>
            {value.platform === 'custom'
              ? 'Enter any valid HTTP or HTTPS link-in-bio or portfolio page URL.'
              : `Enter your ${activePlatform.label} username (with or without @) or paste a direct profile link.`}
          </FieldDescription>
          {hasError && <FieldError>{validationResult.error}</FieldError>}
        </Field>
      </CardContent>
    </Card>
  );
}
