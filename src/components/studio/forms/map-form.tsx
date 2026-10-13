'use client';

import React from 'react';
import { mapPayloadSchema, MapPayloadInput } from '@/schemas/qr-payload';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { FormSection } from './form-section';
import { OptionGroup } from './option-group';

export interface MapFormValue {
  mode: 'address' | 'coordinates';
  addressQuery: string;
  latitude: string;
  longitude: string;
}

interface MapFormProps {
  value: MapFormValue;
  onChange: (value: MapFormValue, encodedOutput: string | null, isValid: boolean) => void;
}

const MAX_ADDRESS_LENGTH = 300;
/** Longest valid coordinate, e.g. "-122.084095", with headroom for extra decimals. */
const MAX_COORDINATE_LENGTH = 20;

const MODES: ReadonlyArray<{ id: MapFormValue['mode']; label: string }> = [
  { id: 'address', label: 'Address or place' },
  { id: 'coordinates', label: 'GPS coordinates' },
];

export function MapForm({ value, onChange }: MapFormProps) {
  const [touched, setTouched] = React.useState(false);

  const getPayloadInput = (val: MapFormValue): MapPayloadInput => {
    if (val.mode === 'address') {
      return { mode: 'address', query: val.addressQuery };
    }
    const latNum = parseFloat(val.latitude);
    const lngNum = parseFloat(val.longitude);
    return {
      mode: 'coordinates',
      latitude: isNaN(latNum) ? -999 : latNum,
      longitude: isNaN(lngNum) ? -999 : lngNum,
    };
  };

  const validationResult = React.useMemo(() => {
    if (value.mode === 'address' && !value.addressQuery.trim()) {
      return { success: false as const, error: 'Please enter a location address or place name' };
    }
    if (value.mode === 'coordinates' && (!value.latitude.trim() || !value.longitude.trim())) {
      return { success: false as const, error: 'Please enter both latitude and longitude values' };
    }

    const payloadInput = getPayloadInput(value);
    const result = mapPayloadSchema.safeParse(payloadInput);
    if (result.success) {
      return { success: true as const, error: null, normalized: result.data };
    }
    const issue = result.error.issues[0];
    return {
      success: false as const,
      error: issue ? issue.message : 'Invalid location values',
      normalized: null,
    };
  }, [value]);

  const updateFields = (nextVal: MapFormValue) => {
    if (!touched) setTouched(true);
    const payloadInput = getPayloadInput(nextVal);
    const result = mapPayloadSchema.safeParse(payloadInput);
    if (result.success) {
      onChange(nextVal, result.data, true);
    } else {
      onChange(nextVal, null, false);
    }
  };

  const hasError = touched && !validationResult.success;

  return (
    <FormSection title="Content" tag="Map Address">
      <Field>
        <FieldLabel>Location type</FieldLabel>
        <OptionGroup
          label="Location input mode"
          value={value.mode}
          options={MODES}
          onChange={(mode) => updateFields({ ...value, mode })}
        />
      </Field>

      {value.mode === 'address' ? (
        <Field>
          <FieldLabel htmlFor="map-address">Address or place name</FieldLabel>
          <Input
            id="map-address"
            type="text"
            maxLength={MAX_ADDRESS_LENGTH}
            placeholder="1600 Amphitheatre Pkwy, Mountain View, CA"
            value={value.addressQuery}
            onChange={(e) =>
              updateFields({ ...value, addressQuery: e.target.value.slice(0, MAX_ADDRESS_LENGTH) })
            }
            onBlur={() => value.addressQuery && setTouched(true)}
            aria-invalid={hasError}
            aria-describedby={hasError ? 'map-error' : 'map-desc'}
          />
          {hasError ? (
            <FieldError match id="map-error">{validationResult.error}</FieldError>
          ) : (
            <FieldDescription id="map-desc">
              A business address, landmark, or street. Opens in Google Maps.
            </FieldDescription>
          )}
        </Field>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="map-lat">Latitude</FieldLabel>
              <Input
                id="map-lat"
                type="text"
                inputMode="decimal"
                maxLength={MAX_COORDINATE_LENGTH}
                placeholder="37.422004"
                value={value.latitude}
                onChange={(e) =>
                  updateFields({ ...value, latitude: e.target.value.slice(0, MAX_COORDINATE_LENGTH) })
                }
                onBlur={() => value.latitude && setTouched(true)}
                aria-invalid={hasError}
                aria-describedby={hasError ? 'map-error' : undefined}
              />
              <FieldDescription>-90 to 90</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="map-lng">Longitude</FieldLabel>
              <Input
                id="map-lng"
                type="text"
                inputMode="decimal"
                maxLength={MAX_COORDINATE_LENGTH}
                placeholder="-122.084095"
                value={value.longitude}
                onChange={(e) =>
                  updateFields({ ...value, longitude: e.target.value.slice(0, MAX_COORDINATE_LENGTH) })
                }
                onBlur={() => value.longitude && setTouched(true)}
                aria-invalid={hasError}
                aria-describedby={hasError ? 'map-error' : undefined}
              />
              <FieldDescription>-180 to 180</FieldDescription>
            </Field>
          </div>
          {hasError && (
            <p id="map-error" className="text-xs font-medium text-destructive-foreground" role="alert">
              {validationResult.error}
            </p>
          )}
        </div>
      )}
    </FormSection>
  );
}
