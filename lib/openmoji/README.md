# OpenMoji Integration System

A comprehensive OpenMoji SVG integration system for Next.js applications, featuring React components, utilities, and hooks for seamless emoji management.

## Overview

This system provides:
- 🎨 **React Components** for displaying OpenMoji SVGs
- 🔍 **Emoji Picker** with search, categories, and contextual suggestions
- 🚀 **Performance Optimized** with caching and lazy loading
- 🔧 **TypeScript** fully typed with comprehensive interfaces
- 📱 **Responsive** mobile-friendly design
- 🎯 **Contextual Suggestions** based on habit text or content

## Features

- **4,294 OpenMoji SVGs** mapped and ready to use
- **Smart Caching** for optimal performance
- **Contextual Emoji Suggestions** for habits and activities
- **Recent & Popular** emoji tracking
- **Search Functionality** with keyword matching
- **Category Organization** (Smileys, Activities, Food, etc.)
- **Multiple Input Types** (name, Unicode, filename)
- **Loading States & Error Handling**
- **Accessibility Support**
- **Dark Mode Compatible**

## Quick Start

### Basic Usage

```tsx
import { OpenMoji } from '@/components/ui/OpenMoji';

// Display by name
<OpenMoji emoji="grinning" size={24} />

// Display by Unicode
<OpenMoji emoji="😀" size={32} />

// Display by filename
<OpenMoji emoji="1F600.svg" size={48} />
```

### Interactive Picker

```tsx
import { OpenMojiPickerPopover } from '@/components/ui/OpenMojiPicker';
import { Button } from '@/components/ui/button';

const [selectedEmoji, setSelectedEmoji] = useState(null);

<OpenMojiPickerPopover
  trigger={<Button>Choose Emoji</Button>}
  open={pickerOpen}
  onOpenChange={setPickerOpen}
  onEmojiSelect={setSelectedEmoji}
  habitContext="morning exercise" // For contextual suggestions
/>
```

### Grid Display

```tsx
import { OpenMojiGrid } from '@/components/ui/OpenMoji';

<OpenMojiGrid
  emojis={['grinning', 'heart_eyes', 'thumbs_up', 'fire']}
  size={24}
  onEmojiClick={(emoji, mapping) => console.log(emoji, mapping)}
/>
```

## Components

### OpenMoji

Main component for displaying OpenMoji SVGs.

```tsx
interface OpenMojiProps {
  emoji: string;                    // Name, Unicode, or filename
  size?: 16 | 20 | 24 | 32 | 48 | 64;
  className?: string;
  alt?: string;
  showLoading?: boolean;
  onLoad?: (mapping: EmojiMapping) => void;
  onError?: (error: Error) => void;
}
```

**Variants:**
- `OpenMojiSmall` (16px)
- `OpenMojiMedium` (24px) 
- `OpenMojiLarge` (32px)
- `OpenMojiXLarge` (48px)

### OpenMojiInteractive

Interactive version with hover effects and click handling.

```tsx
<OpenMojiInteractive
  emoji="star"
  size={32}
  onClick={() => console.log('clicked!')}
  hoverScale={true}
/>
```

### OpenMojiGrid

Grid layout for multiple emojis.

```tsx
<OpenMojiGrid
  emojis={['apple', 'banana', 'grapes']}
  size={24}
  gap="md"
  maxItems={10}
  onEmojiClick={(emoji, mapping) => handleClick(emoji, mapping)}
/>
```

### OpenMojiPicker

Full-featured emoji picker with search and categories.

```tsx
<OpenMojiPicker
  onEmojiSelect={handleSelect}
  habitContext="workout routine"  // For suggestions
  showSearch={true}
  showCategories={true}
  showRecent={true}
  showPopular={true}
  maxPerCategory={32}
  emojiSize={24}
/>
```

### OpenMojiPickerCompact

Compact picker for quick selection.

```tsx
<OpenMojiPickerCompact
  habitContext="meditation"
  onEmojiSelect={handleSelect}
  maxEmojis={18}
  columns={6}
/>
```

### OpenMojiPickerPopover

Picker wrapped in a popover component.

```tsx
<OpenMojiPickerPopover
  trigger={<Button>Choose</Button>}
  open={isOpen}
  onOpenChange={setIsOpen}
  onEmojiSelect={handleSelect}
/>
```

## Hooks

### useOpenMoji

Hook for loading and managing single emoji.

```tsx
const { svgContent, loading, error, emoji, retry } = useOpenMoji('grinning');
```

### useEmojiSearch

Hook for searching emojis with debouncing.

```tsx
const { query, results, loading, search, clear } = useEmojiSearch();

// Search with debouncing
search('smile');
```

### useRecentEmojis

Hook for managing recent emoji usage.

```tsx
const { recent, addRecent, clearRecent } = useRecentEmojis();
```

### useEmojiPicker

Hook for managing picker state.

```tsx
const {
  isOpen,
  selectedEmoji,
  searchQuery,
  activeCategory,
  openPicker,
  closePicker,
  selectEmoji,
  setSearchQuery,
  setActiveCategory
} = useEmojiPicker();
```

### useEmojiFavorites

Hook for managing favorite emojis.

```tsx
const { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite } = useEmojiFavorites();
```

## Utilities

### Core Functions

```tsx
import {
  loadOpenMojiSVG,
  searchEmojis,
  getEmojiByName,
  getEmojiByUnicode,
  getPopularEmojis,
  getRecentEmojis,
  preloadCommonEmojis
} from '@/lib/openmoji/utils';

// Load SVG content
const svgContent = await loadOpenMojiSVG('1F600.svg');

// Search emojis
const results = searchEmojis('happy', 10);

// Get emoji by identifier
const emoji = getEmojiByName('grinning');
const emoji2 = getEmojiByUnicode('😀');

// Preload for performance
await preloadCommonEmojis();
```

