'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { OpenMoji } from './OpenMoji';
import { Button } from './Button';
import { Input } from './Input';
import { 
  EMOJI_CATEGORIES, 
  EMOJI_MAP, 
  EmojiInfo, 
  searchEmojis, 
  getEmojisByCategory 
} from '@/lib/openmoji/emojiMap';
import { cn } from '@/lib/utils';

export interface OpenMojiPickerProps {
  /** Currently selected emoji */
  value?: string;
  /** Called when an emoji is selected */
  onSelect: (emoji: string) => void;
  /** Called when picker is closed */
  onClose?: () => void;
  /** Whether the picker is open */
  isOpen: boolean;
  /** Custom class name */
  className?: string;
  /** Show search functionality */
  showSearch?: boolean;
  /** Show category tabs */
  showCategories?: boolean;
  /** Emoji size in the grid */
  emojiSize?: 16 | 20 | 24 | 32 | 48 | 64;
}

export function OpenMojiPicker({
  value,
  onSelect,
  onClose,
  isOpen,
  className,
  showSearch = true,
  showCategories = true,
  emojiSize = 32
}: OpenMojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('health');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Get filtered emojis based on search or category
  const getDisplayEmojis = (): EmojiInfo[] => {
    if (searchQuery.trim()) {
      return searchEmojis(searchQuery);
    }
    return getEmojisByCategory(activeCategory);
  };

  const displayEmojis = getDisplayEmojis();

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Reset search when picker opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleEmojiSelect = (emoji: EmojiInfo) => {
    onSelect(emoji.unicode);
    onClose?.();
  };

  return (
    <div 
      ref={pickerRef}
      className={cn(
        "absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl",
        "w-80 max-h-96 flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Choose Emoji
          </h3>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-auto hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search emojis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      {/* Category Tabs */}
      {showCategories && !searchQuery && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1 overflow-x-auto">
            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key as keyof typeof EMOJI_CATEGORIES)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  activeCategory === key
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <span className="text-base">{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {displayEmojis.length > 0 ? (
          <>
            {/* Search Results Header */}
            {searchQuery && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {displayEmojis.length} result{displayEmojis.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              </div>
            )}
            
            {/* Emoji Grid */}
            <div className="grid grid-cols-6 gap-2">
              {displayEmojis.map((emoji) => (
                <button
                  key={emoji.filename}
                  onClick={() => handleEmojiSelect(emoji)}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                    value === emoji.unicode && "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500 dark:ring-blue-400"
                  )}
                  title={emoji.name}
                >
                  <OpenMoji 
                    emoji={emoji.unicode} 
                    size={emojiSize}
                    alt={emoji.name}
                  />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">
              {searchQuery ? 'No emojis found' : 'No emojis in this category'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer with selected emoji info */}
      {value && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center space-x-3">
            <OpenMoji emoji={value} size={24} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {Object.values(EMOJI_MAP).find(e => e.unicode === value)?.name || 'Selected Emoji'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Currently selected
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Trigger component that can be used to open the picker
export interface OpenMojiTriggerProps {
  /** Currently selected emoji */
  value?: string;
  /** Called when an emoji is selected */
  onSelect: (emoji: string) => void;
  /** Placeholder when no emoji is selected */
  placeholder?: string;
  /** Size of the displayed emoji */
  size?: 16 | 20 | 24 | 32 | 48 | 64;
  /** Custom class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function OpenMojiTrigger({
  value,
  onSelect,
  placeholder = "🎯",
  size = 32,
  className,
  disabled = false
}: OpenMojiTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md",
          "bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center min-h-[40px]",
          className
        )}
      >
        <OpenMoji 
          emoji={value || placeholder} 
          size={size}
          showFallback={true}
        />
      </button>

      <OpenMojiPicker
        value={value}
        onSelect={onSelect}
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
        className="top-full left-0 mt-1"
      />
    </div>
  );
}