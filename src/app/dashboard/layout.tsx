'use client';

import { ReactNode } from 'react';
import { LayoutDashboard, BarChart2, TrendingUp, History, Lightbulb, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0 z-50 flex flex-col justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="p-6 border-b border-gray-850">
            <Link href="/dashboard" className="block">
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                TraderDash
              </h1>
            </Link>
          </div>
          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-2">
            <NavItem href="#dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" currentPathname={pathname} />
            <NavItem href="#analytics" icon={<BarChart2 size={20} />} label="Analytics" currentPathname={pathname} />
            <NavItem href="#profit-chart" icon={<TrendingUp size={20} />} label="Profit Chart" currentPathname={pathname} />
            <NavItem href="#trade-history" icon={<History size={20} />} label="Trade History" currentPathname={pathname} />
            <NavItem href="#insights" icon={<Lightbulb size={20} />} label="Trading Insights" currentPathname={pathname} />
          </nav>
        </div>

        {/* Footer / Settings Link */}
        <div className="p-4 border-t border-gray-800/60 bg-gray-900/40">
          <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings & Profile" currentPathname={pathname} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full md:max-w-[calc(100vw-16rem)] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  currentPathname: string;
}

function NavItem({ href, icon, label, currentPathname }: NavItemProps) {
  const isSettingsPage = currentPathname === '/dashboard/settings';
  
  // Dynamic href calculation: if on the settings page, rewrite hash links to absolute dashboard paths
  const resolvedHref = isSettingsPage && href.startsWith('#') ? `/dashboard${href}` : href;
  
  // Active route detection
  const isActive = isSettingsPage 
    ? href === '/dashboard/settings' 
    : href !== '/dashboard/settings' && currentPathname.startsWith('/dashboard') && !resolvedHref.includes('/settings');

  return (
    <Link 
      href={resolvedHref}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold group text-sm ${
        isActive 
          ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/5 text-emerald-400 border border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.02)]' 
          : 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/5 border border-transparent'
      }`}
    >
      <span className={`transition-colors ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-emerald-400'}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
