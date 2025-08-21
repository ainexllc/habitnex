'use client';

import { useState, KeyboardEvent } from 'react';
import { X, Plus, Hash } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
  className?: string;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Add tags...",
  suggestions = [],
  maxTags = 10,
  className = ""
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Popular habit tags for suggestions
  const defaultSuggestions = [
    'morning', 'evening', 'health', 'fitness', 'mindfulness', 'productivity',
    'learning', 'creativity', 'social', 'habit-stack', 'quick', '5-min',
    'routine', 'self-care', 'goal', 'challenge', 'daily', 'weekly'
  ];

  const allSuggestions = Array.from(new Set([...suggestions, ...defaultSuggestions]));
  
  const filteredSuggestions = allSuggestions
    .filter(suggestion => 
      !tags.includes(suggestion) && 
      suggestion.toLowerCase().includes(input.toLowerCase())
    )
    .slice(0, 8);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onChange([...tags, trimmed]);
      setInput('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Tags Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded-md dark:bg-primary-900 dark:text-primary-200"
          >
            <Hash className="w-3 h-3" />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={tags.length >= maxTags ? `Max ${maxTags} tags` : placeholder}
          disabled={tags.length >= maxTags}
          className="input w-full pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Plus className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="py-1">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addTag(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Hash className="w-3 h-3 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Press Enter to add tags • Use specific, searchable terms • {tags.length}/{maxTags} tags
      </p>
    </div>
  );
}