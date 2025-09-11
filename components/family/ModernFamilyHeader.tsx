'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Users, Target, Trophy, Gift, BarChart3, Home, Settings, LayoutDashboard, Maximize, Minimize, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';


interface ModernFamilyHeaderProps {
  familyName: string;
  date: string;
  touchMode?: boolean;
  isParent?: boolean;


  className?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}


export function ModernFamilyHeader({
  familyName,
  date,
  touchMode = false,
  isParent = false,


  className,
  activeTab = 'overview',
  onTabChange
}: ModernFamilyHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        } else if ((document.documentElement as any).mozRequestFullScreen) {
          await (document.documentElement as any).mozRequestFullScreen();
        } else if ((document.documentElement as any).msRequestFullscreen) {
          await (document.documentElement as any).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      // Error toggling fullscreen - handle silently
    }
  };

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
      <div className="bg-gradient-to-b from-blue-600 to-gray-900 pb-0.5">
        <div className="px-6">
          {/* Top Row */}
          <div className="flex justify-between items-center mb-6 pt-[15px]">
            <div className="flex items-center gap-6">
              

              
              <div>
                <h1
                  className={cn(
                    "font-bold mt-[10px] ml-[10px]",
                    touchMode ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl lg:text-5xl"
                  )}
                  style={{
                    fontFamily: '"Henny Penny", cursive',
                    fontWeight: 700
                  }}
                >
                {familyName.split('').map((letter, index) => {
                  const rainbowColors = [
                    'text-red-400',
                    'text-orange-400',
                    'text-yellow-400',
                    'text-green-400',
                    'text-blue-400',
                    'text-indigo-400',
                    'text-purple-400',
                    'text-pink-400'
                  ];

                  // Every other letter gets rainbow color
                  const isRainbowLetter = index % 2 === 0;
                  const colorIndex = Math.floor(index / 2) % rainbowColors.length;

                  return (
                    <span
                      key={index}
                      className={cn(
                        isRainbowLetter ? rainbowColors[colorIndex] : 'text-white',
                        letter === ' ' && "text-white"
                      )}
                    >
                      {letter}
                    </span>
                  );
                })}
                </h1>
                
                {/* Date Display */}
                <p className={cn(
                  "text-blue-200 mt-1 ml-[10px]",
                  touchMode ? "text-lg md:text-xl" : "text-base md:text-lg"
                )}>
                  {date}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size={touchMode ? "default" : "sm"}
                onClick={toggleFullscreen}
                className={cn(
                  "bg-black/20 hover:bg-black/30 text-white border-none",
                  touchMode && "min-h-[48px] px-6"
                )}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className={cn(touchMode ? "w-5 h-5" : "w-4 h-4")} />
                ) : (
                  <Maximize className={cn(touchMode ? "w-5 h-5" : "w-4 h-4")} />
                )}
              </Button>

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