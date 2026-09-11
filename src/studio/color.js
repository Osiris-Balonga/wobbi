export function hexToHsv(hex) {
  const rgb = hex
      .slice(1)
      .match(/../g)
      .map((v) => parseInt(v, 16) / 255),
    max = Math.max(...rgb),
    min = Math.min(...rgb),
    d = max - min;
  let h = 0;
  if (d) {
    const i = rgb.indexOf(max);
    h =
      (i === 0
        ? (rgb[1] - rgb[2]) / d + (rgb[1] < rgb[2] ? 6 : 0)
        : i === 1
          ? (rgb[2] - rgb[0]) / d + 2
          : (rgb[0] - rgb[1]) / d + 4) * 60;
  }
  return { h, s: max ? d / max : 0, v: max };
}
export function hsvToHex({ h, s, v }) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return '#' + f(5) + f(3) + f(1);
}
