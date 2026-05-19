'use client';

import { useState, useMemo } from 'react';
import { Trade } from '@/lib/types';
import { calculatePnL } from '@/lib/calculations';
import { getStrategy } from '@/lib/strategies';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit2, Trash2, Download } from 'lucide-react';
import EditTradeModal from './EditTradeModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import toast from 'react-hot-toast';

interface TradeTableProps {
  trades: Trade[];
  onUpdate: (id: string, updatedFields: Partial<Omit<Trade, 'id'>>) => Promise<{ data: unknown; error: string | null }>;
  onDelete: (id: string) => Promise<{ error: string | null }>;
}

type SortKey = 'date' | 'pair' | 'direction' | 'entry' | 'exit' | 'amount' | 'pnl';

export default function TradeTable({ trades, onUpdate, onDelete }: TradeTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [deletingTrade, setDeletingTrade] = useState<Trade | null>(null);

  const sortedTrades = useMemo(() => {
    let sortableTrades = [...trades];
    if (sortConfig !== null) {
      sortableTrades.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Trade];
        let bValue: any = b[sortConfig.key as keyof Trade];

        if (sortConfig.key === 'pnl') {
          aValue = calculatePnL(a);
          bValue = calculatePnL(b);
        } else if (sortConfig.key === 'date') {
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
        }

        if (aValue === null || aValue === undefined) aValue = -Infinity;
        if (bValue === null || bValue === undefined) bValue = -Infinity;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Default sort by date descending
      sortableTrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return sortableTrades;
  }, [trades, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="opacity-40" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-emerald-400" /> : <ArrowDown size={14} className="text-emerald-400" />;
  };

  if (!trades || trades.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-md">
        <p className="text-gray-400 font-medium">No trades recorded yet.</p>
      </div>
    );
  }

  const SortableHeader = ({ label, sortKey, align = 'left' }: { label: string, sortKey: SortKey, align?: 'left' | 'right' | 'center' }) => (
    <th 
      className={`px-6 py-4 font-semibold whitespace-nowrap cursor-pointer hover:text-gray-200 transition-colors select-none ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}
      onClick={() => requestSort(sortKey)}
    >
      <div className={`flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
        {label}
        {getSortIcon(sortKey)}
      </div>
    </th>
  );

  const handleExportCSV = () => {
    try {
      const headers = ['Date (UTC)', 'Pair', 'Direction', 'Entry Price', 'Exit Price', 'Amount', 'PnL ($)', 'Status', 'Journal Comments', 'Strategy'];
      
      const csvRows = sortedTrades.map(trade => {
        const pnl = calculatePnL(trade);
        const isClosed = trade.exit !== null && trade.exit !== undefined;
        
        return [
          new Date(trade.date).toISOString(),
          trade.pair.toUpperCase(),
          trade.direction,
          trade.entry,
          isClosed ? trade.exit : '',
          trade.amount,
          isClosed ? pnl.toFixed(2) : '0.00',
          isClosed ? 'Closed' : 'Open',
          trade.notes || '',
          trade.strategy ? (getStrategy(trade.strategy)?.label ?? trade.strategy) : ''
        ].map(val => {
          const stringVal = val === null || val === undefined ? '' : String(val);
          const escaped = stringVal.replace(/"/g, '""');
          return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"') 
            ? `"${escaped}"` 
            : escaped;
        }).join(',');
      });

      const csvContent = [headers.join(','), ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `trades_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Trades exported successfully!');
    } catch {
      toast.error('Failed to export trades to CSV.');
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Utilities Action Bar */}
      <div className="flex justify-between items-center bg-gray-900/30 border border-gray-800/40 rounded-xl px-4 py-3 shadow-md backdrop-blur-md">
        <span className="text-xs text-gray-400 font-medium">
          Showing <span className="text-emerald-400 font-bold">{sortedTrades.length}</span> recorded position{sortedTrades.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-850 hover:border-emerald-500/30 hover:text-emerald-400 bg-gray-950/20 hover:bg-emerald-500/5 transition-all shadow-[0_0_10px_rgba(16,185,129,0.01)] group"
          title="Download as CSV spreadsheet"
        >
          <Download size={14} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-gray-700/50 bg-gray-800/50 backdrop-blur-md shadow-2xl">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-900/50 text-xs uppercase text-gray-400 border-b border-gray-700/50">
            <tr>
              <SortableHeader label="Date" sortKey="date" />
              <SortableHeader label="Pair" sortKey="pair" />
              <SortableHeader label="Direction" sortKey="direction" align="center" />
              <SortableHeader label="Entry" sortKey="entry" align="right" />
              <SortableHeader label="Exit" sortKey="exit" align="right" />
              <SortableHeader label="Amount" sortKey="amount" align="right" />
              <SortableHeader label="P&L" sortKey="pnl" align="right" />
              <th className="px-6 py-4 font-semibold text-right text-gray-400 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {sortedTrades.map((trade) => {
              const pnl = calculatePnL(trade);
              const isClosed = trade.exit !== null && trade.exit !== undefined;
              
              return (
                <tr key={trade.id} className="hover:bg-gray-700/50 transition-colors duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {new Date(trade.date).toLocaleString(undefined, { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-100">{trade.pair}</div>
                    {trade.strategy && (() => {
                      const strat = getStrategy(trade.strategy);
                      return strat ? (
                        <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${strat.color}`}>
                          {strat.label}
                        </span>
                      ) : null;
                    })()}
                    {trade.notes && (
                      <div className="text-[10px] text-gray-400 italic font-medium truncate max-w-[200px] mt-0.5" title={trade.notes}>
                        {trade.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${trade.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-gray-300">
                    ${trade.entry.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-gray-300">
                    {isClosed ? `$${trade.exit!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : <span className="text-gray-500 italic">Open</span>}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-gray-400">
                    {trade.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {isClosed ? (
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${pnl > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : pnl < 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                        {(pnl > 0 ? '+' : '')}${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        onClick={() => setEditingTrade(trade)}
                        className="p-1.5 text-gray-400 hover:text-emerald-400 rounded-lg hover:bg-gray-800/80 transition-all duration-200"
                        title="Edit Trade"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => setDeletingTrade(trade)}
                        className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-gray-800/80 transition-all duration-200"
                        title="Delete Trade"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {/* Mobile sort select */}
        <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select 
              className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-1.5 focus:ring-emerald-500/50 outline-none"
              onChange={(e) => {
                const [key, dir] = e.target.value.split('-');
                setSortConfig({ key: key as SortKey, direction: dir as 'asc' | 'desc' });
              }}
              value={sortConfig ? `${sortConfig.key}-${sortConfig.direction}` : 'date-desc'}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="pnl-desc">Highest Profit</option>
              <option value="pnl-asc">Biggest Loss</option>
            </select>
        </div>

        {sortedTrades.map(trade => {
          const pnl = calculatePnL(trade);
          const isClosed = trade.exit !== null && trade.exit !== undefined;

          return (
            <div key={trade.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 shadow-lg backdrop-blur-md hover:bg-gray-800 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-100 text-lg">{trade.pair}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${trade.direction === 'LONG' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {trade.direction}
                    </span>
                    {trade.strategy && (() => {
                      const strat = getStrategy(trade.strategy);
                      return strat ? (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${strat.color}`}>
                          {strat.label}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(trade.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-1">P&L</div>
                  {isClosed ? (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${pnl > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : pnl < 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                      {(pnl > 0 ? '+' : '')}${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">Open</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm pt-3 border-t border-gray-700/50">
                <div>
                  <span className="text-gray-500 mr-2">Entry:</span>
                  <span className="text-gray-300">${trade.entry.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                </div>
                <div>
                  <span className="text-gray-500 mr-2">Exit:</span>
                  <span className="text-gray-300">{isClosed ? `$${trade.exit!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : '-'}</span>
                </div>
              </div>

              {trade.notes && (
                <div className="mt-3 p-2.5 rounded-lg bg-gray-950/40 border border-gray-800/40 text-xs text-gray-400 italic leading-relaxed space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 not-italic">Journal Comments:</div>
                  <div className="whitespace-pre-line">{trade.notes}</div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-gray-700/50 mt-3">
                <div className="text-sm">
                  <span className="text-gray-500 mr-2">Amount:</span>
                  <span className="text-gray-300 font-medium">{trade.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setEditingTrade(trade)}
                    className="p-2 text-gray-400 hover:text-emerald-400 rounded-lg hover:bg-gray-800/80 transition-all border border-gray-700/30"
                    title="Edit Trade"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => setDeletingTrade(trade)}
                    className="p-2 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-gray-800/80 transition-all border border-gray-700/30"
                    title="Delete Trade"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingTrade && (
        <EditTradeModal 
          trade={editingTrade}
          isOpen={!!editingTrade}
          onClose={() => setEditingTrade(null)}
          onSave={onUpdate}
        />
      )}

      {deletingTrade && (
        <DeleteConfirmModal 
          trade={deletingTrade}
          isOpen={!!deletingTrade}
          onClose={() => setDeletingTrade(null)}
          onConfirm={onDelete}
        />
      )}
    </div>
  );
}
