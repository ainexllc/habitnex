import { cn } from '@/lib/utils'
import {
  Anton,
  Archivo,
  Audiowide,
  Barlow,
  Bebas_Neue,
  Black_Ops_One,
  Dela_Gothic_One,
  DM_Sans,
  Exo_2,
  Fjalla_One,
  Inter,
  Kanit,
  League_Spartan,
  Manrope,
  Maven_Pro,
  Montserrat,
  Nunito,
  Orbitron,
  Oswald,
  Poppins,
  Prompt,
  Quicksand,
  Rajdhani,
  Raleway,
  Righteous,
  Rubik,
  Saira,
  Space_Grotesk,
  Teko,
  Work_Sans,
} from 'next/font/google'

const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: '400' })
const leagueSpartan = League_Spartan({ subsets: ['latin'], weight: '700' })
const anton = Anton({ subsets: ['latin'], weight: '400' })
const oswald = Oswald({ subsets: ['latin'], weight: '600' })
const montserrat = Montserrat({ subsets: ['latin'], weight: '700' })
const poppins = Poppins({ subsets: ['latin'], weight: '600' })
const inter = Inter({ subsets: ['latin'], weight: '700' })
const manrope = Manrope({ subsets: ['latin'], weight: '700' })
const raleway = Raleway({ subsets: ['latin'], weight: '600' })
const rubik = Rubik({ subsets: ['latin'], weight: '700' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: '700' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: '600' })
const saira = Saira({ subsets: ['latin'], weight: '700' })
const archivo = Archivo({ subsets: ['latin'], weight: '700' })
const barlow = Barlow({ subsets: ['latin'], weight: '700' })
const rajdhani = Rajdhani({ subsets: ['latin'], weight: '600' })
const prompt = Prompt({ subsets: ['latin'], weight: '700' })
const teko = Teko({ subsets: ['latin'], weight: '600' })
const exo2 = Exo_2({ subsets: ['latin'], weight: '700' })
const orbitron = Orbitron({ subsets: ['latin'], weight: '700' })
const righteous = Righteous({ subsets: ['latin'], weight: '400' })
const audiowide = Audiowide({ subsets: ['latin'], weight: '400' })
const fjallaOne = Fjalla_One({ subsets: ['latin'], weight: '400' })
const blackOpsOne = Black_Ops_One({ subsets: ['latin'], weight: '400' })
const delaGothicOne = Dela_Gothic_One({ subsets: ['latin'], weight: '400' })
const kanit = Kanit({ subsets: ['latin'], weight: '700' })
const nunito = Nunito({ subsets: ['latin'], weight: '700' })
const quicksand = Quicksand({ subsets: ['latin'], weight: '700' })
const mavenPro = Maven_Pro({ subsets: ['latin'], weight: '700' })
const workSans = Work_Sans({ subsets: ['latin'], weight: '700' })

type FontRef = { className: string }

interface LogoSpec {
  fontName: string
  font: FontRef
  label: string
  tagline: string
  headlineClass: string
  taglineClass?: string
  accent: string
  nexTone?: 'light' | 'dark'
}

