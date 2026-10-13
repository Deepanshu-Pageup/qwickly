'use client';

import React from 'react';
import { Combobox, ComboboxInput, ComboboxPopup, ComboboxList, ComboboxItem, ComboboxEmpty } from '@/components/ui/combobox';
import { Country, getCountries } from '@/lib/countries';

interface CountryCodeSelectProps {
  /** ISO 3166-1 alpha-2 code of the selected country. */
  value: string;
  onChange: (iso: string) => void;
  id?: string;
  'aria-label'?: string;
}

const toLabel = (c: Country) => `${c.name} (+${c.dial})`;

/** Searchable country calling-code picker composed from the shared Coss UI Combobox. */
export function CountryCodeSelect({ value, onChange, id, 'aria-label': ariaLabel = 'Country code' }: CountryCodeSelectProps) {
  const countries = React.useMemo(() => getCountries(), []);
  const selected = countries.find((c) => c.iso === value) ?? null;

  return (
    <Combobox
      items={countries}
      value={selected}
      onValueChange={(next: Country | null) => {
        if (next) onChange(next.iso);
      }}
      itemToStringLabel={toLabel}
      isItemEqualToValue={(a: Country, b: Country) => a.iso === b.iso}
    >
      <ComboboxInput
        id={id}
        aria-label={ariaLabel}
        placeholder="Search country"
        showTrigger
        onFocus={(e) => e.currentTarget.select()}
      />
      <ComboboxPopup className="w-72">
        <ComboboxEmpty>No country found.</ComboboxEmpty>
        <ComboboxList>
          {(c: Country) => (
            <ComboboxItem key={c.iso} value={c}>
              <span className="flex items-center justify-between gap-3">
                <span className="truncate">{c.name}</span>
                <span className="font-mono text-xs text-muted-foreground">+{c.dial}</span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}
