/**
 * Generates an animated SVG shimmer string for progressive image placeholders.
 */
export const shimmer = (w: number, h: number): string => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#18181b" offset="20%" />
      <stop stop-color="#27272a" offset="50%" />
      <stop stop-color="#18181b" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#18181b" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"  />
</svg>`;

export const toBase64 = (str: string): string =>
    typeof window === "undefined"
        ? Buffer.from(str).toString("base64")
        : window.btoa(str);

/**
 * Returns a data URI string containing an animated dark-theme shimmer placeholder.
 */
export const getShimmerDataUrl = (w: number = 700, h: number = 475): string =>
    `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;
