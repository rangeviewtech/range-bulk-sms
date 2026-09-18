/**
 * Range Bulk SMS Developer Portal Design Tokens
 * Recreated to strictly match the reference design specifications
 */

export const PORTAL_COLORS = {
  // Backgrounds
  mainBg: '#0B1729',
  headerBg: '#0D1B30',
  sidebarBg: '#102038',
  cardBg: '#13243C',
  elevatedBg: '#182D49',
  codeBg: '#0D1B30',
  
  // Borders & Dividers
  border: '#2A405E',
  borderLight: '#3B5880',
  
  // Typography
  primaryText: '#F5F7FC',
  secondaryText: '#A9BCD4',
  mutedText: '#6B82A0',
  
  // Accents & Actions
  accentBlue: '#35B6FF',
  primaryYellow: '#FFCC24',
  primaryYellowHover: '#E5B718',
  successGreen: '#20D5A0',
  dangerRed: '#FF4D6D',
  purpleAccent: '#9D6DFF',
} as const;

export const HTTP_METHOD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  GET: {
    bg: 'rgba(32, 213, 160, 0.15)',
    text: '#20D5A0',
    border: 'rgba(32, 213, 160, 0.3)',
  },
  POST: {
    bg: 'rgba(53, 182, 255, 0.15)',
    text: '#35B6FF',
    border: 'rgba(53, 182, 255, 0.3)',
  },
  PUT: {
    bg: 'rgba(255, 204, 36, 0.15)',
    text: '#FFCC24',
    border: 'rgba(255, 204, 36, 0.3)',
  },
  PATCH: {
    bg: 'rgba(157, 109, 255, 0.15)',
    text: '#9D6DFF',
    border: 'rgba(157, 109, 255, 0.3)',
  },
  DELETE: {
    bg: 'rgba(255, 77, 109, 0.15)',
    text: '#FF4D6D',
    border: 'rgba(255, 77, 109, 0.3)',
  },
};
