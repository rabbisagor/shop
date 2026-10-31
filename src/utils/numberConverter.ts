const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const enDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function toBengaliNumerals(value: number | string): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return str.replace(/[0-9]/g, (digit) => bnDigits[parseInt(digit, 10)]);
}

export function toEnglishNumerals(value: string): string {
  if (!value) return '';
  let result = value;
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(bnDigits[i], enDigits[i]);
  }
  return result;
}

export function parseBengaliOrEnglishNumber(input: string | number): number {
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  if (!input) return 0;
  const enStr = toEnglishNumerals(String(input)).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(enStr);
  return isNaN(parsed) ? 0 : parsed;
}

export interface FormatNumberOptions {
  isCurrency?: boolean;
  currencySymbol?: string;
  decimals?: number;
  useGrouping?: boolean;
}

export function formatNumber(
  value: number | string | undefined | null,
  useBengaliNumerals = true,
  options: FormatNumberOptions = {}
): string {
  if (value === null || value === undefined) return useBengaliNumerals ? '০' : '0';

  const num = typeof value === 'number' ? value : parseBengaliOrEnglishNumber(value);
  const {
    isCurrency = false,
    currencySymbol = '৳',
    decimals = 0,
    useGrouping = true,
  } = options;

  // Format with standard Intl or decimals
  let formatted = '';
  if (decimals > 0) {
    formatted = num.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping,
    });
  } else {
    formatted = num.toLocaleString('en-IN', {
      useGrouping,
      maximumFractionDigits: 0,
    });
  }

  // Convert to Bengali if required
  let result = useBengaliNumerals ? toBengaliNumerals(formatted) : formatted;

  if (isCurrency) {
    result = `${currencySymbol} ${result}`;
  }

  return result;
}

export function formatDateBn(
  dateString?: string,
  useBengaliNumerals = true,
  includeTime = false
): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let formatted = `${day}/${month}/${year}`;
    if (includeTime) {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      formatted += ` ${hours}:${minutes}`;
    }

    return useBengaliNumerals ? toBengaliNumerals(formatted) : formatted;
  } catch {
    return dateString;
  }
}

export function getDaysRemaining(expiryDateStr?: string): number | null {
  if (!expiryDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDateStr);
  if (isNaN(exp.getTime())) return null;
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
