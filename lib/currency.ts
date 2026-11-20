export type SupportedLocale = "ar" | "en";

/**
 * Global Algerian Dinar (DZD) currency formatter strictly backed by `Intl.NumberFormat`
 * locked to `currency: "DZD"`.
 *
 * Examples:
 * - `formatDzd(15000, "ar")` -> `"15,000 د.ج"`
 * - `formatDzd(15000, "en")` -> `"15,000 DZD"`
 */
export function formatDzd(
  amount: number,
  locale: SupportedLocale = "ar",
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const minFrac = options?.minimumFractionDigits ?? 0;
  const maxFrac = options?.maximumFractionDigits ?? 0;

  // Strictly instantiate Intl.NumberFormat locked to the Algerian Dinar (DZD)
  const intlLocale = locale === "ar" ? "ar-DZ-u-nu-latn" : "en-DZ";
  const formatter = new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
  });

  const parts = formatter.formatToParts(safeAmount);
  const numericOnly = parts
    .filter(
      (part) =>
        part.type === "minusSign" ||
        part.type === "integer" ||
        part.type === "group" ||
        part.type === "decimal" ||
        part.type === "fraction"
    )
    .map((part) => (part.type === "group" ? "," : part.value))
    .join("");

  return locale === "ar" ? `${numericOnly} د.ج` : `${numericOnly} DZD`;
}
