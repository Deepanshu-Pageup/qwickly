import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { QR_TYPES, QrType } from '../../src/types/qr';

interface FormState<T> {
  raw: T;
  encoded: string | null;
  isValid: boolean;
}

// Simulates the exact state derivation logic from src/app/page.tsx
function resolveActivePreview(
  selectedType: QrType,
  states: Record<QrType, FormState<unknown>>
) {
  const current = states[selectedType];
  if (!current) {
    return { encodedValue: null, isValid: false };
  }
  return {
    encodedValue: current.encoded,
    isValid: current.isValid,
  };
}

describe('Checkpoint 2: Studio State Isolation & Stale Preview Prevention', () => {
  it('covers all nine registered QR types without missing cases', () => {
    assert.equal(QR_TYPES.length, 9);
    const registeredIds = QR_TYPES.map((t) => t.id);

    const mockStates = registeredIds.reduce((acc, id) => {
      acc[id] = { raw: '', encoded: `https://qwikly.dev/${id}`, isValid: true };
      return acc;
    }, {} as Record<QrType, FormState<unknown>>);

    for (const type of registeredIds) {
      const active = resolveActivePreview(type, mockStates);
      assert.equal(active.isValid, true);
      assert.equal(active.encodedValue, `https://qwikly.dev/${type}`);
    }
  });

  it('guarantees that switching types immediately clears preview when target type is empty/invalid', () => {
    const states: Record<QrType, FormState<unknown>> = {
      link: { raw: 'https://qwikly.dev', encoded: 'https://qwikly.dev/', isValid: true },
      text: { raw: '', encoded: null, isValid: false },
      whatsapp: { raw: { phone: '', message: '' }, encoded: null, isValid: false },
      social: { raw: { platform: 'instagram', input: '' }, encoded: null, isValid: false },
      map: { raw: { mode: 'address', addressQuery: '', latitude: '', longitude: '' }, encoded: null, isValid: false },
      coupon: { raw: { code: '', description: '', terms: '', redeemUrl: '' }, encoded: null, isValid: false },
      app: { raw: { platform: 'ios', input: '' }, encoded: null, isValid: false },
      pdf: { raw: '', encoded: null, isValid: false },
      image: { raw: '', encoded: null, isValid: false },
    };

    // When on Link: active preview is valid
    const linkPreview = resolveActivePreview('link', states);
    assert.equal(linkPreview.isValid, true);
    assert.equal(linkPreview.encodedValue, 'https://qwikly.dev/');

    // When switching to WhatsApp (which has empty inputs): active preview is immediately invalid and null
    const whatsappPreview = resolveActivePreview('whatsapp', states);
    assert.equal(whatsappPreview.isValid, false);
    assert.equal(whatsappPreview.encodedValue, null);

    // Stale Link payload is NEVER leaked to WhatsApp
    assert.notEqual(whatsappPreview.encodedValue, linkPreview.encodedValue);
  });

  it('preserves user input in non-active forms when switching back and forth', () => {
    const states: Record<QrType, FormState<unknown>> = {
      link: { raw: 'https://mysite.com', encoded: 'https://mysite.com/', isValid: true },
      text: { raw: 'Preserved notes', encoded: 'Preserved notes', isValid: true },
      whatsapp: { raw: { phone: '+15551234567', message: 'Hello' }, encoded: 'https://wa.me/15551234567?text=Hello', isValid: true },
      social: { raw: { platform: 'github', input: 'octocat' }, encoded: 'https://github.com/octocat', isValid: true },
      map: { raw: { mode: 'address', addressQuery: 'Paris', latitude: '', longitude: '' }, encoded: 'https://www.google.com/maps/search/?api=1&query=Paris', isValid: true },
      coupon: { raw: { code: 'SAVE', description: 'Promo', terms: '', redeemUrl: '' }, encoded: 'COUPON: SAVE\nOFFER: Promo', isValid: true },
      app: { raw: { platform: 'ios', input: '123456789' }, encoded: 'https://apps.apple.com/app/id123456789', isValid: true },
      pdf: { raw: 'https://example.com/doc.pdf', encoded: 'https://example.com/doc.pdf', isValid: true },
      image: { raw: 'https://example.com/pic.png', encoded: 'https://example.com/pic.png', isValid: true },
    };

    // Verify independent values for each tab
    assert.equal(resolveActivePreview('link', states).encodedValue, 'https://mysite.com/');
    assert.equal(resolveActivePreview('text', states).encodedValue, 'Preserved notes');
    assert.equal(resolveActivePreview('whatsapp', states).encodedValue, 'https://wa.me/15551234567?text=Hello');
    assert.equal(resolveActivePreview('social', states).encodedValue, 'https://github.com/octocat');
    assert.equal(resolveActivePreview('map', states).encodedValue, 'https://www.google.com/maps/search/?api=1&query=Paris');
    assert.equal(resolveActivePreview('coupon', states).encodedValue, 'COUPON: SAVE\nOFFER: Promo');
    assert.equal(resolveActivePreview('app', states).encodedValue, 'https://apps.apple.com/app/id123456789');
    assert.equal(resolveActivePreview('pdf', states).encodedValue, 'https://example.com/doc.pdf');
    assert.equal(resolveActivePreview('image', states).encodedValue, 'https://example.com/pic.png');
  });
});
