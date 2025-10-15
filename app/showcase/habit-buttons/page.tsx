'use client';

import { useState } from 'react';
import {
  Check,
  X,
  Smile,
  Frown,
  ShieldCheck,
  AlertOctagon,
  ChevronRight,
  ChevronLeft,
  Power,
  Zap,
  Circle,
  Pause,
  Clock,
  RefreshCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type HabitState = 'neutral' | 'done' | 'missed';

const variants = [
  {
    title: 'Icon Pill Duo',
    description: 'Compact pill with icon + badge count.',
    render: (
      state: HabitState,
      setState: (value: HabitState) => void
    ) => (
      <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1 shadow-sm shadow-black/30">
        <button
          onClick={() => setState('done')}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition',
            state === 'done'
              ? 'bg-emerald-400 text-emerald-950 shadow shadow-emerald-500/40'
              : 'text-slate-200 hover:text-white'
          )}
        >
          <Check className="h-3.5 w-3.5" />
          Done
        </button>
        <button
          onClick={() => setState('missed')}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition',
            state === 'missed'
              ? 'bg-rose-400 text-rose-950 shadow shadow-rose-500/40'
              : 'text-slate-200 hover:text-white'
          )}
        >
          <X className="h-3.5 w-3.5" />
          Miss
        </button>
      </div>
    ),
  },
  {
    title: 'Stacked Icon Buttons',
    description: 'Tiny circular buttons with labels underneath.',
    render: (state: HabitState, setState: (value: HabitState) => void) => (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setState('done')}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/50 text-emerald-200 transition hover:scale-105',
            state === 'done' && 'bg-emerald-400/20 text-emerald-100'
          )}
          title="Complete"
        >
          <Smile className="h-4 w-4" />
        </button>
        <button
          onClick={() => setState('missed')}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border border-rose-400/50 text-rose-200 transition hover:scale-105',
            state === 'missed' && 'bg-rose-400/20 text-rose-100'
          )}
          title="Missed"
        >
          <Frown className="h-4 w-4" />
        </button>
      </div>
    ),
  },
  {
    title: 'Compact Toggle',
    description: 'Single slider with colored background.',
    render: (state: HabitState, setState: (value: HabitState) => void) => (
      <div className="relative flex h-9 w-48 items-center rounded-full border border-white/15 bg-white/5 p-0.5 text-xs font-semibold uppercase tracking-wide">
        <div
          className={cn(
            'absolute inset-y-1 w-[73px] rounded-full transition-transform duration-200 ease-out shadow-lg',
            state === 'done'
              ? 'translate-x-1 bg-emerald-400 shadow-emerald-500/40'
              : state === 'missed'
              ? 'translate-x-[74px] bg-rose-400 shadow-rose-500/40'
              : 'translate-x-[37px] bg-slate-500/40 shadow-slate-900/30'
          )}
        />
        <button
          onClick={() => setState('done')}
          className="relative z-10 flex-1 text-emerald-200"
        >
          Done
        </button>
        <div className="relative z-10 flex-1 text-center text-[10px] text-slate-400">
          |
        </div>
        <button
          onClick={() => setState('missed')}
          className="relative z-10 flex-1 text-rose-200"
        >
          Miss
        </button>
      </div>
    ),
  },
  {
    title: 'Arrow Tabs',
    description: 'Direction arrows emphasise change.',
    render: (state: HabitState, setState: (value: HabitState) => void) => (
      <div className="inline-flex overflow-hidden rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-white/70">
        <button
          onClick={() => setState('done')}
          className={cn(
            'flex items-center gap-1 px-3 py-1 transition',
            state === 'done' && 'bg-emerald-500 text-emerald-950'
          )}
        >
          <ChevronLeft className="h-3 w-3" />
          Done
        </button>
        <button
          onClick={() => setState('missed')}
          className={cn(
            'flex items-center gap-1 px-3 py-1 transition',
            state === 'missed' && 'bg-rose-500 text-rose-950'
          )}
        >
          Miss
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    ),
  },
  {
    title: 'Badge Pair',
    description: 'Thick badges with subtle gradients.',
    render: (state: HabitState, setState: (value: HabitState) => void) => (
      <div className="inline-flex gap-2">
        <button
          onClick={() => setState('done')}
          className={cn(
            'inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:border-emerald-400',
            state === 'done' && 'bg-emerald-500 text-emerald-950'
          )}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Done
        </button>
        <button
          onClick={() => setState('missed')}
          className={cn(
            'inline-flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100 transition hover:border-amber-400',
            state === 'missed' && 'bg-amber-500 text-amber-950'
          )}
        >
          <AlertOctagon className="h-3.5 w-3.5" />
          Miss
        </button>
      </div>
    ),
  },
  {
    title: 'Corner Buttons',
    description: 'Square buttons for grid alignment.',
    render: (state: HabitState, setState: (value: HabitState) => void) => (
      <div className="inline-grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
        <button
          onClick={() => setState('done')}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg text-emerald-200 transition hover:bg-emerald-500/20',
            state === 'done' && 'bg-emerald-500 text-emerald-950'
          )}
        >
          <Power className="h-4 w-4" />
        </button>
        <button
          onClick={() => setState('missed')}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg text-rose-200 transition hover:bg-rose-500/20',
            state === 'missed' && 'bg-rose-500 text-rose-950'
          )}
        >
          <Pause className="h-4 w-4" />
        </button>
      </div>
    ),
  },
  {
    title: 'Chip Toggle',
    description: 'Chips with indicator dot.',
    render: (state: HabitState, setState: (value: HabitState) => void) => (
      <div className="inline-flex items-center gap-2">
        <button
          onClick={() => setState('done')}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-slate-200 transition hover:border-emerald-400/60',
            state === 'done' && 'border-emerald-400 bg-emerald-400/20 text-emerald-100'
          )}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Done
        </button>
        <button
          onClick={() => setState('missed')}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-slate-200 transition hover:border-rose-400/60',
            state === 'missed' && 'border-rose-400 bg-rose-400/20 text-rose-100'
          )}
        >
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          Miss
        </button>
      </div>
    ),
  },
  {
    title: 'Pulse Buttons',
    description: 'Glowing border when active.',
    render: (state: HabitState, setState: (value: HabitState) => void) => (
      <div className="inline-flex gap-2">
        <button
          onClick={() => setState('done')}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/30 text-emerald-200 transition',
            state === 'done' && 'border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.7)] text-emerald-100'
          )}
        >
          <Zap className="h-4 w-4" />
        </button>
        <button
          onClick={() => setState('missed')}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full border border-slate-400/30 text-slate-300 transition',
            state === 'missed' && 'border-rose-300 shadow-[0_0_12px_rgba(248,113,113,0.55)] text-rose-200'
          )}
        >
          <Circle className="h-4 w-4" />
        </button>
      </div>
    ),
  },
  {
    title: 'Micro Drawer',
    description: 'Tiny drawer reveals actions on hover.',
    render: (state: HabitState, setState: (value: HabitState) => void) => (
      <div className="relative inline-flex overflow-hidden rounded-full border border-white/10 bg-white/10">
        <button
          onClick={() => setState('done')}
          className={cn(
            'flex items-center gap-1 px-3 py-1 text-xs text-slate-200 transition hover:bg-emerald-500/20',
            state === 'done' && 'bg-emerald-500 text-emerald-950'
          )}
        >
          <Clock className="h-3 w-3" />
          Done
        </button>
        <button
          onClick={() => setState('missed')}
          className={cn(
            'flex items-center gap-1 px-3 py-1 text-xs text-slate-200 transition hover:bg-rose-500/20',
            state === 'missed' && 'bg-rose-500 text-rose-950'
          )}
        >
          Skip
        </button>
      </div>
    ),
  },
  {
    title: 'Reset Trio',
    description: 'Two decisions plus reset in one cluster.',
    render: (state: HabitState, setState: (value: HabitState) => void) => (
      <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 p-1 text-xs">
        <button
          onClick={() => setState('done')}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-full text-emerald-200 transition hover:bg-emerald-500/20',
            state === 'done' && 'bg-emerald-500 text-emerald-950'
          )}
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={() => setState('neutral')}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/15"
          title="Reset"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setState('missed')}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-full text-rose-200 transition hover:bg-rose-500/20',
            state === 'missed' && 'bg-rose-500 text-rose-950'
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
  },
];

