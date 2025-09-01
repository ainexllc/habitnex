export interface Quote {
  text: string;
  author: string;
  category?: 'motivation' | 'success' | 'habits' | 'mindfulness' | 'growth';
}

export const motivationalQuotes: Quote[] = [
  // Habit & Success Quotes
  {
    text: "The journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
    category: "habits"
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    category: "habits"
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
    category: "success"
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    category: "motivation"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    category: "motivation"
  },
  
  // Growth & Mindfulness
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "growth"
  },
  {
    text: "Progress, not perfection.",
    author: "Unknown",
    category: "growth"
  },
  {
    text: "Small steps daily lead to big changes yearly.",
    author: "Unknown",
    category: "habits"
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: "mindfulness"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    category: "motivation"
  },
  
  // Habit-Specific Quotes
  {
    text: "Your habits shape your identity, and your identity shapes your habits.",
    author: "James Clear",
    category: "habits"
  },
  {
    text: "Every moment is a fresh beginning.",
    author: "T.S. Eliot",
    category: "mindfulness"
  },
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    category: "habits"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "motivation"
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    category: "motivation"
  },
  
  // Success & Achievement
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "success"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "growth"
  },
  {
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
    category: "mindfulness"
  },
  {
    text: "Life is 10% what happens to you and 90% how you react to it.",
    author: "Charles R. Swindoll",
    category: "mindfulness"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "motivation"
  },
  
  // Daily Motivation
  {
    text: "Today is a gift. That's why they call it the present.",
    author: "Eleanor Roosevelt",
    category: "mindfulness"
  },
  {
    text: "You don't have to be great to get started, but you have to get started to be great.",
    author: "Les Brown",
    category: "motivation"
  },
  {
    text: "Every accomplishment starts with the decision to try.",
    author: "John F. Kennedy",
    category: "motivation"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "motivation"
  },
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    category: "growth"
  },
  
  // Habit Building
  {
    text: "Motivation gets you started. Habit keeps you going.",
    author: "Jim Ryun",
    category: "habits"
  },
  {
    text: "A goal is a dream with a deadline.",
    author: "Napoleon Hill",
    category: "success"
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
    category: "growth"
  },
  {
    text: "The first wealth is health.",
    author: "Ralph Waldo Emerson",
    category: "mindfulness"
  },
  {
    text: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn",
    category: "mindfulness"
  }
];

/**
 * Get a random motivational quote
 */
export function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
}

/**
 * Get a quote by category
 */
export function getQuoteByCategory(category: Quote['category']): Quote {
  const categoryQuotes = motivationalQuotes.filter(quote => quote.category === category);
  if (categoryQuotes.length === 0) {
    return getRandomQuote(); // Fallback to random if category not found
  }
  const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
  return categoryQuotes[randomIndex];
}

/**
 * Get a different quote from the current one
 */
export function getDifferentQuote(currentQuote?: Quote): Quote {
  if (!currentQuote) {
    return getRandomQuote();
  }
  
  let newQuote = getRandomQuote();
  let attempts = 0;
  const maxAttempts = 10;
  
  // Try to get a different quote, but don't infinite loop
  while (newQuote.text === currentQuote.text && attempts < maxAttempts) {
    newQuote = getRandomQuote();
    attempts++;
  }
  
  return newQuote;
}
