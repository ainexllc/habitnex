'use client';

import { useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';

export function TouchScreenOptimizer() {
  const { currentFamily } = useFamily();
  
  useEffect(() => {
    // Disable text selection for touch screens
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    
    // Disable zoom on touch screens
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
    
    // Add touch-friendly CSS classes
    document.body.classList.add('touch-optimized');
    
    // Disable context menu (right-click)
    const handleContextMenu = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Disable drag and drop
    const handleDragStart = (e: Event) => e.preventDefault();
    document.addEventListener('dragstart', handleDragStart);
    
    // Add haptic feedback for supported devices
    if ('vibrate' in navigator) {
      const handleTouchStart = () => {
        if (currentFamily?.settings.display.animationSpeed !== 'slow') {
          navigator.vibrate(10); // Short vibration
        }
      };
      
      document.addEventListener('touchstart', handleTouchStart);
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
      };
    }
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.body.classList.remove('touch-optimized');
    };
  }, [currentFamily?.settings.display.animationSpeed]);
  
  // Add dynamic CSS for touch optimization
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .touch-optimized * {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      
      .touch-optimized button,
      .touch-optimized [role="button"] {
        min-height: 60px;
        min-width: 60px;
        transition: transform 0.1s ease;
      }
      
      .touch-optimized button:active,
      .touch-optimized [role="button"]:active {
        transform: scale(0.95);
      }
      
      .touch-optimized .touch-target {
        min-height: 60px;
        min-width: 60px;
        padding: 12px;
      }
      
      .touch-optimized .touch-large {
        min-height: 80px;
        min-width: 80px;
        padding: 16px;
      }
      
      .touch-optimized .no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      /* Increase font sizes for better readability */
      .touch-optimized {
        font-size: 18px;
        line-height: 1.6;
      }
      
      .touch-optimized h1 { font-size: 2.5rem; }
      .touch-optimized h2 { font-size: 2rem; }
      .touch-optimized h3 { font-size: 1.5rem; }
      .touch-optimized .text-sm { font-size: 1rem; }
      .touch-optimized .text-xs { font-size: 0.875rem; }
      
      /* Better spacing for touch */
      .touch-optimized .space-y-2 > * + * { margin-top: 1rem; }
      .touch-optimized .space-y-4 > * + * { margin-top: 1.5rem; }
      .touch-optimized .space-x-2 > * + * { margin-left: 1rem; }
      .touch-optimized .space-x-4 > * + * { margin-left: 1.5rem; }
      
      /* Smooth animations */
      .touch-optimized * {
        transition-duration: 0.2s;
        transition-timing-function: ease-out;
      }
      
      /* Better focus indicators */
      .touch-optimized *:focus {
        outline: 3px solid #3B82F6;
        outline-offset: 2px;
        border-radius: 8px;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return null; // This component only adds behavior, no visual elements
}