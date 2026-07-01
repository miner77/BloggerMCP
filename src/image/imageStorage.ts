export type StoredImage = {
  url: string;
  alt: string;
  source: string;
};

export type ImageStorageResult = {
  images: StoredImage[];
  warnings: string[];
};

export interface ImageStorage {
  storeImage(source: string, alt?: string): Promise<StoredImage>;
}

export function isImageUrl(value: string): boolean {
  return /^https?:\/\/.+\.(png|jpe?g|webp)(\?.*)?$/i.test(value);
}

export function generateAltText(source: string, fallback = "blog post image"): string {
  const fileName = source.split(/[\\/]/).pop()?.replace(/\.(png|jpe?g|webp)$/i, "") ?? fallback;
  const words = fileName
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return words ? words[0]!.toUpperCase() + words.slice(1) : fallback;
}

export function renderImageHtml(images: StoredImage[], options?: { gallery?: boolean; position?: string }): string {
  if (images.length === 0) return "";

  if (images.length === 1 && !options?.gallery) {
    const image = images[0]!;
    return `<figure><img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt)}" loading="lazy" /><figcaption>${escapeHtml(image.alt)}</figcaption></figure>`;
  }

  const inner = images
    .map(
      (image) =>
        `<figure><img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt)}" loading="lazy" /><figcaption>${escapeHtml(image.alt)}</figcaption></figure>`
    )
    .join("\n");
  return `<div class="post-image-gallery">\n${inner}\n</div>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
