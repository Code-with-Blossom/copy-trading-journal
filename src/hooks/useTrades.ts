import { useState, useEffect } from 'react';
import { Trade } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  // Fetch trades on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchTrades() {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('You must be logged in to view trades.');
        }

        // Fetch trades for user
        const { data, error: fetchError } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        if (fetchError) throw fetchError;

        if (isMounted) {
          setTrades(data as Trade[]);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Failed to fetch trades:', err);
          const msg = err instanceof Error ? err.message : 'Failed to connect to the database.';
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTrades();

    return () => {
      isMounted = false;
    };
  }, []);

  // Async mutators
  const addTrade = async (tradeData: Omit<Trade, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          pair: tradeData.pair,
          direction: tradeData.direction,
          entry: tradeData.entry,
          exit: tradeData.exit,
          amount: tradeData.amount,
          notes: tradeData.notes,
          strategy: tradeData.strategy,
          date: tradeData.date,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setTrades((prev) => [...prev, data as Trade]);
      toast.success('Trade added successfully');
      return { data, error: null };
    } catch (err: unknown) {
      console.error('Error adding trade:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to add trade';
      toast.error(errMsg);
      return { data: null, error: errMsg };
    }
  };

  const updateTrade = async (id: string, updatedFields: Partial<Omit<Trade, 'id'>>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('trades')
        .update(updatedFields)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setTrades((prev) =>
        prev.map((trade) => (trade.id === id ? { ...trade, ...data } : trade))
      );
      toast.success('Trade updated successfully');
      return { data, error: null };
    } catch (err: unknown) {
      console.error('Error updating trade:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to update trade';
      toast.error(errMsg);
      return { data: null, error: errMsg };
    }
  };

  const deleteTrade = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state
      setTrades((prev) => prev.filter((trade) => trade.id !== id));
      toast.success('Trade deleted successfully');
      return { error: null };
    } catch (err: unknown) {
      console.error('Error deleting trade:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to delete trade';
      toast.error(errMsg);
      return { error: errMsg };
    }
  };

  return {
    trades,
    isLoading,
    error,
    addTrade,
    updateTrade,
    deleteTrade,
  };
}
