import { useState, useCallback } from 'react';
import { Upload, ImageIcon, X } from 'lucide-react';
import { getImageDimensions, formatFileSize } from '../lib/resizer';

interface ImageUploaderProps {
  onImageSelect: (file: File, dimensions: { width: number; height: number }) => void;
  isProcessing: boolean;
}

export function ImageUploader({ onImageSelect, isProcessing }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; dimensions: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError('Please upload a JPG, PNG, or WebP image');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Image must be smaller than 50MB');
      return;
    }

    setError(null);
    const dimensions = await getImageDimensions(file);
    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);
    setFileInfo({
      name: file.name,
      size: formatFileSize(file.size),
      dimensions: `${dimensions.width} × ${dimensions.height}`,
    });

    onImageSelect(file, dimensions);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const clearImage = useCallback(() => {
    setPreview(null);
    setFileInfo(null);
    setError(null);
  }, []);

  return (
    <div className="w-full">
      {!preview ? (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative flex flex-col items-center justify-center
            w-full h-72 border-2 border-dashed rounded-2xl
            transition-all duration-300 cursor-pointer
            ${isDragging
              ? 'border-teal-400 bg-teal-400/10 scale-[1.02]'
              : 'border-neutral-700 bg-neutral-900/50 hover:border-teal-500/50 hover:bg-neutral-800/50'
            }
            ${isProcessing ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />

          <div className={`
            flex flex-col items-center gap-4 transition-transform duration-300
            ${isDragging ? 'scale-110' : ''}
          `}>
            <div className={`
              p-4 rounded-full transition-colors duration-300
              ${isDragging ? 'bg-teal-500/20' : 'bg-neutral-800'}
            `}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-teal-400' : 'text-neutral-400'}`} />
            </div>

            <div className="text-center">
              <p className="text-lg font-medium text-white mb-1">
                Drop your image here
              </p>
              <p className="text-sm text-neutral-500">
                or <span className="text-teal-400 hover:text-teal-300">browse files</span>
              </p>
            </div>

            <p className="text-xs text-neutral-600">
              JPG, PNG, WebP up to 50MB
            </p>
          </div>
        </label>
      ) : (
        <div className="relative bg-neutral-900/50 rounded-2xl border border-neutral-800 overflow-hidden">
          <button
            onClick={clearImage}
            className="absolute top-3 right-3 z-10 p-2 bg-neutral-900/80 hover:bg-red-500/20 rounded-full transition-colors group"
          >
            <X className="w-5 h-5 text-neutral-400 group-hover:text-red-400" />
          </button>

          <div className="flex items-center gap-4 p-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-teal-400" />
                <p className="text-sm font-medium text-white truncate">
                  {fileInfo?.name}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-neutral-500">
                  Dimensions: <span className="text-neutral-300">{fileInfo?.dimensions}</span>
                </p>
                <p className="text-xs text-neutral-500">
                  Size: <span className="text-neutral-300">{fileInfo?.size}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
