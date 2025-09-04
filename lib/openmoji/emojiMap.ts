/**
 * OpenMoji Emoji Mapping
 * Maps common emoji names and Unicode characters to OpenMoji filename patterns
 */

export interface EmojiInfo {
  name: string;
  filename: string;
  category: string;
  keywords: string[];
  unicode: string;
}

// Comprehensive habit-related emojis with their OpenMoji filenames
export const EMOJI_MAP: Record<string, EmojiInfo> = {
  // Health & Fitness
  'muscle': {
    name: 'Muscle',
    filename: '1F4AA.svg',
    category: 'health',
    keywords: ['strength', 'exercise', 'fitness', 'workout', 'gym'],
    unicode: '💪'
  },
  'runner': {
    name: 'Runner',
    filename: '1F3C3.svg',
    category: 'health',
    keywords: ['running', 'exercise', 'cardio', 'jogging', 'fitness'],
    unicode: '🏃'
  },
  'swimmer': {
    name: 'Swimmer',
    filename: '1F3CA.svg',
    category: 'health',
    keywords: ['swimming', 'exercise', 'water', 'pool', 'fitness'],
    unicode: '🏊'
  },
  'weight_lifter': {
    name: 'Weight Lifter',
    filename: '1F3CB.svg',
    category: 'health',
    keywords: ['weightlifting', 'gym', 'strength', 'exercise', 'fitness'],
    unicode: '🏋️'
  },
  'cyclist': {
    name: 'Cyclist',
    filename: '1F6B4.svg',
    category: 'health',
    keywords: ['cycling', 'bike', 'exercise', 'fitness', 'outdoor'],
    unicode: '🚴'
  },
  'person_in_lotus_position': {
    name: 'Person in Lotus Position',
    filename: '1F9D8.svg',
    category: 'wellness',
    keywords: ['meditation', 'yoga', 'mindfulness', 'zen', 'relaxation'],
    unicode: '🧘'
  },
  'handball': {
    name: 'Handball',
    filename: '1F93E.svg',
    category: 'health',
    keywords: ['handball', 'sport', 'exercise', 'ball game', 'fitness'],
    unicode: '🤾'
  },
  'tennis': {
    name: 'Tennis',
    filename: '1F3BE.svg',
    category: 'health',
    keywords: ['tennis', 'sport', 'exercise', 'racket', 'ball'],
    unicode: '🎾'
  },
  'soccer_ball': {
    name: 'Soccer Ball',
    filename: '26BD.svg',
    category: 'health',
    keywords: ['soccer', 'football', 'sport', 'exercise', 'ball'],
    unicode: '⚽'
  },
  'basketball': {
    name: 'Basketball',
    filename: '1F3C0.svg',
    category: 'health',
    keywords: ['basketball', 'sport', 'exercise', 'ball', 'hoop'],
    unicode: '🏀'
  },

  // Hygiene & Self-Care
  'soap': {
    name: 'Soap',
    filename: '1F9FC.svg',
    category: 'hygiene',
    keywords: ['soap', 'clean', 'wash', 'hygiene', 'bath', 'shower'],
    unicode: '🧼'
  },
  'toothbrush': {
    name: 'Toothbrush',
    filename: '1FAA5.svg',
    category: 'hygiene',
    keywords: ['toothbrush', 'teeth', 'dental', 'hygiene', 'clean', 'brush'],
    unicode: '🪥'
  },
  'bathtub': {
    name: 'Bathtub',
    filename: '1F6C1.svg',
    category: 'hygiene',
    keywords: ['bath', 'bathtub', 'wash', 'clean', 'relaxation', 'hygiene'],
    unicode: '🛁'
  },
  'shower': {
    name: 'Shower',
    filename: '1F6BF.svg',
    category: 'hygiene',
    keywords: ['shower', 'wash', 'clean', 'water', 'hygiene', 'bath'],
    unicode: '🚿'
  },

  // Learning & Knowledge  
  'book': {
    name: 'Book',
    filename: '1F4D6.svg',
    category: 'learning',
    keywords: ['reading', 'study', 'education', 'knowledge', 'learning'],
    unicode: '📖'
  },
  'books': {
    name: 'Books',
    filename: '1F4DA.svg',
    category: 'learning',
    keywords: ['books', 'reading', 'study', 'education', 'library'],
    unicode: '📚'
  },
  'graduation_cap': {
    name: 'Graduation Cap',
    filename: '1F393.svg',
    category: 'learning',
    keywords: ['graduation', 'education', 'study', 'learning', 'achievement'],
    unicode: '🎓'
  },
  'memo': {
    name: 'Memo',
    filename: '1F4DD.svg',
    category: 'learning',
    keywords: ['writing', 'note', 'study', 'journal', 'documentation'],
    unicode: '📝'
  },
  'computer': {
    name: 'Computer',
    filename: '1F4BB.svg',
    category: 'learning',
    keywords: ['computer', 'coding', 'programming', 'work', 'technology'],
    unicode: '💻'
  },

  // Food & Nutrition
  'green_salad': {
    name: 'Green Salad',
    filename: '1F957.svg',
    category: 'nutrition',
    keywords: ['healthy', 'eating', 'vegetables', 'diet', 'nutrition'],
    unicode: '🥗'
  },
  'apple': {
    name: 'Apple',
    filename: '1F34E.svg',
    category: 'nutrition',
    keywords: ['apple', 'fruit', 'healthy', 'snack', 'nutrition'],
    unicode: '🍎'
  },
  'banana': {
    name: 'Banana',
    filename: '1F34C.svg',
    category: 'nutrition',
    keywords: ['banana', 'fruit', 'healthy', 'potassium', 'nutrition'],
    unicode: '🍌'
  },
  'broccoli': {
    name: 'Broccoli',
    filename: '1F966.svg',
    category: 'nutrition',
    keywords: ['broccoli', 'vegetable', 'healthy', 'green', 'nutrition'],
    unicode: '🥦'
  },
  'carrot': {
    name: 'Carrot',
    filename: '1F955.svg',
    category: 'nutrition',
    keywords: ['carrot', 'vegetable', 'healthy', 'orange', 'nutrition'],
    unicode: '🥕'
  },
  'cooking': {
    name: 'Cooking',
    filename: '1F373.svg',
    category: 'nutrition',
    keywords: ['cooking', 'food', 'meal', 'prepare', 'kitchen'],
    unicode: '🍳'
  },

  // Hydration
  'droplet': {
    name: 'Droplet',
    filename: '1F4A7.svg',
    category: 'health',
    keywords: ['water', 'hydration', 'drink', 'healthy', 'liquid'],
    unicode: '💧'
  },
  'glass_of_milk': {
    name: 'Glass of Milk',
    filename: '1F95B.svg',
    category: 'nutrition',
    keywords: ['milk', 'drink', 'calcium', 'healthy', 'glass'],
    unicode: '🥛'
  },

  // Sleep & Rest
  'sleeping': {
    name: 'Sleeping Face',
    filename: '1F634.svg',
    category: 'wellness',
    keywords: ['sleep', 'rest', 'tired', 'bed', 'zzz'],
    unicode: '😴'
  },
  'bed': {
    name: 'Bed',
    filename: '1F6CF.svg',
    category: 'wellness',
    keywords: ['bed', 'sleep', 'rest', 'bedroom', 'comfortable'],
    unicode: '🛏️'
  },
  'pillow': {
    name: 'Pillow',
    filename: '1F6CF.svg',
    category: 'wellness',
    keywords: ['pillow', 'sleep', 'rest', 'comfort', 'bed'],
    unicode: '🛏️'
  },

  // Emotions & Motivation
  'smiling_face_with_smiling_eyes': {
    name: 'Smiling Face with Smiling Eyes',
    filename: '1F60A.svg',
    category: 'emotions',
    keywords: ['happy', 'joy', 'positive', 'smile', 'good mood'],
    unicode: '😊'
  },
  'thumbs_up': {
    name: 'Thumbs Up',
    filename: '1F44D.svg',
    category: 'emotions',
    keywords: ['approval', 'good', 'like', 'positive', 'success'],
    unicode: '👍'
  },
  'red_heart': {
    name: 'Red Heart',
    filename: '2764.svg',
    category: 'emotions',
    keywords: ['love', 'care', 'affection', 'family', 'relationship'],
    unicode: '❤️'
  },
  'fire': {
    name: 'Fire',
    filename: '1F525.svg',
    category: 'emotions',
    keywords: ['fire', 'motivation', 'energy', 'passion', 'hot'],
    unicode: '🔥'
  },
  'sparkles': {
    name: 'Sparkles',
    filename: '2728.svg',
    category: 'emotions',
    keywords: ['sparkles', 'magic', 'celebration', 'achievement', 'shine'],
    unicode: '✨'
  },

  // Nature & Environment
  'star': {
    name: 'Star',
    filename: '1F31F.svg',
    category: 'nature',
    keywords: ['achievement', 'goal', 'success', 'excellence', 'bright'],
    unicode: '🌟'
  },
  'seedling': {
    name: 'Seedling',
    filename: '1F331.svg',
    category: 'nature',
    keywords: ['growth', 'plant', 'nature', 'development', 'new beginning'],
    unicode: '🌱'
  },
  'tree': {
    name: 'Tree',
    filename: '1F333.svg',
    category: 'nature',
    keywords: ['tree', 'nature', 'growth', 'environment', 'green'],
    unicode: '🌳'
  },
  'sun': {
    name: 'Sun',
    filename: '2600.svg',
    category: 'nature',
    keywords: ['sun', 'sunny', 'bright', 'energy', 'vitamin d'],
    unicode: '☀️'
  },
  'moon': {
    name: 'Moon',
    filename: '1F319.svg',
    category: 'nature',
    keywords: ['moon', 'night', 'sleep', 'peaceful', 'evening'],
    unicode: '🌙'
  },

  // Time & Schedule
  'alarm_clock': {
    name: 'Alarm Clock',
    filename: '23F0.svg',
    category: 'time',
    keywords: ['alarm', 'clock', 'wake up', 'time', 'schedule'],
    unicode: '⏰'
  },
  'watch': {
    name: 'Watch',
    filename: '231A.svg',
    category: 'time',
    keywords: ['watch', 'time', 'schedule', 'punctual', 'timing'],
    unicode: '⌚'
  },
  'calendar': {
    name: 'Calendar',
    filename: '1F4C5.svg',
    category: 'time',
    keywords: ['calendar', 'date', 'schedule', 'plan', 'organize'],
    unicode: '📅'
  },

  // Work & Productivity
  'briefcase': {
    name: 'Briefcase',
    filename: '1F4BC.svg',
    category: 'work',
    keywords: ['work', 'business', 'job', 'professional', 'career'],
    unicode: '💼'
  },
  'office_building': {
    name: 'Office Building',
    filename: '1F3E2.svg',
    category: 'work',
    keywords: ['office', 'work', 'business', 'building', 'corporate'],
    unicode: '🏢'
  },

  // Household & Cleaning
  'broom': {
    name: 'Broom',
    filename: '1F9F9.svg',
    category: 'household',
    keywords: ['broom', 'clean', 'sweep', 'tidy', 'household'],
    unicode: '🧹'
  },
  'sponge': {
    name: 'Sponge',
    filename: '1F9FD.svg',
    category: 'household',
    keywords: ['sponge', 'clean', 'wash', 'scrub', 'household'],
    unicode: '🧽'
  },
  'house': {
    name: 'House',
    filename: '1F3E0.svg',
    category: 'household',
    keywords: ['house', 'home', 'family', 'household', 'living'],
    unicode: '🏠'
  },

  // Money & Finance
  'money_bag': {
    name: 'Money Bag',
    filename: '1F4B0.svg',
    category: 'finance',
    keywords: ['money', 'save', 'savings', 'budget', 'finance'],
    unicode: '💰'
  },
  'piggy_bank': {
    name: 'Piggy Bank',
    filename: '1F437.svg',
    category: 'finance',
    keywords: ['piggy bank', 'save', 'savings', 'money', 'budget'],
    unicode: '🐷'
  },

  // Activities & Hobbies
  'musical_note': {
    name: 'Musical Note',
    filename: '1F3B5.svg',
    category: 'activities',
    keywords: ['music', 'note', 'song', 'practice', 'instrument'],
    unicode: '🎵'
  },
  'artist_palette': {
    name: 'Artist Palette',
    filename: '1F3A8.svg',
    category: 'activities',
    keywords: ['art', 'paint', 'creative', 'drawing', 'palette'],
    unicode: '🎨'
  },
  'camera': {
    name: 'Camera',
    filename: '1F4F7.svg',
    category: 'activities',
    keywords: ['camera', 'photo', 'photography', 'picture', 'hobby'],
    unicode: '📷'
  },
  'target': {
    name: 'Target',
    filename: '1F3AF.svg',
    category: 'activities',
    keywords: ['goal', 'aim', 'target', 'focus', 'objective'],
    unicode: '🎯'
  },
  'trophy': {
    name: 'Trophy',
    filename: '1F3C6.svg',
    category: 'activities',
    keywords: ['trophy', 'achievement', 'success', 'win', 'award'],
    unicode: '🏆'
  },

  // Transportation
  'bicycle': {
    name: 'Bicycle',
    filename: '1F6B2.svg',
    category: 'transport',
    keywords: ['bicycle', 'bike', 'cycling', 'transport', 'exercise'],
    unicode: '🚲'
  },
  'walking': {
    name: 'Walking',
    filename: '1F6B6.svg',
    category: 'transport',
    keywords: ['walking', 'walk', 'exercise', 'steps', 'pedestrian'],
    unicode: '🚶'
  }
};

