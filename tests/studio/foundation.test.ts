import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { QR_TYPES, getQrTypeMetadata, QrType } from '../../src/types/qr';

describe('Sub-phase 2.1: QR Studio Foundation Suite', () => {
  const EXPECTED_TYPES: readonly QrType[] = [
    'link',
    'text',
    'pdf',
    'image',
    'whatsapp',
    'social',
    'map',
    'coupon',
    'app',
  ];

  describe('Group A: QR Type Registry Invariants', () => {
    it('contains exactly the nine approved QR types', () => {
      assert.equal(QR_TYPES.length, 9);
      const actualIds = QR_TYPES.map((t) => t.id);
      assert.deepEqual(actualIds, EXPECTED_TYPES);
    });

    it('ensures every QR type has unique id, non-empty label, description, and icon', () => {
      const seenIds = new Set<string>();

      for (const item of QR_TYPES) {
        assert.ok(!seenIds.has(item.id), `Duplicate ID detected: ${item.id}`);
        seenIds.add(item.id);

        assert.ok(item.label.trim().length > 0, `Empty label for ${item.id}`);
        assert.ok(
          item.description.trim().length > 0,
          `Empty description for ${item.id}`
        );
        assert.ok(item.icon.trim().length > 0, `Empty icon for ${item.id}`);
      }
    });

    it('flags hosted items (PDF and Image) with appropriate badge metadata', () => {
      const pdf = getQrTypeMetadata('pdf');
      const image = getQrTypeMetadata('image');
      const link = getQrTypeMetadata('link');

      assert.equal(pdf.badge, 'Hosted');
      assert.equal(image.badge, 'Hosted');
      assert.equal(link.badge, undefined);
    });
  });

  describe('Group B: Metadata Lookup Helper', () => {
    it('retrieves valid metadata for all nine types without throwing', () => {
      for (const type of EXPECTED_TYPES) {
        const metadata = getQrTypeMetadata(type);
        assert.equal(metadata.id, type);
        assert.ok(typeof metadata.label === 'string');
      }
    });

    it('throws error when querying an unlisted type', () => {
      assert.throws(
        () => {
          // @ts-expect-error Testing invalid runtime input
          getQrTypeMetadata('unsupported-type');
        },
        {
          name: 'Error',
          message: 'Unknown QR type: unsupported-type',
        }
      );
    });
  });
});
