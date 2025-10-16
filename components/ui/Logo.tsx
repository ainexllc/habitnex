import Link from 'next/link'
import { Kanit } from 'next/font/google'
import { cn } from '@/lib/utils'

const habitNexLogoFont = Kanit({
  subsets: ['latin'],
  weight: ['600', '700'],
})

type LogoSize = 'sm' | 'md' | 'lg' | 'xl'
type LogoTone = 'auto' | 'light' | 'dark'

interface LogoProps {
  linkToHome?: boolean
  className?: string
  textSize?: LogoSize
  tone?: LogoTone
}

const sizeStyles: Record<LogoSize, string> = {
  sm: 'text-[1.65rem]',
  md: 'text-[2.1rem]',
  lg: 'text-[2.6rem]',
  xl: 'text-[3.25rem]',
}

const nexToneStyles: Record<LogoTone, string> = {
  auto: 'text-gray-900 transition-colors duration-200 dark:text-white',
  light: 'text-white',
  dark: 'text-gray-900',
}

function LogoMark({
  textSize,
  tone,
  className,
}: {
  textSize: LogoSize
  tone: LogoTone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex select-none items-baseline font-semibold leading-none tracking-[-0.035em]',
        habitNexLogoFont.className,
        sizeStyles[textSize],
        className
      )}
    >
      <span className="text-orange-500 drop-shadow-[0_10px_25px_rgba(249,115,22,0.28)]">
        Habit
      </span>
      <span className={cn('ml-[0.015em]', nexToneStyles[tone])}>Nex</span>
    </span>
  )
}

export function Logo({
  linkToHome = true,
  className,
  textSize = 'lg',
  tone = 'auto',
}: LogoProps) {
  const content = <LogoMark textSize={textSize} tone={tone} className={className} />

  if (!linkToHome) {
    return content
  }

  return (
    <Link href="/" className="group inline-flex" aria-label="HabitNex home">
      {content}
    </Link>
  )
}
