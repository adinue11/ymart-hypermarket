
import imageCompression from "browser-image-compression";

export async function compressImage(
  file: File,
  type: "product" | "poster" | "gallery" = "product"
): Promise<File> {
  // Keep animated GIFs and SVG files unchanged.
  if (
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return file;
  }

  const settings = {
    product: { maxWidthOrHeight: 1600, maxSizeMB: 0.3 },
    poster: { maxWidthOrHeight: 1920, maxSizeMB: 0.5 },
    gallery: { maxWidthOrHeight: 1600, maxSizeMB: 0.3 },
  };

  const options = settings[type];

  const compressed = await imageCompression(file, {
    maxSizeMB: options.maxSizeMB,
    maxWidthOrHeight: options.maxWidthOrHeight,
    useWebWorker: true,
    initialQuality: 0.82,
  });

  return new File(
    [compressed],
    file.name,
    {
      type: compressed.type,
      lastModified: Date.now(),
    }
  );
}