// Categories for organizing emojis in the picker
export const EMOJI_CATEGORIES = {
  health: {
    name: 'Health & Fitness',
    icon: '💪',
    emojis: ['muscle', 'runner', 'swimmer', 'weight_lifter', 'cyclist', 'person_in_lotus_position', 'handball', 'tennis', 'soccer_ball', 'basketball', 'droplet', 'bicycle', 'walking']
  },
  hygiene: {
    name: 'Hygiene & Self-Care',
    icon: '🧼',
    emojis: ['soap', 'toothbrush', 'bathtub', 'shower']
  },
  learning: {
    name: 'Learning & Work',
    icon: '📖', 
    emojis: ['book', 'books', 'graduation_cap', 'memo', 'computer', 'briefcase', 'office_building']
  },
  nutrition: {
    name: 'Food & Nutrition',
    icon: '🥗',
    emojis: ['green_salad', 'apple', 'banana', 'broccoli', 'carrot', 'cooking', 'glass_of_milk']
  },
  wellness: {
    name: 'Sleep & Wellness',
    icon: '😴',
    emojis: ['sleeping', 'bed', 'pillow']
  },
  emotions: {
    name: 'Emotions & Motivation',
    icon: '😊',
    emojis: ['smiling_face_with_smiling_eyes', 'thumbs_up', 'red_heart', 'fire', 'sparkles']
  },
  nature: {
    name: 'Nature & Environment',
    icon: '🌱',
    emojis: ['star', 'seedling', 'tree', 'sun', 'moon']
  },
  time: {
    name: 'Time & Schedule',
    icon: '⏰',
    emojis: ['alarm_clock', 'watch', 'calendar']
  },
  household: {
    name: 'Home & Cleaning',
    icon: '🏠',
    emojis: ['house', 'broom', 'sponge']
  },
  finance: {
    name: 'Money & Finance',
    icon: '💰',
    emojis: ['money_bag', 'piggy_bank']
  },
  activities: {
    name: 'Hobbies & Activities',
    icon: '🎯',
    emojis: ['target', 'trophy', 'musical_note', 'artist_palette', 'camera']
  }
} as const;

// Helper function to get emoji info by name
export function getEmojiInfo(name: string): EmojiInfo | undefined {
  return EMOJI_MAP[name];
}

// Helper function to search emojis by keyword
export function searchEmojis(query: string): EmojiInfo[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(EMOJI_MAP).filter(emoji => 
    emoji.name.toLowerCase().includes(lowerQuery) ||
    emoji.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
}

// Helper function to get all emojis in a category
export function getEmojisByCategory(category: keyof typeof EMOJI_CATEGORIES): EmojiInfo[] {
  const categoryInfo = EMOJI_CATEGORIES[category];
  if (!categoryInfo) return [];
  
  return categoryInfo.emojis.map(name => EMOJI_MAP[name]).filter(Boolean);
}

// Convert Unicode character to OpenMoji filename (basic mapping for common emojis)
export function unicodeToFilename(unicode: string): string | null {
  // Find emoji by unicode
  const emoji = Object.values(EMOJI_MAP).find(e => e.unicode === unicode);
  return emoji?.filename || null;
}

// Convert filename back to Unicode (for fallback display)
export function filenameToUnicode(filename: string): string | null {
  const emoji = Object.values(EMOJI_MAP).find(e => e.filename === filename);
  return emoji?.unicode || null;
}