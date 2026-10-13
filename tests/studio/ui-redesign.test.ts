import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildInternationalPhone,
  sanitizeNationalNumber,
  findCountry,
  getCountries,
  guessCountryFromLocale,
} from '../../src/lib/countries';
import { whatsappPayloadSchema } from '../../src/schemas/qr-payload';
import { socialPayloadSchema } from '../../src/schemas/payload/social';
import { appPayloadSchema } from '../../src/schemas/payload/app';
import { couponPayloadSchema } from '../../src/schemas/payload/coupon';
import * as barrel from '../../src/schemas/qr-payload';

describe('Country code selector helpers', () => {
  it('lists countries with dial codes and finds known ones', () => {
    assert.ok(getCountries().length > 150);
    assert.equal(findCountry('IN').dial, '91');
    assert.equal(findCountry('US').dial, '1');
  });

  it('falls back to +1 for unknown countries and locales', () => {
    assert.equal(findCountry('ZZ').dial, '1');
    assert.equal(guessCountryFromLocale('en-IN'), 'IN');
    assert.equal(guessCountryFromLocale('en'), 'US');
    assert.equal(guessCountryFromLocale(undefined), 'US');
    assert.equal(guessCountryFromLocale('xx-ZZ'), 'US');
  });

  it('combines code and number without spaces or duplicate plus signs', () => {
    assert.equal(buildInternationalPhone('91', '98765 43210'), '+919876543210');
    assert.equal(buildInternationalPhone('1', '(555) 019-2834'), '+15550192834');
    assert.equal(buildInternationalPhone('91', '+91 98765 43210'), '+919876543210');
    assert.equal(buildInternationalPhone('44', '07911 123456'), '+447911123456');
    assert.equal(buildInternationalPhone('1', ''), '');
  });

  it('caps the national number so code + number never exceeds 15 digits', () => {
    assert.equal(sanitizeNationalNumber('91', '1'.repeat(30)).length, 13);
    assert.equal(sanitizeNationalNumber('1', '1'.repeat(30)).length, 14);
  });

  it('produces a wa.me link from the combined number', () => {
    const result = whatsappPayloadSchema.safeParse({
      phone: buildInternationalPhone('91', '98765 43210'),
      message: '',
    });
    assert.ok(result.success);
    assert.equal(result.data, 'https://wa.me/919876543210');
  });
});

describe('Input length limits (validation layer)', () => {
  it('rejects over-long social and app inputs', () => {
    const long = 'a'.repeat(2049);
    assert.equal(socialPayloadSchema.safeParse({ platform: 'custom', input: long }).success, false);
    assert.equal(appPayloadSchema.safeParse({ platform: 'android', input: long }).success, false);
  });

  it('rejects an over-long redeem URL and message', () => {
    const base = { code: 'SAVE', description: 'Deal', terms: '' };
    assert.equal(
      couponPayloadSchema.safeParse({ ...base, redeemUrl: `https://a.com/${'x'.repeat(2100)}` }).success,
      false,
    );
    assert.equal(whatsappPayloadSchema.safeParse({ phone: '+15550192834', message: 'm'.repeat(501) }).success, false);
  });

  it('still accepts maximum-length valid input', () => {
    assert.ok(whatsappPayloadSchema.safeParse({ phone: '+15550192834', message: 'm'.repeat(500) }).success);
    assert.ok(couponPayloadSchema.safeParse({ code: 'A'.repeat(32), description: 'd'.repeat(100), terms: 't'.repeat(200), redeemUrl: 'https://shop.example.com' }).success);
  });
});

describe('Per-type schema modules', () => {
  it('re-exports every payload schema from the barrel', () => {
    for (const name of [
      'normalizeWebUrl',
      'linkPayloadSchema',
      'textPayloadSchema',
      'whatsappPayloadSchema',
      'socialPayloadSchema',
      'mapPayloadSchema',
      'couponPayloadSchema',
      'appPayloadSchema',
      'pdfPayloadSchema',
      'imagePayloadSchema',
    ]) {
      assert.ok(name in barrel, `${name} missing from qr-payload barrel`);
    }
  });
});
