import { createClient } from '@supabase/supabase-js'
import { logger } from '@/core/logging/logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Helper to check if URL is valid (not a placeholder)
const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http') && new URL(url)
  } catch {
    return false
  }
}

// Export supabase client only if configured, otherwise provide a warning
export const supabase = (isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (!supabase) {
  logger.info('Supabase keys are missing. Data persistence will be disabled.')
}

// Schema Types (Requirements 1.13 adapted to Supabase)
export interface AICacheEntry {
  id?: string
  key: string
  prompt_hash: string
  response: unknown
  created_at: string
  ttl: number
}

export interface LearningHistory {
  id?: string
  user_id?: string
  type: string
  data: Record<string, unknown>
  timestamp: string
  topic?: string
}

export interface MasteryScore {
  id?: string
  user_id?: string
  topic_id: string
  score: number
  updated_at: string
  activity_count: number
}

export const dbService = {
  // AI Cache
  async getAICache(key: string) {
    if (!supabase) return null
    const { data, error } = await supabase
      .from('ai_cache')
      .select('*')
      .eq('key', key)
      .single()
    
    if (error || !data) {
      if (error && error.code !== 'PGRST116') logger.error('Supabase Error in getAICache', error)
      return null
    }
    
    // Check TTL
    const createdAt = new Date(data.created_at).getTime()
    if (Date.now() > createdAt + data.ttl * 1000) {
      await supabase.from('ai_cache').delete().eq('key', key)
      return null
    }
    
    return data
  },

  async setAICache(entry: Partial<AICacheEntry>) {
    if (!supabase) return null
    return supabase.from('ai_cache').upsert(entry)
  },

  // Learning History
  async addHistory(entry: Partial<LearningHistory>) {
    if (!supabase) return null
    return supabase.from('learning_history').insert(entry)
  },

  async getHistory(limit = 80) {
    if (!supabase) return []
    const { data } = await supabase
      .from('learning_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
    return data || []
  },

  // Mastery Scores
  async updateMastery(score: Partial<MasteryScore>) {
    if (!supabase) return null
    return supabase.from('mastery_scores').upsert(score)
  },

  async getMastery(topicId: string) {
    if (!supabase) return null
    return supabase
      .from('mastery_scores')
      .select('*')
      .eq('topic_id', topicId)
      .single()
  }
}
