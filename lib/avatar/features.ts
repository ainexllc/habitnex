// Avatar feature definitions and mappings for DiceBear adventurer style

export interface FeatureOption {
  value: string;
  label: string;
  emoji?: string;
  category?: string;
}

// Hair style options for adventurer style
export const HAIR_STYLES: FeatureOption[] = [
  { value: '', label: 'No Hair', emoji: '🎯', category: 'none' },
  
  // Short styles
  { value: 'short01', label: 'Short Classic', emoji: '✂️', category: 'short' },
  { value: 'short02', label: 'Short Tidy', emoji: '✂️', category: 'short' },
  { value: 'short03', label: 'Short Casual', emoji: '✂️', category: 'short' },
  { value: 'short04', label: 'Short Textured', emoji: '✂️', category: 'short' },
  { value: 'short05', label: 'Short Wavy', emoji: '✂️', category: 'short' },
  { value: 'short06', label: 'Short Spiky', emoji: '✂️', category: 'short' },
  { value: 'short07', label: 'Short Modern', emoji: '✂️', category: 'short' },
  { value: 'short08', label: 'Short Buzz', emoji: '✂️', category: 'short' },
  { value: 'short09', label: 'Short Crew', emoji: '✂️', category: 'short' },
  { value: 'short10', label: 'Short Fade', emoji: '✂️', category: 'short' },
  { value: 'short11', label: 'Short Caesar', emoji: '✂️', category: 'short' },
  { value: 'short12', label: 'Short Quiff', emoji: '✂️', category: 'short' },
  { value: 'short13', label: 'Short Pompadour', emoji: '✂️', category: 'short' },
  { value: 'short14', label: 'Short Slick', emoji: '✂️', category: 'short' },
  { value: 'short15', label: 'Short Messy', emoji: '✂️', category: 'short' },
  { value: 'short16', label: 'Short Curly', emoji: '✂️', category: 'short' },
  { value: 'short17', label: 'Short Choppy', emoji: '✂️', category: 'short' },
  { value: 'short18', label: 'Short Layered', emoji: '✂️', category: 'short' },
  { value: 'short19', label: 'Short Tousled', emoji: '✂️', category: 'short' },
  { value: 'short20', label: 'Short Undercut', emoji: '✂️', category: 'short' },
  
  // Long styles
  { value: 'long01', label: 'Long Straight', emoji: '💇', category: 'long' },
  { value: 'long02', label: 'Long Wavy', emoji: '💇', category: 'long' },
  { value: 'long03', label: 'Long Curly', emoji: '💇', category: 'long' },
  { value: 'long04', label: 'Long Braided', emoji: '💇', category: 'long' },
  { value: 'long05', label: 'Long Layered', emoji: '💇', category: 'long' },
  { value: 'long06', label: 'Long Beach', emoji: '💇', category: 'long' },
  { value: 'long07', label: 'Long Flowing', emoji: '💇', category: 'long' },
  { value: 'long08', label: 'Long Textured', emoji: '💇', category: 'long' },
  { value: 'long09', label: 'Long Feathered', emoji: '💇', category: 'long' },
  { value: 'long10', label: 'Long Bohemian', emoji: '💇', category: 'long' },
  { value: 'long11', label: 'Long Sleek', emoji: '💇', category: 'long' },
  { value: 'long12', label: 'Long Tousled', emoji: '💇', category: 'long' },
  { value: 'long13', label: 'Long Side-swept', emoji: '💇', category: 'long' },
  { value: 'long14', label: 'Long Voluminous', emoji: '💇', category: 'long' },
  { value: 'long15', label: 'Long Natural', emoji: '💇', category: 'long' },
  { value: 'long16', label: 'Long Artistic', emoji: '💇', category: 'long' },
  { value: 'long17', label: 'Long Romantic', emoji: '💇', category: 'long' },
  { value: 'long18', label: 'Long Vintage', emoji: '💇', category: 'long' },
  { value: 'long19', label: 'Long Modern', emoji: '💇', category: 'long' },
  { value: 'long20', label: 'Long Elegant', emoji: '💇', category: 'long' },
  { value: 'long21', label: 'Long Free-flowing', emoji: '💇', category: 'long' },
  { value: 'long22', label: 'Long Cascading', emoji: '💇', category: 'long' },
  { value: 'long23', label: 'Long Windswept', emoji: '💇', category: 'long' },
  { value: 'long24', label: 'Long Luxurious', emoji: '💇', category: 'long' },
  { value: 'long25', label: 'Long Silky', emoji: '💇', category: 'long' },
  { value: 'long26', label: 'Long Dreamy', emoji: '💇', category: 'long' },
];

// Eye variations for adventurer style
export const EYE_TYPES: FeatureOption[] = Array.from({ length: 14 }).map((_, i) => {
  const idx = (i + 1).toString().padStart(2, '0');
  return { 
    value: `variant${idx}`, 
    label: `Eyes Style ${i + 1}`,
    emoji: '👁️'
  };
});

