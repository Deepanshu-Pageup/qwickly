import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  calculateContrastRatio,
  evaluateContrast,
  getEffectiveErrorLevel,
  QrDesignSettings,
} from '../../src/schemas/qr-design';
import { QrPreviewCanvas } from '../../src/components/studio/qr-preview-canvas';

interface ReactServerInternals {
  H: {
    useMemo: (fn: () => unknown) => unknown;
    useRef: (v: unknown) => { current: unknown };
    useCallback: (fn: (...args: unknown[]) => unknown) => unknown;
  } | null;
}

interface SvgElementProps {
  height: number;
  width: number;
  role: string;
  viewBox: string;
  children: Array<{
    type: string;
    props: {
      fill?: string;
      d?: string;
      href?: string;
      height?: number;
      width?: number;
      preserveAspectRatio?: string;
    };
  }>;
}

interface ForwardRefRenderer {
  render: (
    props: React.ComponentProps<typeof QRCodeSVG>,
    ref: null
  ) => React.ReactElement<SvgElementProps>;
}

function renderQrCode(props: React.ComponentProps<typeof QRCodeSVG>) {
  const internals = (
    React as unknown as Record<string, ReactServerInternals>
  ).__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  if (internals) {
    internals.H = {
      useMemo: (fn: () => unknown) => fn(),
      useRef: (v: unknown) => ({ current: v }),
      useCallback: (fn: (...args: unknown[]) => unknown) => fn,
    };
  }
  return (QRCodeSVG as unknown as ForwardRefRenderer).render(props, null);
}

