import { FolderOpen } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="w-full h-96 border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-gray-900/30 backdrop-blur-md">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700 shadow-inner">
        <FolderOpen className="text-gray-400" size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-200 mb-2">No Trades Found</h3>
      <p className="text-gray-400 max-w-sm mb-6">
        You haven't recorded any trades yet. Start logging your trades to see your performance analytics.
      </p>
      <button className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 px-6 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
        + Add Your First Trade
      </button>
    </div>
  );
}
