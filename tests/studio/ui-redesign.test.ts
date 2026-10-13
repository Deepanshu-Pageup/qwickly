import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildInternationalPhone,
  sanitizeNationalNumber,
  findCountry,
  getCountries,
  guessCountryFromLocale,
} from '../../src/lib/countries';
import { whatsappPayloadSchema, type SocialPlatform } from '../../src/schemas/qr-payload';
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

  it('falls back to India (+91) for unknown countries and locales', () => {
    assert.equal(findCountry('ZZ').dial, '91');
    assert.equal(guessCountryFromLocale('en-IN'), 'IN');
    assert.equal(guessCountryFromLocale('en'), 'IN');
    assert.equal(guessCountryFromLocale(undefined), 'IN');
    assert.equal(guessCountryFromLocale('xx-ZZ'), 'IN');
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

describe('Social media: usernames, profile links and post links', () => {
  const ok = (platform: SocialPlatform, input: string) => {
    const r = socialPayloadSchema.safeParse({ platform, input });
    assert.ok(r.success, `${platform}: ${input}`);
    return r.data;
  };

  it('still normalizes usernames and profile links', () => {
    assert.equal(ok('instagram', '@johndoe'), 'https://instagram.com/johndoe/');
    assert.equal(ok('instagram', 'https://www.instagram.com/johndoe/'), 'https://instagram.com/johndoe/');
  });

  it('accepts post and content links for every platform', () => {
    assert.equal(ok('instagram', 'https://www.instagram.com/p/CxYz123AbC/'), 'https://www.instagram.com/p/CxYz123AbC/');
    assert.equal(ok('x', 'https://x.com/jack/status/20'), 'https://x.com/jack/status/20');
    assert.equal(ok('x', 'https://twitter.com/jack/status/20'), 'https://twitter.com/jack/status/20');
    assert.equal(ok('youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.equal(ok('youtube', 'https://youtu.be/dQw4w9WgXcQ'), 'https://youtu.be/dQw4w9WgXcQ');
    assert.equal(ok('facebook', 'https://www.facebook.com/brand/posts/12345'), 'https://www.facebook.com/brand/posts/12345');
    assert.equal(ok('tiktok', 'https://www.tiktok.com/@user/video/7300000000000000000'), 'https://www.tiktok.com/@user/video/7300000000000000000');
    assert.equal(ok('linkedin', 'https://www.linkedin.com/posts/jane-doe_activity-123'), 'https://www.linkedin.com/posts/jane-doe_activity-123');
    assert.equal(ok('github', 'https://github.com/vercel/next.js'), 'https://github.com/vercel/next.js');
    assert.equal(ok('linkedin', 'https://lnkd.in/p/d2TGCxKz'), 'https://lnkd.in/p/d2TGCxKz');
  });

  it('upgrades http post links to https and rejects other hosts and bare domains', () => {
    assert.equal(ok('x', 'http://x.com/jack/status/20'), 'https://x.com/jack/status/20');
    assert.equal(socialPayloadSchema.safeParse({ platform: 'instagram', input: 'https://evil.com/p/abc' }).success, false);
    assert.equal(socialPayloadSchema.safeParse({ platform: 'instagram', input: 'https://instagram.com/' }).success, false);
  });
});
