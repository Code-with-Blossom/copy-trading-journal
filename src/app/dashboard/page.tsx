'use client'

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTrades } from '@/hooks/useTrades';
import { calculateTradeStats, calculatePnL, calculateInsights } from '@/lib/calculations';
import { createClient } from '@/utils/supabase/client';
import TradeTable from '@/components/TradeTable';
import ProfitChart from '@/components/ProfitChart';
import TradingInsights from '@/components/TradingInsights';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import EmptyState from '@/components/EmptyState';
import AddTradeModal from '@/components/AddTradeModal';
import { STRATEGIES } from '@/lib/strategies';
import { Activity, TrendingUp, TrendingDown, Target, BarChart2, Filter, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { trades, isLoading, error, addTrade, updateTrade, deleteTrade } = useTrades();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const [filterDirection, setFilterDirection] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');
  const [filterOutcome, setFilterOutcome] = useState<'ALL' | 'PROFIT' | 'LOSS'>('ALL');
  const [filterPair, setFilterPair] = useState<string>('ALL');
  const [filterStrategy, setFilterStrategy] = useState<string>('ALL');

  const uniquePairs = useMemo(() => {
    return Array.from(new Set(trades.map(t => t.pair))).sort();
  }, [trades]);

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      if (filterDirection !== 'ALL' && trade.direction !== filterDirection) return false;
      if (filterPair !== 'ALL' && trade.pair !== filterPair) return false;
      if (filterStrategy !== 'ALL' && (trade.strategy ?? null) !== filterStrategy) return false;
      
      if (filterOutcome !== 'ALL') {
        if (trade.exit === null || trade.exit === undefined) return false;
        
        const pnl = calculatePnL(trade);
        if (filterOutcome === 'PROFIT' && pnl <= 0) return false;
        if (filterOutcome === 'LOSS' && pnl >= 0) return false;
      }
      return true;
    });
  }, [trades, filterDirection, filterPair, filterOutcome, filterStrategy]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = calculateTradeStats(filteredTrades);
  const insights = calculateInsights(filteredTrades);

  return (
    <div className="text-gray-100 p-4 md:p-8 selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header id="dashboard" className="flex items-center justify-between scroll-mt-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent pb-1">
              Trading Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Monitor your performance and analyze your trades.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-200 transition-colors font-medium text-sm"
            >
              Logout
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 px-5 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            >
              <span>+ New Trade</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 backdrop-blur-md">
            <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-bold text-rose-400">Database Connection Error</h4>
              <p className="text-sm text-rose-400/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {trades.length === 0 && !error ? (
          <EmptyState />
        ) : (
          <div className="space-y-12">
            {/* Summary Cards */}
            <div id="analytics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 scroll-mt-10">
          <StatCard 
            title="Total P&L" 
            value={stats.totalPnL} 
            isCurrency 
            icon={<Activity className="text-emerald-400" size={24} />} 
            gradientClass="from-emerald-500/20 to-cyan-500/20"
          />
          <StatCard 
            title="Win Rate" 
            value={stats.winRate} 
            isPercentage 
            icon={<Target className="text-blue-400" size={24} />} 
            gradientClass="from-blue-500/20 to-indigo-500/20"
          />
          <StatCard 
            title="Total Trades" 
            value={stats.totalTrades} 
            icon={<BarChart2 className="text-purple-400" size={24} />} 
            gradientClass="from-purple-500/20 to-pink-500/20"
          />
          <StatCard 
            title="Avg Profit" 
            value={stats.averageProfit} 
            isCurrency 
            icon={<TrendingUp className="text-teal-400" size={24} />} 
            gradientClass="from-emerald-500/20 to-teal-500/20"
          />
          <StatCard 
            title="Avg Loss" 
            value={stats.averageLoss} 
            isCurrency 
            icon={<TrendingDown className="text-rose-400" size={24} />} 
            gradientClass="from-rose-500/20 to-orange-500/20"
          />
        </div>

            {/* Chart Section */}
            <div id="profit-chart" className="scroll-mt-10">
              <ProfitChart trades={filteredTrades} />
            </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 text-gray-400 font-medium px-2">
            <Filter size={18} />
            <span>Filters</span>
          </div>
          <div className="flex-1 flex flex-wrap gap-3">
            <select 
              value={filterPair}
              onChange={(e) => setFilterPair(e.target.value)}
              className="bg-gray-900/80 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Pairs</option>
              {uniquePairs.map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>

            <select 
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value as 'ALL' | 'LONG' | 'SHORT')}
              className="bg-gray-900/80 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Directions</option>
              <option value="LONG">Longs Only</option>
              <option value="SHORT">Shorts Only</option>
            </select>

            <select 
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value as 'ALL' | 'PROFIT' | 'LOSS')}
              className="bg-gray-900/80 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Outcomes</option>
              <option value="PROFIT">Profitable</option>
              <option value="LOSS">Losses</option>
            </select>

            <select
              value={filterStrategy}
              onChange={(e) => setFilterStrategy(e.target.value)}
              className="bg-gray-900/80 border border-gray-700 text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">All Strategies</option>
              {STRATEGIES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            
            {(filterDirection !== 'ALL' || filterOutcome !== 'ALL' || filterPair !== 'ALL' || filterStrategy !== 'ALL') && (
              <button 
                onClick={() => {
                  setFilterDirection('ALL');
                  setFilterOutcome('ALL');
                  setFilterPair('ALL');
                  setFilterStrategy('ALL');
                }}
                className="text-sm text-gray-400 hover:text-gray-200 px-3 py-2 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

            {/* Table Section */}
            <div id="trade-history" className="space-y-4 scroll-mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-200">Recent Trades</h2>
            {/* Mobile Add Button */}
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="sm:hidden flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 px-4 py-2 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <span>+ New</span>
            </button>
          </div>
          <TradeTable 
            trades={filteredTrades} 
            onUpdate={updateTrade}
            onDelete={deleteTrade}
          />
        </div>

            {/* Insights Section */}
            <div id="insights" className="scroll-mt-10">
              <TradingInsights insights={insights} />
            </div>
          </div>
        )}
        <AddTradeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={addTrade}
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, isCurrency, isPercentage, icon, gradientClass = "from-emerald-500/10 to-cyan-500/10" }: any) {
  let displayValue = value.toString();
  let colorClass = "text-gray-100";

  if (isCurrency) {
    const isPositive = value >= 0;
    displayValue = `${isPositive ? '+' : '-'}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    colorClass = value > 0 ? "text-emerald-400" : value < 0 ? "text-rose-400" : "text-gray-100";
  } else if (isPercentage) {
    displayValue = `${value.toFixed(1)}%`;
  }

  return (
    <div className="relative overflow-hidden group rounded-2xl bg-gray-800/50 border border-gray-700/50 p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-gray-600/50">
      <div className={`absolute -inset-0.5 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-100 transition duration-500 rounded-2xl blur`}></div>
      <div className="relative flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <h3 className={`text-3xl font-bold tracking-tight ${colorClass}`}>
            {displayValue}
          </h3>
        </div>
        <div className="p-3 bg-gray-900/50 rounded-xl border border-gray-700/50">
          {icon}
        </div>
      </div>
    </div>
  );
}
