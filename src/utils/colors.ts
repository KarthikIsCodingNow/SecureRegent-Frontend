export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

export function rgbToHue(r: number, g: number, b: number): number {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const delta = max - min;

  if (delta === 0) return 0;

  let h = 0;
  if (max === nr) {
    h = ((ng - nb) / delta) % 6;
  } else if (max === ng) {
    h = (nb - nr) / delta + 2;
  } else {
    h = (nr - ng) / delta + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return h;
}

export function getHueFromHex(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  return rgbToHue(rgb.r, rgb.g, rgb.b);
}

export function isProhibitedHue(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const delta = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
  if (delta < 15) return false;
  const hue = rgbToHue(rgb.r, rgb.g, rgb.b);
  return hue >= 255 && hue <= 320;
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function calculateContrast(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function getContrastBadge(ratio: number): { label: string; pass: boolean } {
  const pass = ratio >= 4.5;
  const label = `${ratio.toFixed(1)}:1 ${pass ? "AA Pass" : "AA Fail"}`;
  return { label, pass };
}

export function getContrastTextColor(backgroundHex: string): string {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) return "#FFFFFF";
  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  return lum > 0.4 ? "#0F1114" : "#FFFFFF";
}
