import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  whatsappPayloadSchema,
  socialPayloadSchema,
  mapPayloadSchema,
  couponPayloadSchema,
  appPayloadSchema,
  pdfPayloadSchema,
  imagePayloadSchema,
  hasPdfExtension,
  hasImageExtension,
} from '../../src/schemas/qr-payload';

describe('Checkpoint 1: Remaining QR Types Payload Schemas & Contracts', () => {
  // ==========================================================================
  // 1. WhatsApp Contract Suite
  // ==========================================================================
  describe('WhatsApp Payload Schema', () => {
    it('normalizes formatted phone number with spaces, hyphens, and parens to wa.me URL', () => {
      const parsed = whatsappPayloadSchema.safeParse({
        phone: '+1 (555) 019-2834',
        message: '',
      });
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data, 'https://wa.me/15550192834');
      }
    });

    it('correctly trims and encodes pre-filled message as a URL query parameter', () => {
      const parsed = whatsappPayloadSchema.safeParse({
        phone: '+44 7911 123456',
        message: '  Hello from Qwikly QR! Let\'s chat?  ',
      });
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(
          parsed.data,
          'https://wa.me/447911123456?text=Hello%20from%20Qwikly%20QR!%20Let\'s%20chat%3F'
        );
      }
    });

    it('omits text parameter when message is empty or whitespace only', () => {
      const parsed = whatsappPayloadSchema.safeParse({
        phone: '919876543210',
        message: '   \n  \t ',
      });
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data, 'https://wa.me/919876543210');
      }
    });

    it('rejects letters and unsupported symbols rather than silently stripping them', () => {
      const invalidPhones = ['+1 (555) CALL-ME', '1234abc5678', '44#7911*123'];
      for (const phone of invalidPhones) {
        const parsed = whatsappPayloadSchema.safeParse({ phone });
        assert.equal(parsed.success, false, `Expected ${phone} to be rejected`);
      }
    });

    it('rejects international numbers starting with a leading zero', () => {
      const parsed = whatsappPayloadSchema.safeParse({ phone: '0447911123456' });
      assert.equal(parsed.success, false);
      if (!parsed.success) {
        assert.match(parsed.error.issues[0]?.message, /leading zero/);
      }
    });

    it('rejects phone numbers with fewer than 7 or more than 15 digits', () => {
      const short = whatsappPayloadSchema.safeParse({ phone: '123456' });
      assert.equal(short.success, false);

      const long = whatsappPayloadSchema.safeParse({ phone: '1234567890123456' });
      assert.equal(long.success, false);
    });
  });

  // ==========================================================================
  // 2. Social Media Contract Suite
  // ==========================================================================
  describe('Social Media Payload Schema', () => {
    it('normalizes handles for standard platforms with correct canonical output', () => {
      const cases = [
        { platform: 'instagram' as const, input: '@johndoe', expected: 'https://instagram.com/johndoe/' },
        { platform: 'x' as const, input: 'twitter_user', expected: 'https://x.com/twitter_user' },
        { platform: 'linkedin' as const, input: 'jane-doe-123', expected: 'https://linkedin.com/in/jane-doe-123/' },
        { platform: 'youtube' as const, input: '@creator_channel', expected: 'https://youtube.com/@creator_channel' },
        { platform: 'facebook' as const, input: 'brand.official', expected: 'https://facebook.com/brand.official' },
        { platform: 'tiktok' as const, input: '@trend_creator', expected: 'https://tiktok.com/@trend_creator' },
        { platform: 'github' as const, input: 'octocat-dev', expected: 'https://github.com/octocat-dev' },
      ];

      for (const c of cases) {
        const parsed = socialPayloadSchema.safeParse({ platform: c.platform, input: c.input });
        assert.equal(parsed.success, true, `Failed for ${c.platform}: ${c.input}`);
        if (parsed.success) {
          assert.equal(parsed.data, c.expected);
        }
      }
    });

    it('parses full profile URLs and verifies platform hostname before extracting handle', () => {
      const parsed = socialPayloadSchema.safeParse({
        platform: 'instagram',
        input: 'https://www.instagram.com/nature.photographer/',
      });
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data, 'https://instagram.com/nature.photographer/');
      }
    });

    it('rejects unrelated hostnames for social platforms', () => {
      const parsed = socialPayloadSchema.safeParse({
        platform: 'instagram',
        input: 'https://google.com/johndoe',
      });
      assert.equal(parsed.success, false);
      if (!parsed.success) {
        assert.match(parsed.error.issues[0]?.message, /does not belong to Instagram/);
      }
    });

    it('strictly normalizes custom web URLs and rejects invalid protocols', () => {
      const validCustom = socialPayloadSchema.safeParse({
        platform: 'custom',
        input: 'linktr.ee/mybrand?ref=qr',
      });
      assert.equal(validCustom.success, true);
      if (validCustom.success) {
        assert.equal(validCustom.data, 'https://linktr.ee/mybrand?ref=qr');
      }

      const invalidCustom = socialPayloadSchema.safeParse({
        platform: 'custom',
        input: 'javascript:alert(1)',
      });
      assert.equal(invalidCustom.success, false);
    });
  });

  // ==========================================================================
  // 3. Map Address Contract Suite
  // ==========================================================================
  describe('Map Address Payload Schema', () => {
    it('constructs safe Google Maps URL for address query using URLSearchParams', () => {
      const parsed = mapPayloadSchema.safeParse({
        mode: 'address',
        query: '1600 Amphitheatre Pkwy, Mountain View, CA 94043',
      });
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(
          parsed.data,
          'https://www.google.com/maps/search/?api=1&query=1600+Amphitheatre+Pkwy%2C+Mountain+View%2C+CA+94043'
        );
      }
    });

    it('constructs safe Google Maps URL for coordinates with 6-decimal precision', () => {
      const parsed = mapPayloadSchema.safeParse({
        mode: 'coordinates',
        latitude: 37.422004123,
        longitude: -122.084095999,
      });
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(
          parsed.data,
          'https://www.google.com/maps/search/?api=1&query=37.422004%2C-122.084096'
        );
      }
    });

    it('rejects coordinates outside permitted bounds [-90, 90] and [-180, 180]', () => {
      const badLat = mapPayloadSchema.safeParse({
        mode: 'coordinates',
        latitude: 91,
        longitude: 0,
      });
      assert.equal(badLat.success, false);

      const badLng = mapPayloadSchema.safeParse({
        mode: 'coordinates',
        latitude: 0,
        longitude: -185,
      });
      assert.equal(badLng.success, false);
    });
  });

  // ==========================================================================
  // 4. Coupon Contract Suite
  // ==========================================================================
  describe('Coupon Payload Schema', () => {
    it('normalizes coupon code to uppercase and produces deterministic multiline plain text without redeem URL', () => {
      const parsed = couponPayloadSchema.safeParse({
        code: 'save_20-off',
        description: '20% discount on all spring items',
        terms: 'Valid until May 1st. One per customer.',
      });
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(
          parsed.data,
          'COUPON: SAVE_20-OFF\nOFFER: 20% discount on all spring items\nTERMS: Valid until May 1st. One per customer.'
        );
      }
    });

    it('omits terms line when terms are empty', () => {
      const parsed = couponPayloadSchema.safeParse({
        code: 'WELCOME10',
        description: '$10 off first order',
      });
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data, 'COUPON: WELCOME10\nOFFER: $10 off first order');
      }
    });

    it('appends coupon parameter using URL APIs when redeem URL is supplied', () => {
      const parsed = couponPayloadSchema.safeParse({
        code: 'FLASH50',
        description: 'Flash sale 50% discount',
        redeemUrl: 'https://shop.example.com/checkout?ref=campaign#cart',
      });
      assert.equal(parsed.success, true);
      if (parsed.success) {
        const url = new URL(parsed.data);
        assert.equal(url.searchParams.get('coupon'), 'FLASH50');
        assert.equal(url.searchParams.get('ref'), 'campaign');
        assert.equal(url.hash, '#cart');
      }
    });

    it('overwrites duplicate coupon parameter deterministically when redeem URL already has one', () => {
      const parsed = couponPayloadSchema.safeParse({
        code: 'NEWCODE',
        description: 'Updated discount',
        redeemUrl: 'https://shop.example.com/checkout?coupon=OLDCODE',
      });
      assert.equal(parsed.success, true);
      if (parsed.success) {
        const url = new URL(parsed.data);
        assert.equal(url.searchParams.get('coupon'), 'NEWCODE');
      }
    });

    it('prevents line break injection in description and terms', () => {
      const parsed = couponPayloadSchema.safeParse({
        code: 'CLEAN',
        description: 'Line 1\r\nLine 2',
        terms: 'Terms 1\nTerms 2',
      });
      assert.equal(parsed.success, true);
      if (parsed.success) {
        const lines = parsed.data.split('\n');
        assert.equal(lines.length, 3);
        assert.equal(lines[1], 'OFFER: Line 1 Line 2');
        assert.equal(lines[2], 'TERMS: Terms 1 Terms 2');
      }
    });
  });

  // ==========================================================================
  // 5. App Link Contract Suite
  // ==========================================================================
  describe('App Link Payload Schema', () => {
    it('normalizes numeric Apple App ID and extracts from official URL', () => {
      const fromId = appPayloadSchema.safeParse({
        platform: 'ios',
        input: '1234567890',
      });
      assert.equal(fromId.success, true);
      if (fromId.success) {
        assert.equal(fromId.data, 'https://apps.apple.com/app/id1234567890');
      }

      const fromUrl = appPayloadSchema.safeParse({
        platform: 'ios',
        input: 'https://apps.apple.com/us/app/qwikly-pro/id987654321',
      });
      assert.equal(fromUrl.success, true);
      if (fromUrl.success) {
        assert.equal(fromUrl.data, 'https://apps.apple.com/app/id987654321');
      }
    });

    it('normalizes Google Play package name and extracts from official URL', () => {
      const fromPkg = appPayloadSchema.safeParse({
        platform: 'android',
        input: 'com.example.awesomeapp',
      });
      assert.equal(fromPkg.success, true);
      if (fromPkg.success) {
        assert.equal(fromPkg.data, 'https://play.google.com/store/apps/details?id=com.example.awesomeapp');
      }

      const fromUrl = appPayloadSchema.safeParse({
        platform: 'android',
        input: 'https://play.google.com/store/apps/details?id=org.qwikly.client&hl=en',
      });
      assert.equal(fromUrl.success, true);
      if (fromUrl.success) {
        assert.equal(fromUrl.data, 'https://play.google.com/store/apps/details?id=org.qwikly.client');
      }
    });

    it('rejects unrelated domains for store URLs', () => {
      const fakeApple = appPayloadSchema.safeParse({
        platform: 'ios',
        input: 'https://phishing.com/app/id1234567890',
      });
      assert.equal(fakeApple.success, false);

      const fakeGoogle = appPayloadSchema.safeParse({
        platform: 'android',
        input: 'https://notgoogle.com/store?id=com.app',
      });
      assert.equal(fakeGoogle.success, false);
    });
  });

  // ==========================================================================
  // 6. PDF & Image Direct URL Contract Suite
  // ==========================================================================
  describe('PDF & Image Direct URL Payload Schemas', () => {
    it('validates HTTPS PDF URL and preserves presigned query tokens and hashes', () => {
      const parsed = pdfPayloadSchema.safeParse(
        'https://s3.amazonaws.com/bucket/doc.pdf?X-Amz-Signature=abc123token&expires=3600#page=5'
      );
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(
          parsed.data,
          'https://s3.amazonaws.com/bucket/doc.pdf?X-Amz-Signature=abc123token&expires=3600#page=5'
        );
      }
    });

    it('rejects non-HTTPS protocols for PDF direct URLs', () => {
      const http = pdfPayloadSchema.safeParse('http://example.com/doc.pdf');
      assert.equal(http.success, false);
      if (!http.success) {
        assert.match(http.error.issues[0]?.message, /HTTPS/);
      }
    });

    it('validates HTTPS Image URL and preserves query tokens', () => {
      const parsed = imagePayloadSchema.safeParse(
        'https://cdn.example.com/assets/banner.png?v=2&w=800'
      );
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data, 'https://cdn.example.com/assets/banner.png?v=2&w=800');
      }
    });

    it('inspects URL pathname accurately in extension helpers', () => {
      assert.equal(hasPdfExtension('https://example.com/docs/annual-report.pdf?token=123'), true);
      assert.equal(hasPdfExtension('https://example.com/docs/annual-report.html?pdf=true'), false);

      assert.equal(hasImageExtension('https://example.com/img/photo.JPEG?size=large'), true);
      assert.equal(hasImageExtension('https://example.com/img/vector.svg#icon'), true);
      assert.equal(hasImageExtension('https://example.com/api/get-image?format=png'), false);
    });
  });
});