const logos: LogoSpec[] = [
  {
    fontName: 'Bebas Neue',
    font: bebasNeue,
    label: 'Glow Grid',
    tagline: 'Discipline in motion.',
    headlineClass: 'drop-shadow-[0_14px_35px_rgba(249,115,22,0.42)]',
    taglineClass: 'text-xs uppercase tracking-[0.45em]',
    accent: 'Signal Rise',
  },
  {
    fontName: 'League Spartan',
    font: leagueSpartan,
    label: 'Sunrise Block',
    tagline: 'Build streaks that shine.',
    headlineClass: 'drop-shadow-[0_12px_32px_rgba(249,115,22,0.38)]',
    taglineClass: 'text-sm uppercase tracking-[0.32em]',
    accent: 'Radiant Steps',
  },
  {
    fontName: 'Anton',
    font: anton,
    label: 'Impact Stack',
    tagline: 'Bold habits, fearless teams.',
    headlineClass: 'drop-shadow-[0_18px_42px_rgba(249,115,22,0.5)]',
    taglineClass: 'text-sm tracking-[0.18em]',
    accent: 'Momentum Forge',
  },
  {
    fontName: 'Oswald',
    font: oswald,
    label: 'Condensed Pulse',
    tagline: 'Cadence for every crew.',
    headlineClass: 'drop-shadow-[0_20px_50px_rgba(249,115,22,0.46)]',
    taglineClass: 'text-xs uppercase tracking-[0.4em]',
    accent: 'Cadence Crew',
  },
  {
    fontName: 'Montserrat',
    font: montserrat,
    label: 'Precision Crest',
    tagline: 'Crafted rituals, no noise.',
    headlineClass: 'drop-shadow-[0_16px_36px_rgba(249,115,22,0.4)]',
    taglineClass: 'text-sm tracking-[0.22em]',
    accent: 'Sharp Focus',
  },
  {
    fontName: 'Poppins',
    font: poppins,
    label: 'Modular Halo',
    tagline: 'Organize the everyday.',
    headlineClass: 'drop-shadow-[0_14px_38px_rgba(249,115,22,0.42)]',
    taglineClass: 'text-xs uppercase tracking-[0.42em]',
    accent: 'Cosmic Orbit',
  },
  {
    fontName: 'Inter',
    font: inter,
    label: 'Utility Mark',
    tagline: 'Framework for flourishing.',
    headlineClass: 'drop-shadow-[0_15px_38px_rgba(249,115,22,0.43)]',
    taglineClass: 'text-sm tracking-[0.2em]',
    accent: 'System Flow',
  },
  {
    fontName: 'Manrope',
    font: manrope,
    label: 'Nomad Line',
    tagline: 'Habits that travel well.',
    headlineClass: 'drop-shadow-[0_12px_30px_rgba(249,115,22,0.35)]',
    taglineClass: 'text-sm uppercase tracking-[0.28em]',
    accent: 'Nomad Tempo',
  },
  {
    fontName: 'Raleway',
    font: raleway,
    label: 'Airy Beacon',
    tagline: 'Lightweight focus rituals.',
    headlineClass: 'drop-shadow-[0_12px_28px_rgba(249,115,22,0.34)]',
    taglineClass: 'text-xs uppercase tracking-[0.5em]',
    accent: 'Beacon Trail',
  },
  {
    fontName: 'Rubik',
    font: rubik,
    label: 'Soft Grid',
    tagline: 'Friendly structure, serious results.',
    headlineClass: 'drop-shadow-[0_16px_40px_rgba(249,115,22,0.44)]',
    taglineClass: 'text-sm tracking-[0.18em]',
    accent: 'Streak Canvas',
  },
  {
    fontName: 'DM Sans',
    font: dmSans,
    label: 'Signal Smooth',
    tagline: 'Smooth operators of routine.',
    headlineClass: 'drop-shadow-[0_10px_28px_rgba(249,115,22,0.34)]',
    taglineClass: 'text-sm uppercase tracking-[0.24em]',
    accent: 'Signal Runway',
  },
  {
    fontName: 'Space Grotesk',
    font: spaceGrotesk,
    label: 'Orbit Path',
    tagline: 'Guide every orbit of your day.',
    headlineClass: 'drop-shadow-[0_18px_45px_rgba(249,115,22,0.52)]',
    taglineClass: 'text-xs uppercase tracking-[0.48em]',
    accent: 'Mission Control',
  },
  {
    fontName: 'Saira',
    font: saira,
    label: 'Velocity Stamp',
    tagline: 'Fast lanes for daily wins.',
    headlineClass: 'drop-shadow-[0_16px_40px_rgba(249,115,22,0.44)]',
    taglineClass: 'text-sm tracking-[0.2em]',
    accent: 'Velocity Lane',
  },
  {
    fontName: 'Archivo',
    font: archivo,
    label: 'Editorial Edge',
    tagline: 'Editorial discipline for teams.',
    headlineClass: 'drop-shadow-[0_14px_34px_rgba(249,115,22,0.38)]',
    taglineClass: 'text-sm uppercase tracking-[0.3em]',
    accent: 'Edit Suite',
  },
  {
    fontName: 'Barlow',
    font: barlow,
    label: 'Control Loop',
    tagline: 'Feedback that fuels focus.',
    headlineClass: 'drop-shadow-[0_12px_28px_rgba(249,115,22,0.34)]',
    taglineClass: 'text-sm tracking-[0.22em]',
    accent: 'Loop Current',
  },
  {
    fontName: 'Rajdhani',
    font: rajdhani,
    label: 'Metro Track',
    tagline: 'Future-forward family habits.',
    headlineClass: 'drop-shadow-[0_17px_42px_rgba(249,115,22,0.47)]',
    taglineClass: 'text-xs uppercase tracking-[0.44em]',
    accent: 'Metro Pulse',
  },
  {
    fontName: 'Prompt',
    font: prompt,
    label: 'Signal Cloud',
    tagline: 'Instant clarity, daily progress.',
    headlineClass: 'drop-shadow-[0_15px_34px_rgba(249,115,22,0.39)]',
    taglineClass: 'text-sm uppercase tracking-[0.3em]',
    accent: 'Cloudline',
  },
  {
    fontName: 'Teko',
    font: teko,
    label: 'Stacked Rush',
    tagline: 'Compact energy, constant drive.',
    headlineClass: 'drop-shadow-[0_18px_46px_rgba(249,115,22,0.52)]',
    taglineClass: 'text-xs uppercase tracking-[0.46em]',
    accent: 'Rush Line',
  },
  {
    fontName: 'Exo 2',
    font: exo2,
    label: 'Tech Circuit',
    tagline: 'Adaptive routines for makers.',
    headlineClass: 'drop-shadow-[0_16px_42px_rgba(249,115,22,0.45)]',
    taglineClass: 'text-sm tracking-[0.22em]',
    accent: 'Circuit Forge',
  },
  {
    fontName: 'Orbitron',
    font: orbitron,
    label: 'Neon Orbit',
    tagline: 'Sci-fi cadence for crews.',
    headlineClass: 'drop-shadow-[0_18px_46px_rgba(249,115,22,0.48)]',
    taglineClass: 'text-xs uppercase tracking-[0.52em]',
    accent: 'Orbit Line',
  },
  {
    fontName: 'Righteous',
    font: righteous,
    label: 'Retro Burst',
    tagline: 'Playful power streaks.',
    headlineClass: 'drop-shadow-[0_15px_35px_rgba(249,115,22,0.38)]',
    taglineClass: 'text-sm tracking-[0.26em]',
    accent: 'Retro Spark',
  },
  {
    fontName: 'Audiowide',
    font: audiowide,
    label: 'Waveform Mark',
    tagline: 'Tune into better habits.',
    headlineClass: 'drop-shadow-[0_18px_46px_rgba(249,115,22,0.48)]',
    taglineClass: 'text-xs uppercase tracking-[0.5em]',
    accent: 'Wave Signal',
  },
  {
    fontName: 'Fjalla One',
    font: fjallaOne,
    label: 'Summit Badge',
    tagline: 'Rise above the plateau.',
    headlineClass: 'drop-shadow-[0_20px_50px_rgba(249,115,22,0.52)]',
    taglineClass: 'text-sm uppercase tracking-[0.32em]',
    accent: 'Summit Trail',
  },
  {
    fontName: 'Black Ops One',
    font: blackOpsOne,
    label: 'Tactical Seal',
    tagline: 'Mission-ready momentum.',
    headlineClass: 'drop-shadow-[0_20px_55px_rgba(249,115,22,0.52)]',
    taglineClass: 'text-xs uppercase tracking-[0.48em]',
    accent: 'Ops Command',
  },
  {
    fontName: 'Dela Gothic One',
    font: delaGothicOne,
    label: 'Poster Signal',
    tagline: 'Loud and loyal rituals.',
    headlineClass: 'drop-shadow-[0_16px_40px_rgba(249,115,22,0.44)]',
    taglineClass: 'text-sm tracking-[0.24em]',
    accent: 'Poster Forge',
  },
  {
    fontName: 'Kanit',
    font: kanit,
    label: 'Hybrid Frame',
    tagline: 'Flexible systems, grounded focus.',
    headlineClass: 'drop-shadow-[0_15px_36px_rgba(249,115,22,0.4)]',
    taglineClass: 'text-sm uppercase tracking-[0.28em]',
    accent: 'Hybrid Flow',
    nexTone: 'light',
  },
  {
    fontName: 'Nunito',
    font: nunito,
    label: 'Rounded Pulse',
    tagline: 'Gentle guardrails, bold wins.',
    headlineClass: 'drop-shadow-[0_12px_32px_rgba(249,115,22,0.36)]',
    taglineClass: 'text-sm tracking-[0.22em]',
    accent: 'Pulse Light',
  },
  {
    fontName: 'Quicksand',
    font: quicksand,
    label: 'Sandline Crest',
    tagline: 'Soft landings for streaks.',
    headlineClass: 'drop-shadow-[0_14px_34px_rgba(249,115,22,0.4)]',
    taglineClass: 'text-xs uppercase tracking-[0.46em]',
    accent: 'Sandline',
  },
  {
    fontName: 'Maven Pro',
    font: mavenPro,
    label: 'Studio Mark',
    tagline: 'Designed for creative cadence.',
    headlineClass: 'drop-shadow-[0_15px_36px_rgba(249,115,22,0.4)]',
    taglineClass: 'text-sm tracking-[0.22em]',
    accent: 'Studio Beam',
  },
  {
    fontName: 'Work Sans',
    font: workSans,
    label: 'Workline Core',
    tagline: 'Anchor your team rituals.',
    headlineClass: 'drop-shadow-[0_12px_32px_rgba(249,115,22,0.36)]',
    taglineClass: 'text-sm uppercase tracking-[0.28em]',
    accent: 'Core Channel',
  },
]