export default function CompactHabitButtonsShowcase() {
  const [states, setStates] = useState<HabitState[]>(() =>
    Array(variants.length).fill('neutral')
  );

  const updateState = (index: number, value: HabitState) => {
    setStates((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <div
      className="min-h-screen w-full bg-slate-950/95 p-6 text-slate-100 sm:p-8"
      style={{
        background:
          'radial-gradient(circle at top, rgba(59,130,246,0.25), transparent 45%), radial-gradient(circle at bottom, rgba(29,78,216,0.18), transparent 55%), #020617',
      }}
    >
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70">
            HabitNex UI Lab
          </span>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Compact Complete / Missed Controls
          </h1>
          <p className="text-sm text-slate-300">
            Quick ideas for smaller surfaces—each tile shows a pair of buttons you can tap to simulate the state.
          </p>
        </header>

        <div className="grid gap-4">
          {variants.map((variant, index) => (
            <section
              key={variant.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/40 backdrop-blur-lg"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    {variant.title}
                  </h2>
                  <p className="text-xs text-slate-300">
                    {variant.description}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-[11px] uppercase tracking-wide',
                    states[index] === 'done'
                      ? 'text-emerald-300'
                      : states[index] === 'missed'
                      ? 'text-rose-300'
                      : 'text-slate-400'
                  )}
                >
                  {states[index] === 'done'
                    ? 'Completed'
                    : states[index] === 'missed'
                    ? 'Missed'
                    : 'Awaiting'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-200">
                  Log hydration habit
                </span>
                {variant.render(states[index], (value) => updateState(index, value))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
