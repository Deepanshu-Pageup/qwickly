import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateLogoFile,
  MAX_LOGO_FILE_SIZE,
} from '../../src/lib/logo-upload';
import {
  getEffectiveErrorLevel,
  QrDesignSettings,
} from '../../src/schemas/qr-design';
import { fileService } from '../../src/lib/file-service';

// Minimal 1x1 transparent PNG data URI
const SAMPLE_PNG_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Minimal 1x1 JPEG data URI
const SAMPLE_JPEG_DATA_URI =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

describe('Custom Logo Upload & Integration Suite', () => {
  describe('Group A: Logo File Validation Rules', () => {
    it('accepts valid PNG, JPEG, and WebP files under 1.5 MB', () => {
      const pngFile = new File([new Uint8Array(1024)], 'company-logo.png', {
        type: 'image/png',
      });
      const jpgFile = new File([new Uint8Array(2048)], 'avatar.jpg', {
        type: 'image/jpeg',
      });
      const webpFile = new File([new Uint8Array(4096)], 'badge.webp', {
        type: 'image/webp',
      });

      assert.equal(validateLogoFile(pngFile).valid, true);
      assert.equal(validateLogoFile(jpgFile).valid, true);
      assert.equal(validateLogoFile(webpFile).valid, true);
    });

    it('rejects files exceeding the 1.5 MB limit', () => {
      const oversizedBytes = new Uint8Array(MAX_LOGO_FILE_SIZE + 1024);
      const oversizedFile = new File([oversizedBytes], 'huge-image.png', {
        type: 'image/png',
      });

      const res = validateLogoFile(oversizedFile);
      assert.equal(res.valid, false);
      assert.ok(res.error?.includes('exceeds the 1.5 MB limit'));
    });

    it('rejects SVG files to prevent script injection and XXE risks', () => {
      const svgFile = new File(['<svg></svg>'], 'vector.svg', {
        type: 'image/svg+xml',
      });

      const res = validateLogoFile(svgFile);
      assert.equal(res.valid, false);
      assert.ok(res.error?.includes('Unsupported image format'));
    });

    it('rejects unsupported file formats (PDF, GIF, Executables)', () => {
      const pdfFile = new File([new Uint8Array(100)], 'document.pdf', {
        type: 'application/pdf',
      });
      const gifFile = new File([new Uint8Array(100)], 'animation.gif', {
        type: 'image/gif',
      });
      const exeFile = new File([new Uint8Array(100)], 'binary.exe', {
        type: 'application/octet-stream',
      });

      assert.equal(validateLogoFile(pdfFile).valid, false);
      assert.equal(validateLogoFile(gifFile).valid, false);
      assert.equal(validateLogoFile(exeFile).valid, false);
    });
  });

  describe('Group B: Error Correction Invariants with Custom Logo', () => {
    it('preserves user error correction when no logo is selected', () => {
      const settingsNoLogo: QrDesignSettings = {
        fgColor: '#000000',
        bgColor: '#ffffff',
        level: 'M',
        marginSize: 4,
        logo: null,
      };
      assert.equal(getEffectiveErrorLevel(settingsNoLogo), 'M');

      settingsNoLogo.level = 'Q';
      assert.equal(getEffectiveErrorLevel(settingsNoLogo), 'Q');
    });

    it('elevates error correction to H when custom uploaded logo is active', () => {
      const settingsWithCustomLogo: QrDesignSettings = {
        fgColor: '#000000',
        bgColor: '#ffffff',
        level: 'L', // user selected L initially
        marginSize: 4,
        logo: {
          src: SAMPLE_PNG_DATA_URI,
          sizeRatio: 0.18,
          excavate: true,
        },
      };

      assert.equal(getEffectiveErrorLevel(settingsWithCustomLogo), 'H');
    });

    it('restores previous error correction level when custom logo is removed', () => {
      const savedLevel = 'M';
      let settings: QrDesignSettings = {
        fgColor: '#000000',
        bgColor: '#ffffff',
        level: 'H',
        marginSize: 4,
        logo: {
          src: SAMPLE_JPEG_DATA_URI,
          sizeRatio: 0.18,
          excavate: true,
        },
      };

      assert.equal(getEffectiveErrorLevel(settings), 'H');

      // User removes custom logo
      settings = {
        ...settings,
        level: savedLevel,
        logo: null,
      };

      assert.equal(getEffectiveErrorLevel(settings), 'M');
      assert.equal(settings.logo, null);
    });
  });

  describe('Group C: Self-Contained SVG Export with Custom Logo', () => {
    it('embeds Data URL directly into SVG markup with xlink:href', () => {
      const designWithLogo: QrDesignSettings = {
        fgColor: '#000000',
        bgColor: '#ffffff',
        level: 'M',
        marginSize: 4,
        logo: {
          src: SAMPLE_PNG_DATA_URI,
          sizeRatio: 0.18,
          excavate: true,
        },
      };

      const svgString = fileService.generateSvgString(
        'https://qwikly.dev/brand',
        designWithLogo,
        1024
      );

      // Verify self-contained structure
      assert.ok(svgString.includes('<image '));
      assert.ok(svgString.includes(`href="${SAMPLE_PNG_DATA_URI}"`));
      assert.ok(svgString.includes(`xlink:href="${SAMPLE_PNG_DATA_URI}"`));

      // Must never contain transient blob URLs
      assert.ok(!svgString.includes('blob:'));

      // The image element itself must use the Data URI and not an external HTTP link
      assert.ok(svgString.includes(`href="${SAMPLE_PNG_DATA_URI}"`));
      assert.ok(!svgString.includes('href="http://') && !svgString.includes('href="https://'));
    });

    it('generates standard SVG without image element when logo is removed', () => {
      const designNoLogo: QrDesignSettings = {
        fgColor: '#000000',
        bgColor: '#ffffff',
        level: 'M',
        marginSize: 4,
        logo: null,
      };

      const svgString = fileService.generateSvgString(
        'https://qwikly.dev/clean',
        designNoLogo,
        1024
      );

      assert.ok(!svgString.includes('<image '));
      assert.ok(!svgString.includes('xlink:href'));
    });
  });
});