const FEATURED_INDEX = 25

const cardBackgrounds = [
  'linear-gradient(140deg, rgba(249,115,22,0.18) 0%, rgba(12,12,12,0.94) 48%, rgba(0,0,0,0.96) 100%)',
  'linear-gradient(150deg, rgba(255,125,50,0.2) 0%, rgba(15,15,15,0.95) 45%, rgba(0,0,0,0.98) 100%)',
  'linear-gradient(160deg, rgba(249,115,22,0.22) 0%, rgba(10,10,10,0.92) 50%, rgba(0,0,0,0.97) 100%)',
  'linear-gradient(170deg, rgba(234,88,12,0.24) 0%, rgba(11,11,11,0.94) 52%, rgba(0,0,0,0.98) 100%)',
]

const cardOverlays = [
  'radial-gradient(circle at 20% 20%, rgba(249,115,22,0.28), transparent 55%)',
  'radial-gradient(circle at 80% 25%, rgba(255,125,50,0.32), transparent 60%)',
  'radial-gradient(circle at 25% 80%, rgba(234,88,12,0.26), transparent 60%)',
  'radial-gradient(circle at 75% 75%, rgba(249,115,22,0.22), transparent 55%)',
]

const cardShadows = [
  '0 24px 60px -32px rgba(249,115,22,0.65)',
  '0 28px 70px -34px rgba(234,88,12,0.6)',
  '0 20px 55px -28px rgba(255,140,66,0.55)',
  '0 22px 60px -30px rgba(249,115,22,0.58)',
]