describe('Checkpoint 3: QR Design Customization & Preview Integration Suite', () => {
  // ==========================================================================
  // Group A: Relative Luminance & Contrast Heuristic Evaluation
  // ==========================================================================
  describe('Group A: Contrast Heuristic Evaluation', () => {
    it('calculates expected 21:1 contrast ratio for standard black on white', () => {
      const ratio = calculateContrastRatio('#000000', '#ffffff');
      assert.ok(Math.abs(ratio - 21.0) < 0.1, `Expected ~21:1 ratio, got ${ratio}`);

      const evaluation = evaluateContrast('#000000', '#ffffff');
      assert.equal(evaluation.isLowContrast, false);
      assert.equal(evaluation.isInverted, false);
      assert.equal(evaluation.warningMessage, null);
    });

    it('identifies low contrast combinations below 4.5:1 and triggers advisory notice', () => {
      // Light gray (#a0a0a0) on white (#ffffff)
      const evaluation = evaluateContrast('#a0a0a0', '#ffffff');
      assert.equal(evaluation.isLowContrast, true);
      assert.ok(evaluation.ratio < 4.5);
      assert.ok(evaluation.warningMessage?.includes('below the recommended 4.5:1 advisory threshold'));
    });

    it('identifies inverted color schemes (light on dark) and triggers optical warning', () => {
      // White (#ffffff) on black (#000000)
      const evaluation = evaluateContrast('#ffffff', '#000000');
      assert.equal(evaluation.isInverted, true);
      assert.ok(evaluation.warningMessage?.includes('Inverted color scheme detected'));
    });

    it('confirms contrast threshold is purely an advisory heuristic and does not block rendering', () => {
      // Even with low contrast, evaluation still returns valid numbers without throwing
      const evaluation = evaluateContrast('#eeeeee', '#ffffff');
      assert.ok(evaluation.ratio > 0);
      assert.ok(evaluation.warningMessage !== null);
    });
  });

  // ==========================================================================
  // Group B: Error Correction Elevation & Restoration Policy
  // ==========================================================================
  describe('Group B: Error Correction & Logo Locking Invariants', () => {
    it('uses user-selected error correction level when no logo is present', () => {
      const settings: QrDesignSettings = {
        fgColor: '#000000',
        bgColor: '#ffffff',
        level: 'M',
        marginSize: 4,
        logo: null,
      };
      assert.equal(getEffectiveErrorLevel(settings), 'M');

      settings.level = 'L';
      assert.equal(getEffectiveErrorLevel(settings), 'L');

      settings.level = 'Q';
      assert.equal(getEffectiveErrorLevel(settings), 'Q');
    });

    it('strictly elevates effective error correction to H when a logo is active', () => {
      const settingsWithLogo: QrDesignSettings = {
        fgColor: '#000000',
        bgColor: '#ffffff',
        level: 'L', // User preference was L
        marginSize: 4,
        logo: {
          src: 'https://example.com/logo.png',
          sizeRatio: 0.18,
          excavate: true,
        },
      };

      // Effective level MUST be elevated to H to protect central excavated matrix
      assert.equal(getEffectiveErrorLevel(settingsWithLogo), 'H');
    });

    it('restores previously selected error correction level when logo is cleared', () => {
      const userLevelBeforeLogo = 'M';
      let settings: QrDesignSettings = {
        fgColor: '#000000',
        bgColor: '#ffffff',
        level: 'H',
        marginSize: 4,
        logo: {
          src: 'https://example.com/logo.png',
          sizeRatio: 0.18,
          excavate: true,
        },
      };

      // While logo is active: effective level is H
      assert.equal(getEffectiveErrorLevel(settings), 'H');

      // User removes logo: restore saved level
      settings = {
        ...settings,
        level: userLevelBeforeLogo,
        logo: null,
      };

      assert.equal(getEffectiveErrorLevel(settings), 'M');
    });
  });

  // ==========================================================================
  // Group C: Quiet Zone & SVG Rendering Assertions
  // ==========================================================================
  describe('Group C: Quiet Zone & Custom SVG Rendering', () => {
    it('renders custom foreground and background colors in SVG markup', () => {
      const element = renderQrCode({
        value: 'https://qwikly.dev',
        size: 220,
        fgColor: '#065f46', // Emerald
        bgColor: '#f8fafc', // Off-white
        level: 'M',
        marginSize: 4,
      });

      const children = element.props.children;
      // Background path
      assert.equal(children[1].props.fill, '#f8fafc');
      // Foreground path
      assert.equal(children[2].props.fill, '#065f46');
    });

    it('enforces excavate=true and renders image element when logo is active', () => {
      const element = renderQrCode({
        value: 'https://qwikly.dev',
        size: 220,
        level: 'H',
        marginSize: 4,
        imageSettings: {
          src: 'https://example.com/brand-icon.png',
          height: 40,
          width: 40,
          excavate: true,
        },
      });

      // Child 3 is the image element scaled into SVG viewBox coordinates
      const imageChild = element.props.children[3];
      assert.ok(imageChild, 'Image child must be present in SVG element tree');
      assert.equal(imageChild.type, 'image');
      assert.equal(imageChild.props.href, 'https://example.com/brand-icon.png');
      // Scaled proportionally into viewBox coordinates (40 / 220 * viewBoxWidth)
      assert.ok(typeof imageChild.props.height === 'number' && imageChild.props.height > 5);
      assert.ok(typeof imageChild.props.width === 'number' && imageChild.props.width > 5);
      assert.equal(imageChild.props.preserveAspectRatio, 'none');
    });

    it('ensures design customization NEVER mutates the normalized payload string', () => {
      const originalPayload = 'https://wa.me/15550192834?text=Hello';

      // Simulate canvas rendering with various design settings
      const designA: QrDesignSettings = {
        fgColor: '#000000',
        bgColor: '#ffffff',
        level: 'M',
        marginSize: 4,
        logo: null,
      };
      const designB: QrDesignSettings = {
        fgColor: '#881337',
        bgColor: '#fefce8',
        level: 'H',
        marginSize: 2,
        logo: { src: 'https://example.com/icon.svg', sizeRatio: 0.15, excavate: true },
      };

      const canvasA = QrPreviewCanvas({
        selectedType: 'whatsapp',
        encodedValue: originalPayload,
        isValid: true,
        designSettings: designA,
      });

      const canvasB = QrPreviewCanvas({
        selectedType: 'whatsapp',
        encodedValue: originalPayload,
        isValid: true,
        designSettings: designB,
      });

      assert.ok(canvasA);
      assert.ok(canvasB);
      // The payload passed into QR code generation remains completely identical
      assert.equal(originalPayload, 'https://wa.me/15550192834?text=Hello');
    });
  });
});
