import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { generateAltText, ImageStorage, isImageUrl, StoredImage } from "./imageStorage.js";

const SUPPORTED_IMAGE_RE = /\.(png|jpe?g|webp)$/i;

export class UrlImageStorage implements ImageStorage {
  async storeImage(source: string, alt?: string): Promise<StoredImage> {
    if (!isImageUrl(source)) {
      throw new Error(`Image URL must be http(s) and end in png, jpg, jpeg, or webp: ${source}`);
    }
    return { url: source, alt: alt ?? generateAltText(source), source };
  }
}

export class PublicAssetImageStorage implements ImageStorage {
  async storeImage(source: string, alt?: string): Promise<StoredImage> {
    if (!SUPPORTED_IMAGE_RE.test(source)) {
      throw new Error(`Unsupported image extension: ${source}`);
    }
    if (!config.imageAssetDir || !config.imagePublicBaseUrl) {
      throw new Error("BLOGGER_IMAGE_ASSET_DIR and BLOGGER_IMAGE_PUBLIC_BASE_URL must be set for local image publishing.");
    }

    const stat = await fs.stat(source);
    if (!stat.isFile()) {
      throw new Error(`Image path is not a file: ${source}`);
    }

    await fs.mkdir(config.imageAssetDir, { recursive: true });
    const ext = path.extname(source).toLowerCase();
    const baseName = path.basename(source, ext).replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
    const targetName = `${baseName}-${Date.now()}${ext}`;
    const targetPath = path.join(config.imageAssetDir, targetName);
    await fs.copyFile(source, targetPath);

    return {
      url: `${config.imagePublicBaseUrl.replace(/\/$/, "")}/${encodeURIComponent(targetName)}`,
      alt: alt ?? generateAltText(source),
      source
    };
  }
}

export async function collectLatestScreenshots(input: {
  projectDir?: string;
  screenshotDir?: string;
  limit?: number;
}): Promise<string[]> {
  const base = input.screenshotDir
    ? path.resolve(input.projectDir ?? process.cwd(), input.screenshotDir)
    : path.resolve(input.projectDir ?? process.cwd(), "screenshots");

  const entries = await fs.readdir(base, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && SUPPORTED_IMAGE_RE.test(entry.name))
      .map(async (entry) => {
        const filePath = path.join(base, entry.name);
        const stat = await fs.stat(filePath);
        return { filePath, mtimeMs: stat.mtimeMs };
      })
  );

  return files
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .slice(0, input.limit ?? 4)
    .map((file) => file.filePath);
}

export async function storeImages(input: {
  imageUrls?: string[];
  imagePaths?: string[];
  altTexts?: string[];
}): Promise<{ images: StoredImage[]; warnings: string[] }> {
  const warnings: string[] = [];
  const images: StoredImage[] = [];
  const urlStorage = new UrlImageStorage();
  const assetStorage = new PublicAssetImageStorage();

  const sources = [
    ...(input.imageUrls ?? []).map((source) => ({ source, kind: "url" as const })),
    ...(input.imagePaths ?? []).map((source) => ({ source, kind: "path" as const }))
  ];

  for (const [index, item] of sources.entries()) {
    try {
      const stored = item.kind === "url"
        ? await urlStorage.storeImage(item.source, input.altTexts?.[index])
        : await assetStorage.storeImage(path.resolve(item.source), input.altTexts?.[index]);
      images.push(stored);
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : String(error));
    }
  }

  return { images, warnings };
}
