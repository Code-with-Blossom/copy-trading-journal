'use client';

import React, { useState, useEffect } from 'react';
import { Trade } from '@/lib/types';
import { STRATEGIES } from '@/lib/strategies';
import { X, Calendar, DollarSign, Coins, ShieldAlert } from 'lucide-react';

interface EditTradeModalProps {
  trade: Trade;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updatedFields: Partial<Omit<Trade, 'id'>>) => Promise<{ data: unknown; error: string | null }>;
}

export default function EditTradeModal({ trade, isOpen, onClose, onSave }: EditTradeModalProps) {
  const [pair, setPair] = useState(trade.pair);
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>(trade.direction);
  const [entry, setEntry] = useState(trade.entry.toString());
  const [amount, setAmount] = useState(trade.amount.toString());
  const [hasExit, setHasExit] = useState(trade.exit !== null);
  const [exit, setExit] = useState(trade.exit !== null ? trade.exit.toString() : '');
  
  // Format trade.date (which is ISO string) to "YYYY-MM-DDTHH:MM" for datetime-local input
  const formatIsoToDatetimeLocal = (isoString: string) => {
    try {
      const dateObj = new Date(isoString);
      // Adjust for timezone offset to get local time in ISO-like format
      const tzOffset = dateObj.getTimezoneOffset() * 60000;
      const localISOTime = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
      return localISOTime;
    } catch {
      return '';
    }
  };

  const [date, setDate] = useState(formatIsoToDatetimeLocal(trade.date));
  const [notes, setNotes] = useState(trade.notes || '');
  const [strategy, setStrategy] = useState<string | null>(trade.strategy || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with trade if trade changes
  useEffect(() => {
    setPair(trade.pair);
    setDirection(trade.direction);
    setEntry(trade.entry.toString());
    setAmount(trade.amount.toString());
    setHasExit(trade.exit !== null);
    setExit(trade.exit !== null ? trade.exit.toString() : '');
    setDate(formatIsoToDatetimeLocal(trade.date));
    setNotes(trade.notes || '');
    setStrategy(trade.strategy || null);
    setError(null);
  }, [trade, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    if (!pair.trim()) {
      setError('Trading pair is required (e.g., BTC/USDT).');
      return;
    }

    const entryNum = parseFloat(entry);
    if (isNaN(entryNum) || entryNum <= 0) {
      setError('Entry price must be a valid positive number.');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a valid positive number.');
      return;
    }

    let exitNum: number | null = null;
    if (hasExit) {
      exitNum = parseFloat(exit);
      if (isNaN(exitNum) || exitNum <= 0) {
        setError('Exit price must be a valid positive number.');
        return;
      }
    }

    if (!date) {
      setError('Trade date and time are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedFields: Partial<Omit<Trade, 'id'>> = {
        pair: pair.trim().toUpperCase(),
        direction,
        entry: entryNum,
        exit: exitNum,
        amount: amountNum,
        date: new Date(date).toISOString(),
        notes: notes.trim() || null,
        strategy: strategy || null,
      };

      const { error: saveError } = await onSave(trade.id, updatedFields);
      
      if (saveError) {
        setError(saveError);
      } else {
        onClose();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred while saving the trade.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-900/90 p-6 text-left shadow-2xl backdrop-blur-xl transition-all duration-300 md:p-8 animate-in fade-in zoom-in-95">
        
        {/* Glow Effect Accent */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-200 transition-colors rounded-lg p-1 hover:bg-gray-800/50"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-extrabold text-gray-100 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Edit Trade
          </h3>
          <p className="text-sm text-gray-400 mt-1">Update the details of your recorded position.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-rose-400 text-sm">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pair & Direction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Trading Pair
              </label>
              <div className="relative">
                <Coins className="absolute left-3 top-3 text-gray-500" size={16} />
                <input 
                  type="text"
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  placeholder="BTC/USDT"
                  className="w-full bg-gray-950/50 border border-gray-800 rounded-lg pl-9 pr-3 py-2.5 text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`py-2.5 text-xs font-extrabold rounded-lg border transition-all ${
                    direction === 'LONG' 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'bg-gray-950/20 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  LONG
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`py-2.5 text-xs font-extrabold rounded-lg border transition-all ${
                    direction === 'SHORT' 
                      ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
                      : 'bg-gray-950/20 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  SHORT
                </button>
              </div>
            </div>
          </div>

          {/* Amount & Entry Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Position Size (Amount)
              </label>
              <input 
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                className="w-full bg-gray-950/50 border border-gray-800 rounded-lg px-3 py-2.5 text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Entry Price ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-gray-500" size={16} />
                <input 
                  type="number"
                  step="any"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="65000"
                  className="w-full bg-gray-950/50 border border-gray-800 rounded-lg pl-8 pr-3 py-2.5 text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Exit / Outcome Status Toggle */}
          <div className="bg-gray-950/30 border border-gray-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm font-bold text-gray-200">Trade Outcome Status</span>
                <span className="text-xs text-gray-400 mt-0.5">Toggle whether this trade is closed or open.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHasExit(!hasExit);
                  if (!hasExit && !exit) {
                    setExit(entry); // Pre-fill with entry price
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  hasExit ? 'bg-emerald-500' : 'bg-gray-700'
                }`}
              >
                <span 
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-gray-950 shadow ring-0 transition duration-200 ease-in-out ${
                    hasExit ? 'translate-x-5 bg-white' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {hasExit && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Exit Price ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 text-gray-500" size={16} />
                  <input 
                    type="number"
                    step="any"
                    value={exit}
                    onChange={(e) => setExit(e.target.value)}
                    placeholder="68000"
                    className="w-full bg-gray-950/50 border border-gray-800 rounded-lg pl-8 pr-3 py-2.5 text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                    required={hasExit}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Trade Date & Time (Local)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-500" size={16} />
              <input 
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-950/50 border border-gray-800 rounded-lg pl-9 pr-3 py-2.5 text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Strategy Tag */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Strategy Tag <span className="text-gray-600 normal-case font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {STRATEGIES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStrategy(strategy === s.value ? null : s.value)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    strategy === s.value
                      ? s.color + ' shadow-sm'
                      : 'bg-gray-950/30 text-gray-500 border-gray-800/60 hover:text-gray-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trading Journal / Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Trading Journal / Comments
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Entered after support retest. Exited too early. Need better patience."
              rows={3}
              className="w-full bg-gray-950/50 border border-gray-800 rounded-lg px-3 py-2.5 text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-gray-600"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-400 hover:text-gray-200 transition-colors border border-transparent hover:bg-gray-800/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-gray-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
