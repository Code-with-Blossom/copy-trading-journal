'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Trade } from '@/lib/types';

export type InsertTradeData = Omit<Trade, 'id' | 'date'> & { date?: string };

export async function saveTrade(tradeData: InsertTradeData) {
  const supabase = createClient();
  
  // Securely get the authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('You must be logged in to save a trade.');
  }

  // Insert the trade linked to the authenticated user_id
  const { data, error } = await supabase
    .from('trades')
    .insert({
      user_id: user.id,
      pair: tradeData.pair,
      direction: tradeData.direction,
      entry: tradeData.entry,
      exit: tradeData.exit,
      amount: tradeData.amount,
      ...(tradeData.date && { date: tradeData.date }) // only include date if provided
    })
    .select()
    .single();

  if (error) {
    console.error('Database error inserting trade:', error);
    throw new Error('Failed to save trade.');
  }

  // Refresh the dashboard so the new trade appears immediately
  revalidatePath('/');
  
  return data as Trade;
}
