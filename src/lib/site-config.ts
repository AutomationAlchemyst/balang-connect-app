/**
 * Central place for brand contact details and social links.
 *
 * To publish a social channel, set its URL below. Any entry left as an empty
 * string is automatically hidden from the UI (no dead "#" links ship to prod).
 */

// Business WhatsApp line (digits only, incl. country code) used for wa.me links.
export const WHATSAPP_NUMBER = '6598814898';

// Human-friendly version shown in copy (e.g. FAQ answers).
export const WHATSAPP_DISPLAY = '9881 4898';

// Pre-filled message for WhatsApp deep-links.
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi Balang Kepalang! I'd like to enquire about your catering.";

export const whatsappLink = (message: string = WHATSAPP_DEFAULT_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export type SocialLink = {
  label: string;
  href: string;
};

// Fill in the real profile URLs to publish these. Empty = hidden.
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/balangkepalang/' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@balangkepalang' },
  { label: 'Facebook', href: 'https://www.facebook.com/andyidriss/' },
].filter((s) => s.href.trim() !== '');
