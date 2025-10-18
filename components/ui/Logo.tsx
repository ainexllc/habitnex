import Link from 'next/link'
import { Kanit } from 'next/font/google'
import { clsx } from 'clsx'

const habitNexLogoFont = Kanit({
  subsets: ['latin'],
  weight: ['600', '700'],
})

interface LogoProps {
  linkToHome?: boolean
  className?: string
  iconSize?: number
}

function LogoWordmark({ className, iconSize = 87.2 }: { className?: string; iconSize?: number }) {
  return (
    <div
      className={clsx(
        'flex items-center text-[43.6px] font-semibold tracking-[-1.526px] font-[family-name:var(--font-kanit)]',
        habitNexLogoFont.className,
        className
      )}
    >
      <span className="text-orange-500">Habit</span>
      <span className="text-white">Ne</span>
      <span className="relative inline-block -ml-[21px] translate-y-[7px]" style={{ width: iconSize, height: iconSize }}>
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <rect x="10" y="10" width="15" height="15" fill="#f97316" />
          <rect x="30" y="30" width="15" height="15" fill="#f97316" />
          <rect x="50" y="50" width="15" height="15" fill="#f97316" />
          <rect x="70" y="70" width="15" height="15" fill="#f97316" />
          <rect x="70" y="10" width="15" height="15" fill="white" />
          <rect x="50" y="30" width="15" height="15" fill="white" />
          <rect x="30" y="50" width="15" height="15" fill="white" />
          <rect x="10" y="70" width="15" height="15" fill="white" />
        </svg>
      </span>
    </div>
  )
}

export function Logo({ linkToHome = true, className, iconSize }: LogoProps) {
  const content = <LogoWordmark className={className} iconSize={iconSize} />

  if (!linkToHome) {
    return content
  }

  return (
    <Link href="/" className="group inline-flex" aria-label="HabitNex home">
      {content}
    </Link>
  )
}
