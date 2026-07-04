import { User, LogOut, Sparkles, Cloud } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onOpenAuth: () => void;
  onSaveToCloudChange: (save: boolean) => void;
  saveToCloud: boolean;
}

export function Header({ onOpenAuth, onSaveToCloudChange, saveToCloud }: HeaderProps) {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onSaveToCloudChange(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                ResizeKit
              </h1>
              <p className="text-xs text-neutral-500 hidden sm:block">
                Social Media Image Resizer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <label className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl cursor-pointer hover:border-teal-500/30 transition-colors">
                <Cloud className={`w-4 h-4 ${saveToCloud ? 'text-teal-400' : 'text-neutral-500'}`} />
                <span className="text-sm text-neutral-300 hidden sm:inline">Save to Cloud</span>
                <input
                  type="checkbox"
                  checked={saveToCloud}
                  onChange={e => onSaveToCloudChange(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  saveToCloud
                    ? 'bg-teal-500 border-teal-500'
                    : 'border-neutral-600'
                }`}>
                  {saveToCloud && <span className="w-2 h-2 bg-white rounded-sm" />}
                </div>
              </label>
            )}

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-neutral-800 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-medium text-white">
                    {user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {user.email}
                  </p>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white font-medium rounded-xl transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
