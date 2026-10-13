import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
      fill: string;
      d: string;
      shapeRendering: string;
    };
  }>;
}

interface ForwardRefRenderer {
  render: (
    props: React.ComponentProps<typeof QRCodeSVG>,
    ref: null
  ) => React.ReactElement<SvgElementProps>;
}

// Helper to render QRCodeSVG in Node.js test environment
function renderQrCode(props: React.ComponentProps<typeof QRCodeSVG>) {
  // Set dispatcher for client hooks (useMemo, useRef, useCallback) under Node tsx runner
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

describe('QR Encoding & Scannability Verification Suite', () => {
  describe('Group A: SVG Structure & ISO Quiet Zone Compliance', () => {
    it('renders valid SVG element with exact dimensions and accessibility role', () => {
      const element = renderQrCode({
        value: 'https://qwikly.dev',
        size: 220,
        level: 'M',
        marginSize: 4,
        bgColor: '#ffffff',
        fgColor: '#000000',
      });

      assert.equal(element.type, 'svg');
      assert.equal(element.props.height, 220);
      assert.equal(element.props.width, 220);
      assert.equal(element.props.role, 'img');
      assert.equal(element.props.viewBox, '0 0 33 33');
    });

    it('enforces ISO/IEC 18004 4-module quiet zone in viewBox geometry', () => {
      // For https://qwikly.dev at Level M:
      // Nayuki encoder produces QR Version 2 (25x25 matrix).
      // With ISO standard marginSize=4, quiet zone adds 4 modules to each edge:
      // Total size = 25 + 2 * 4 = 33.
      const margin4 = renderQrCode({
        value: 'https://qwikly.dev',
        size: 220,
        level: 'M',
        marginSize: 4,
      });
      assert.equal(margin4.props.viewBox, '0 0 33 33');

      // With marginSize=2: 25 + 2 * 2 = 29.
      const margin2 = renderQrCode({
        value: 'https://qwikly.dev',
        size: 220,
        level: 'M',
        marginSize: 2,
      });
      assert.equal(margin2.props.viewBox, '0 0 29 29');

      // With marginSize=0: strictly raw 25x25 modules.
      const margin0 = renderQrCode({
        value: 'https://qwikly.dev',
        size: 220,
        level: 'M',
        marginSize: 0,
      });
      assert.equal(margin0.props.viewBox, '0 0 25 25');
    });

    it('renders solid background rectangle and foreground module path with crispEdges', () => {
      const element = renderQrCode({
        value: 'https://qwikly.dev',
        size: 220,
        level: 'M',
        marginSize: 4,
        bgColor: '#ffffff',
        fgColor: '#000000',
      });

      const children = element.props.children;
      // Background rect path is first child element (index 1 after boolean)
      const bgPath = children[1];
      assert.equal(bgPath.type, 'path');
      assert.equal(bgPath.props.fill, '#ffffff');
      assert.equal(bgPath.props.d, 'M0,0 h33v33H0z');
      assert.equal(bgPath.props.shapeRendering, 'crispEdges');

      // Foreground module path is second child element
      const fgPath = children[2];
      assert.equal(fgPath.type, 'path');
      assert.equal(fgPath.props.fill, '#000000');
      assert.equal(fgPath.props.shapeRendering, 'crispEdges');
      assert.ok(typeof fgPath.props.d === 'string');
      assert.ok(fgPath.props.d.length > 50, 'Path data must contain QR module coordinates');
    });
  });

  describe('Group B: Error Correction Level Invariants (L, M, Q, H)', () => {
    const testPayload = 'https://qwikly.dev/checkout?ref=campaign_2026';

    it('renders valid SVG matrices across all 4 standard error correction levels', () => {
      const levels: Array<'L' | 'M' | 'Q' | 'H'> = ['L', 'M', 'Q', 'H'];
      const matrixSizes: number[] = [];

      for (const level of levels) {
        const element = renderQrCode({
          value: testPayload,
          size: 220,
          level,
          marginSize: 4,
        });

        assert.equal(element.type, 'svg');
        const match = element.props.viewBox.match(/^0 0 (\d+) \1$/);
        assert.ok(match, `Expected square viewBox for error level ${level}, got ${element.props.viewBox}`);
        matrixSizes.push(Number(match[1]));
      }

      // Increasing error correction levels increases required QR version/module count:
      // Level L <= Level M <= Level Q <= Level H
      assert.ok(
        matrixSizes[0] <= matrixSizes[1],
        `Level L matrix (${matrixSizes[0]}) should be <= Level M (${matrixSizes[1]})`
      );
      assert.ok(
        matrixSizes[1] <= matrixSizes[2],
        `Level M matrix (${matrixSizes[1]}) should be <= Level Q (${matrixSizes[2]})`
      );
      assert.ok(
        matrixSizes[2] <= matrixSizes[3],
        `Level Q matrix (${matrixSizes[2]}) should be <= Level H (${matrixSizes[3]})`
      );
    });
  });

  describe('Group C: Payload Boundaries, Unicode & Stress Validation', () => {
    it('encodes maximum length link payload (2048 characters) without error', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2048 - 'https://example.com/'.length);
      assert.equal(longUrl.length, 2048);

      const element = renderQrCode({
        value: longUrl,
        size: 220,
        level: 'M',
        marginSize: 4,
      });

      assert.equal(element.type, 'svg');
      const match = element.props.viewBox.match(/^0 0 (\d+) \1$/);
      assert.ok(match);
      const totalModules = Number(match[1]);
      // 2048 characters requires high QR Version (e.g. Version 35-40, ~150-185 modules)
      assert.ok(
        totalModules > 100,
        `Expected dense QR matrix for 2048 characters, got ${totalModules} modules`
      );
    });

    it('encodes maximum length text payload (1000 characters) without error', () => {
      const longText = 'Hello QR World! '.repeat(62) + '12345678';
      assert.equal(longText.length, 1000);

      const element = renderQrCode({
        value: longText,
        size: 220,
        level: 'M',
        marginSize: 4,
      });

      assert.equal(element.type, 'svg');
      assert.ok(element.props.viewBox.length > 0);
    });

    it('correctly handles multi-byte UTF-8 international text', () => {
      const internationalText = '東京, 대한민국, القاهرة, Москва, München, São Paulo';
      const element = renderQrCode({
        value: internationalText,
        size: 220,
        level: 'M',
        marginSize: 4,
      });

      assert.equal(element.type, 'svg');
      const fgPath = element.props.children[2];
      assert.ok(fgPath.props.d.length > 0);
    });

    it('correctly handles multi-line text with tabs, carriage returns, and newlines', () => {
      const multilineText = 'Line 1\r\n\tLine 2 with tab\n  Line 3 with spaces\nEnd.';
      const element = renderQrCode({
        value: multilineText,
        size: 220,
        level: 'M',
        marginSize: 4,
      });

      assert.equal(element.type, 'svg');
      const fgPath = element.props.children[2];
      assert.ok(fgPath.props.d.length > 0);
    });

    it('correctly handles emoji and surrogate pairs', () => {
      const emojiText = 'Qwikly QR 🚀✨🔥🎉';
      const element = renderQrCode({
        value: emojiText,
        size: 220,
        level: 'M',
        marginSize: 4,
      });

      assert.equal(element.type, 'svg');
      const fgPath = element.props.children[2];
      assert.ok(fgPath.props.d.length > 0);
    });
  });

  describe('Group D: QrPreviewCanvas Integration Component', () => {
    type TreeNode = { type?: unknown; props?: { children?: unknown } & Record<string, unknown> };

    /** Depth-first search of a React element tree for the first element matching `predicate`. */
    function findElement(node: unknown, predicate: (el: TreeNode) => boolean): TreeNode | null {
      if (Array.isArray(node)) {
        for (const child of node) {
          const hit = findElement(child, predicate);
          if (hit) return hit;
        }
        return null;
      }
      if (!node || typeof node !== 'object') return null;
      const el = node as TreeNode;
      if (predicate(el)) return el;
      return findElement(el.props?.children, predicate);
    }

    const isQrCode = (el: TreeNode) => el.type === QRCodeSVG;

    it('renders QrPreviewCanvas with default ISO marginSize=4 and level=M', () => {
      const element = QrPreviewCanvas({
        selectedType: 'link',
        encodedValue: 'https://qwikly.dev/',
        isValid: true,
      });

      const qrCode = findElement(element, isQrCode);
      assert.ok(qrCode, 'QRCodeSVG should be rendered for valid content');
      assert.equal(qrCode.props?.value, 'https://qwikly.dev/');
      assert.equal(qrCode.props?.level, 'M');
      assert.equal(qrCode.props?.marginSize, 4);
    });

    it('accepts custom error correction level and marginSize overrides', () => {
      const element = QrPreviewCanvas({
        selectedType: 'text',
        encodedValue: 'Custom configuration test',
        isValid: true,
        level: 'H',
        marginSize: 6,
      });

      const qrCode = findElement(element, isQrCode);
      assert.ok(qrCode);
      assert.equal(qrCode.props?.level, 'H');
      assert.equal(qrCode.props?.marginSize, 6);
    });

    it('renders an empty state without any QR code when input is invalid', () => {
      const element = QrPreviewCanvas({
        selectedType: 'link',
        encodedValue: null,
        isValid: false,
      });

      assert.equal(findElement(element, isQrCode), null, 'no QR (real or decorative) before valid content');
      const emptyState = findElement(
        element,
        (el) => el.type === 'p' && el.props?.children === 'No QR code yet',
      );
      assert.ok(emptyState, 'calm empty-state message should be shown');
    });
  });
});
