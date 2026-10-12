import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { linkPayloadSchema, textPayloadSchema } from '../../src/schemas/qr-payload';

describe('Sub-phase 2.2: Payload Validation & Normalization Suite', () => {
  describe('Group A: Link Payload Normalization & Output Transforms', () => {
    it('normalizes a scheme-less URL to HTTPS with trailing slash', () => {
      const parsed = linkPayloadSchema.safeParse('example.com');
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data, 'https://example.com/');
      }
    });

    it('normalizes a scheme-less URL with path and query parameters', () => {
      const parsed = linkPayloadSchema.safeParse('pageupsoft.com/products?ref=qr&v=2');
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data, 'https://pageupsoft.com/products?ref=qr&v=2');
      }
    });

    it('preserves an explicit HTTPS scheme', () => {
      const parsed = linkPayloadSchema.safeParse('https://secure.example.com/checkout');
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data, 'https://secure.example.com/checkout');
      }
    });

    it('preserves an explicit HTTP scheme', () => {
      const parsed = linkPayloadSchema.safeParse('http://legacy.example.com/api');
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data, 'http://legacy.example.com/api');
      }
    });

    it('rejects unsupported protocols (ftp, file, javascript, mailto)', () => {
      const protocols = [
        'ftp://files.example.com',
        'file:///C:/local/path',
        'javascript:alert(1)',
        'mailto:user@example.com',
      ];

      for (const protoUrl of protocols) {
        const parsed = linkPayloadSchema.safeParse(protoUrl);
        assert.equal(parsed.success, false, `Expected ${protoUrl} to be rejected`);
        if (!parsed.success) {
          assert.equal(
            parsed.error.issues[0]?.message,
            'Only HTTP and HTTPS web URLs are supported'
          );
        }
      }
    });

    it('rejects empty or whitespace-only inputs', () => {
      const emptyInputs = ['', '   ', '\t\n'];
      for (const input of emptyInputs) {
        const parsed = linkPayloadSchema.safeParse(input);
        assert.equal(parsed.success, false);
      }
    });

    it('rejects malformed hostnames', () => {
      const malformed = ['https://', 'http://', 'http://.com'];
      for (const input of malformed) {
        const parsed = linkPayloadSchema.safeParse(input);
        assert.equal(parsed.success, false);
      }
    });

    it('rejects URLs exceeding 2048 characters', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2050);
      const parsed = linkPayloadSchema.safeParse(longUrl);
      assert.equal(parsed.success, false);
    });
  });

  describe('Group B: Plain-Text Byte-Exact Preservation', () => {
    it('preserves plain text exact byte-for-byte including whitespace and newlines', () => {
      const sampleText = '  Leading and trailing spaces  \nLine 2 with tab:\tvalue\n\nLine 4.';
      const parsed = textPayloadSchema.safeParse(sampleText);
      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data, sampleText);
      }
    });

    it('rejects empty or whitespace-only text inputs', () => {
      const whitespaceInputs = ['', '   ', '\n\n\t  '];
      for (const input of whitespaceInputs) {
        const parsed = textPayloadSchema.safeParse(input);
        assert.equal(parsed.success, false);
        if (!parsed.success) {
          assert.equal(
            parsed.error.issues[0]?.message,
            'Please enter text to generate a QR code'
          );
        }
      }
    });

    it('enforces the 1000 character product constraint boundary', () => {
      const exact1000 = 'x'.repeat(1000);
      const over1000 = 'x'.repeat(1001);

      const parsedExact = textPayloadSchema.safeParse(exact1000);
      assert.equal(parsedExact.success, true);
      if (parsedExact.success) {
        assert.equal(parsedExact.data.length, 1000);
      }

      const parsedOver = textPayloadSchema.safeParse(over1000);
      assert.equal(parsedOver.success, false);
      if (!parsedOver.success) {
        assert.equal(
          parsedOver.error.issues[0]?.message,
          'Text exceeds maximum product limit of 1000 characters for QR studio preview'
        );
      }
    });
  });
});