// Eyebrow variations for adventurer style
export const EYEBROW_TYPES: FeatureOption[] = Array.from({ length: 10 }).map((_, i) => {
  const idx = (i + 1).toString().padStart(2, '0');
  return { 
    value: `variant${idx}`, 
    label: `Brow Style ${i + 1}`,
    emoji: '🤨'
  };
});

// Mouth expressions for adventurer style
export const MOUTH_TYPES: FeatureOption[] = [
  { value: 'variant01', label: 'Happy Smile', emoji: '😊' },
  { value: 'variant02', label: 'Big Grin', emoji: '😄' },
  { value: 'variant03', label: 'Surprised', emoji: '😮' },
  { value: 'variant04', label: 'Neutral', emoji: '😐' },
  { value: 'variant05', label: 'Slight Smile', emoji: '🙂' },
  { value: 'variant06', label: 'Sad', emoji: '😔' },
  { value: 'variant07', label: 'Cool', emoji: '😎' },
  { value: 'variant08', label: 'Playful', emoji: '😋' },
  { value: 'variant09', label: 'Thinking', emoji: '🤔' },
  { value: 'variant10', label: 'Sleepy', emoji: '😴' },
  { value: 'variant11', label: 'Whistling', emoji: '😗' },
  { value: 'variant12', label: 'Laughing', emoji: '😆' },
];

// Feature probability options
export interface FeatureProbability {
  key: keyof ProbabilityConfig;
  label: string;
  description: string;
  emoji: string;
  defaultValue: number;
}

export interface ProbabilityConfig {
  hairProbability: number;
  glassesProbability: number;
  featuresProbability: number;
  earringsProbability: number;
}

export const FEATURE_PROBABILITIES: FeatureProbability[] = [
  { 
    key: 'hairProbability', 
    label: 'Hair', 
    description: 'Chance of having hair',
    emoji: '💇',
    defaultValue: 100
  },
  { 
    key: 'glassesProbability', 
    label: 'Glasses', 
    description: 'Chance of wearing glasses',
    emoji: '👓',
    defaultValue: 50
  },
  { 
    key: 'featuresProbability', 
    label: 'Features', 
    description: 'Chance of facial features (freckles, etc.)',
    emoji: '✨',
    defaultValue: 10
  },
  { 
    key: 'earringsProbability', 
    label: 'Earrings', 
    description: 'Chance of wearing earrings',
    emoji: '👂',
    defaultValue: 30
  },
];

// Helper function to get hair styles by category
export function getHairStylesByCategory(category: 'short' | 'long' | 'none'): FeatureOption[] {
  return HAIR_STYLES.filter(style => style.category === category);
}

// Helper function to get popular hair styles for quick selection
export function getPopularHairStyles(): FeatureOption[] {
  return [
    HAIR_STYLES.find(s => s.value === 'short07')!, // Short Modern
    HAIR_STYLES.find(s => s.value === 'short03')!, // Short Casual
    HAIR_STYLES.find(s => s.value === 'short12')!, // Short Quiff
    HAIR_STYLES.find(s => s.value === 'long01')!, // Long Straight
    HAIR_STYLES.find(s => s.value === 'long02')!, // Long Wavy
    HAIR_STYLES.find(s => s.value === 'long05')!, // Long Layered
  ];
}

// Helper function to get default features for a role
export function getDefaultFeaturesForRole(role: 'parent' | 'child' | 'teen' | 'adult') {
  switch (role) {
    case 'child':
      return {
        hair: 'short07', // Short Modern
        eyeType: 'variant02', // Bright eyes
        eyebrowType: 'variant01', // Standard brows
        mouthType: 'variant02', // Big grin
        probabilities: {
          hairProbability: 100,
          glassesProbability: 20,
          featuresProbability: 30, // More likely to have freckles
          earringsProbability: 10
        }
      };
    case 'teen':
      return {
        hair: 'long02', // Long Wavy
        eyeType: 'variant05', // Expressive eyes
        eyebrowType: 'variant03', // Styled brows
        mouthType: 'variant07', // Cool expression
        probabilities: {
          hairProbability: 100,
          glassesProbability: 40,
          featuresProbability: 20,
          earringsProbability: 60
        }
      };
    case 'parent':
    case 'adult':
      return {
        hair: 'short03', // Short Casual
        eyeType: 'variant01', // Standard eyes
        eyebrowType: 'variant02', // Professional brows
        mouthType: 'variant05', // Slight smile
        probabilities: {
          hairProbability: 90,
          glassesProbability: 60,
          featuresProbability: 10,
          earringsProbability: 40
        }
      };
    default:
      return {
        hair: 'short07',
        eyeType: 'variant01',
        eyebrowType: 'variant01',
        mouthType: 'variant01',
        probabilities: {
          hairProbability: 100,
          glassesProbability: 50,
          featuresProbability: 10,
          earringsProbability: 30
        }
      };
  }
}