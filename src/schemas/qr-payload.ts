/**
 * Barrel for QR payload validation. Each QR type owns its own schema module under
 * `./payload/` so features can be modularised independently; import from here (or
 * from a specific module) - both stay valid.
 */
export * from './payload/shared';
export * from './payload/link';
export * from './payload/text';
export * from './payload/whatsapp';
export * from './payload/social';
export * from './payload/map';
export * from './payload/coupon';
export * from './payload/app';
export * from './payload/pdf';
export * from './payload/image';
