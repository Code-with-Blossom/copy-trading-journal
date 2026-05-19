import { TradingInsights as InsightsType } from '@/lib/calculations';
import { Trophy, TrendingDown, Repeat, Zap } from 'lucide-react';

interface TradingInsightsProps {
  insights: InsightsType;
}

export default function TradingInsights({ insights }: TradingInsightsProps) {
  if (!insights.mostTradedPair) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-200">Trading Insights</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard 
          title="Best Pair" 
          value={insights.bestPair || '-'} 
          subtext={insights.bestPairPnL > 0 ? `+$${insights.bestPairPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `$${insights.bestPairPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtextColor="text-emerald-400"
          icon={<Trophy className="text-yellow-400" size={20} />}
          gradient="from-yellow-500/10 to-orange-500/10"
        />
        <InsightCard 
          title="Worst Pair" 
          value={insights.worstPair || '-'} 
          subtext={`-$${Math.abs(insights.worstPairPnL).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtextColor="text-rose-400"
          icon={<TrendingDown className="text-rose-400" size={20} />}
          gradient="from-rose-500/10 to-red-500/10"
        />
        <InsightCard 
          title="Most Traded" 
          value={insights.mostTradedPair || '-'} 
          subtext={`${insights.mostTradedCount} Trades`}
          subtextColor="text-gray-400"
          icon={<Repeat className="text-blue-400" size={20} />}
          gradient="from-blue-500/10 to-cyan-500/10"
        />
        <InsightCard 
          title="Winning Streak" 
          value={`${insights.longestWinningStreak}`} 
          subtext="Consecutive Wins"
          subtextColor="text-gray-400"
          icon={<Zap className="text-amber-400" size={20} />}
          gradient="from-amber-500/10 to-yellow-500/10"
        />
      </div>
    </div>
  );
}

function InsightCard({ title, value, subtext, subtextColor, icon, gradient }: any) {
  return (
    <div className="relative overflow-hidden group rounded-xl bg-gray-800/40 border border-gray-700/50 p-5 backdrop-blur-md transition-all duration-300 hover:bg-gray-800/60 hover:-translate-y-1 hover:shadow-lg hover:border-gray-600/50">
      <div className={`absolute -inset-0.5 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition duration-500 rounded-xl blur`}></div>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <h4 className="text-xl font-bold text-gray-100">{value}</h4>
          <p className={`text-sm mt-1 font-medium ${subtextColor}`}>{subtext}</p>
        </div>
        <div className="p-2.5 bg-gray-900/50 rounded-lg border border-gray-700/50 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
    </div>
  );
}
