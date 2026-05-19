'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Trade } from '@/lib/types';
import { calculateCumulativePnL } from '@/lib/calculations';

interface ProfitChartProps {
  trades: Trade[];
}

export default function ProfitChart({ trades }: ProfitChartProps) {
  const data = useMemo(() => {
    return calculateCumulativePnL(trades).map(item => ({
      ...item,
      displayDate: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));
  }, [trades]);

  if (data.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col items-center justify-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <span className="text-2xl">📈</span>
        </div>
        <h3 className="text-lg font-bold text-gray-200 mb-1">No Data Available</h3>
        <p className="text-gray-400 text-center max-w-sm">
          Add some completed trades to see your cumulative profit and loss chart.
        </p>
      </div>
    );
  }

  const isProfitable = data[data.length - 1].cumulativePnL >= 0;
  const strokeColor = isProfitable ? '#10b981' : '#f43f5e'; // emerald-500 or rose-500

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const isPos = val >= 0;
      return (
        <div className="bg-gray-900/90 border border-gray-700 p-4 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-gray-400 text-sm mb-1">{payload[0].payload.displayDate}</p>
          <p className={`text-xl font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPos ? '+' : '-'}${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 md:p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-gray-600/50 flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-200">Cumulative P&L</h3>
          <p className="text-sm text-gray-400">Your performance over time</p>
        </div>
      </div>
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="displayDate" 
              stroke="#9ca3af" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="#9ca3af" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4b5563', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="cumulativePnL" 
              stroke={strokeColor} 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPnL)"
              activeDot={{ r: 6, fill: strokeColor, stroke: '#1f2937', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
