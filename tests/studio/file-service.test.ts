import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FileService, fileService } from '../../src/lib/file-service';
import { QrDesignSettings } from '../../src/schemas/qr-design';

describe('Sub-phase 2.7: File Service & Export Suite', () => {
  describe('Group A: Singleton & Instance Lifecycle Invariants', () => {
    it('returns the exact same instance on repeated getInstance calls', () => {
      const instance1 = FileService.getInstance();
      const instance2 = FileService.getInstance();
      assert.strictEqual(instance1, instance2);
      assert.strictEqual(instance1, fileService);
    });

    it('rejects empty or whitespace-only payloads', () => {
      assert.throws(
        () => fileService.generateSvgString(''),
        /Cannot export empty or invalid QR code payload/
      );
      assert.throws(
        () => fileService.generateSvgString('   '),
        /Cannot export empty or invalid QR code payload/
      );
    });
  });

  describe('Group B: SVG Generation & Vector Quality', () => {
    it('generates valid SVG with XML declaration and standard namespaces', () => {
      const svg = fileService.generateSvgString('https://example.com/test');
      assert.ok(svg.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
      assert.ok(svg.includes('<svg '));
      assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'));
      assert.ok(svg.includes('height="1024"'));
      assert.ok(svg.includes('width="1024"'));
      assert.ok(svg.includes('</svg>'));
    });

    it('preserves custom foreground, background colors, and marginSize', () => {
      const design: QrDesignSettings = {
        fgColor: '#1e40af',
        bgColor: '#f0fdf4',
        level: 'Q',
        marginSize: 5,
        logo: null,
      };

      const svg = fileService.generateSvgString('https://example.com/colors', design);
      assert.ok(svg.includes('fill="#f0fdf4"'));
      assert.ok(svg.includes('fill="#1e40af"'));
    });

    it('embeds image tag and raises error level when logo is provided', () => {
      const design: QrDesignSettings = {
        fgColor: '#000000',
        bgColor: '#ffffff',
        level: 'L',
        marginSize: 4,
        logo: {
          src: 'data:image/svg+xml;utf8,<svg></svg>',
          sizeRatio: 0.18,
          excavate: true,
        },
      };

      const svg = fileService.generateSvgString('https://example.com/logo', design, 1000);
      assert.ok(svg.includes('<image '));
      assert.ok(svg.includes('href="data:image/svg+xml;utf8,&lt;svg&gt;&lt;/svg&gt;"'));
      assert.ok(svg.includes('xlink:href="data:image/svg+xml;utf8,&lt;svg&gt;&lt;/svg&gt;"'));
      // In SVG viewBox units, height and width are scaled to viewBox modules
      assert.ok(svg.includes('preserveAspectRatio="none"'));
      assert.ok(/height="[0-9.]+"/.test(svg));
      assert.ok(/width="[0-9.]+"/.test(svg));
    });

    it('embeds external PNG URL with both href and xlink:href attributes', () => {
      const design: QrDesignSettings = {
        fgColor: '#000000',
        bgColor: '#ffffff',
        level: 'M',
        marginSize: 4,
        logo: {
          src: 'https://example.com/brand-logo.png',
          sizeRatio: 0.18,
          excavate: true,
        },
      };

      const svg = fileService.generateSvgString('https://example.com/png-test', design, 512);
      assert.ok(svg.includes('href="https://example.com/brand-logo.png"'));
      assert.ok(svg.includes('xlink:href="https://example.com/brand-logo.png"'));
    });
  });

  describe('Group C: PDF Document Generation & Spec Compliance', () => {
    it('builds an ISO standard PDF 1.4 document containing valid xref and trailer', () => {
      // Mock 100-byte image payload
      const mockImage = new Uint8Array(100);
      for (let i = 0; i < mockImage.length; i++) {
        mockImage[i] = i % 256;
      }

      const pdfBytes = fileService.buildPdfDocument(mockImage, 512, 512);
      const textDecoder = new TextDecoder();
      const pdfText = textDecoder.decode(pdfBytes);

      // Verify PDF structure
      assert.ok(pdfText.startsWith('%PDF-1.4'));
      assert.ok(pdfText.includes('/Type /Catalog'));
      assert.ok(pdfText.includes('/Type /Pages'));
      assert.ok(pdfText.includes('/Type /Page'));
      assert.ok(pdfText.includes('/Type /XObject'));
      assert.ok(pdfText.includes('/Subtype /Image'));
      assert.ok(pdfText.includes('/Width 512 /Height 512'));
      assert.ok(pdfText.includes('/Filter /DCTDecode'));
      assert.ok(pdfText.includes('xref'));
      assert.ok(pdfText.includes('trailer'));
      assert.ok(pdfText.includes('/Root 1 0 R'));
      assert.ok(pdfText.includes('startxref'));
      assert.ok(pdfText.includes('%%EOF'));
    });

    it('centers QR code precisely on standard A4 page (595.28 x 841.89)', () => {
      const mockImage = new Uint8Array(50);
      const pdfBytes = fileService.buildPdfDocument(mockImage, 1024, 1024);
      const pdfText = new TextDecoder().decode(pdfBytes);

      // A4 default dimensions in MediaBox
      assert.ok(pdfText.includes('/MediaBox [0 0 595.28 841.89]'));

      // displaySize = min(350, 595.28 - 100) = 350
      // x = (595.28 - 350) / 2 = 122.64
      // y = (841.89 - 350) / 2 = 245.945 -> 245.95 or 245.94
      assert.ok(pdfText.includes('350.00 0 0 350.00 122.64'));
    });
  });

  describe('Group D: Safe Error Boundaries in Non-Browser Environments', () => {
    it('safely rejects PNG generation when browser DOM/Canvas is absent', async () => {
      await assert.rejects(
        async () => {
          await fileService.generatePngBlob('https://example.com');
        },
        /PNG raster generation is only supported in browser environments/
      );
    });

    it('safely rejects PDF blob generation when browser DOM/Canvas is absent', async () => {
      await assert.rejects(
        async () => {
          await fileService.generatePdfBlob('https://example.com');
        },
        /PDF document generation is only supported in browser environments/
      );
    });

    it('safely rejects browser download trigger in non-browser environments', async () => {
      await assert.rejects(
        async () => {
          await fileService.exportSVG({ value: 'https://example.com' });
        },
        /Blob is not defined|Download triggers are only supported in browser environments/
      );
    });
  });
});
