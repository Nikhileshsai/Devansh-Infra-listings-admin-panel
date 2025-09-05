/**
 * Formats a number into a string representing Indian Lakhs or Crores.
 * e.g., 5000000 becomes "₹ 50 L", 15000000 becomes "₹ 1.5 Cr".
 * @param price The numerical price value.
 * @returns A formatted string or 'N/A' if the price is invalid.
 */
export const formatPriceInLakhsCrores = (price: number | null | undefined): string => {
  if (price === null || price === undefined || isNaN(price)) {
    return 'N/A';
  }

  const CRORE = 10000000;
  const LAKH = 100000;

  if (price >= CRORE) {
    const value = price / CRORE;
    // Show one decimal place if it's not a round number, otherwise show none.
    const formattedValue = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
    return `₹ ${formattedValue} Cr`;
  }
  
  if (price >= LAKH) {
    const value = price / LAKH;
    const formattedValue = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
    return `₹ ${formattedValue} L`;
  }
  
  // For values less than a lakh, format with commas.
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};
