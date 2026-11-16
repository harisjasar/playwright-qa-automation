// All money is handled as integer cents to avoid floating-point drift ($0.1 + $0.2 != $0.3).

/** Extracts the first "$12.34" amount from a label such as "Item total: $39.98". */
export function parseCents(text: string): number {
  const match = text.match(/\$\s*(\d+)(?:\.(\d{1,2}))?/);
  if (!match) {
    throw new Error(`No dollar amount found in "${text}"`);
  }
  const [, dollars, cents = '0'] = match;
  return Number(dollars) * 100 + Number(cents.padEnd(2, '0'));
}

export function sumCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/** Tax rounded half-up to the nearest cent, e.g. 8% of $39.98 = $3.1984 -> $3.20. */
export function taxCents(amountCents: number, ratePercent: number): number {
  return Math.round((amountCents * ratePercent) / 100);
}
