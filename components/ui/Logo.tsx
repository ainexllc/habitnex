import { Sparkles } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  showIcon?: boolean;
  linkToHome?: boolean;
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ 
  showIcon = true, 
  linkToHome = true, 
  className = '',
  iconSize = 'md',
  textSize = 'lg'
}: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconInnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const content = (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && (
        <div className={`${iconSizes[iconSize]} bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-md`}>
          <Sparkles className={`${iconInnerSizes[iconSize]} text-white`} />
        </div>
      )}
      <span className={`${textSizes[textSize]} font-bold flex items-baseline`}>
        <span className="text-blue-600 dark:text-blue-500">Next</span>
        <span className="text-gray-900 dark:text-white">Vibe</span>
      </span>
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="group">
        {content}
      </Link>
    );
  }

  return content;
}