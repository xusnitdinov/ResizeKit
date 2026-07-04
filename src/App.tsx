import { useState, useCallback } from 'react';
import { ImageUp, Zap, Shield, Download } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PlatformSelector } from './components/PlatformSelector';
import { ResultsGallery } from './components/ResultsGallery';
import { PlatformSize } from './lib/platforms';
import { ResizeResult, resizeForAllPlatforms } from './lib/resizer';
import { supabase } from './lib/supabase';

function AppContent() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformSize[]>([]);
  const [results, setResults] = useState<ResizeResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [saveToCloud, setSaveToCloud] = useState(false);

  const handleImageSelect = useCallback((file: File, dimensions: { width: number; height: number }) => {
    setSelectedImage(file);
    setImageDimensions(dimensions);
    setResults([]);
  }, []);

  const handleGenerate = async () => {
    if (!selectedImage || selectedPlatforms.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: selectedPlatforms.length });
    setResults([]);

    try {
      const resizeResults = await resizeForAllPlatforms(
        selectedImage,
        selectedPlatforms,
        (current, total) => setProgress({ current, total })
      );

      setResults(resizeResults);

      if (user && saveToCloud) {
        await supabase.from('resize_history').insert({
          original_filename: selectedImage.name,
          original_width: imageDimensions?.width,
          original_height: imageDimensions?.height,
          platforms_generated: selectedPlatforms.map(p => p.id),
        });
      }
    } catch (error) {
      console.error('Error resizing images:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Header
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSaveToCloudChange={setSaveToCloud}
        saveToCloud={saveToCloud}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="text-white">Resize for </span>
            <span className="text-teal-400">Every Platform</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Upload one image, get perfectly sized versions for all social media platforms.
            Fast, private, and free.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-500/20 rounded-lg">
                  <ImageUp className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Upload Image</h3>
              </div>

              <ImageUploader
                onImageSelect={handleImageSelect}
                isProcessing={isProcessing}
              />
            </div>

            {selectedImage && (
              <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6">
                <PlatformSelector
                  selectedPlatforms={selectedPlatforms}
                  onSelectionChange={setSelectedPlatforms}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            {selectedPlatforms.length > 0 && selectedImage && (
              <div className={`bg-gradient-to-r ${
                isProcessing
                  ? 'from-neutral-800 to-neutral-800'
                  : 'from-teal-500/20 to-emerald-500/20'
              } rounded-2xl border border-teal-500/30 p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Zap className={`w-5 h-5 ${isProcessing ? 'text-neutral-400 animate-pulse' : 'text-teal-400'}`} />
                    <div>
                      <p className="font-medium text-white">
                        {isProcessing
                          ? `Processing ${progress.current}/${progress.total}...`
                          : 'Ready to Generate'
                        }
                      </p>
                      <p className="text-sm text-neutral-500">
                        {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/50 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    {isProcessing ? 'Processing...' : 'Generate All'}
                  </button>
                </div>

                {isProcessing && (
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {results.length > 0 && imageDimensions && (
              <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6">
                <ResultsGallery
                  results={results}
                  originalDimensions={imageDimensions}
                />
              </div>
            )}

            {!selectedImage && (
              <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6 text-center">
                <p className="text-neutral-500">
                  Select an image and platforms to get started
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 mb-8">
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-neutral-900/30 rounded-xl border border-neutral-800 p-6">
              <div className="p-3 bg-teal-500/10 rounded-lg w-fit mb-4">
                <Zap className="w-6 h-6 text-teal-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Instant Processing</h4>
              <p className="text-sm text-neutral-400">
                All processing happens in your browser. No uploads to slow servers.
              </p>
            </div>

            <div className="bg-neutral-900/30 rounded-xl border border-neutral-800 p-6">
              <div className="p-3 bg-teal-500/10 rounded-lg w-fit mb-4">
                <Shield className="w-6 h-6 text-teal-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">100% Private</h4>
              <p className="text-sm text-neutral-400">
                Your images never leave your device unless you choose to save them.
              </p>
            </div>

            <div className="bg-neutral-900/30 rounded-xl border border-neutral-800 p-6">
              <div className="p-3 bg-teal-500/10 rounded-lg w-fit mb-4">
                <Download className="w-6 h-6 text-teal-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Batch Download</h4>
              <p className="text-sm text-neutral-400">
                Download individual images or get everything as a ZIP file.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-neutral-500">
            ResizeKit - Free Social Media Image Resizer
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            No login required. Works entirely in your browser.
          </p>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
