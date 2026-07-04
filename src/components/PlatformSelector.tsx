import { useState } from 'react';
import { platforms, PlatformSize, getCategories, getPlatformsByCategory } from '../lib/platforms';
import { Check, ChevronDown, LayoutGrid } from 'lucide-react';

interface PlatformSelectorProps {
  selectedPlatforms: PlatformSize[];
  onSelectionChange: (platforms: PlatformSize[]) => void;
}

export function PlatformSelector({ selectedPlatforms, onSelectionChange }: PlatformSelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Instagram');

  const categories = getCategories();

  const togglePlatform = (platform: PlatformSize) => {
    const isSelected = selectedPlatforms.some(p => p.id === platform.id);
    if (isSelected) {
      onSelectionChange(selectedPlatforms.filter(p => p.id !== platform.id));
    } else {
      onSelectionChange([...selectedPlatforms, platform]);
    }
  };

  const toggleCategory = (category: string) => {
    const categoryPlatforms = getPlatformsByCategory(category);
    const allSelected = categoryPlatforms.every(p =>
      selectedPlatforms.some(sp => sp.id === p.id)
    );

    if (allSelected) {
      onSelectionChange(selectedPlatforms.filter(p => p.category !== category));
    } else {
      const newSelections = [...selectedPlatforms];
      categoryPlatforms.forEach(p => {
        if (!newSelections.some(sp => sp.id === p.id)) {
          newSelections.push(p);
        }
      });
      onSelectionChange(newSelections);
    }
  };

  const selectAll = () => {
    onSelectionChange([...platforms]);
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'Instagram': '📱',
      'Twitter/X': '🐦',
      'LinkedIn': '💼',
      'YouTube': '▶️',
      'TikTok': '🎵',
      'Facebook': '📘',
      'Pinterest': '📌',
      'Universal': '⬜',
    };
    return icons[category] || '📷';
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-semibold text-white">Select Platforms</h3>
          <span className="text-sm text-neutral-500">
            ({selectedPlatforms.length} selected)
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 hover:bg-teal-400/10 rounded-lg transition-colors"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {categories.map(category => {
          const categoryPlatforms = getPlatformsByCategory(category);
          const allSelected = categoryPlatforms.every(p =>
            selectedPlatforms.some(sp => sp.id === p.id)
          );
          const someSelected = categoryPlatforms.some(p =>
            selectedPlatforms.some(sp => sp.id === p.id)
          );
          const isExpanded = expandedCategory === category;

          return (
            <div
              key={category}
              className="rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden"
            >
              <button
                onClick={() => {
                  setExpandedCategory(isExpanded ? null : category);
                }}
                onDoubleClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      allSelected
                        ? 'bg-teal-500 border-teal-500'
                        : someSelected
                          ? 'bg-teal-500/30 border-teal-500/50'
                          : 'border-neutral-600'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category);
                    }}
                  >
                    {allSelected && <Check className="w-3 h-3 text-white" />}
                    {!allSelected && someSelected && <div className="w-2 h-0.5 bg-teal-400 rounded" />}
                  </div>
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <span className="font-medium text-white">{category}</span>
                  <span className="text-xs text-neutral-600">
                    ({categoryPlatforms.length})
                  </span>
                </div>

                <ChevronDown
                  className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categoryPlatforms.map(platform => {
                    const isSelected = selectedPlatforms.some(p => p.id === platform.id);
                    const aspectRatio = (platform.width / platform.height).toFixed(2);

                    return (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform)}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-teal-500/10 border border-teal-500/30'
                            : 'bg-neutral-800/50 border border-transparent hover:border-neutral-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected
                              ? 'bg-teal-500 border-teal-500'
                              : 'border-neutral-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>

                        <div className="flex-1 text-left">
                          <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                            {platform.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {platform.width} × {platform.height} ({aspectRatio})
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
