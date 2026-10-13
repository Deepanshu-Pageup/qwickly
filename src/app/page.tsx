'use client';

import React, { useState, useMemo } from 'react';
import { QrType } from '@/types/qr';
import { QrTypeSelector } from '@/components/studio/qr-type-selector';
import { DesignCustomizationPanel } from '@/components/studio/customization/design-customization-panel';
import { ExportActions } from '@/components/studio/export-actions';
import { LinkForm } from '@/components/studio/forms/link-form';
import { TextForm } from '@/components/studio/forms/text-form';
import { WhatsAppForm, WhatsAppFormValue } from '@/components/studio/forms/whatsapp-form';
import { SocialForm, SocialFormValue } from '@/components/studio/forms/social-form';
import { MapForm, MapFormValue } from '@/components/studio/forms/map-form';
import { CouponForm, CouponFormValue } from '@/components/studio/forms/coupon-form';
import { AppForm, AppFormValue } from '@/components/studio/forms/app-form';
import { PdfForm } from '@/components/studio/forms/pdf-form';
import { ImageForm } from '@/components/studio/forms/image-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { QrPreviewCanvas } from '@/components/studio/qr-preview-canvas';
import { QrDesignSettings, ErrorCorrectionLevel } from '@/schemas/qr-design';

interface FormState<T> {
  raw: T;
  encoded: string | null;
  isValid: boolean;
}

