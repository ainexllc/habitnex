'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { Users, Target, Trophy, Gift, BarChart3, Home, Settings, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';


interface ModernFamilyHeaderProps {
  familyName: string;
  date: string;
  touchMode?: boolean;
  isParent?: boolean;


  className?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const encouragingMessages = [
  "🔥 On fire! Keep that momentum going!",
  "⭐ Amazing progress this week!",
  "💪 Building strong habits together!",
  "🌟 Every small step counts!",
  "🚀 Consistency is your superpower!",
  "✨ Great teamwork, family!",
  "🎯 Focused and determined!",
  "🏆 Champions in the making!",
];

export function ModernFamilyHeader({
  familyName,
  date,
  touchMode = false,
  isParent = false,


  className,
  activeTab = 'overview',
  onTabChange
}: ModernFamilyHeaderProps) {
  const [currentMessage, setCurrentMessage] = useState(encouragingMessages[0]);
  
  // Rotate encouraging message daily
  useEffect(() => {
    const today = new Date().getDate();
    const messageIndex = today % encouragingMessages.length;
    setCurrentMessage(encouragingMessages[messageIndex]);
  }, []);

  const navigationLinks = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className={cn("bg-gray-900 text-white mb-[10px]", className)}>
      {/* Gradient Header Section */}
      <div className="bg-gradient-to-b from-blue-600 to-gray-900 pb-8">
        <div className="px-6">
          {/* Top Row */}
          <div className="flex justify-between items-center mb-6 pt-[15px]">
            <h1
              className={cn(
                "font-bold",
                touchMode ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl lg:text-5xl"
              )}
              style={{
                fontFamily: '"Kablammo", sans-serif',
                fontWeight: 700
              }}
            >
              {familyName.split('').map((letter, index) => {
                const colors = [
                  'text-red-400',
                  'text-orange-400',
                  'text-yellow-400',
                  'text-green-400',
                  'text-blue-400',
                  'text-indigo-400',
                  'text-purple-400',
                  'text-pink-400'
                ];
                const colorIndex = index % colors.length;
                return (
                  <span
                    key={index}
                    className={cn(
                      colors[colorIndex],
                      letter === ' ' && "text-white"
                    )}
                  >
                    {letter}
                  </span>
                );
              })}
            </h1>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size={touchMode ? "default" : "sm"}
                  className={cn(
                    "bg-black/20 hover:bg-black/30 text-white border-none",
                    touchMode && "min-h-[48px] px-6"
                  )}
                  title="Dashboard"
                >
                  <LayoutDashboard className={cn(touchMode ? "w-5 h-5" : "w-4 h-4")} />
                </Button>
              </Link>
              

            </div>
          </div>
          
          {/* Info Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white/90">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className={cn(
                "font-medium",
                touchMode ? "text-lg" : "text-sm md:text-base"
              )}>
                {date}
              </span>
              
              <span className="hidden sm:inline text-white/60">•</span>
              
              <span className={cn(
                "text-blue-200 font-medium",
                touchMode ? "text-lg" : "text-sm md:text-base"
              )}>
                {currentMessage}
              </span>
            </div>
            
            {/* Weather Widget */}
            <WeatherWidget compact className="flex-shrink-0" />
          </div>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="px-6">
          <div className="flex gap-8 overflow-x-auto">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onTabChange?.(link.id)}
                  className={cn(
                    "flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap",
                    touchMode && "py-5 text-base min-w-[120px] justify-center",
                    isActive
                      ? "text-white border-blue-500"
                      : "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600"
                  )}
                >
                  <Icon className={cn(touchMode ? "w-5 h-5" : "w-4 h-4")} />
                  <span className={cn(touchMode ? "block" : "hidden sm:block")}>
                    {link.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      

    </header>
  );
}