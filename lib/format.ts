/**
 * Format number to IDR currency string
 * @param amount - Number to format
 * @returns Formatted string like "Rp 1.000.000"
 */
export function formatIDR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp 0';
  
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Parse IDR formatted string to number
 * @param str - IDR formatted string like "Rp 1.000.000"
 * @returns Number value
 */
export function parseIDR(str: string): number {
  // Remove "Rp" and spaces, then replace dots
  const cleaned = str.replace(/Rp\s?/gi, '').replace(/\./g, '').trim();
  return parseFloat(cleaned) || 0;
}

/**
 * Format large amounts in compact format
 * @param amount - Number to format
 * @returns Compact format like "5 Jt" for 5.000.000
 */
export function formatIDRCompact(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp 0';
  
  if (num >= 1000000000) {
    return `Rp ${(num / 1000000000).toFixed(1)} M`; // Miliar
  } else if (num >= 1000000) {
    return `Rp ${(num / 1000000).toFixed(1)} Jt`; // Juta
  } else if (num >= 1000) {
    return `Rp ${(num / 1000).toFixed(1)} Rb`; // Ribu
  }
  
  return formatIDR(num);
}

/**
 * Format input value with thousand separators
 * @param value - Input value
 * @returns Formatted string with dots as separators
 */
export function formatInputIDR(value: string): string {
  // Remove non-numeric characters except for decimal point
  const numericValue = value.replace(/[^\d]/g, '');
  
  // Add thousand separators
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