export default function Home() {
  const [selectedType, setSelectedType] = useState<QrType>('link');

  // Independent state for all nine QR types to guarantee zero cross-type state contamination
  const [linkState, setLinkState] = useState<FormState<string>>({
    raw: '',
    encoded: null,
    isValid: false,
  });

  const [textState, setTextState] = useState<FormState<string>>({
    raw: '',
    encoded: null,
    isValid: false,
  });

  const [whatsappState, setWhatsappState] = useState<FormState<WhatsAppFormValue>>({
    raw: { country: 'US', phone: '', message: '' },
    encoded: null,
    isValid: false,
  });

  const [socialState, setSocialState] = useState<FormState<SocialFormValue>>({
    raw: { platform: 'instagram', input: '' },
    encoded: null,
    isValid: false,
  });

  const [mapState, setMapState] = useState<FormState<MapFormValue>>({
    raw: { mode: 'address', addressQuery: '', latitude: '', longitude: '' },
    encoded: null,
    isValid: false,
  });

  const [couponState, setCouponState] = useState<FormState<CouponFormValue>>({
    raw: { code: '', description: '', terms: '', redeemUrl: '' },
    encoded: null,
    isValid: false,
  });

  const [appState, setAppState] = useState<FormState<AppFormValue>>({
    raw: { platform: 'ios', input: '' },
    encoded: null,
    isValid: false,
  });

  const [pdfState, setPdfState] = useState<FormState<string>>({
    raw: '',
    encoded: null,
    isValid: false,
  });

  const [imageState, setImageState] = useState<FormState<string>>({
    raw: '',
    encoded: null,
    isValid: false,
  });

  // Global design customization settings (isolated from payload data)
  const [designSettings, setDesignSettings] = useState<QrDesignSettings>({
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'M',
    marginSize: 4,
    logo: null,
  });

  // Preserves user-selected error correction level when a logo is toggled
  const [savedLevelBeforeLogo, setSavedLevelBeforeLogo] = useState<ErrorCorrectionLevel>('M');

  // Derive active preview state strictly according to the currently active type
  const activePreviewState = useMemo(() => {
    switch (selectedType) {
      case 'link':
        return { encodedValue: linkState.encoded, isValid: linkState.isValid };
      case 'text':
        return { encodedValue: textState.encoded, isValid: textState.isValid };
      case 'whatsapp':
        return { encodedValue: whatsappState.encoded, isValid: whatsappState.isValid };
      case 'social':
        return { encodedValue: socialState.encoded, isValid: socialState.isValid };
      case 'map':
        return { encodedValue: mapState.encoded, isValid: mapState.isValid };
      case 'coupon':
        return { encodedValue: couponState.encoded, isValid: couponState.isValid };
      case 'app':
        return { encodedValue: appState.encoded, isValid: appState.isValid };
      case 'pdf':
        return { encodedValue: pdfState.encoded, isValid: pdfState.isValid };
      case 'image':
        return { encodedValue: imageState.encoded, isValid: imageState.isValid };
      default:
        return { encodedValue: null, isValid: false };
    }
  }, [
    selectedType,
    linkState,
    textState,
    whatsappState,
    socialState,
    mapState,
    couponState,
    appState,
    pdfState,
    imageState,
  ]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Compact header: PageUp-style navy navbar (same in light and dark themes) */}
      <header className="site-navbar sticky top-0 z-30 border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-md bg-[#4457e1] text-xs font-semibold text-white"
            >
              Q
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-white">Qwikly Studio</h1>
              <span className="hidden text-xs text-[#e5e8ed]/70 sm:inline">QR Code Generator</span>
            </div>
          </div>
          <ThemeToggle className="text-[#e5e8ed] hover:bg-white/10 hover:text-white" />
        </div>
      </header>

      {/* Centered workspace: ~60/40 settings-to-preview split on wide screens */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[3fr_2fr] lg:gap-10">
          {/* Left column: type, content, appearance (DOM order = mobile order) */}
          <div className="min-w-0 space-y-8">
            <section aria-label="QR type">
              <QrTypeSelector selectedType={selectedType} onSelectType={setSelectedType} />
            </section>

            <section aria-label="Content" className="border-t border-border pt-6">
              {selectedType === 'link' && (
                <LinkForm
                  value={linkState.raw}
                  onChange={(raw, encoded, isValid) =>
                    setLinkState({ raw, encoded, isValid })
                  }
                />
              )}
              {selectedType === 'text' && (
                <TextForm
                  value={textState.raw}
                  onChange={(raw, encoded, isValid) =>
                    setTextState({ raw, encoded, isValid })
                  }
                />
              )}
              {selectedType === 'whatsapp' && (
                <WhatsAppForm
                  value={whatsappState.raw}
                  onChange={(raw, encoded, isValid) =>
                    setWhatsappState({ raw, encoded, isValid })
                  }
                />
              )}
              {selectedType === 'social' && (
                <SocialForm
                  value={socialState.raw}
                  onChange={(raw, encoded, isValid) =>
                    setSocialState({ raw, encoded, isValid })
                  }
                />
              )}
              {selectedType === 'map' && (
                <MapForm
                  value={mapState.raw}
                  onChange={(raw, encoded, isValid) =>
                    setMapState({ raw, encoded, isValid })
                  }
                />
              )}
              {selectedType === 'coupon' && (
                <CouponForm
                  value={couponState.raw}
                  onChange={(raw, encoded, isValid) =>
                    setCouponState({ raw, encoded, isValid })
                  }
                />
              )}
              {selectedType === 'app' && (
                <AppForm
                  value={appState.raw}
                  onChange={(raw, encoded, isValid) =>
                    setAppState({ raw, encoded, isValid })
                  }
                />
              )}
              {selectedType === 'pdf' && (
                <PdfForm
                  value={pdfState.raw}
                  onChange={(raw, encoded, isValid) =>
                    setPdfState({ raw, encoded, isValid })
                  }
                />
              )}
              {selectedType === 'image' && (
                <ImageForm
                  value={imageState.raw}
                  onChange={(raw, encoded, isValid) =>
                    setImageState({ raw, encoded, isValid })
                  }
                />
              )}
            </section>

            <section aria-label="Appearance" className="border-t border-border pt-6">
              <DesignCustomizationPanel
                settings={designSettings}
                onChange={setDesignSettings}
                savedLevelBeforeLogo={savedLevelBeforeLogo}
                onSavedLevelChange={setSavedLevelBeforeLogo}
              />
            </section>
          </div>

          {/* Right column: preview and export stay together; sticky on wide screens */}
          <div className="min-w-0 space-y-5 lg:sticky lg:top-20 lg:border-s lg:border-border lg:ps-10">
            <section aria-label="Preview">
              <QrPreviewCanvas
                selectedType={selectedType}
                encodedValue={activePreviewState.encodedValue}
                isValid={activePreviewState.isValid}
                designSettings={designSettings}
              />
            </section>

            <section aria-label="Export">
              <ExportActions
                encodedValue={activePreviewState.encodedValue}
                isValid={activePreviewState.isValid}
                designSettings={designSettings}
              />
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Powered By © Pageup Software Services Pvt. Ltd.
      </footer>
    </div>
  );
}