### Contextual Suggestions

Get emoji suggestions based on text context:

```tsx
import { getHabitEmojiSuggestions } from '@/lib/openmoji/emojiMap';

const suggestions = getHabitEmojiSuggestions('morning exercise routine');
// Returns: [running, trophy, fire, star, checkmark, ...]
```

## Data Structure

### EmojiMapping

```tsx
interface EmojiMapping {
  name: string;           // 'grinning'
  filename: string;       // '1F600.svg'
  unicode: string;        // '😀'
  keywords: string[];     // ['grinning', 'face', 'smile', 'happy']
  category: string;       // 'smileys'
}
```

### Categories

- **Smileys & Emotions** (😀-😷)
- **Activities & Sports** (🏃‍♂️⚽🏆)
- **Food & Drink** (🍎🍕☕)
- **Animals & Nature** (🐶🌳🌻)
- **Health & Medical** (💊❤️🧠)
- **Objects & Symbols** (📚💡⭐)
- **People & Family** (👪👶👨‍👩‍👧‍👦)

## Contextual Suggestions

The system provides smart emoji suggestions based on context:

```tsx
// Exercise/Fitness
"morning run" → [running, trophy, fire, star]
"yoga session" → [yoga, meditation, heart, peaceful]

// Health
"drink water" → [water, droplet, health]
"take vitamins" → [pill, health, apple, heart]

// Work/Productivity
"finish project" → [target, checkmark, trophy, star]
"team meeting" → [family, people, calendar, work]
```

## Performance

- **SVG Caching** - Loaded SVGs are cached in memory
- **Lazy Loading** - Components only load when needed
- **Preloading** - Common emojis preloaded for instant display
- **Debounced Search** - Search input debounced for performance
- **Virtual Scrolling** - Large lists virtualized (TODO)

## File Structure

```
lib/openmoji/
├── emojiMap.ts         # Emoji mappings and categories
├── utils.ts            # Core utility functions
└── README.md           # This documentation

components/ui/
├── OpenMoji.tsx        # Main display component
└── OpenMojiPicker.tsx  # Picker components

hooks/
└── useOpenMoji.ts      # React hooks

types/
└── openmoji.ts         # TypeScript definitions

public/openmoji/
└── *.svg               # 4,294 OpenMoji SVG files
```

## Integration Examples

### Habit Form Integration

```tsx
import { OpenMojiPickerPopover } from '@/components/ui/OpenMojiPicker';

const HabitForm = () => {
  const [habitName, setHabitName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  return (
    <form>
      <input 
        value={habitName}
        onChange={(e) => setHabitName(e.target.value)}
        placeholder="Habit name"
      />
      
      <OpenMojiPickerPopover
        trigger={<Button>Choose Emoji</Button>}
        habitContext={habitName}  // Smart suggestions
        onEmojiSelect={setSelectedEmoji}
      />
      
      {selectedEmoji && (
        <div>Selected: <OpenMoji emoji={selectedEmoji.name} size={24} /></div>
      )}
    </form>
  );
};
```

### Dashboard Display

```tsx
const HabitCard = ({ habit }) => (
  <div className="habit-card">
    <OpenMoji emoji={habit.emoji} size={32} />
    <h3>{habit.name}</h3>
  </div>
);
```

## Advanced Usage

### Custom Styling

```tsx
<OpenMoji 
  emoji="fire"
  size={32}
  className="custom-emoji-style drop-shadow-lg hover:scale-110"
/>
```

### Error Handling

```tsx
<OpenMoji
  emoji="invalid-emoji"
  size={24}
  errorComponent={
    <div className="emoji-error">⚠️ Failed to load</div>
  }
  onError={(error) => console.error('Emoji load failed:', error)}
/>
```

### Loading States

```tsx
<OpenMoji
  emoji="grinning"
  size={24}
  showLoading={true}
  loadingComponent={
    <div className="animate-pulse bg-gray-200 rounded w-6 h-6" />
  }
/>
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Tips

1. **Preload Common Emojis**:
   ```tsx
   useEffect(() => {
     preloadCommonEmojis();
   }, []);
   ```

2. **Use Appropriate Sizes**: Smaller sizes load and render faster

3. **Limit Concurrent Loading**: Don't load 100s of emojis simultaneously

4. **Cache Management**: The system handles caching automatically

## Troubleshooting

### Common Issues

1. **Emoji not found**: Check if the emoji exists in `emojiMap.ts`
2. **Slow loading**: Enable preloading or check network connection
3. **TypeScript errors**: Ensure proper imports of types
4. **Styling issues**: Use `className` prop for custom styles

### Debug Tools

```tsx
import { getCacheStats, emojiToJSON } from '@/lib/openmoji/utils';

// Check cache performance
console.log('Cache stats:', getCacheStats());

// Debug emoji data
console.log('Emoji data:', emojiToJSON(emoji));
```

## Contributing

To add new emojis or categories:

1. Add entries to `emojiMap.ts`
2. Include SVG files in `public/openmoji/`
3. Update contextual suggestions in `habitEmojiSuggestions`
4. Test with the demo page at `/test-openmoji`

## Testing

Visit `/test-openmoji` for a comprehensive test page featuring:
- All component variants
- Interactive examples
- Performance tests
- Integration demos

## License

This integration system is part of the NextVibe project. OpenMoji SVGs are licensed under CC BY-SA 4.0.