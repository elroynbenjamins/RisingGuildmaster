/** Compact visual totals; callers retain the exact value in the accessibility label. */
export function compactResourceAmount(value: number): string {
  const amount = Math.abs(value);
  if (amount < 10000) return value.toLocaleString("en-US");
  const units = ["K", "M", "B", "T"];
  let index = Math.min(3, Math.floor(Math.log10(amount) / 3) - 1);
  let rounded = Math.round(amount / 1000 ** (index + 1) * 10) / 10;
  if (rounded >= 1000 && index < 3) { index++; rounded = 1; }
  return (value < 0 ? "−" : "") + rounded + units[index];
}
