/**
 * Currency Utility
 * Default locale: Philippines (PHP)
 * 
 * Converts and formats amounts in the user's local currency.
 * Falls back to PHP (₱) for Philippine-based users.
 */

// Default exchange rates (USD → target). Updated periodically via API.
const EXCHANGE_RATES = {
  PHP: 56.50,  // Philippine Peso
  USD: 1.00,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  KRW: 1320.00,
  INR: 83.40,
  AUD: 1.54,
  SGD: 1.34,
  MYR: 4.72,
  THB: 35.80,
}

const CURRENCY_SYMBOLS = {
  PHP: '₱',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  KRW: '₩',
  INR: '₹',
  AUD: 'A$',
  SGD: 'S$',
  MYR: 'RM',
  THB: '฿',
}

const CURRENCY_LOCALES = {
  PHP: 'en-PH',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  KRW: 'ko-KR',
  INR: 'en-IN',
  AUD: 'en-AU',
  SGD: 'en-SG',
  MYR: 'ms-MY',
  THB: 'th-TH',
}

/**
 * Get the user's preferred currency from localStorage, default to PHP.
 */
export function getUserCurrency() {
  return localStorage.getItem('user-currency') || 'PHP'
}

/**
 * Set the user's preferred currency.
 */
export function setUserCurrency(currency) {
  localStorage.setItem('user-currency', currency)
}

/**
 * Convert a USD amount to the user's local currency.
 * @param {number} usdAmount - Amount in USD
 * @param {string} [targetCurrency] - Override currency code
 * @returns {number} Converted amount
 */
export function convertFromUSD(usdAmount, targetCurrency) {
  const currency = targetCurrency || getUserCurrency()
  const rate = EXCHANGE_RATES[currency] || 1
  return usdAmount * rate
}

/**
 * Format an amount in the user's local currency with symbol.
 * @param {number} amount - Amount in USD (will be converted)
 * @param {object} [options]
 * @param {boolean} [options.fromUSD=true] - Whether to convert from USD
 * @param {string} [options.currency] - Override currency code
 * @param {number} [options.decimals=0] - Decimal places
 * @returns {string} Formatted amount like "₱56,500"
 */
export function formatCurrency(amount, options = {}) {
  const { fromUSD = true, currency: overrideCurrency, decimals = 0 } = options
  const currency = overrideCurrency || getUserCurrency()
  const converted = fromUSD ? convertFromUSD(amount, currency) : amount
  const locale = CURRENCY_LOCALES[currency] || 'en-PH'

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(converted)
  } catch {
    // Fallback
    const symbol = CURRENCY_SYMBOLS[currency] || currency
    return `${symbol}${Number(converted).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
  }
}

/**
 * Get the currency symbol for the current user currency.
 */
export function getCurrencySymbol(currencyCode) {
  const code = currencyCode || getUserCurrency()
  return CURRENCY_SYMBOLS[code] || code
}

/**
 * Get all supported currencies for a settings dropdown.
 */
export function getSupportedCurrencies() {
  return Object.keys(EXCHANGE_RATES).map(code => ({
    code,
    symbol: CURRENCY_SYMBOLS[code],
    label: `${CURRENCY_SYMBOLS[code]} ${code}`,
  }))
}

export default {
  formatCurrency,
  convertFromUSD,
  getUserCurrency,
  setUserCurrency,
  getCurrencySymbol,
  getSupportedCurrencies,
}
