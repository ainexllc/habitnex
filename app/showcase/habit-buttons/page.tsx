'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Check,
  X,
  Circle,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Pause,
  Smile,
  Frown,
  Zap,
  Plus,
  Minus,
  Star,
  Square,
  ChevronUp,
  ChevronDown,
  Slash,
  Dot,
  Power,
  RefreshCcw,
} from 'lucide-react';

type HabitState = 'none' | 'done' | 'missed';

interface ButtonStyle {
  base: string;
  active: string;
  icon: JSX.Element;
  ariaLabel: string;
}

interface Design {
  title: string;
  description: string;
  complete: ButtonStyle;
  missed: ButtonStyle;
}

const iconSize = 'h-3.5 w-3.5';
const buttonBase =
  'inline-flex items-center justify-center transition duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40';

const designs: Design[] = [
  {
    title: '1 · Solid Glow',
    description: 'Simple neon pill with warm glow.',
    complete: {
      base: `${buttonBase} h-6 w-7 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-500/40`,
      active: 'bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/40',
      icon: <Check className={iconSize} />,
      ariaLabel: 'Mark habit complete',
    },
    missed: {
      base: `${buttonBase} h-6 w-7 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/40`,
      active: 'bg-rose-400 text-rose-950 shadow-lg shadow-rose-500/40',
      icon: <X className={iconSize} />,
      ariaLabel: 'Mark habit missed',
    },
  },
  {
    title: '2 · Ring Outline',
    description: 'Lightweight ring with colored core.',
    complete: {
      base: `${buttonBase} h-6 w-6 rounded-full border-2 border-emerald-400/70 text-emerald-200`,
      active: 'bg-emerald-400 text-emerald-950 shadow-[0_0_8px_rgba(16,185,129,0.55)]',
      icon: <Circle className={iconSize} />,
      ariaLabel: 'Complete habit',
    },
    missed: {
      base: `${buttonBase} h-6 w-6 rounded-full border-2 border-amber-300/70 text-amber-200`,
      active: 'bg-amber-400 text-amber-950 shadow-[0_0_8px_rgba(251,191,36,0.55)]',
      icon: <Slash className={iconSize} />,
      ariaLabel: 'Skip habit',
    },
  },
  {
    title: '3 · Glass Chips',
    description: 'Frosted squares with subtle lighting.',
    complete: {
      base: `${buttonBase} h-6 w-6 rounded-md border border-white/20 bg-white/10 text-emerald-200`,
      active: 'border-emerald-300 bg-emerald-400/20 text-emerald-100',
      icon: <ShieldCheck className={iconSize} />,
      ariaLabel: 'Completed',
    },
    missed: {
      base: `${buttonBase} h-6 w-6 rounded-md border border-white/20 bg-white/10 text-rose-200`,
      active: 'border-rose-300 bg-rose-400/20 text-rose-100',
      icon: <AlertTriangle className={iconSize} />,
      ariaLabel: 'Missed',
    },
  },
  {
    title: '4 · Gradient Slivers',
    description: 'Slender capsules for tight grids.',
    complete: {
      base: `${buttonBase} h-6 w-8 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-200 border border-emerald-500/30`,
      active: 'from-emerald-400 to-teal-400 text-emerald-950 shadow-md shadow-emerald-500/30',
      icon: <Sparkles className={iconSize} />,
      ariaLabel: 'Complete',
    },
    missed: {
      base: `${buttonBase} h-6 w-8 rounded-full bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-200 border border-rose-400/30`,
      active: 'from-rose-400 to-orange-400 text-rose-950 shadow-md shadow-rose-500/30',
      icon: <Flame className={iconSize} />,
      ariaLabel: 'Missed',
    },
  },
  {
    title: '5 · Pixel Dots',
    description: 'Square dot with saturated center.',
    complete: {
      base: `${buttonBase} h-6 w-6 rounded-sm border border-emerald-500/40 bg-emerald-500/10 text-emerald-200`,
      active: 'bg-emerald-400 text-emerald-950 shadow-[0_0_6px_rgba(16,185,129,0.65)]',
      icon: <Dot className={iconSize} />,
      ariaLabel: 'Complete habit',
    },
    missed: {
      base: `${buttonBase} h-6 w-6 rounded-sm border border-rose-500/40 bg-rose-500/10 text-rose-200`,
      active: 'bg-rose-400 text-rose-950 shadow-[0_0_6px_rgba(244,63,94,0.65)]',
      icon: <Minus className={iconSize} />,
      ariaLabel: 'Skip habit',
    },
  },
  {
    title: '6 · Soft Halo',
    description: 'Filled icons with translucent halo ring.',
    complete: {
      base: `${buttonBase} relative h-6 w-6 rounded-full bg-emerald-500/25 text-emerald-100`,
      active:
        'bg-emerald-500 text-emerald-950 after:absolute after:-inset-1 after:rounded-full after:bg-emerald-500/15',
      icon: <Smile className={iconSize} />,
      ariaLabel: 'Done',
    },
    missed: {
      base: `${buttonBase} relative h-6 w-6 rounded-full bg-rose-500/25 text-rose-100`,
      active:
        'bg-rose-500 text-rose-950 after:absolute after:-inset-1 after:rounded-full after:bg-rose-500/15',
      icon: <Frown className={iconSize} />,
      ariaLabel: 'Miss',
    },
  },
  {
    title: '7 · Duo Tone',
    description: 'Thin border with two-color fill when active.',
    complete: {
      base: `${buttonBase} h-6 w-8 rounded-full border border-emerald-400/40 text-emerald-200`,
      active: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950',
      icon: <ChevronUp className={iconSize} />,
      ariaLabel: 'Complete',
    },
    missed: {
      base: `${buttonBase} h-6 w-8 rounded-full border border-rose-400/40 text-rose-200`,
      active: 'bg-gradient-to-r from-rose-500 to-amber-400 text-rose-950',
      icon: <ChevronDown className={iconSize} />,
      ariaLabel: 'Missed',
    },
  },
  {
    title: '8 · Glimmer Squares',
    description: 'Creates a metallic tap target.',
    complete: {
      base: `${buttonBase} h-6 w-6 rounded-lg border border-white/15 bg-white/10 text-emerald-200`,
      active:
        'bg-gradient-to-br from-emerald-500 to-cyan-400 text-emerald-950 shadow-lg shadow-emerald-500/40',
      icon: <Check className={iconSize} />,
      ariaLabel: 'Done',
    },
    missed: {
      base: `${buttonBase} h-6 w-6 rounded-lg border border-white/15 bg-white/10 text-rose-200`,
      active:
        'bg-gradient-to-br from-rose-500 to-orange-400 text-rose-950 shadow-lg shadow-rose-500/40',
      icon: <X className={iconSize} />,
      ariaLabel: 'Skip',
    },
  },
  {
    title: '9 · Minimal Lines',
    description: 'Bare outline with icon swap.',
    complete: {
      base: `${buttonBase} h-6 w-6 rounded-full border border-emerald-400/60 text-emerald-200`,
      active: 'bg-emerald-500 text-emerald-950',
      icon: <Plus className={iconSize} />,
      ariaLabel: 'Complete',
    },
    missed: {
      base: `${buttonBase} h-6 w-6 rounded-full border border-slate-400/60 text-slate-200`,
      active: 'bg-rose-500 text-rose-950',
      icon: <Minus className={iconSize} />,
      ariaLabel: 'Miss',
    },
  },
  {
    title: '10 · Split Tiles',
    description: 'Semi-rounded rectangle combo.',
    complete: {
      base: `${buttonBase} h-6 w-8 rounded-l-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-200`,
      active: 'bg-emerald-400 text-emerald-950',
      icon: <Star className={iconSize} />,
      ariaLabel: 'Done',
    },
    missed: {
      base: `${buttonBase} h-6 w-8 rounded-r-lg border border-rose-500/30 bg-rose-500/10 text-rose-200`,
      active: 'bg-rose-400 text-rose-950',
      icon: <Square className={iconSize} />,
      ariaLabel: 'Miss',
    },
  },
  {
    title: '11 · Glass Ring',
    description: 'Transparent ring with crisp fill when active.',
    complete: {
      base: `${buttonBase} h-6 w-6 rounded-full border border-emerald-400/40 bg-transparent text-emerald-200`,
      active: 'bg-emerald-400 text-emerald-950 ring-2 ring-emerald-300/70',
      icon: <Dot className={iconSize} />,
      ariaLabel: 'Complete',
    },
    missed: {
      base: `${buttonBase} h-6 w-6 rounded-full border border-rose-400/40 bg-transparent text-rose-200`,
      active: 'bg-rose-400 text-rose-950 ring-2 ring-rose-300/70',
      icon: <Dot className={iconSize} />,
      ariaLabel: 'Miss',
    },
  },
  {
    title: '12 · Micro Switch',
    description: 'Tiny switcher with indicator bar.',
    complete: {
      base: `${buttonBase} h-6 w-6 rounded-full bg-slate-900 text-slate-400 border border-slate-600`,
      active: 'bg-emerald-500 text-emerald-950',
      icon: <Power className={iconSize} />,
      ariaLabel: 'Complete',
    },
    missed: {
      base: `${buttonBase} h-6 w-6 rounded-full bg-slate-900 text-slate-400 border border-slate-600`,
      active: 'bg-rose-500 text-rose-950',
      icon: <Pause className={iconSize} />,
      ariaLabel: 'Missed',
    },
  },
  {
    title: '13 · Soft Shadow',
    description: 'Drop-shadow circle with color rim.',
    complete: {
      base: `${buttonBase} h-6 w-6 rounded-full border border-emerald-400/40 bg-slate-900 text-emerald-200`,
      active: 'bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-500/50',
      icon: <Zap className={iconSize} />,
      ariaLabel: 'Complete',
    },
    missed: {
      base: `${buttonBase} h-6 w-6 rounded-full border border-amber-400/40 bg-slate-900 text-amber-200`,
      active: 'bg-amber-500 text-amber-950 shadow-md shadow-amber-500/50',
      icon: <AlertTriangle className={iconSize} />,
      ariaLabel: 'Missed',
    },
  },
  {
    title: '14 · Frosted Pixel',
    description: 'Squared edges with subtle texture.',
    complete: {
      base: `${buttonBase} h-6 w-6 rounded-[6px] border border-emerald-300/40 bg-white/10 text-emerald-200`,
      active: 'bg-emerald-400 text-emerald-950',
      icon: <Check className={iconSize} />,
      ariaLabel: 'Done',
    },
    missed: {
      base: `${buttonBase} h-6 w-6 rounded-[6px] border border-rose-300/40 bg-white/10 text-rose-200`,
      active: 'bg-rose-400 text-rose-950',
      icon: <X className={iconSize} />,
      ariaLabel: 'Skip',
    },
  },
  {
    title: '15 · Mini Bars',
    description: 'Slim rectangular bars for dense lists.',
    complete: {
      base: `${buttonBase} h-6 w-8 rounded-full border border-emerald-400/40 bg-slate-900 text-emerald-200`,
      active: 'bg-emerald-500 text-emerald-950',
      icon: <ChevronUp className={iconSize} />,
      ariaLabel: 'Complete habit',
    },
    missed: {
      base: `${buttonBase} h-6 w-8 rounded-full border border-rose-400/40 bg-slate-900 text-rose-200`,
      active: 'bg-rose-500 text-rose-950',
      icon: <ChevronDown className={iconSize} />,
      ariaLabel: 'Missed habit',
    },
  },
  {
    title: '16 · Light Tiles',
    description: 'Subtle inset lighting for neutral lists.',
    complete: {
      base: `${buttonBase} h-6 w-6 rounded-lg border border-white/15 bg-white/6 text-emerald-200`,
      active: 'bg-emerald-400 text-emerald-950 shadow-inner shadow-emerald-500/30',
      icon: <Smile className={iconSize} />,
      ariaLabel: 'Complete',
    },
    missed: {
      base: `${buttonBase} h-6 w-6 rounded-lg border border-white/15 bg-white/6 text-rose-200`,
      active: 'bg-rose-400 text-rose-950 shadow-inner shadow-rose-500/30',
      icon: <Frown className={iconSize} />,
      ariaLabel: 'Missed',
    },
  },
  {
    title: '17 · Gradient Ring',
    description: 'Gradient outline with transparent center.',
    complete: {
      base: `${buttonBase} h-6 w-6 rounded-full bg-transparent text-emerald-200`,
      active: 'bg-emerald-400 text-emerald-950',
      icon: <Circle className={iconSize} />,
      ariaLabel: 'Complete',
    },
    missed: {
      base: `${buttonBase} h-6 w-6 rounded-full bg-transparent text-rose-200`,
      active: 'bg-rose-400 text-rose-950',
      icon: <Circle className={iconSize} />,
      ariaLabel: 'Missed',
    },
  },
  {
    title: '18 · Micro Arrows',
    description: 'Directional cues for success/fail.',
    complete: {
      base: `${buttonBase} h-6 w-6 rounded-full border border-emerald-400/40 bg-slate-900 text-emerald-200`,
      active: 'bg-emerald-500 text-emerald-950 shadow shadow-emerald-500/40',
      icon: <ChevronUp className={iconSize} />,
      ariaLabel: 'Mark as done',
    },
    missed: {
      base: `${buttonBase} h-6 w-6 rounded-full border border-rose-400/40 bg-slate-900 text-rose-200`,
      active: 'bg-rose-500 text-rose-950 shadow shadow-rose-500/40',
      icon: <ChevronDown className={iconSize} />,
      ariaLabel: 'Mark as missed',
    },
  },
  {
    title: '19 · Soft Toggle',
    description: 'Two-button cluster with neutral reset.',
    complete: {
      base: `${buttonBase} h-6 w-7 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-500/30`,
      active: 'bg-emerald-500 text-emerald-950',
      icon: <Check className={iconSize} />,
      ariaLabel: 'Complete habit',
    },
    missed: {
      base: `${buttonBase} h-6 w-7 rounded-full bg-slate-600/20 text-slate-200 border border-slate-500/30`,
      active: 'bg-rose-500 text-rose-950',
      icon: <Pause className={iconSize} />,
      ariaLabel: 'Mark missed',
    },
  },
  {
    title: '20 · Reset Trio Mini',
    description: 'Complete, reset, miss icons all at 24px.',
    complete: {
      base: `${buttonBase} h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-200`,
      active: 'bg-emerald-400 text-emerald-950',
      icon: <Check className={iconSize} />,
      ariaLabel: 'Complete',
    },
    missed: {
      base: `${buttonBase} h-6 w-6 rounded-full bg-rose-500/20 text-rose-200`,
      active: 'bg-rose-400 text-rose-950',
      icon: <X className={iconSize} />,
      ariaLabel: 'Miss',
    },
  },
];

