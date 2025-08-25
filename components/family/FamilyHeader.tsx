'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Settings, Users, Calendar, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
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
            "flex items-center justify-center rounded-full bg-blue-600 text-white font-bold",
            touchMode ? "w-16 h-16 text-2xl" : "w-12 h-12 text-lg"
          )}>
            <Home className={cn(
              "text-white",
              touchMode ? "w-8 h-8" : "w-6 h-6"
            )} />
          </div>
          <div>
            <h1 className={cn(
              "font-bold text-gray-900",
              touchMode ? "text-4xl" : "text-2xl md:text-3xl"
            )}>
              {familyName}
            </h1>
            <div className={cn(
              "text-gray-600 font-medium",
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
              "font-bold text-gray-900",
              touchMode ? "text-3xl" : "text-xl"
            )}>
              {time}
            </div>
            <div className={cn(
              "text-gray-500 text-sm",
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
                <Button variant="ghost" size="sm">
                  <Calendar className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/family/members">
                <Button variant="ghost" size="sm">
                  <Users className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={onSettingsClick}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            /* Touch Controls */
            <div className="relative">
              <Button
                variant="ghost"
                size="lg"
                className="w-16 h-16 rounded-full"
                onClick={() => setShowMenu(!showMenu)}
              >
                <Settings className="w-8 h-8" />
              </Button>
              
              {/* Touch Menu */}
              {showMenu && (
                <div className="absolute right-0 top-20 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-[200px] z-50">
                  <div className="space-y-2">
                    <Link href="/family/calendar">
                      <Button 
                        variant="ghost" 
                        size="lg" 
                        className="w-full justify-start h-14 text-lg"
                        onClick={() => setShowMenu(false)}
                      >
                        <Calendar className="w-6 h-6 mr-3" />
                        Calendar
                      </Button>
                    </Link>
                    <Link href="/family/members">
                      <Button 
                        variant="ghost" 
                        size="lg" 
                        className="w-full justify-start h-14 text-lg"
                        onClick={() => setShowMenu(false)}
                      >
                        <Users className="w-6 h-6 mr-3" />
                        Members
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="lg" 
                      className="w-full justify-start h-14 text-lg"
                      onClick={() => {
                        setShowMenu(false);
                        onSettingsClick?.();
                      }}
                    >
                      <Settings className="w-6 h-6 mr-3" />
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