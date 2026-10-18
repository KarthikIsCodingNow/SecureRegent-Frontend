export function formatCurrency(amount: number, compact = false, currencySymbol = "₹"): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return `${currencySymbol}0`;
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (compact) {
    if (absAmount >= 10000000) {
      const cr = absAmount / 10000000;
      const formatted = cr >= 10 ? cr.toFixed(1) : cr.toFixed(2);
      return `${isNegative ? "-" : ""}${currencySymbol}${parseFloat(formatted)}Cr`;
    }
    if (absAmount >= 100000) {
      const lakh = absAmount / 100000;
      const formatted = lakh >= 10 ? lakh.toFixed(1) : lakh.toFixed(2);
      return `${isNegative ? "-" : ""}${currencySymbol}${parseFloat(formatted)}L`;
    }
    if (absAmount >= 1000) {
      const k = absAmount / 1000;
      return `${isNegative ? "-" : ""}${currencySymbol}${parseFloat(k.toFixed(1))}k`;
    }
    return `${isNegative ? "-" : ""}${currencySymbol}${Math.round(absAmount)}`;
  }

  const rounded = Math.round(absAmount);
  const parts = rounded.toString().split(".");
  let intPart = parts[0];
  const lastThree = intPart.substring(intPart.length - 3);
  const otherNumbers = intPart.substring(0, intPart.length - 3);
  if (otherNumbers !== "") {
    intPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  } else {
    intPart = lastThree;
  }

  return `${isNegative ? "-" : ""}${currencySymbol}${intPart}`;
}

export function formatNumber(value: number, compact = false): string {
  if (isNaN(value) || !isFinite(value)) {
    return "0";
  }

  const isNegative = value < 0;
  const abs = Math.abs(value);

  if (compact) {
    if (abs >= 10000000) {
      const cr = abs / 10000000;
      return `${isNegative ? "-" : ""}${parseFloat(cr.toFixed(1))}Cr`;
    }
    if (abs >= 100000) {
      const lakh = abs / 100000;
      return `${isNegative ? "-" : ""}${parseFloat(lakh.toFixed(1))}L`;
    }
    if (abs >= 1000) {
      const k = abs / 1000;
      return `${isNegative ? "-" : ""}${parseFloat(k.toFixed(1))}k`;
    }
    return `${isNegative ? "-" : ""}${abs}`;
  }

  const rounded = Math.round(abs);
  const parts = rounded.toString().split(".");
  let intPart = parts[0];
  const lastThree = intPart.substring(intPart.length - 3);
  const otherNumbers = intPart.substring(0, intPart.length - 3);
  if (otherNumbers !== "") {
    intPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  } else {
    intPart = lastThree;
  }

  return `${isNegative ? "-" : ""}${intPart}`;
}

export interface DeltaResult {
  text: string;
  value: number;
  isNew: boolean;
  isNeutral: boolean;
  isPositive: boolean;
  inverted: boolean;
}

export function computePercentageDelta(
  current: number,
  previous: number,
  lowerIsBetter = false
): DeltaResult {
  if (previous === 0) {
    if (current > 0) {
      return {
        text: "New",
        value: 100,
        isNew: true,
        isNeutral: false,
        isPositive: !lowerIsBetter,
        inverted: lowerIsBetter
      };
    }
    return {
      text: "—",
      value: 0,
      isNew: false,
      isNeutral: true,
      isPositive: false,
      inverted: lowerIsBetter
    };
  }

  const delta = ((current - previous) / previous) * 100;
  if (isNaN(delta) || !isFinite(delta)) {
    return {
      text: "—",
      value: 0,
      isNew: false,
      isNeutral: true,
      isPositive: false,
      inverted: lowerIsBetter
    };
  }

  const absDelta = Math.abs(delta);
  if (absDelta < 0.05) {
    return {
      text: "0.0%",
      value: 0,
      isNew: false,
      isNeutral: true,
      isPositive: false,
      inverted: lowerIsBetter
    };
  }

  const formattedText = `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`;
  const isPositiveDirection = delta > 0;
  const isPositive = lowerIsBetter ? !isPositiveDirection : isPositiveDirection;

  return {
    text: formattedText,
    value: delta,
    isNew: false,
    isNeutral: false,
    isPositive,
    inverted: lowerIsBetter
  };
}

export function formatRelativeTime(dateStr: string, now = new Date()): string {
  const date = new Date(dateStr);
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) {
    return "just now";
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "yesterday";
  }
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
}

export function safeParseInteger(val: unknown, fallback = 0): number {
  if (typeof val === "number") {
    return Number.isSafeInteger(val) ? val : Math.trunc(Number.isFinite(val) ? val : fallback);
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return fallback;
    const parsed = Number(trimmed);
    return Number.isSafeInteger(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function safeParseFloat(val: unknown, fallback = 0): number {
  if (typeof val === "number") {
    return Number.isFinite(val) ? val : fallback;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return fallback;
    const parsed = parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

