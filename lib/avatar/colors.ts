// Centralized color definitions for the avatar system
// This consolidates colors from all the different avatar components

export interface ColorOption {
  value: string;
  label: string;
  hex: string;
  emoji?: string;
}

// Skin color options for adventurer avatars
export const SKIN_COLORS: ColorOption[] = [
  { value: 'Light', label: 'Light', hex: '#FDBCB4', emoji: '🏻' },
  { value: 'Pale', label: 'Pale', hex: '#FFDBB4', emoji: '🏻' },
  { value: 'Yellow', label: 'Medium Light', hex: '#F1C27D', emoji: '🏼' },
  { value: 'Tanned', label: 'Medium', hex: '#E0AC69', emoji: '🏽' },
  { value: 'Brown', label: 'Medium Dark', hex: '#C68642', emoji: '🏾' },
  { value: 'DarkBrown', label: 'Dark', hex: '#8D5524', emoji: '🏾' },
  { value: 'Black', label: 'Deep', hex: '#5A3A31', emoji: '🏿' },
];

// Hair color options
export const HAIR_COLORS: ColorOption[] = [
  { value: 'Black', label: 'Black', hex: '#2C1B18', emoji: '⚫' },
  { value: 'BrownDark', label: 'Dark Brown', hex: '#4A2C2A', emoji: '🟤' },
  { value: 'Brown', label: 'Brown', hex: '#724133', emoji: '🟫' },
  { value: 'Auburn', label: 'Light Brown', hex: '#A55728', emoji: '🧡' },
  { value: 'Blonde', label: 'Blonde', hex: '#B58143', emoji: '💛' },
  { value: 'BlondeGolden', label: 'Golden Blonde', hex: '#D6B370', emoji: '✨' },
  { value: 'Red', label: 'Red', hex: '#C93305', emoji: '🔴' },
  { value: 'SilverGray', label: 'Gray', hex: '#B7B7B7', emoji: '⚪' },
  { value: 'Platinum', label: 'White', hex: '#E8E1E1', emoji: '⚪' },
  { value: 'PastelPink', label: 'Pink', hex: '#FF69B4', emoji: '💗' },
  { value: 'Blue', label: 'Blue', hex: '#4169E1', emoji: '💙' },
  { value: 'Green', label: 'Green', hex: '#228B22', emoji: '💚' },
  { value: 'Purple', label: 'Purple', hex: '#9370DB', emoji: '💜' },
];

// Background color options
export const BACKGROUND_COLORS: ColorOption[] = [
  { value: 'transparent', label: 'None', hex: 'transparent', emoji: '◻️' },
  { value: '#FFFFFF', label: 'White', hex: '#FFFFFF', emoji: '⚪' },
  { value: '#E0F2FE', label: 'Light Blue', hex: '#E0F2FE', emoji: '🟦' },
  { value: '#DCFCE7', label: 'Light Green', hex: '#DCFCE7', emoji: '🟩' },
  { value: '#FEF3C7', label: 'Light Yellow', hex: '#FEF3C7', emoji: '🟨' },
  { value: '#FCE7F3', label: 'Light Pink', hex: '#FCE7F3', emoji: '💕' },
  { value: '#EDE9FE', label: 'Light Purple', hex: '#EDE9FE', emoji: '🟪' },
  { value: '#F3F4F6', label: 'Light Gray', hex: '#F3F4F6', emoji: '⬜' },
  { value: '#D1FAE5', label: 'Mint', hex: '#D1FAE5', emoji: '🌿' },
  { value: '#FED7AA', label: 'Peach', hex: '#FED7AA', emoji: '🍑' },
  { value: '#DDD6FE', label: 'Lavender', hex: '#DDD6FE', emoji: '💜' },
  { value: '#BAE6FD', label: 'Sky', hex: '#BAE6FD', emoji: '☁️' },
];

// Personal theme colors for family members
export const MEMBER_COLORS: ColorOption[] = [
  { value: '#3B82F6', label: 'Blue', hex: '#3B82F6' },
  { value: '#60A5FA', label: 'Light Blue', hex: '#60A5FA' },
  { value: '#06B6D4', label: 'Cyan', hex: '#06B6D4' },
  { value: '#14B8A6', label: 'Teal', hex: '#14B8A6' },
  { value: '#10B981', label: 'Green', hex: '#10B981' },
  { value: '#84CC16', label: 'Lime', hex: '#84CC16' },
  { value: '#EAB308', label: 'Yellow', hex: '#EAB308' },
  { value: '#F59E0B', label: 'Amber', hex: '#F59E0B' },
  { value: '#F97316', label: 'Orange', hex: '#F97316' },
  { value: '#EF4444', label: 'Red', hex: '#EF4444' },
  { value: '#DC2626', label: 'Dark Red', hex: '#DC2626' },
  { value: '#EC4899', label: 'Pink', hex: '#EC4899' },
  { value: '#F472B6', label: 'Light Pink', hex: '#F472B6' },
  { value: '#8B5CF6', label: 'Purple', hex: '#8B5CF6' },
  { value: '#A78BFA', label: 'Light Purple', hex: '#A78BFA' },
  { value: '#6366F1', label: 'Indigo', hex: '#6366F1' },
  { value: '#4F46E5', label: 'Dark Indigo', hex: '#4F46E5' },
  { value: '#6B7280', label: 'Gray', hex: '#6B7280' },
  { value: '#374151', label: 'Dark Gray', hex: '#374151' },
  { value: '#1F2937', label: 'Charcoal', hex: '#1F2937' },
];

// Helper function to find color by value
export function findColorByValue(colors: ColorOption[], value: string): ColorOption | undefined {
  return colors.find(color => color.value === value);
}

// Helper function to convert DiceBear color names to hex
export function colorValueToHex(value: string): string {
  const skinColor = findColorByValue(SKIN_COLORS, value);
  if (skinColor) return skinColor.hex;
  
  const hairColor = findColorByValue(HAIR_COLORS, value);
  if (hairColor) return hairColor.hex;
  
  const bgColor = findColorByValue(BACKGROUND_COLORS, value);
  if (bgColor && bgColor.hex !== 'transparent') return bgColor.hex;
  
  // If not found, assume it's already a hex value
  return value.startsWith('#') ? value : `#${value}`;
}

// Get default colors for a specific role
export function getDefaultColorsForRole(role: 'parent' | 'child' | 'teen' | 'adult') {
  switch (role) {
    case 'child':
      return {
        skin: 'Light',
        hair: 'Brown',
        background: '#E0F2FE', // Light blue
        member: '#3B82F6' // Blue
      };
    case 'teen':
      return {
        skin: 'Yellow',
        hair: 'Auburn',
        background: '#FCE7F3', // Light pink
        member: '#EC4899' // Pink
      };
    case 'parent':
    case 'adult':
      return {
        skin: 'Tanned',
        hair: 'BrownDark',
        background: '#F3F4F6', // Light gray
        member: '#6B7280' // Gray
      };
    default:
      return {
        skin: 'Light',
        hair: 'Brown',
        background: 'transparent',
        member: '#3B82F6'
      };
  }
}