export default function HabitButtonShowcase() {
  const [states, setStates] = useState<HabitState[]>(Array(designs.length).fill('none'));

  const toggleState = (index: number, target: HabitState) => {
    setStates((prev) => {
      const next = [...prev];
      next[index] = prev[index] === target ? 'none' : target;
      return next;
    });
  };

  return (
    <div
      className="min-h-screen w-full bg-slate-950/95 p-6 text-slate-100 sm:p-8"
      style={{
        background:
          'radial-gradient(circle at top, rgba(59,130,246,0.25), transparent 45%), radial-gradient(circle at bottom, rgba(15,118,110,0.2), transparent 55%), #020617',
      }}
    >
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70">
            HabitNex UI Lab
          </span>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">20 Compact Complete / Missed Options</h1>
          <p className="text-sm text-slate-300">
            Every button below stays under 25px tall and 35px wide—ideal for dense member habit lists on touch or wall displays.
            Tap to preview the active state.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {designs.map((design, index) => {
            const state = states[index];

            return (
              <section
                key={design.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/40 backdrop-blur-lg"
              >
                <header className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">{design.title}</h2>
                    <p className="text-xs text-slate-300">{design.description}</p>
                  </div>
                  <span
                    className={cn(
                      'text-[11px] uppercase tracking-wide',
                      state === 'done'
                        ? 'text-emerald-300'
                        : state === 'missed'
                        ? 'text-rose-300'
                        : 'text-slate-400'
                    )}
                  >
                    {state === 'done' ? 'Complete' : state === 'missed' ? 'Missed' : 'Idle'}
                  </span>
                </header>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-200">Sample Habit</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={design.complete.ariaLabel}
                      className={cn(design.complete.base, state === 'done' && design.complete.active)}
                      onClick={() => toggleState(index, 'done')}
                    >
                      {design.complete.icon}
                    </button>
                    {design.title === '20 · Reset Trio Mini' && (
                      <button
                        type="button"
                        aria-label="Reset habit state"
                        className={`${buttonBase} h-6 w-6 rounded-full bg-white/10 text-slate-200 hover:bg-white/15`}
                        onClick={() => toggleState(index, 'none')}
                      >
                        <RefreshCcw className={iconSize} />
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={design.missed.ariaLabel}
                      className={cn(design.missed.base, state === 'missed' && design.missed.active)}
                      onClick={() => toggleState(index, 'missed')}
                    >
                      {design.missed.icon}
                    </button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
