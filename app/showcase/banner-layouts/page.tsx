'use client';

import { useState } from 'react';
import {
  Gauge,
  Wind,
  Droplets,
  Sun,
  RefreshCcw,
  Maximize2,
  Bell,
  Plus,
  Settings,
  ChevronDown,
  ChevronRight,
  MapPin,
  LogOut,
  Moon,
  SunMedium,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExampleCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    className="min-h-screen bg-slate-950/90 p-6 sm:p-8 text-slate-100"
    style={{
      background:
        'radial-gradient(circle at top, rgba(59,130,246,0.25), transparent 45%), radial-gradient(circle at bottom, rgba(14,116,144,0.18), transparent 50%), #020617',
      fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}
  >
    <div className="mx-auto max-w-6xl space-y-6">{children}</div>
  </div>
);

const ExampleCard = ({ title, description, children }: ExampleCardProps) => (
  <section
    className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-blue-900/40 backdrop-blur-xl"
    style={{
      backgroundColor: 'rgba(15,23,42,0.55)',
      boxShadow: '0 40px 120px -40px rgba(30,64,175,0.45)',
      borderColor: 'rgba(148,163,184,0.25)',
    }}
  >
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-slate-300">{description}</p>
      </div>
    </header>
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/2 to-white/0 p-5">
      {children}
    </div>
  </section>
);

const BannerShell = ({ rightSlot, highlight }: { rightSlot: React.ReactNode; highlight?: string }) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div className="space-y-2">
      <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/50 bg-blue-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
        <Gauge className="h-3 w-3" /> Family Dashboard
      </span>
      <h3 className="text-2xl font-bold text-white">Welcome back, HabitNex Family</h3>
      <p className="text-sm text-slate-300">
        Monday, February 24 · 3 family members · {highlight ?? 'Sunny · 72°F'}
      </p>
    </div>
    <div className="flex flex-1 items-center justify-end">
      {rightSlot}
    </div>
  </div>
);

const GlassPanel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white shadow-lg shadow-blue-950/40 backdrop-blur-lg',
      className
    )}
    style={{
      background:
        'linear-gradient(135deg, rgba(30,64,175,0.45) 0%, rgba(17,24,39,0.7) 50%, rgba(2,6,23,0.65) 100%)',
      borderColor: 'rgba(148,163,184,0.25)',
    }}
  >
    {children}
  </div>
);

const ThemeToggleDemo = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  return (
    <button
      onClick={() => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20',
        mode === 'dark' ? 'shadow-blue-900/40' : 'shadow-yellow-500/40'
      )}
      title="Toggle theme (demo)"
    >
      {mode === 'dark' ? <SunMedium className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

const ActionIconButton = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <button
    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
    title={label}
  >
    {children}
  </button>
);

const InlineActions = ({ includeLabels = false }: { includeLabels?: boolean }) => (
  <div className={cn('flex items-center gap-2', includeLabels && 'text-xs')}>
    <ThemeToggleDemo />
    <ActionIconButton label="Toggle fullscreen">
      <Maximize2 className="h-4 w-4" />
    </ActionIconButton>
    <ActionIconButton label="Exit fullscreen">
      <Minimize2 className="h-4 w-4" />
    </ActionIconButton>
    <ActionIconButton label="Log out">
      <LogOut className="h-4 w-4" />
    </ActionIconButton>
  </div>
);

function CompactUtilityStrip() {
  return (
    <GlassPanel className="flex-nowrap gap-5">
      <div className="flex items-center gap-2">
        <Sun className="h-5 w-5 text-amber-300" />
        <div>
          <div className="text-sm font-semibold leading-tight">72°F · Sunny</div>
          <div className="text-xs text-slate-200/70">Austin, TX 73301</div>
        </div>
      </div>
      <div className="h-8 border-l border-white/15" />
      <button className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20">
        <RefreshCcw className="h-3.5 w-3.5" />
        Refresh
      </button>
      <button className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20">
        <Plus className="h-3.5 w-3.5" />
        Quick Add
      </button>
      <InlineActions />
      <ActionIconButton label="Notifications">
        <Bell className="h-4 w-4" />
      </ActionIconButton>
    </GlassPanel>
  );
}

function CardStack() {
  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <GlassPanel className="flex-col items-start gap-2 text-left sm:flex-row sm:items-center sm:gap-3 sm:text-right">
        <div className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-amber-300" />
          <div className="text-sm font-semibold">Sunny · 72°F</div>
        </div>
        <div className="text-xs text-slate-200/70">Austin, TX 73301</div>
      </GlassPanel>
      <GlassPanel className="flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-200/80">
          <Droplets className="h-3.5 w-3.5" />
          54% humidity
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-200/80">
          <Wind className="h-3.5 w-3.5" />
          8 mph
        </div>
        <InlineActions includeLabels />
      </GlassPanel>
    </div>
  );
}

function SegmentedPillBar() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative inline-flex items-center gap-4 rounded-full border border-white/15 bg-white/10 px-2 py-2 pr-3 shadow-lg backdrop-blur">
        <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase text-slate-900 shadow">
          72°F
        </button>
        <button className="rounded-full px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10">
          Austin, TX
        </button>
        <button className="rounded-full px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10">
          Humidity 54%
        </button>
        <div className="h-6 border-l border-white/15" />
        <button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
          <RefreshCcw className="h-4 w-4" />
        </button>
        <button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
          <Settings className="h-4 w-4" />
        </button>
      </div>
      <InlineActions />
    </div>
  );
}

