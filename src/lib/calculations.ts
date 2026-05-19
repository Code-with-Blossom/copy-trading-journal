import { Trade } from './types';

export function calculatePnL(trade: Trade): number {
  if (trade.exit === null || trade.exit === undefined) {
    return 0;
  }

  if (trade.direction === 'LONG') {
    return (trade.exit - trade.entry) * trade.amount;
  } else {
    return (trade.entry - trade.exit) * trade.amount;
  }
}

export interface TradeStats {
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  averageProfit: number;
  averageLoss: number;
}

export function calculateTradeStats(trades: Trade[]): TradeStats {
  const totalTrades = trades.length;
  const closedTradesList = trades.filter(t => t.exit !== null && t.exit !== undefined);
  const closedTrades = closedTradesList.length;

  if (closedTrades === 0) {
    return {
      totalPnL: 0,
      winRate: 0,
      totalTrades,
      averageProfit: 0,
      averageLoss: 0
    };
  }

  let totalPnL = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let totalProfit = 0;
  let totalLoss = 0;

  for (const trade of closedTradesList) {
    const pnl = calculatePnL(trade);
    totalPnL += pnl;
    if (pnl > 0) {
      winningTrades++;
      totalProfit += pnl;
    } else if (pnl < 0) {
      losingTrades++;
      totalLoss += Math.abs(pnl);
    }
  }

  // Returns win rate as a percentage (0 to 100)
  const winRate = (winningTrades / closedTrades) * 100;
  const averageProfit = winningTrades > 0 ? totalProfit / winningTrades : 0;
  const averageLoss = losingTrades > 0 ? -(totalLoss / losingTrades) : 0;

  return {
    totalPnL,
    winRate,
    totalTrades,
    averageProfit,
    averageLoss
  };
}

export interface CumulativePnLDataPoint {
  date: string;
  cumulativePnL: number;
}

export function calculateCumulativePnL(trades: Trade[]): CumulativePnLDataPoint[] {
  const closedTrades = trades.filter(t => t.exit !== null && t.exit !== undefined);
  
  // Sort trades by date (ascending)
  const sortedTrades = [...closedTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentPnL = 0;
  return sortedTrades.map(trade => {
    currentPnL += calculatePnL(trade);
    return {
      date: trade.date,
      cumulativePnL: currentPnL
    };
  });
}

export interface TradingInsights {
  bestPair: string | null;
  bestPairPnL: number;
  worstPair: string | null;
  worstPairPnL: number;
  mostTradedPair: string | null;
  mostTradedCount: number;
  longestWinningStreak: number;
}

export function calculateInsights(trades: Trade[]): TradingInsights {
  const closedTrades = trades.filter(t => t.exit !== null && t.exit !== undefined);
  
  if (closedTrades.length === 0) {
    return {
      bestPair: null,
      bestPairPnL: 0,
      worstPair: null,
      worstPairPnL: 0,
      mostTradedPair: null,
      mostTradedCount: 0,
      longestWinningStreak: 0
    };
  }

  const pairStats = new Map<string, { pnl: number, count: number }>();
  
  // Sort by date for streak calculation
  const sortedTrades = [...closedTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let currentStreak = 0;
  let maxStreak = 0;

  for (const trade of sortedTrades) {
    const pnl = calculatePnL(trade);
    
    // Streak
    if (pnl > 0) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (pnl < 0) {
      currentStreak = 0;
    }

    // Pair stats
    const current = pairStats.get(trade.pair) || { pnl: 0, count: 0 };
    pairStats.set(trade.pair, {
      pnl: current.pnl + pnl,
      count: current.count + 1
    });
  }

  let bestPair = null;
  let bestPairPnL = -Infinity;
  let worstPair = null;
  let worstPairPnL = Infinity;
  let mostTradedPair = null;
  let mostTradedCount = -1;

  for (const [pair, stats] of Array.from(pairStats.entries())) {
    if (stats.pnl > bestPairPnL) {
      bestPairPnL = stats.pnl;
      bestPair = pair;
    }
    if (stats.pnl < worstPairPnL) {
      worstPairPnL = stats.pnl;
      worstPair = pair;
    }
    if (stats.count > mostTradedCount) {
      mostTradedCount = stats.count;
      mostTradedPair = pair;
    }
  }

  return {
    bestPair,
    bestPairPnL,
    worstPair,
    worstPairPnL,
    mostTradedPair,
    mostTradedCount,
    longestWinningStreak: maxStreak
  };
}
