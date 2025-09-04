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
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  const content = (
    <span 
      className={`${textSizes[textSize]} ${className}`}
      style={{ fontFamily: '"Climate Crisis", cursive' }}
    >
      <span className="text-green-600 dark:text-green-500">Next</span>
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