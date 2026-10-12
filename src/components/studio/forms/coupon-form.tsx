'use client';

import React from 'react';
import { couponPayloadSchema, CouponPayloadInput } from '@/schemas/qr-payload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

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

export function CouponForm({ value, onChange }: CouponFormProps) {
  const [touched, setTouched] = React.useState(false);

  const validationResult = React.useMemo(() => {
    if (!value.code.trim()) {
      return { success: false as const, error: 'Please enter a coupon code' };
    }
    if (!value.description.trim()) {
      return { success: false as const, error: 'Please enter an offer description' };
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
    <Card className="rounded-2xl bg-card/90 backdrop-blur-xs border-border/80">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
            <CardTitle>Coupon & Promo QR Configuration</CardTitle>
          </div>
          <Badge variant="outline" size="sm">
            {value.redeemUrl ? 'Online Checkout' : 'Text Card'}
          </Badge>
        </div>
        <CardDescription>
          Distribute promo discounts. If a redeem URL is supplied, the code is passed as a URL parameter; otherwise, a formatted coupon text card is generated.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="coupon-code">Coupon Code (Required)</FieldLabel>
            <span className="text-[10px] text-muted-foreground font-mono">{value.code.length} / 32</span>
          </div>
          <Input
            id="coupon-code"
            type="text"
            placeholder="e.g. SUMMER50 or FLASH_SALE_2026"
            value={value.code}
            onChange={(e) => updateFields({ ...value, code: e.target.value.toUpperCase() })}
            aria-invalid={hasError && !value.code.trim()}
            className="uppercase font-mono"
          />
          <FieldDescription>
            Uppercase alphanumeric characters, hyphens, and underscores only.
          </FieldDescription>
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="coupon-desc">Offer Description (Required)</FieldLabel>
            <span className="text-[10px] text-muted-foreground">{value.description.length} / 100</span>
          </div>
          <Input
            id="coupon-desc"
            type="text"
            placeholder="e.g. 50% discount on entire summer catalog"
            value={value.description}
            onChange={(e) => updateFields({ ...value, description: e.target.value })}
            aria-invalid={hasError && !value.description.trim()}
          />
          <FieldDescription>
            Briefly describe the promotion or discount for customers.
          </FieldDescription>
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="coupon-terms">Terms & Expiration (Optional)</FieldLabel>
            <span className="text-[10px] text-muted-foreground">{value.terms.length} / 200</span>
          </div>
          <Textarea
            id="coupon-terms"
            rows={2}
            placeholder="e.g. Valid until August 31, 2026. Limit 1 per customer. Cannot combine with other offers."
            value={value.terms}
            onChange={(e) => updateFields({ ...value, terms: e.target.value })}
            className="resize-none"
          />
          <FieldDescription>
            Optional terms, restrictions, or expiry dates.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="coupon-url">Redeem URL (Optional)</FieldLabel>
          <Input
            id="coupon-url"
            type="url"
            placeholder="https://shop.example.com/checkout"
            value={value.redeemUrl}
            onChange={(e) => updateFields({ ...value, redeemUrl: e.target.value })}
          />
          <FieldDescription>
            Optional link to your online checkout. If provided, the code will be attached as <code className="text-[11px] font-mono">?coupon={value.code || 'CODE'}</code>.
          </FieldDescription>
        </Field>

        {hasError && (
          <p className="text-destructive text-xs font-medium" role="alert">
            {validationResult.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
