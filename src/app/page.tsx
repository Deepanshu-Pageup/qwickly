'use client';

import React, { useState, useMemo } from 'react';
import { QrType } from '@/types/qr';
import { QrTypeSelector } from '@/components/studio/qr-type-selector';
import { DesignCustomizationPanel } from '@/components/studio/customization/design-customization-panel';
import {
  ExportActionsPlaceholder,
} from '@/components/studio/studio-placeholders';
import { LinkForm } from '@/components/studio/forms/link-form';
import { TextForm } from '@/components/studio/forms/text-form';
import { WhatsAppForm, WhatsAppFormValue } from '@/components/studio/forms/whatsapp-form';
import { SocialForm, SocialFormValue } from '@/components/studio/forms/social-form';
import { MapForm, MapFormValue } from '@/components/studio/forms/map-form';
import { CouponForm, CouponFormValue } from '@/components/studio/forms/coupon-form';
import { AppForm, AppFormValue } from '@/components/studio/forms/app-form';
import { PdfForm } from '@/components/studio/forms/pdf-form';
import { ImageForm } from '@/components/studio/forms/image-form';
import { QrPreviewCanvas } from '@/components/studio/qr-preview-canvas';
import { Badge } from '@/components/ui/badge';
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
    raw: { phone: '', message: '' },
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
      {/* Studio Header */}
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-xs">
              Q
            </div>
            <div>
              <h1 className="text-base font-semibold leading-none tracking-tight">
                Qwikly Studio
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                QR Code Generation & Design
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="success" size="default" className="gap-1.5 py-1 px-3">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              9 Types Activated
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Studio Workstation Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Type Selection & Configuration Area */}
          <div className="lg:col-span-7 space-y-6">
            <section aria-label="Type Selection">
              <QrTypeSelector
                selectedType={selectedType}
                onSelectType={setSelectedType}
              />
            </section>

            <section aria-label="Payload Configuration">
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

            <section aria-label="Design Customization">
              <DesignCustomizationPanel
                settings={designSettings}
                onChange={setDesignSettings}
                savedLevelBeforeLogo={savedLevelBeforeLogo}
                onSavedLevelChange={setSavedLevelBeforeLogo}
              />
            </section>
          </div>

          {/* Right Column: Live Inspector, Preview & Export Area */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <section aria-label="Live Preview">
              <QrPreviewCanvas
                selectedType={selectedType}
                encodedValue={activePreviewState.encodedValue}
                isValid={activePreviewState.isValid}
                designSettings={designSettings}
              />
            </section>

            <section aria-label="Export Actions">
              <ExportActionsPlaceholder />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
