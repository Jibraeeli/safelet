/**
 * SafeLet colour palette.
 *
 * Status colours (green / amber / red) are used to signal the compliance
 * state of each item: compliant, expiring soon, and overdue/missing.
 */
export const colours = {
  navy: '#1B2B4B',
  white: '#FFFFFF',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  cardBackground: '#243860',
} as const;

export type ColourName = keyof typeof colours;

export default colours;
