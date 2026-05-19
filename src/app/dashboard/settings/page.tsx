'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { Mail, User, Camera, ShieldCheck, Zap, Compass, RefreshCw, BarChart4, Cpu } from 'lucide-react';

const STRATEGY_PRESETS = [
  {
    id: 'Trend Following',
    name: 'Trend Following',
    description: 'Ride long-term momentum trends using moving averages and breakout patterns.',
    icon: <Zap size={22} className="text-amber-400" />,
    gradient: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40',
    activeGradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-400'
  },
  {
    id: 'Scalping',
    name: 'Scalping & High Frequency',
    description: 'Capture micro-profits from rapid short-term price movements and tick charts.',
    icon: <Compass size={22} className="text-cyan-400" />,
    gradient: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-500/40',
    activeGradient: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400'
  },
  {
    id: 'Swing Trading',
    name: 'Swing Trading',
    description: 'Capture swing moves spanning days or weeks based on support/resistance zones.',
    icon: <BarChart4 size={22} className="text-emerald-400" />,
    gradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/40',
    activeGradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-400'
  },
  {
    id: 'Grid & Arbitrage',
    name: 'Grid & Arbitrage',
    description: 'Automated range consolidation strategy and multi-exchange premium execution.',
    icon: <Cpu size={22} className="text-purple-400" />,
    gradient: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40',
    activeGradient: 'from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-400'
  }
];

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [preferredStrategy, setPreferredStrategy] = useState('Trend Following');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function fetchProfile() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('Not authenticated.');
        }

        if (isMounted) {
          setEmail(user.email || '');
          setUsername(user.user_metadata?.username || '');
          setPreferredStrategy(user.user_metadata?.preferredStrategy || 'Trend Following');
          setAvatarPreview(user.user_metadata?.avatarUrl || '');
        }
      } catch (err: unknown) {
        console.error('Failed to load user settings:', err);
        toast.error('Session expired or invalid. Please login again.');
        router.push('/login');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        toast.success('Avatar preview updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const supabase = createClient();

    try {
      if (!username.trim()) {
        throw new Error('Username cannot be empty.');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          username: username.trim(),
          preferredStrategy,
          avatarUrl: avatarPreview
        }
      });

      if (updateError) throw updateError;
      
      toast.success('Profile updated successfully!');
      router.refresh();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred while saving.';
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-gray-400">
        <RefreshCw className="animate-spin text-emerald-400 mb-4" size={32} />
        <p className="font-semibold text-sm">Loading profile settings...</p>
      </div>
    );
  }

  // Get Initials for Avatar Placeholder if no custom image
  const getInitials = () => {
    if (username.trim()) {
      return username.trim().substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'TR';
  };

  return (
    <div className="text-gray-100 p-4 md:p-8 selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col gap-1 pb-4 border-b border-gray-800/80">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            User Settings & Profile
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Customize your trading identity and platform preferences.</p>
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Summary Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-gray-800/60 bg-gray-900/50 p-6 text-center backdrop-blur-md shadow-xl">
              {/* Glow Accent */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              {/* Circular Avatar */}
              <div className="relative mx-auto w-32 h-32 group cursor-pointer mb-5" onClick={handleAvatarClick}>
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="User Avatar" 
                    className="w-full h-full rounded-full object-cover border-2 border-emerald-500/30 group-hover:border-emerald-500/80 transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-2 border-emerald-500/20 text-emerald-400 font-extrabold text-3xl group-hover:border-emerald-500/80 transition-all duration-300">
                    {getInitials()}
                  </div>
                )}
                {/* Camera Overlay Hover Trigger */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-gray-950/70 opacity-0 group-hover:opacity-100 transition-all duration-300 border-2 border-emerald-500/80">
                  <Camera size={22} className="text-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-gray-200 mt-1 uppercase tracking-wider">Upload</span>
                </div>
                
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Profile Details */}
              <h3 className="text-xl font-bold text-gray-100 truncate mb-1">
                {username || 'Trader'}
              </h3>
              <p className="text-xs text-gray-400 truncate mb-4">{email}</p>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                <ShieldCheck size={14} />
                <span>Verified Copy Trader</span>
              </div>
            </div>
          </div>

          {/* Right Column: Settings Edit Form */}
          <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
            
            {/* Identity Settings Box */}
            <div className="rounded-2xl border border-gray-800/60 bg-gray-900/50 p-6 backdrop-blur-md shadow-xl space-y-5">
              <h3 className="text-lg font-bold text-gray-100 border-b border-gray-800/50 pb-2">
                Identity Profile
              </h3>
              
              {/* Email Address (Read-only) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Email Address (Read-Only)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-600" size={16} />
                  <input 
                    type="email" 
                    value={email} 
                    disabled 
                    className="w-full bg-gray-950/20 border border-gray-850 rounded-lg pl-9 pr-3 py-2.5 text-gray-500 text-sm cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Trader Nickname / Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Enter your trader handle"
                    className="w-full bg-gray-950/50 border border-gray-800 rounded-lg pl-9 pr-3 py-2.5 text-gray-100 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Trading Strategy Preferences Grid */}
            <div className="rounded-2xl border border-gray-800/60 bg-gray-900/50 p-6 backdrop-blur-md shadow-xl space-y-5">
              <div>
                <h3 className="text-lg font-bold text-gray-100 border-b border-gray-800/50 pb-2">
                  Trading Preferences
                </h3>
                <p className="text-xs text-gray-400 mt-1">Select your preferred copy-trading methodology to align automated analytics.</p>
              </div>

              {/* Preset Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STRATEGY_PRESETS.map((strat) => {
                  const isActive = preferredStrategy === strat.id;
                  return (
                    <button
                      key={strat.id}
                      type="button"
                      onClick={() => setPreferredStrategy(strat.id)}
                      className={`relative text-left p-4 rounded-xl border bg-gray-950/30 transition-all duration-300 ${
                        isActive ? strat.activeGradient : strat.gradient
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gray-900/80 rounded-lg border border-gray-800/50">
                          {strat.icon}
                        </div>
                        <span className="font-bold text-sm text-gray-200">{strat.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed leading-normal">
                        {strat.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Buttons Panel */}
            <div className="flex items-center justify-end gap-4 p-4 rounded-2xl border border-gray-800/60 bg-gray-900/50 backdrop-blur-md shadow-xl">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-400 hover:text-gray-200 transition-colors border border-transparent hover:bg-gray-800/50"
              >
                Back to Dashboard
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-gray-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="animate-spin text-gray-950" size={16} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
