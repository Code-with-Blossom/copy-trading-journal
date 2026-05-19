'use client';

import React, { useState } from 'react';
import { Trade } from '@/lib/types';
import { calculatePnL } from '@/lib/calculations';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  trade: Trade;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<{ error: string | null }>;
}

export default function DeleteConfirmModal({ trade, isOpen, onClose, onConfirm }: DeleteConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: deleteError } = await onConfirm(trade.id);
      if (deleteError) {
        setError(deleteError);
      } else {
        onClose();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred while deleting the trade.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pnl = calculatePnL(trade);
  const isClosed = trade.exit !== null && trade.exit !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-900/90 p-6 text-left shadow-2xl backdrop-blur-xl transition-all duration-300 md:p-8 animate-in fade-in zoom-in-95">
        
        {/* Glow Effect Accent */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-200 transition-colors rounded-lg p-1 hover:bg-gray-800/50"
        >
          <X size={20} />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-100">
              Delete Trade Record?
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Trade Details Summary */}
        <div className="bg-gray-950/45 border border-gray-800/60 rounded-xl p-4 mb-6 space-y-3.5 text-sm">
          <div className="flex justify-between items-center pb-2.5 border-b border-gray-800/50">
            <span className="font-bold text-gray-200 text-base">{trade.pair}</span>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
              trade.direction === 'LONG' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {trade.direction}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <div className="flex justify-between pr-2">
              <span className="text-gray-500">Entry:</span>
              <span className="text-gray-300 font-medium">${trade.entry.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pl-2">
              <span className="text-gray-500">Exit:</span>
              <span className="text-gray-300 font-medium">
                {isClosed ? `$${trade.exit!.toLocaleString()}` : <span className="text-gray-500 italic">Open</span>}
              </span>
            </div>
            <div className="flex justify-between pr-2">
              <span className="text-gray-500">Amount:</span>
              <span className="text-gray-300 font-medium">{trade.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pl-2">
              <span className="text-gray-500">P&L:</span>
              <span className={`font-bold ${
                isClosed 
                  ? pnl > 0 
                    ? 'text-emerald-400' 
                    : pnl < 0 
                      ? 'text-rose-400' 
                      : 'text-gray-300'
                  : 'text-gray-500'
              }`}>
                {isClosed 
                  ? `${pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                  : '-'
                }
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Are you sure you want to permanently remove this trade from your database? This will immediately recalculate all your performance metrics and charts.
        </p>

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
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-[0_0_20px_rgba(244,63,94,0.15)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete Trade</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
