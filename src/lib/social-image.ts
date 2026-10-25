/**
 * Social-card contract, shared by three places that must agree:
 *
 *  - `buildMetadata` (what URL, width and height are advertised in `og:image`)
 *  - the `opengraph-image` file-convention routes (what is actually rendered)
 *  - the per-family card routes (what path each page's card lives at)
 *
 * Kept free of React and JSX so it can be imported from server metadata code
 * and from unit tests without pulling a renderer into either.
 */

export const SOCIAL_IMAGE = {
  width: 1200,
  height: 630,
  contentType: "image/png",
  /** Route of the default card, served by `src/app/opengraph-image.tsx`. */
  defaultPath: "/opengraph-image",
} as const;

/**
 * Values the `opengraph-image` file convention expects to be exported from each
 * route module (`export const size`, `export const contentType`), derived here
 * so a dimension can only ever be changed in one place.
 */
export const OG_SIZE = {
  width: SOCIAL_IMAGE.width,
  height: SOCIAL_IMAGE.height,
} as const;

export const OG_CONTENT_TYPE = SOCIAL_IMAGE.contentType;

/**
 * Absolute URL for a social card. Open Graph requires absolute URLs — relative
 * `og:image` values are ignored by most crawlers — so this always resolves
 * against `SITE_URL`, which already handles the platform-provided fallbacks.
 */
export function socialImageUrl(siteUrl: string, path?: string): string {
  return `${siteUrl}${path ?? SOCIAL_IMAGE.defaultPath}`;
}

/** Per-family card route, e.g. `/insights/<slug>/opengraph-image`. */
export function cardPath(family: string, slug: string): string {
  return `/${family}/${slug}/opengraph-image`;
}
