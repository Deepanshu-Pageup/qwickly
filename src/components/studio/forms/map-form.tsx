'use client';

import React from 'react';
import { mapPayloadSchema, MapPayloadInput } from '@/schemas/qr-payload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    <Card className="rounded-2xl bg-card/90 backdrop-blur-xs border-border/80">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
            <CardTitle>Map Address QR Configuration</CardTitle>
          </div>
          <Badge variant="outline" size="sm">
            {value.mode === 'address' ? 'Address Search' : 'GPS Coordinates'}
          </Badge>
        </div>
        <CardDescription>
          Provide a street address or GPS coordinates that immediately open in Google Maps navigation.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-5">
        <Field>
          <FieldLabel>Location Input Mode</FieldLabel>
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant={value.mode === 'address' ? 'default' : 'outline'}
              onClick={() => updateFields({ ...value, mode: 'address' })}
              className="text-xs"
            >
              Address & Places
            </Button>
            <Button
              type="button"
              size="sm"
              variant={value.mode === 'coordinates' ? 'default' : 'outline'}
              onClick={() => updateFields({ ...value, mode: 'coordinates' })}
              className="text-xs"
            >
              GPS Coordinates (Lat / Lng)
            </Button>
          </div>
        </Field>

        {value.mode === 'address' ? (
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="map-address">Street Address or Place Name</FieldLabel>
              <span className="text-[10px] text-muted-foreground">{value.addressQuery.length} / 300</span>
            </div>
            <Input
              id="map-address"
              type="text"
              placeholder="e.g. 1600 Amphitheatre Pkwy, Mountain View, CA"
              value={value.addressQuery}
              onChange={(e) => updateFields({ ...value, addressQuery: e.target.value })}
              aria-invalid={hasError}
              className={hasError ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            <FieldDescription>
              Enter a full business address, landmark, or street name.
            </FieldDescription>
            {hasError && <FieldError>{validationResult.error}</FieldError>}
          </Field>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="map-lat">Latitude</FieldLabel>
                <Input
                  id="map-lat"
                  type="text"
                  placeholder="e.g. 37.422004"
                  value={value.latitude}
                  onChange={(e) => updateFields({ ...value, latitude: e.target.value })}
                  aria-invalid={hasError}
                  className={hasError ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                <FieldDescription>-90 to 90 degrees</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="map-lng">Longitude</FieldLabel>
                <Input
                  id="map-lng"
                  type="text"
                  placeholder="e.g. -122.084095"
                  value={value.longitude}
                  onChange={(e) => updateFields({ ...value, longitude: e.target.value })}
                  aria-invalid={hasError}
                  className={hasError ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                <FieldDescription>-180 to 180 degrees</FieldDescription>
              </Field>
            </div>
            {hasError && (
              <p className="text-destructive text-xs font-medium" role="alert">
                {validationResult.error}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
