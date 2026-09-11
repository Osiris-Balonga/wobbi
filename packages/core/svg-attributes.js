const CASE_SENSITIVE_SVG_ATTRIBUTES = new Set([
  'gradientTransform',
  'gradientUnits',
  'preserveAspectRatio',
  'viewBox',
]);

export function svgAttributeName(name) {
  if (CASE_SENSITIVE_SVG_ATTRIBUTES.has(name)) return name;
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
