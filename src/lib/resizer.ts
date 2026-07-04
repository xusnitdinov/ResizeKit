import { PlatformSize } from './platforms';

export interface ResizeResult {
  platform: PlatformSize;
  blob: Blob;
  dataUrl: string;
  filename: string;
}

export async function resizeImage(
  sourceImage: HTMLImageElement,
  platform: PlatformSize,
  cropPosition: number = 0.5,
  format: 'image/png' = 'image/png'
): Promise<ResizeResult> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const { width: targetWidth, height: targetHeight } = platform;
  const sourceWidth = sourceImage.naturalWidth;
  const sourceHeight = sourceImage.naturalHeight;

  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = sourceWidth / sourceHeight;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  let sx: number, sy: number, sw: number, sh: number;

  if (sourceRatio > targetRatio) {
    sh = sourceHeight;
    sw = sourceHeight * targetRatio;
    sy = 0;
    sx = cropPosition * (sourceWidth - sw);
  } else {
    sw = sourceWidth;
    sh = sourceWidth / targetRatio;
    sx = 0;
    sy = cropPosition * (sourceHeight - sh);
  }

  sx = Math.max(0, Math.min(sx, sourceWidth - sw));
  sy = Math.max(0, Math.min(sy, sourceHeight - sh));

  ctx.drawImage(sourceImage, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      format,
      0.95
    );
  });

  const dataUrl = canvas.toDataURL(format);

  const ext = format.split('/')[1];
  const filename = `${platform.id}.${ext}`;

  return {
    platform,
    blob,
    dataUrl,
    filename,
  };
}

export async function resizeForAllPlatforms(
  file: File,
  selectedPlatforms: PlatformSize[],
  onProgress?: (current: number, total: number) => void
): Promise<ResizeResult[]> {
  const imageDataUrl = await readFileAsDataURL(file);
  const image = await loadImage(imageDataUrl);

  const results: ResizeResult[] = [];

  for (let i = 0; i < selectedPlatforms.length; i++) {
    const result = await resizeImage(image, selectedPlatforms[i], 0.5);
    results.push(result);
    if (onProgress) {
      onProgress(i + 1, selectedPlatforms.length);
    }
  }

  return results;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
