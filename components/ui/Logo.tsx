import Link from 'next/link';

interface LogoProps {
  linkToHome?: boolean;
  className?: string;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ 
  linkToHome = true, 
  className = '',
  textSize = 'lg'
}: LogoProps) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const content = (
    <span className={`${textSizes[textSize]} font-bold ${className}`}>
      <span className="text-blue-600 dark:text-blue-500">Next</span>
      <span className="text-gray-900 dark:text-white">Vibe</span>
    </span>
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