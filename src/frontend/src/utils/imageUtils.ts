import { ExternalBlob } from "../backend";

/**
 * Converts an ExternalBlob to a URL suitable for use in <img src>
 */
export function getBlobImageUrl(blob: ExternalBlob): string {
  return blob.getDirectURL();
}

/**
 * Reads a File and converts it to an ExternalBlob for uploading
 */
export async function fileToExternalBlob(file: File): Promise<ExternalBlob> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  return ExternalBlob.fromBytes(bytes);
}

/**
 * Generates a unique key for an image upload
 */
export function generateImageKey(personId: string, cardType: string): string {
  return `${personId}-${cardType}-${Date.now()}`;
}
