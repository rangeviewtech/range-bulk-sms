/**
 * Range Bulk SMS Developer Portal Design Tokens
 * Recreated to strictly match the reference design specifications
 */

export const PORTAL_COLORS = {
  // Backgrounds
  mainBg: 'var(--portal-main-bg, #0B1729)',
  headerBg: 'var(--portal-header-bg, #0D1B30)',
  sidebarBg: 'var(--portal-sidebar-bg, #102038)',
  cardBg: 'var(--portal-card-bg, #13243C)',
  elevatedBg: 'var(--portal-elevated-bg, #182D49)',
  codeBg: 'var(--portal-code-bg, #0D1B30)',
  
  // Borders & Dividers
  border: 'var(--portal-border, #2A405E)',
  borderLight: 'var(--portal-border-light, #3B5880)',
  
  // Typography
  primaryText: 'var(--portal-primary-text, #F5F7FC)',
  secondaryText: 'var(--portal-secondary-text, #A9BCD4)',
  mutedText: 'var(--portal-muted-text, #6B82A0)',
  
  // Accents & Actions
  accentBlue: 'var(--portal-accent-blue, #35B6FF)',
  activeTab: 'var(--portal-active-tab, #FFCC24)',
  primaryYellow: 'var(--portal-primary-yellow, #FFCC24)',
  primaryYellowHover: 'var(--portal-primary-yellow-hover, #E5B718)',
  successGreen: 'var(--portal-success-green, #20D5A0)',
  dangerRed: 'var(--portal-danger-red, #FF4D6D)',
  purpleAccent: 'var(--portal-purple-accent, #9D6DFF)',
} as const;

export const HTTP_METHOD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  GET: {
    bg: 'var(--method-get-bg, rgba(32, 213, 160, 0.15))',
    text: 'var(--method-get-text, #20D5A0)',
    border: 'var(--method-get-border, rgba(32, 213, 160, 0.3))',
  },
  POST: {
    bg: 'var(--method-post-bg, rgba(53, 182, 255, 0.15))',
    text: 'var(--method-post-text, #35B6FF)',
    border: 'var(--method-post-border, rgba(53, 182, 255, 0.3))',
  },
  PUT: {
    bg: 'var(--method-put-bg, rgba(255, 204, 36, 0.15))',
    text: 'var(--method-put-text, #FFCC24)',
    border: 'var(--method-put-border, rgba(255, 204, 36, 0.3))',
  },
  PATCH: {
    bg: 'var(--method-patch-bg, rgba(157, 109, 255, 0.15))',
    text: 'var(--method-patch-text, #9D6DFF)',
    border: 'var(--method-patch-border, rgba(157, 109, 255, 0.3))',
  },
  DELETE: {
    bg: 'var(--method-delete-bg, rgba(255, 77, 109, 0.15))',
    text: 'var(--method-delete-text, #FF4D6D)',
    border: 'var(--method-delete-border, rgba(255, 77, 109, 0.3))',
  },
};
