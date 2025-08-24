import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types matching your FaceCardUI CardItem structure
export type CardItem = {
  id: string;
  name: string;
  summary: string;
  tier: "L1";
  leverage: "Informational" | "Relational" | "Resource" | "Urgency" | "Narrative" | "Authority";
  intent: "Extract" | "Increase";
  modes: { direct: string[]; inception: string[] };
  steps: [string, string, string];
  recovery: string;
  map_adaptations?: { map: "Chaotic" | "Stable" | "Adversarial" | "Cooperative"; tip: string }[];
  telemetry_keys: string[];
  version: string;
  status: "draft" | "beta" | "stable" | "deprecated";
  author?: string;
  created_at?: string;
  updated_at?: string;
}

// Database operations
export const cardOperations = {
  // Get all cards
  async getAll() {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as CardItem[];
  },

  // Get cards by filter
  async getFiltered(filters: {
    leverage?: CardItem['leverage'];
    intent?: CardItem['intent'];
    search?: string;
  }) {
    let query = supabase.from('cards').select('*');
    
    if (filters.leverage && filters.leverage !== 'All') {
      query = query.eq('leverage', filters.leverage);
    }
    
    if (filters.intent && filters.intent !== 'All') {
      query = query.eq('intent', filters.intent);
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as CardItem[];
  },

  // Insert new card
  async insert(card: Omit<CardItem, 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('cards')
      .insert([card])
      .select()
      .single();
    
    if (error) throw error;
    return data as CardItem;
  },

  // Update existing card
  async update(id: string, updates: Partial<CardItem>) {
    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as CardItem;
  },

  // Delete card
  async delete(id: string) {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};