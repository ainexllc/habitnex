'use client';

import { useEffect, useState } from 'react';
import { useCelebration } from '@/contexts/CelebrationContext';
import { Star, Trophy, Zap, Crown, Gift, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  y: number;
  delay: number;
}

export function CelebrationOverlay() {
  const { celebrations, removeCelebration } = useCelebration();
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  // Generate floating emojis when celebration starts
  useEffect(() => {
    if (celebrations.length > 0) {
      const latestCelebration = celebrations[celebrations.length - 1];
      generateFloatingEmojis(latestCelebration.emoji, latestCelebration.type);
    }
  }, [celebrations.length]);

  const generateFloatingEmojis = (emoji: string, type: string) => {
    const emojiCount = getEmojiCountByType(type);
    const newEmojis: FloatingEmoji[] = [];

    for (let i = 0; i < emojiCount; i++) {
      newEmojis.push({
        id: Math.random().toString(36).substr(2, 9),
        emoji: getRandomCelebrationEmoji(emoji),
        x: Math.random() * 100, // Random position across screen width
        y: Math.random() * 100, // Random position across screen height
        delay: Math.random() * 2000 // Random delay up to 2 seconds
      });
    }

    setFloatingEmojis(newEmojis);

    // Clear floating emojis after animation
    setTimeout(() => {
      setFloatingEmojis([]);
    }, 4000);
  };

  const getEmojiCountByType = (type: string): number => {
    switch (type) {
      case 'habit_complete': return 8;
      case 'streak_milestone': return 12;
      case 'reward_earned': return 15;
      case 'challenge_complete': return 20;
      case 'level_up': return 25;
      default: return 10;
    }
  };

  const getRandomCelebrationEmoji = (primaryEmoji: string): string => {
    const celebrationEmojis = [
      primaryEmoji,
      '🎉', '🎊', '✨', '🌟', '⭐', '🎈', '🎁', 
      '🏆', '👏', '💫', '🔥', '⚡', '🚀', '💪'
    ];
    
    return celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
  };

  const getCelebrationIcon = (type: string) => {
    switch (type) {
      case 'habit_complete': return <Target className="w-6 h-6" />;
      case 'streak_milestone': return <Zap className="w-6 h-6" />;
      case 'reward_earned': return <Gift className="w-6 h-6" />;
      case 'challenge_complete': return <Trophy className="w-6 h-6" />;
      case 'level_up': return <Crown className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const getCelebrationColors = (type: string) => {
    switch (type) {
      case 'habit_complete': 
        return 'bg-green-500 border-green-400 text-white shadow-green-200';
      case 'streak_milestone': 
        return 'bg-yellow-500 border-yellow-400 text-white shadow-yellow-200';
      case 'reward_earned': 
        return 'bg-purple-500 border-purple-400 text-white shadow-purple-200';
      case 'challenge_complete': 
        return 'bg-blue-500 border-blue-400 text-white shadow-blue-200';
      case 'level_up': 
        return 'bg-pink-500 border-pink-400 text-white shadow-pink-200';
      default: 
        return 'bg-indigo-500 border-indigo-400 text-white shadow-indigo-200';
    }
  };

  if (celebrations.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Floating Emojis Background */}
      {floatingEmojis.map(({ id, emoji, x, y, delay }) => (
        <div
          key={id}
          className="absolute text-4xl animate-bounce pointer-events-none"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            animationDelay: `${delay}ms`,
            animationDuration: '3s',
            animationIterationCount: 'infinite'
          }}
        >
          <div className="animate-pulse">
            {emoji}
          </div>
        </div>
      ))}

      {/* Celebration Cards */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="space-y-4 max-w-md w-full">
          {celebrations.map((celebration, index) => (
            <div
              key={celebration.id}
              className={cn(
                "relative overflow-hidden rounded-2xl border-2 shadow-2xl transform transition-all duration-700 pointer-events-auto",
                getCelebrationColors(celebration.type),
                "animate-in slide-in-from-top-4 zoom-in-95"
              )}
              style={{
                animationDelay: `${index * 200}ms`
              }}
            >
              {/* Sparkle Animation Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-2 left-4 text-white text-xl animate-ping">✨</div>
                <div className="absolute top-6 right-6 text-white text-lg animate-ping" style={{ animationDelay: '500ms' }}>⭐</div>
                <div className="absolute bottom-4 left-8 text-white text-sm animate-ping" style={{ animationDelay: '1000ms' }}>💫</div>
                <div className="absolute bottom-8 right-4 text-white text-lg animate-ping" style={{ animationDelay: '1500ms' }}>🌟</div>
              </div>

              <div className="relative p-6 text-center">
                {/* Member Avatar */}
                <div className="flex justify-center mb-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg"
                    style={{ backgroundColor: celebration.memberColor }}
                  >
                    <div className="animate-bounce">
                      {celebration.memberAvatar}
                    </div>
                  </div>
                </div>

                {/* Celebration Content */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-pulse">
                      {getCelebrationIcon(celebration.type)}
                    </div>
                    <div className="text-6xl animate-bounce" style={{ animationDuration: '1s' }}>
                      {celebration.emoji}
                    </div>
                    <div className="animate-pulse">
                      {getCelebrationIcon(celebration.type)}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold">
                    🎉 {celebration.memberName}! 🎉
                  </h2>
                  
                  <h3 className="text-xl font-semibold">
                    {celebration.title}
                  </h3>
                  
                  <p className="text-lg opacity-90">
                    {celebration.description}
                  </p>

                  {/* Stats */}
                  <div className="flex justify-center space-x-6 mt-4">
                    {celebration.points && (
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 text-yellow-200">
                          <Star className="w-5 h-5" />
                          <span className="text-2xl font-bold">+{celebration.points}</span>
                        </div>
                        <div className="text-sm opacity-75">Points</div>
                      </div>
                    )}

                    {celebration.streak && (
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 text-orange-200">
                          <Zap className="w-5 h-5" />
                          <span className="text-2xl font-bold">{celebration.streak}</span>
                        </div>
                        <div className="text-sm opacity-75">Day Streak</div>
                      </div>
                    )}

                    {celebration.level && (
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 text-pink-200">
                          <Crown className="w-5 h-5" />
                          <span className="text-2xl font-bold">Level {celebration.level}</span>
                        </div>
                        <div className="text-sm opacity-75">New Level!</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => removeCelebration(celebration.id)}
                  className="mt-4 px-6 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white font-medium transition-all duration-200 backdrop-blur-sm"
                >
                  Awesome! 🎊
                </button>
              </div>

              {/* Progress Bar for Auto-dismiss */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-20">
                <div 
                  className="h-full bg-white bg-opacity-50 animate-pulse"
                  style={{
                    animation: `shrink ${celebration.duration}ms linear forwards`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confetti Effect */}
      {celebrations.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-3 h-3 opacity-70 animate-bounce",
                i % 2 === 0 ? "bg-yellow-400" : "bg-pink-400",
                i % 3 === 0 ? "rounded-full" : "rounded-sm"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3000}ms`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}