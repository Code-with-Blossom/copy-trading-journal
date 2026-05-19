export interface Trade {
  id: string;
  pair: string;
  direction: 'LONG' | 'SHORT';
  entry: number;
  exit: number | null;
  amount: number;
  date: string;
  notes?: string | null;
  strategy?: string | null;
}
