'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Heart, Zap, Crown, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingIcon {
  id: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface VisualFeedbackProps {
  children: React.ReactNode;
  onInteraction?: () => void;
  feedbackType?: 'success' | 'error' | 'warning' | 'info';
  disabled?: boolean;
  className?: string;
}

export function VisualFeedback({ 
  children, 
  onInteraction, 
  feedbackType = 'success',
  disabled = false,
  className 
}: VisualFeedbackProps) {
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([]);
  const [isPressed, setIsPressed] = useState(false);

  const handleInteraction = useCallback((event: React.MouseEvent) => {
    if (disabled) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Create floating icons
    createFloatingIcons(x, y, feedbackType);

    // Call original handler
    onInteraction?.();
  }, [disabled, feedbackType, onInteraction]);

  const createFloatingIcons = (x: number, y: number, type: string) => {
    const iconCount = 5;
    const icons = getIconsForType(type);
    const colors = getColorsForType(type);
    
    const newIcons: FloatingIcon[] = [];

    for (let i = 0; i < iconCount; i++) {
      const angle = (Math.PI * 2 * i) / iconCount + Math.random() * 0.5;
      const distance = 30 + Math.random() * 20;
      
      newIcons.push({
        id: Math.random().toString(36).substr(2, 9),
        icon: icons[Math.floor(Math.random() * icons.length)],
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 16 + Math.random() * 8
      });
    }

    setFloatingIcons(prev => [...prev, ...newIcons]);

    // Clean up after animation
    setTimeout(() => {
      setFloatingIcons(prev => 
        prev.filter(icon => !newIcons.some(newIcon => newIcon.id === icon.id))
      );
    }, 1500);
  };

  const getIconsForType = (type: string): React.ReactNode[] => {
    switch (type) {
      case 'success':
        return [
          <Star key="star" className="w-full h-full" />,
          <Heart key="heart" className="w-full h-full" />,
          <Zap key="zap" className="w-full h-full" />
        ];
      case 'error':
        return [
          <span key="x">❌</span>,
          <span key="warning">⚠️</span>
        ];
      case 'warning':
        return [
          <span key="warning">⚠️</span>,
          <span key="caution">🔸</span>
        ];
      case 'info':
        return [
          <span key="info">ℹ️</span>,
          <Star key="star" className="w-full h-full" />
        ];
      default:
        return [<Star key="star" className="w-full h-full" />];
    }
  };

  const getColorsForType = (type: string): string[] => {
    switch (type) {
      case 'success':
        return ['text-green-500', 'text-yellow-500', 'text-blue-500', 'text-purple-500'];
      case 'error':
        return ['text-red-500', 'text-orange-500'];
      case 'warning':
        return ['text-yellow-500', 'text-orange-500'];
      case 'info':
        return ['text-blue-500', 'text-indigo-500'];
      default:
        return ['text-purple-500'];
    }
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "relative transition-transform duration-150",
          isPressed && !disabled && "transform scale-95",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onMouseDown={() => !disabled && setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onClick={handleInteraction}
      >
        {children}
        
        {/* Ripple Effect */}
        <div className="absolute inset-0 overflow-hidden rounded-inherit pointer-events-none">
          {isPressed && !disabled && (
            <div 
              className={cn(
                "absolute inset-0 rounded-inherit animate-ping opacity-25",
                feedbackType === 'success' && "bg-green-500",
                feedbackType === 'error' && "bg-red-500",
                feedbackType === 'warning' && "bg-yellow-500",
                feedbackType === 'info' && "bg-blue-500"
              )}
              style={{ animationDuration: '600ms' }}
            />
          )}
        </div>
      </div>

      {/* Floating Icons */}
      {floatingIcons.map(({ id, icon, x, y, color, size }) => (
        <div
          key={id}
          className={cn(
            "absolute pointer-events-none animate-bounce",
            color
          )}
          style={{
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
            animationDuration: '1.5s',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards'
          }}
        >
          <div 
            className="w-full h-full animate-pulse"
            style={{
              animationDelay: '0.5s',
              animationDuration: '1s'
            }}
          >
            {icon}
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px) scale(0.5);
          }
        }
        
        .animate-float-up {
          animation: float-up 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Enhanced Button with built-in visual feedback
interface FeedbackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  feedbackType?: 'success' | 'error' | 'warning' | 'info';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function FeedbackButton({ 
  children, 
  feedbackType = 'success', 
  variant = 'default',
  size = 'md',
  className,
  onClick,
  disabled,
  ...props 
}: FeedbackButtonProps) {
  
  const baseClasses = cn(
    "relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
    
    // Size variants
    size === 'sm' && "px-3 py-1.5 text-sm",
    size === 'md' && "px-4 py-2 text-base", 
    size === 'lg' && "px-6 py-3 text-lg",
    
    // Style variants
    variant === 'default' && "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
    variant === 'outline' && "border-2 border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500",
    variant === 'ghost' && "text-purple-600 hover:bg-purple-50 focus:ring-purple-500",
    
    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
    className
  );

  return (
    <VisualFeedback 
      feedbackType={feedbackType}
      onInteraction={onClick ? () => onClick({} as any) : undefined}
      disabled={disabled}
    >
      <button 
        className={baseClasses}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    </VisualFeedback>
  );
}

// Progress indicator with celebration effect
interface CelebrationProgressProps {
  value: number;
  max: number;
  label?: string;
  celebrateOnIncrease?: boolean;
  className?: string;
}

export function CelebrationProgress({ 
  value, 
  max, 
  label, 
  celebrateOnIncrease = true,
  className 
}: CelebrationProgressProps) {
  const [previousValue, setPreviousValue] = useState(value);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (celebrateOnIncrease && value > previousValue) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
    setPreviousValue(value);
  }, [value, previousValue, celebrateOnIncrease]);

  return (
    <div className={cn("relative", className)}>
      {label && (
        <div className="flex justify-between text-sm font-medium mb-2">
          <span>{label}</span>
          <span>{value}/{max}</span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            percentage >= 100 ? "bg-green-500" : "bg-purple-600"
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect on progress increase */}
          {showCelebration && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-pulse" />
          )}
        </div>
        
        {/* Sparkles on completion */}
        {percentage >= 100 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-xs animate-bounce">✨</div>
          </div>
        )}
      </div>
      
      {/* Celebration burst */}
      {showCelebration && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce text-yellow-500">
            <Star className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}