const getNexToneClass = (tone?: 'light' | 'dark') =>
  tone === 'dark' ? 'text-black' : 'text-white'

export default function LogoMockupsPage() {
  const featuredLogo = logos[FEATURED_INDEX]
  const heroBackground = cardBackgrounds[FEATURED_INDEX % cardBackgrounds.length]
  const heroOverlay = cardOverlays[FEATURED_INDEX % cardOverlays.length]
  const heroShadow = cardShadows[FEATURED_INDEX % cardShadows.length]

  const heroMeta = [
    { label: 'Font', value: featuredLogo.fontName },
    { label: 'Mood', value: 'Grounded · Technical · Warm' },
    { label: 'Use Case', value: 'Product hero · Marketing banners' },
  ]

  const usageNotes = [
    'Set the logotype at 48px or larger to preserve Kanit\'s geometric counters.',
    'Pair with Inter or Manrope for supporting UI copy to keep the voice balanced.',
    'Keep the split fill: #f97316 for Habit, pure white for Nex on dark grounds.',
  ]

  return (
    <div
      className="min-h-screen bg-[#050505] pb-24 pt-16 text-orange-50"
      style={{
        background:
          'radial-gradient(circle at top, rgba(249,115,22,0.18), transparent 50%), radial-gradient(circle at bottom, rgba(249,115,22,0.12), transparent 55%), #020202',
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
        <header className="space-y-4 text-center sm:text-left">
          <span className="inline-flex items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1 text-xs uppercase tracking-[0.38em] text-orange-200/80">
            Google Fonts × HabitNex
          </span>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-orange-100 sm:text-4xl">
              Orange & Black Logo Studies
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-orange-200/80 sm:mx-0">
              Thirty explorations pairing Google Fonts with a HabitNex logotype. We landed on Hybrid Frame as the lead treatment and kept the remaining alternates for future iteration.
            </p>
          </div>
        </header>

        <section
          className="relative overflow-hidden rounded-[42px] border border-orange-500/25 bg-black/75 px-8 py-12 shadow-[0_32px_90px_-40px_rgba(249,115,22,0.58)] sm:px-14 sm:py-16"
          style={{ background: heroBackground, boxShadow: heroShadow }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-85 mix-blend-screen"
            style={{ background: heroOverlay }}
          />
          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-center">
            <div className="space-y-9">
              <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.45em] text-orange-300/70">
                <span>{`Logo ${String(FEATURED_INDEX + 1).padStart(2, '0')}`}</span>
                <span>{featuredLogo.label}</span>
                <span>{featuredLogo.accent}</span>
              </div>
              <div
                className={cn(
                  'text-[clamp(3.4rem,7vw,6rem)] leading-none tracking-[-0.035em]',
                  featuredLogo.headlineClass,
                  featuredLogo.font.className
                )}
              >
                <span className="text-orange-400">Habit</span>
                <span className={getNexToneClass(featuredLogo.nexTone)}>Nex</span>
              </div>
              <div className="space-y-4 text-orange-200/85">
                <p className="text-base leading-relaxed">
                  Hybrid Frame leans on Kanit's engineered geometry to keep HabitNex feeling dependable while the orange-to-white split adds a pulse of momentum. It scales cleanly across dashboards, onboarding flows, and hero creative.
                </p>
                <p className="text-sm leading-relaxed text-orange-200/70">
                  Tagline direction: <span className="text-orange-100">{featuredLogo.tagline}</span>
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {heroMeta.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-orange-500/25 bg-orange-500/5 px-4 py-3 text-sm text-orange-200/80 backdrop-blur"
                  >
                    <span className="block text-[11px] uppercase tracking-[0.35em] text-orange-300/60">
                      {item.label}
                    </span>
                    <span className="mt-2 block text-orange-100">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5 rounded-3xl border border-orange-500/30 bg-black/50 p-6 text-sm text-orange-200/75 shadow-inner shadow-orange-900/30 backdrop-blur">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.38em] text-orange-200/80">
                Usage Notes
              </span>
              <ul className="space-y-3 leading-relaxed">
                {usageNotes.map((note) => (
                  <li key={note} className="text-orange-200/80">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-orange-100">Supporting Explorations</h2>
              <p className="text-sm text-orange-200/70">
                Twenty-nine alternates stay on file for tonal pivots, theme drops, or seasonal campaigns.
              </p>
            </div>
            <span className="text-xs uppercase tracking-[0.32em] text-orange-300/60">
              {logos.length - 1} options archived
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {logos.map((logo, index) => {
              if (index === FEATURED_INDEX) {
                return null
              }

              const background = cardBackgrounds[index % cardBackgrounds.length]
              const overlay = cardOverlays[index % cardOverlays.length]
              const shadow = cardShadows[index % cardShadows.length]

              return (
                <article
                  key={`${logo.fontName}-${logo.label}`}
                  className="relative overflow-hidden rounded-3xl border border-orange-500/25 bg-black/70 p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-400/40"
                  style={{ background, boxShadow: shadow }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-80 mix-blend-screen"
                    style={{ background: overlay }}
                  />
                  <div className="relative z-10 flex h-full flex-col gap-6">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.45em] text-orange-300/70">
                      <span>{`Logo ${String(index + 1).padStart(2, '0')}`}</span>
                      <span>{logo.label}</span>
                    </div>
                    <div className="space-y-4">
                      <div
                        className={cn(
                          'text-[2.8rem] leading-none tracking-[-0.02em] text-orange-400 sm:text-[3.4rem]',
                          logo.headlineClass,
                          logo.font.className
                        )}
                      >
                        <span className="text-orange-400">Habit</span>
                        <span className={getNexToneClass(logo.nexTone)}>Nex</span>
                      </div>
                      <div
                        className={cn(
                          'max-w-xs leading-relaxed text-orange-200/80',
                          logo.taglineClass
                        )}
                      >
                        {logo.tagline}
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between text-xs uppercase tracking-[0.32em] text-orange-300/60">
                      <span>{logo.fontName}</span>
                      <span>{logo.accent}</span>
                    </div>
                  </div>
                  <div className="absolute inset-x-6 bottom-4 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent opacity-70" />
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
