'use client';

import React, { useState, useEffect } from 'react';
import { Trade } from '@/lib/types';
import { STRATEGIES } from '@/lib/strategies';
import { X, Calendar, DollarSign, Coins, ShieldAlert } from 'lucide-react';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tradeData: Omit<Trade, 'id'>) => Promise<{ data: unknown; error: string | null }>;
}

export default function AddTradeModal({ isOpen, onClose, onAdd }: AddTradeModalProps) {
  const [pair, setPair] = useState('');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [entry, setEntry] = useState('');
  const [amount, setAmount] = useState('');
  const [hasExit, setHasExit] = useState(false);
  const [exit, setExit] = useState('');
  
  const getInitialLocalDatetime = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [date, setDate] = useState(getInitialLocalDatetime());
  const [notes, setNotes] = useState('');
  const [strategy, setStrategy] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset fields on modal open
  useEffect(() => {
    if (isOpen) {
      setPair('');
      setDirection('LONG');
      setEntry('');
      setAmount('');
      setHasExit(false);
      setExit('');
      setDate(getInitialLocalDatetime());
      setNotes('');
      setStrategy(null);
      setError(null);
    }
  }, [isOpen]);

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
      const tradeData: Omit<Trade, 'id'> = {
        pair: pair.trim().toUpperCase(),
        direction,
        entry: entryNum,
        exit: exitNum,
        amount: amountNum,
        date: new Date(date).toISOString(),
        notes: notes.trim() || null,
        strategy: strategy || null,
      };

      const { error: addError } = await onAdd(tradeData);
      
      if (addError) {
        setError(addError);
      } else {
        onClose();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred while adding the trade.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-gray-900/90 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80">
          <div>
            <h3 className="text-lg font-extrabold text-gray-100 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Record New Trade
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Add a new manual or copy-trade entry</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-450 hover:text-gray-250 hover:bg-gray-800/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5">
              <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={16} />
              <span className="text-xs text-rose-450 font-medium leading-normal">{error}</span>
            </div>
          )}

          {/* Direction toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Position Direction
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDirection('LONG')}
                className={`py-2 rounded-lg font-bold text-sm border transition-all ${direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-gray-950/20 text-gray-500 border-gray-800/80 hover:text-gray-400 hover:border-gray-805'}`}
              >
                LONG
              </button>
              <button
                type="button"
                onClick={() => setDirection('SHORT')}
                className={`py-2 rounded-lg font-bold text-sm border transition-all ${direction === 'SHORT' ? 'bg-rose-500/10 text-rose-400 border-rose-500/35 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'bg-gray-950/20 text-gray-500 border-gray-800/80 hover:text-gray-400 hover:border-gray-805'}`}
              >
                SHORT
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Pair Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Token Pair
              </label>
              <div className="relative">
                <Coins className="absolute left-3 top-3 text-gray-500" size={16} />
                <input 
                  type="text"
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  placeholder="BTC/USDT"
                  className="w-full bg-gray-950/50 border border-gray-800 rounded-lg pl-8 pr-3 py-2.5 text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-650"
                  required
                />
              </div>
            </div>

            {/* Position Size */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Amount (Tokens)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-gray-500" size={16} />
                <input 
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1.5"
                  className="w-full bg-gray-950/50 border border-gray-800 rounded-lg pl-8 pr-3 py-2.5 text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-650"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Entry Price */}
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
                  className="w-full bg-gray-950/50 border border-gray-800 rounded-lg pl-8 pr-3 py-2.5 text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-650"
                  required
                />
              </div>
            </div>

            {/* Has Exit switch */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Outcome Status
              </label>
              <button
                type="button"
                onClick={() => setHasExit(!hasExit)}
                className={`w-full py-2.5 rounded-lg border text-sm font-bold transition-all ${hasExit ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450' : 'bg-gray-950/20 border-gray-800/80 text-gray-450 hover:text-gray-350'}`}
              >
                {hasExit ? 'Closed Position' : 'Open / Unclosed'}
              </button>
            </div>
          </div>

          {/* Exit block if closed */}
          <div className="transition-all duration-300">
            {hasExit && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
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
                'Add Trade'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
