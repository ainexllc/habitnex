'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Settings, Users, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';
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
  
  return (
    <header className={cn(
      "mb-6 md:mb-8",
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Date Info */}
        <div>
          {familyName && (
            <h1 className={cn(
              theme.text.primary,
              "font-bold",
              touchMode ? "text-4xl" : "text-2xl md:text-3xl"
            )}>
              {familyName}
            </h1>
          )}
          <div className={cn(
            theme.text.secondary,
            "font-medium",
            touchMode ? "text-xl" : "text-sm md:text-base",
            !familyName && "text-lg md:text-xl"
          )}>
            {date}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-4">
          {!touchMode ? (
            /* Desktop Controls */
            <div className="flex items-center space-x-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className={theme.animation.transition} title="Individual Dashboard">
                  <User className={cn("w-4 h-4", theme.text.muted)} />
                </Button>
              </Link>
              <Link href="/family/calendar">
                <Button variant="ghost" size="sm" className={theme.animation.transition}>
                  <Calendar className={cn("w-4 h-4", theme.text.muted)} />
                </Button>
              </Link>
              <Link href="/family/members">
                <Button variant="ghost" size="sm" className={theme.animation.transition}>
                  <Users className={cn("w-4 h-4", theme.text.muted)} />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={onSettingsClick} className={theme.animation.transition}>
                <Settings className={cn("w-4 h-4", theme.text.muted)} />
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
                  theme.animation.transition,
                  "hover:scale-105 active:scale-95"
                )}
                onClick={() => setShowMenu(!showMenu)}
              >
                <Settings className={cn("w-8 h-8", theme.text.muted)} />
              </Button>
              
              {/* Touch Menu */}
              {showMenu && (
                <div className={cn(
                  "absolute right-0 top-20 rounded-2xl p-4 min-w-[200px] z-50",
                  theme.components.dropdown.menu,
                  theme.shadow.xl
                )}>
                  <div className="space-y-2">
                    <Link href="/dashboard">
                      <Button 
                        variant="ghost" 
                        size="lg" 
                        className={cn(
                          "w-full justify-start h-14 text-lg",
                          theme.text.primary,
                          theme.animation.transition
                        )}
                        onClick={() => setShowMenu(false)}
                      >
                        <User className={cn("w-6 h-6 mr-3", theme.text.primary)} />
                        Individual Dashboard
                      </Button>
                    </Link>
                    <Link href="/family/calendar">
                      <Button 
                        variant="ghost" 
                        size="lg" 
                        className={cn(
                          "w-full justify-start h-14 text-lg",
                          theme.text.primary,
                          theme.animation.transition
                        )}
                        onClick={() => setShowMenu(false)}
                      >
                        <Calendar className={cn("w-6 h-6 mr-3", theme.text.primary)} />
                        Calendar
                      </Button>
                    </Link>
                    <Link href="/family/members">
                      <Button 
                        variant="ghost" 
                        size="lg" 
                        className={cn(
                          "w-full justify-start h-14 text-lg",
                          theme.text.primary,
                          theme.animation.transition
                        )}
                        onClick={() => setShowMenu(false)}
                      >
                        <Users className={cn("w-6 h-6 mr-3", theme.text.primary)} />
                        Members
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      className={cn(
                        "w-full justify-start h-14 text-lg",
                        theme.text.primary,
                        theme.animation.transition
                      )}
                      onClick={() => {
                        setShowMenu(false);
                        onSettingsClick?.();
                      }}
                    >
                      <Settings className={cn("w-6 h-6 mr-3", theme.text.primary)} />
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
        "mt-4 p-4 rounded-xl border",
        theme.gradients.primary,
        theme.border.light,
        touchMode && "mt-6 p-6"
      )}>
        <p className={cn(
          "font-medium text-center",
          theme.status.info.text,
          touchMode ? "text-xl" : "text-sm md:text-base"
        )}>
          🌟 Every small step counts! Let's make today amazing together! 🌟
        </p>
      </div>
      
      {/* Touch Menu Overlay */}
      {showMenu && touchMode && (
        <div 
          className={cn("fixed inset-0 z-40", theme.components.modal.backdrop)}
          onClick={() => setShowMenu(false)}
        />
      )}
    </header>
  );
}