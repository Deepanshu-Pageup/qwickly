'use client';

import React from 'react';
import { couponPayloadSchema, CouponPayloadInput } from '@/schemas/qr-payload';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSection, CharCounter } from './form-section';

export interface CouponFormValue {
  code: string;
  description: string;
  terms: string;
  redeemUrl: string;
}

interface CouponFormProps {
  value: CouponFormValue;
  onChange: (value: CouponFormValue, encodedOutput: string | null, isValid: boolean) => void;
}

const MAX_CODE_LENGTH = 32;
const MAX_DESCRIPTION_LENGTH = 100;
const MAX_TERMS_LENGTH = 200;
const MAX_URL_LENGTH = 2048;

export function CouponForm({ value, onChange }: CouponFormProps) {
  const [touched, setTouched] = React.useState(false);

  const validationResult = React.useMemo(() => {
    if (!value.code.trim()) {
      return { success: false as const, error: 'Please enter a coupon code' };
    }
    if (!value.description.trim()) {
      return { success: false as const, error: 'Please enter an offer description' };
    }
    if (!value.redeemUrl.trim()) {
      return { success: false as const, error: 'Please enter a redeem URL' };
    }

    const payloadInput: CouponPayloadInput = {
      code: value.code,
      description: value.description,
      terms: value.terms,
      redeemUrl: value.redeemUrl,
    };
    const result = couponPayloadSchema.safeParse(payloadInput);
    if (result.success) {
      return { success: true as const, error: null, normalized: result.data };
    }
    const issue = result.error.issues[0];
    return {
      success: false as const,
      error: issue ? issue.message : 'Invalid coupon details',
      normalized: null,
    };
  }, [value]);

  const updateFields = (nextVal: CouponFormValue) => {
    if (!touched) setTouched(true);
    const result = couponPayloadSchema.safeParse(nextVal);
    if (result.success) {
      onChange(nextVal, result.data, true);
    } else {
      onChange(nextVal, null, false);
    }
  };

  const hasError = touched && !validationResult.success;

  return (
    <FormSection title="Content" tag="Coupon">
      <Field>
        <FieldLabel htmlFor="coupon-code">Coupon code</FieldLabel>
        <Input
          id="coupon-code"
          type="text"
          maxLength={MAX_CODE_LENGTH}
          placeholder="SUMMER50"
          value={value.code}
          onChange={(e) =>
            updateFields({ ...value, code: e.target.value.toUpperCase().slice(0, MAX_CODE_LENGTH) })
          }
          aria-invalid={hasError && !value.code.trim()}
          className="font-mono uppercase"
        />
        <FieldDescription>Letters, numbers, hyphens and underscores.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="coupon-desc">Offer description</FieldLabel>
        <Input
          id="coupon-desc"
          type="text"
          maxLength={MAX_DESCRIPTION_LENGTH}
          placeholder="50% off the entire summer catalog"
          value={value.description}
          onChange={(e) =>
            updateFields({ ...value, description: e.target.value.slice(0, MAX_DESCRIPTION_LENGTH) })
          }
          aria-invalid={hasError && !value.description.trim()}
        />
      </Field>

      <Field>
        <div className="flex w-full items-center justify-between">
          <FieldLabel htmlFor="coupon-terms">Terms and expiry (optional)</FieldLabel>
          <CharCounter length={value.terms.length} max={MAX_TERMS_LENGTH} />
        </div>
        <Textarea
          id="coupon-terms"
          rows={2}
          maxLength={MAX_TERMS_LENGTH}
          placeholder="Valid until August 31. One per customer."
          value={value.terms}
          onChange={(e) =>
            updateFields({ ...value, terms: e.target.value.slice(0, MAX_TERMS_LENGTH) })
          }
          className="resize-none"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="coupon-url">Redeem URL</FieldLabel>
        <Input
          id="coupon-url"
          type="url"
          maxLength={MAX_URL_LENGTH}
          placeholder="https://shop.example.com/checkout"
          value={value.redeemUrl}
          onChange={(e) =>
            updateFields({ ...value, redeemUrl: e.target.value.slice(0, MAX_URL_LENGTH) })
          }
          required
          aria-required="true"
          aria-invalid={hasError && !value.redeemUrl.trim()}
        />
        <FieldDescription>
          Required. The code is added to this link as <code className="font-mono">?coupon={value.code || 'CODE'}</code>.
        </FieldDescription>
      </Field>

      {hasError && (
        <p className="text-xs font-medium text-destructive-foreground" role="alert">
          {validationResult.error}
        </p>
      )}
    </FormSection>
  );
}