function FloatingActionDock() {
  return (
    <div className="relative flex items-center gap-4">
      <GlassPanel className="gap-4 pr-6">
        <Sun className="h-5 w-5 text-amber-300" />
        <div>
          <div className="text-sm font-semibold leading-tight">72°F · Sunny</div>
          <div className="text-xs text-slate-200/70">Austin, TX 73301</div>
        </div>
      </GlassPanel>
      <div className="-mr-2 flex items-end gap-3">
        <button className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-blue-400 text-white shadow-xl shadow-blue-900/60 transition hover:scale-105">
          <Plus className="h-5 w-5" />
        </button>
        <ThemeToggleDemo />
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white shadow-lg hover:bg-white/25">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-end gap-2">
          <ActionIconButton label="Fullscreen">
            <Maximize2 className="h-4 w-4" />
          </ActionIconButton>
          <ActionIconButton label="Log out">
            <LogOut className="h-4 w-4" />
          </ActionIconButton>
        </div>
      </div>
    </div>
  );
}

function AccordionQuickPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 shadow-lg backdrop-blur">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white"
      >
        <div className="flex items-center gap-3">
          <Sun className="h-5 w-5 text-amber-300" />
          <div>
            <div>72°F · Sunny</div>
            <div className="text-xs font-normal text-white/70">Austin, TX 73301</div>
          </div>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-white/70" /> : <ChevronRight className="h-4 w-4 text-white/70" />}
      </button>
      {open && (
        <div className="space-y-3 border-t border-white/15 px-4 py-3 text-xs text-white">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Humidity</span>
            <span className="font-semibold">54%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70">Wind</span>
            <span className="font-semibold">8 mph</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70">Sunrise</span>
            <span className="font-semibold">6:41 am</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70">Sunset</span>
            <span className="font-semibold">7:22 pm</span>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">
              Refresh
            </button>
            <button className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">
              Edit
            </button>
          </div>
          <InlineActions includeLabels />
        </div>
      )}
    </div>
  );
}

function MetricCapsuleRow() {
  const metrics = [
    { label: 'Streak', value: '12 days', icon: <Gauge className="h-4 w-4" /> },
    { label: 'Mood Avg.', value: '4.6', icon: <Sun className="h-4 w-4" /> },
    { label: 'Next Event', value: 'Family Walk · 4:30pm', icon: <MapPin className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col gap-3">
      <GlassPanel className="flex-col items-start gap-3 sm:w-[340px] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Sun className="h-5 w-5 text-amber-300" />
          <div>
            <div className="text-sm font-semibold leading-tight">72°F · Sunny</div>
            <div className="text-xs text-slate-200/80">Austin, TX 73301</div>
          </div>
        </div>
        <InlineActions />
      </GlassPanel>
      <div className="flex flex-wrap gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow"
          >
            <span className="text-white/70">{metric.icon}</span>
            <span className="uppercase tracking-wide text-white/60">{metric.label}</span>
            <span className="text-white">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BannerLayoutShowcase() {
  return (
    <Wrapper>
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-white">Family Banner Right-Side Layouts</h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Six explorations that tidy up the weather/actions cluster on the modern family header.
          Each tile reuses the current context (weather data + quick actions) with a distinct visual hierarchy.
        </p>
      </header>

      <ExampleCard
        title="1. Compact Utility Strip"
        description="Single horizontal strip with dividers keeps the content lean and aligned."
      >
        <BannerShell rightSlot={<CompactUtilityStrip />} highlight="Austin, TX 73301" />
      </ExampleCard>

      <ExampleCard
        title="2. Card Stack"
        description="Split info across glass cards so weather and secondary stats have clear boundaries."
      >
        <BannerShell rightSlot={<CardStack />} highlight="72°F · Sunny" />
      </ExampleCard>

      <ExampleCard
        title="3. Segmented Pill Bar"
        description="Rounded pill segments create a cohesive control bar that still reads as one unit."
      >
        <BannerShell rightSlot={<SegmentedPillBar />} highlight="54% humidity · 8 mph winds" />
      </ExampleCard>

      <ExampleCard
        title="4. Floating Action Dock"
        description="Keep weather anchored, float the quick actions for a playful yet focused arrangement."
      >
        <BannerShell rightSlot={<FloatingActionDock />} highlight="Family focus mode active" />
      </ExampleCard>

      <ExampleCard
        title="5. Accordion Quick Panel"
        description="Default view is minimal; expanded state reveals rich weather metrics and buttons."
      >
        <BannerShell rightSlot={<AccordionQuickPanel />} highlight="Quick-panel collapsed" />
      </ExampleCard>

      <ExampleCard
        title="6. Metric Capsule Row"
        description="Pair a weather tile with a capsule row showing streaks, mood, or upcoming plans."
      >
        <BannerShell rightSlot={<MetricCapsuleRow />} highlight="3 actionable items" />
      </ExampleCard>
    </Wrapper>
  );
}
