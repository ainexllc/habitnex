'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Settings, Plus, UserPlus, User, Users, Target, Trophy, Gift, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { InviteCodeDisplay } from './InviteCodeDisplay';

interface ModernFamilyHeaderProps {
  familyName: string;
  date: string;
  touchMode?: boolean;
  isParent?: boolean;
  onSettingsClick?: () => void;
  onAddMemberClick?: () => void;
  className?: string;
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
  onSettingsClick,
  onAddMemberClick,
  className
}: ModernFamilyHeaderProps) {
  const [currentMessage, setCurrentMessage] = useState(encouragingMessages[0]);
  
  // Rotate encouraging message daily
  useEffect(() => {
    const today = new Date().getDate();
    const messageIndex = today % encouragingMessages.length;
    setCurrentMessage(encouragingMessages[messageIndex]);
  }, []);

  const navigationLinks = [
    { href: '/dashboard/family', label: 'Members', icon: Users, active: true },
    { href: '/family/habits', label: 'Habits', icon: Target, active: false },
    { href: '/family/challenges', label: 'Challenges', icon: Trophy, active: false },
    { href: '/family/rewards', label: 'Rewards', icon: Gift, active: false },
    { href: '/family/analytics', label: 'Analytics', icon: BarChart3, active: false },
  ];

  return (
    <header className={cn("bg-gray-900 text-white", className)}>
      {/* Gradient Header Section */}
      <div className="bg-gradient-to-b from-blue-600 to-gray-900 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Row */}
          <div className="flex justify-between items-center mb-6">
            <h1 className={cn(
              "font-bold text-white",
              touchMode ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl lg:text-5xl"
            )}>
              {familyName}
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
                  title="Individual Dashboard"
                >
                  <User className={cn(touchMode ? "w-5 h-5" : "w-4 h-4")} />
                  <span className="ml-2 hidden sm:inline">Individual</span>
                </Button>
              </Link>
              
              {isParent && (
                <>
                  <Link href="/family/habits/create">
                    <Button
                      size={touchMode ? "default" : "sm"}
                      className={cn(
                        "bg-black/20 hover:bg-black/30 text-white border-none",
                        touchMode && "min-h-[48px] px-6"
                      )}
                    >
                      <Plus className={cn(touchMode ? "w-5 h-5" : "w-4 h-4", "mr-2")} />
                      Add Habit
                    </Button>
                  </Link>
                  
                  <Button
                    variant="ghost"
                    size={touchMode ? "default" : "sm"}
                    onClick={onAddMemberClick}
                    className={cn(
                      "bg-black/20 hover:bg-black/30 text-white border-none",
                      touchMode && "min-h-[48px] px-6"
                    )}
                    title="Add Member"
                  >
                    <UserPlus className={cn(touchMode ? "w-5 h-5" : "w-4 h-4")} />
                    <span className="ml-2 hidden lg:inline">Member</span>
                  </Button>
                  
                  <Link href="/family/settings">
                    <Button
                      variant="ghost"
                      size={touchMode ? "default" : "sm"}
                      className={cn(
                        "bg-black/20 hover:bg-black/30 text-white border-none",
                        touchMode && "min-h-[48px] px-6"
                      )}
                      title="Settings"
                    >
                      <Settings className={cn(touchMode ? "w-5 h-5" : "w-4 h-4")} />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Info Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-white/90">
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
            
            {/* Invite Code for Parents */}
            {isParent && !touchMode && (
              <>
                <span className="hidden lg:inline text-white/60">•</span>
                <div className="hidden lg:block">
                  <InviteCodeDisplay 
                    variant="inline"
                    showTitle={false}
                    className="text-white/80 hover:text-white"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap",
                    touchMode && "py-5 text-base min-w-[120px] justify-center",
                    link.active
                      ? "text-white border-blue-500"
                      : "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600"
                  )}
                >
                  <Icon className={cn(touchMode ? "w-5 h-5" : "w-4 h-4")} />
                  <span className={cn(touchMode ? "block" : "hidden sm:block")}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      
      {/* Mobile Invite Code - Show on touch mode */}
      {isParent && touchMode && (
        <div className="bg-gray-800/50 px-6 py-3 border-b border-gray-700">
          <InviteCodeDisplay 
            variant="inline"
            showTitle={true}
            className="text-white/80"
          />
        </div>
      )}
    </header>
  );
}