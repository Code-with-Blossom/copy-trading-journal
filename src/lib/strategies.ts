export interface Strategy {
  label: string;
  value: string;
  color: string; // Tailwind bg + text + border classes
}

export const STRATEGIES: Strategy[] = [
  { value: 'breakout',    label: 'Breakout',         color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  { value: 'support',     label: 'Support Retest',   color: 'bg-blue-500/15   text-blue-400   border-blue-500/30'   },
  { value: 'trend',       label: 'Trend Following',  color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  { value: 'reversal',    label: 'Reversal',         color: 'bg-amber-500/15  text-amber-400  border-amber-500/30'  },
  { value: 'scalp',       label: 'Scalp',            color: 'bg-cyan-500/15   text-cyan-400   border-cyan-500/30'   },
  { value: 'copytrading', label: 'Copy Trading',     color: 'bg-pink-500/15   text-pink-400   border-pink-500/30'   },
  { value: 'dca',         label: 'DCA',              color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  { value: 'other',       label: 'Other',            color: 'bg-gray-500/15   text-gray-400   border-gray-500/30'   },
];

export function getStrategy(value: string | null | undefined): Strategy | undefined {
  if (!value) return undefined;
  return STRATEGIES.find(s => s.value === value);
}
