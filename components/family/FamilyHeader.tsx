'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Settings, Users, Calendar, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { familyText, familyIcons, getFamilyButton, familyAnimations } from '@/lib/familyThemes';
import Link from 'next/link';

interface FamilyHeaderProps {
  familyName: string;
  date: string;
  touchMode?: boolean;
  onSettingsClick?: () => void;
  className?: string;
}

export function FamilyHeader({
  familyName,
  date,
  touchMode = false,
  onSettingsClick,
  className
}: FamilyHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const time = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return (
    <header className={cn(
      "mb-6 md:mb-8",
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Family Info */}
        <div className="flex items-center space-x-4">
          <div className={cn(
            "flex items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-white font-bold shadow-lg dark:shadow-blue-500/20",
            familyAnimations.hover,
            touchMode ? "w-16 h-16 text-2xl" : "w-12 h-12 text-lg"
          )}>
            <Home className={cn(
              "text-white",
              touchMode ? "w-8 h-8" : "w-6 h-6"
            )} />
          </div>
          <div>
            <h1 className={cn(
              familyText.primary,
              "font-bold",
              touchMode ? "text-4xl" : "text-2xl md:text-3xl"
            )}>
              {familyName}
            </h1>
            <div className={cn(
              familyText.secondary,
              "font-medium",
              touchMode ? "text-xl" : "text-sm md:text-base"
            )}>
              {date}
            </div>
          </div>
        </div>
        
        {/* Time and Controls */}
        <div className="flex items-center space-x-4">
          {/* Current Time */}
          <div className={cn(
            "text-right",
            touchMode && "mr-4"
          )}>
            <div className={cn(
              familyText.primary,
              "font-bold",
              touchMode ? "text-3xl" : "text-xl"
            )}>
              {time}
            </div>
            <div className={cn(
              familyText.muted,
              "text-sm",
              touchMode && "text-base"
            )}>
              Right now
            </div>
          </div>
          
          {/* Controls */}
          {!touchMode ? (
            /* Desktop Controls */
            <div className="flex items-center space-x-2">
              <Link href="/family/calendar">
                <Button variant="ghost" size="sm" className={familyAnimations.hover}>
                  <Calendar className={cn("w-4 h-4", familyIcons.interactive)} />
                </Button>
              </Link>
              <Link href="/family/members">
                <Button variant="ghost" size="sm" className={familyAnimations.hover}>
                  <Users className={cn("w-4 h-4", familyIcons.interactive)} />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={onSettingsClick} className={familyAnimations.hover}>
                <Settings className={cn("w-4 h-4", familyIcons.interactive)} />
              </Button>
            </div>
          ) : (
            /* Touch Controls */
            <div className="relative">
              <Button
                variant="ghost"
                size="lg"
                className={cn(
                  "w-16 h-16 rounded-full",
                  familyAnimations.hover,
                  familyAnimations.press
                )}
                onClick={() => setShowMenu(!showMenu)}
              >
                <Settings className={cn("w-8 h-8", familyIcons.interactive)} />
              </Button>
              
              {/* Touch Menu */}
              {showMenu && (
                <div className="absolute right-0 top-20 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[200px] z-50">
                  <div className="space-y-2">
                    <Link href="/family/calendar">
                      <Button 
                        variant="ghost" 
                        size="lg" 
                        className={cn(
                          "w-full justify-start h-14 text-lg",
                          familyText.primary,
                          familyAnimations.hover
                        )}
                        onClick={() => setShowMenu(false)}
                      >
                        <Calendar className={cn("w-6 h-6 mr-3", familyIcons.primary)} />
                        Calendar
                      </Button>
                    </Link>
                    <Link href="/family/members">
                      <Button 
                        variant="ghost" 
                        size="lg" 
                        className={cn(
                          "w-full justify-start h-14 text-lg",
                          familyText.primary,
                          familyAnimations.hover
                        )}
                        onClick={() => setShowMenu(false)}
                      >
                        <Users className={cn("w-6 h-6 mr-3", familyIcons.primary)} />
                        Members
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      className={cn(
                        "w-full justify-start h-14 text-lg",
                        familyText.primary,
                        familyAnimations.hover
                      )}
                      onClick={() => {
                        setShowMenu(false);
                        onSettingsClick?.();
                      }}
                    >
                      <Settings className={cn("w-6 h-6 mr-3", familyIcons.primary)} />
                      Settings
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Motivational Message */}
      <div className={cn(
        "mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100",
        touchMode && "mt-6 p-6"
      )}>
        <p className={cn(
          "text-blue-800 font-medium text-center",
          touchMode ? "text-xl" : "text-sm md:text-base"
        )}>
          🌟 Every small step counts! Let's make today amazing together! 🌟
        </p>
      </div>
      
      {/* Touch Menu Overlay */}
      {showMenu && touchMode && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </header>
  );
}