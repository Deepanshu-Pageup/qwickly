'use client';

import React from 'react';
import { whatsappPayloadSchema } from '@/schemas/qr-payload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export interface WhatsAppFormValue {
  phone: string;
  message: string;
}

interface WhatsAppFormProps {
  value: WhatsAppFormValue;
  onChange: (value: WhatsAppFormValue, encodedOutput: string | null, isValid: boolean) => void;
}

export function WhatsAppForm({ value, onChange }: WhatsAppFormProps) {
  const [touched, setTouched] = React.useState(false);

  const validationResult = React.useMemo(() => {
    if (!value.phone.trim()) {
      return { success: false as const, error: 'Please enter a phone number with country code' };
    }
    const result = whatsappPayloadSchema.safeParse(value);
    if (result.success) {
      return { success: true as const, error: null, normalized: result.data };
    }
    const issue = result.error.issues[0];
    return {
      success: false as const,
      error: issue ? issue.message : 'Invalid phone number format',
      normalized: null,
    };
  }, [value]);

  const updateFields = (phone: string, message: string) => {
    if (!touched) setTouched(true);
    const nextVal = { phone, message };
    const result = whatsappPayloadSchema.safeParse(nextVal);
    if (result.success) {
      onChange(nextVal, result.data, true);
    } else {
      onChange(nextVal, null, false);
    }
  };

  const hasPhoneError = touched && !validationResult.success;
  const isMessageOverLimit = value.message.length > 500;

  return (
    <Card className="rounded-2xl bg-card/90 backdrop-blur-xs border-border/80">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
            <CardTitle>WhatsApp QR Configuration</CardTitle>
          </div>
          <Badge variant="outline" size="sm">
            Direct Chat
          </Badge>
        </div>
        <CardDescription>
          Generate a direct wa.me link that launches a WhatsApp chat with your phone number and optional message.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="whatsapp-phone">Phone Number (with Country Code)</FieldLabel>
            <span className="text-[10px] text-muted-foreground">E.164 (7–15 digits)</span>
          </div>
          <Input
            id="whatsapp-phone"
            type="tel"
            placeholder="+1 (555) 019-2834 or 44 7911 123456"
            value={value.phone}
            onChange={(e) => updateFields(e.target.value, value.message)}
            aria-invalid={hasPhoneError}
            className={hasPhoneError ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          <FieldDescription>
            Include your full international country code without leading zeroes. Note: syntax validation does not verify registration on WhatsApp.
          </FieldDescription>
          {hasPhoneError && <FieldError>{validationResult.error}</FieldError>}
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="whatsapp-message">Pre-filled Message (Optional)</FieldLabel>
            <span
              className={`font-mono text-[10px] ${
                isMessageOverLimit ? 'text-destructive font-bold' : 'text-muted-foreground'
              }`}
            >
              {value.message.length} / 500
            </span>
          </div>
          <Textarea
            id="whatsapp-message"
            rows={3}
            placeholder="Hi! I scanned your QR code and would like to learn more about..."
            value={value.message}
            onChange={(e) => updateFields(value.phone, e.target.value)}
            className="resize-none"
          />
          <FieldDescription>
            This message will be automatically filled into the chat box when the user scans your code.
          </FieldDescription>
        </Field>
      </CardContent>
    </Card>
  );
}
