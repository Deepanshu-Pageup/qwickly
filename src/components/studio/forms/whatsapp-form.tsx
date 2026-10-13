'use client';

import React from 'react';
import { whatsappPayloadSchema } from '@/schemas/qr-payload';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  buildInternationalPhone,
  findCountry,
  guessCountryFromLocale,
  sanitizeNationalNumber,
} from '@/lib/countries';
import { FormSection, CharCounter } from './form-section';
import { CountryCodeSelect } from './country-code-select';

export interface WhatsAppFormValue {
  /** ISO 3166-1 alpha-2 code driving the calling-code prefix. */
  country: string;
  /** National number as typed by the user (digits only, no calling code). */
  phone: string;
  message: string;
}

interface WhatsAppFormProps {
  value: WhatsAppFormValue;
  onChange: (value: WhatsAppFormValue, encodedOutput: string | null, isValid: boolean) => void;
}

const MAX_MESSAGE_LENGTH = 500;

export function WhatsAppForm({ value, onChange }: WhatsAppFormProps) {
  const [touched, setTouched] = React.useState(false);
  const dial = findCountry(value.country).dial;
  const maxNationalDigits = 15 - dial.length;

  // Pre-select the visitor's likely country once, only while the form is still pristine.
  const didGuessCountry = React.useRef(false);
  React.useEffect(() => {
    if (didGuessCountry.current) return;
    didGuessCountry.current = true;
    if (value.phone || value.message) return;
    const guess = guessCountryFromLocale(typeof navigator !== 'undefined' ? navigator.language : undefined);
    if (guess !== value.country) {
      onChange({ ...value, country: guess }, null, false);
    }
    // Runs once on mount; `value`/`onChange` are intentionally read at that moment only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toPayload = (next: WhatsAppFormValue) => ({
    phone: buildInternationalPhone(findCountry(next.country).dial, next.phone),
    message: next.message,
  });

  const validationResult = React.useMemo(() => {
    if (!value.phone.trim()) {
      return { success: false as const, error: 'Please enter a phone number' };
    }
    const result = whatsappPayloadSchema.safeParse({
      phone: buildInternationalPhone(dial, value.phone),
      message: value.message,
    });
    if (result.success) {
      return { success: true as const, error: null };
    }
    const issue = result.error.issues[0];
    return {
      success: false as const,
      error: issue ? issue.message : 'Invalid phone number format',
    };
  }, [value, dial]);

  const updateFields = (next: WhatsAppFormValue) => {
    if (!touched) setTouched(true);
    const result = whatsappPayloadSchema.safeParse(toPayload(next));
    if (result.success) {
      onChange(next, result.data, true);
    } else {
      onChange(next, null, false);
    }
  };

  const hasPhoneError = touched && !validationResult.success;

  return (
    <FormSection title="Content" tag="WhatsApp">
      <Field>
        <FieldLabel htmlFor="whatsapp-phone">Phone number</FieldLabel>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
          <CountryCodeSelect
            id="whatsapp-country"
            aria-label="Country calling code"
            value={value.country}
            onChange={(country) => {
              const nextDial = findCountry(country).dial;
              updateFields({ ...value, country, phone: sanitizeNationalNumber(nextDial, value.phone) });
            }}
          />
          <Input
            id="whatsapp-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            // Digits are hard-capped by sanitizeNationalNumber; the extra room lets a pasted
            // "+91 98765 43210" through before it is normalised.
            maxLength={maxNationalDigits + 8}
            placeholder="Phone number"
            value={value.phone}
            onChange={(e) =>
              updateFields({ ...value, phone: sanitizeNationalNumber(dial, e.target.value) })
            }
            onBlur={() => value.phone && setTouched(true)}
            aria-invalid={hasPhoneError}
            aria-describedby={hasPhoneError ? 'whatsapp-phone-error' : 'whatsapp-phone-desc'}
          />
        </div>
        {hasPhoneError ? (
          <FieldError match id="whatsapp-phone-error">{validationResult.error}</FieldError>
        ) : (
          <FieldDescription id="whatsapp-phone-desc">
            Opens a chat with +{dial} followed by this number. We check the format only, not whether the number is on WhatsApp.
          </FieldDescription>
        )}
      </Field>

      <Field>
        <div className="flex w-full items-center justify-between">
          <FieldLabel htmlFor="whatsapp-message">Pre-filled message (optional)</FieldLabel>
          <CharCounter length={value.message.length} max={MAX_MESSAGE_LENGTH} />
        </div>
        <Textarea
          id="whatsapp-message"
          rows={3}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Hi! I scanned your QR code and would like to know more."
          value={value.message}
          onChange={(e) =>
            updateFields({ ...value, message: e.target.value.slice(0, MAX_MESSAGE_LENGTH) })
          }
          className="resize-none"
        />
      </Field>
    </FormSection>
  );
}
