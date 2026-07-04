import { Download, Package, CheckCircle, Eye, X } from 'lucide-react';
import { useState } from 'react';
import { ResizeResult } from '../lib/resizer';
import { downloadBlob, buildZip } from '../lib/download';

interface ResultsGalleryProps {
  results: ResizeResult[];
  originalDimensions: { width: number; height: number };
}

export function ResultsGallery({ results, originalDimensions }: ResultsGalleryProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<ResizeResult | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const downloadImage = (result: ResizeResult) => {
    setDownloading(result.platform.id);
    downloadBlob(result.blob, result.filename);
    setDownloadedIds(prev => new Set([...prev, result.platform.id]));
    setTimeout(() => setDownloading(null), 500);
  };

  const downloadAllAsZip = async () => {
    if (results.length === 0) return;
    setIsDownloadingAll(true);
    try {
      const files = results.map(r => ({ name: r.filename, blob: r.blob }));
      const zipBlob = await buildZip(files);
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadBlob(zipBlob, `social-media-images-${timestamp}.zip`);
      setDownloadedIds(new Set(results.map(r => r.platform.id)));
    } finally {
      setTimeout(() => setIsDownloadingAll(false), 500);
    }
  };

  const getAspectRatioLabel = (width: number, height: number): string => {
    const ratio = width / height;
    if (Math.abs(ratio - 1) < 0.01) return '1:1';
    if (Math.abs(ratio - 9 / 16) < 0.01) return '9:16';
    if (Math.abs(ratio - 16 / 9) < 0.01) return '16:9';
    if (Math.abs(ratio - 4 / 5) < 0.01) return '4:5';
    if (Math.abs(ratio - 4 / 3) < 0.01) return '4:3';
    if (Math.abs(ratio - 3 / 1) < 0.01) return '3:1';
    if (Math.abs(ratio - 3 / 2) < 0.01) return '3:2';
    return ratio.toFixed(2);
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Instagram: 'bg-gradient-to-r from-pink-500 to-purple-500',
      'Twitter/X': 'bg-sky-500',
      LinkedIn: 'bg-blue-600',
      YouTube: 'bg-red-600',
      TikTok: 'bg-black border border-neutral-700',
      Facebook: 'bg-blue-500',
      Pinterest: 'bg-red-500',
      Universal: 'bg-neutral-600',
    };
    return colors[category] || 'bg-neutral-600';
  };

  if (results.length === 0) return null;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/20 rounded-lg">
            <Package className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Generated Images</h3>
            <p className="text-sm text-neutral-500">
              {results.length} images ready for download
            </p>
          </div>
        </div>

        <button
          onClick={downloadAllAsZip}
          disabled={isDownloadingAll}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium
            transition-all duration-300
            ${isDownloadingAll
              ? 'bg-teal-500/30 text-teal-300'
              : 'bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25'
            }
          `}
        >
          <Download className={`w-4 h-4 ${isDownloadingAll ? 'animate-bounce' : ''}`} />
          {isDownloadingAll ? 'Creating ZIP...' : 'Download All (ZIP)'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map(result => {
          const isDownloaded = downloadedIds.has(result.platform.id);
          const isCurrentDownload = downloading === result.platform.id;
          const ratio = getAspectRatioLabel(result.platform.width, result.platform.height);

          return (
            <div
              key={result.platform.id}
              className="group relative bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden hover:border-teal-500/30 transition-all duration-300"
            >
              <div className="aspect-square relative overflow-hidden bg-neutral-800">
                <img
                  src={result.dataUrl}
                  alt={result.platform.name}
                  className="w-full h-full object-contain"
                />

                <button
                  onClick={() => setPreviewImage(result)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="p-3 bg-neutral-900/90 rounded-full">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </button>

                <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium text-white ${getCategoryColor(result.platform.category)}`}>
                  {result.platform.category}
                </div>

                {isDownloaded && (
                  <div className="absolute top-2 right-2 p-1.5 bg-teal-500 rounded-full">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate">
                    {result.platform.name}
                  </p>
                  <span className="text-xs px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">
                    {ratio}
                  </span>
                </div>

                <p className="text-xs text-neutral-500">
                  {result.platform.width} × {result.platform.height}
                </p>

                <button
                  onClick={() => downloadImage(result)}
                  disabled={isCurrentDownload}
                  className={`
                    w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isCurrentDownload
                      ? 'bg-teal-500/30 text-teal-300'
                      : 'bg-neutral-800 hover:bg-teal-500/20 text-neutral-300 hover:text-teal-300'
                    }
                  `}
                >
                  <Download className={`w-4 h-4 ${isCurrentDownload ? 'animate-bounce' : ''}`} />
                  {isCurrentDownload ? 'Downloading...' : 'Download'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-700"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-neutral-800/80 hover:bg-red-500/20 rounded-full transition-colors group"
            >
              <X className="w-5 h-5 text-neutral-400 group-hover:text-red-400" />
            </button>

            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`px-3 py-1 rounded-lg text-sm font-medium text-white ${getCategoryColor(previewImage.platform.category)}`}>
                  {previewImage.platform.category}
                </div>
                <h4 className="text-lg font-semibold text-white">
                  {previewImage.platform.name}
                </h4>
              </div>

              <div className="bg-neutral-800 rounded-xl p-4 flex items-center justify-center">
                <img
                  src={previewImage.dataUrl}
                  alt={previewImage.platform.name}
                  className="max-h-[60vh] object-contain rounded-lg"
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-neutral-400">
                <div>
                  <span className="text-neutral-500">Original:</span> {originalDimensions.width} × {originalDimensions.height}
                </div>
                <div>
                  <span className="text-neutral-500">Output:</span> {previewImage.platform.width} × {previewImage.platform.height}
                </div>
              </div>

              <button
                onClick={() => {
                  downloadImage(previewImage);
                  setPreviewImage(null);
                }}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-medium transition-colors"
              >
                <Download className="w-5 h-5" />
                Download This Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
