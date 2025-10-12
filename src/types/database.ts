// Database types matching Supabase schema
// Auto-generated types can be created with: supabase gen types typescript

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          user_id: string
          file_id: string
          filename: string
          document_type: string
          status: 'queued' | 'processing' | 'completed' | 'failed'
          progress: number
          stage: 'cleaning' | 'extracting' | 'translating' | null
          queue_position: number | null
          retry_count: number
          error: string | null
          created_at: string
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          file_id: string
          filename: string
          document_type: string
          status: 'queued' | 'processing' | 'completed' | 'failed'
          progress?: number
          stage?: 'cleaning' | 'extracting' | 'translating' | null
          queue_position?: number | null
          retry_count?: number
          error?: string | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          file_id?: string
          filename?: string
          document_type?: string
          status?: 'queued' | 'processing' | 'completed' | 'failed'
          progress?: number
          stage?: 'cleaning' | 'extracting' | 'translating' | null
          queue_position?: number | null
          retry_count?: number
          error?: string | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
      }
      wordlists: {
        Row: {
          id: string
          user_id: string
          job_id: string | null
          filename: string
          document_type: string
          word_count: number
          words: WordPair[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_id?: string | null
          filename: string
          document_type: string
          word_count: number
          words: WordPair[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_id?: string | null
          filename?: string
          document_type?: string
          word_count?: number
          words?: WordPair[]
          created_at?: string
        }
      }
      llm_metrics: {
        Row: {
          id: string
          job_id: string
          agent_type: 'cleaner' | 'extractor' | 'translator'
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          latency_ms: number
          model: string
          confidence: number | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          agent_type: 'cleaner' | 'extractor' | 'translator'
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          latency_ms: number
          model: string
          confidence?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          agent_type?: 'cleaner' | 'extractor' | 'translator'
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          latency_ms?: number
          model?: string
          confidence?: number | null
          created_at?: string
        }
      }
      upload_cooldowns: {
        Row: {
          user_id: string
          last_upload_at: string
          upload_count: number
          cooldown_until: string
        }
        Insert: {
          user_id: string
          last_upload_at: string
          upload_count?: number
          cooldown_until: string
        }
        Update: {
          user_id?: string
          last_upload_at?: string
          upload_count?: number
          cooldown_until?: string
        }
      }
      practice_sets: {
        Row: {
          id: string
          wordlist_id: string
          questions: any // JSONB
          created_at: string
          share_url: string | null
          is_shared: boolean
        }
        Insert: {
          id?: string
          wordlist_id: string
          questions: any // JSONB
          created_at?: string
          share_url?: string | null
          is_shared?: boolean
        }
        Update: {
          id?: string
          wordlist_id?: string
          questions?: any // JSONB
          created_at?: string
          share_url?: string | null
          is_shared?: boolean
        }
      }
      practice_sessions: {
        Row: {
          id: string
          practice_set_id: string
          session_id: string
          start_time: string
          end_time: string | null
          timer_duration: number | null
          answers: any // JSONB
          score: number | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          practice_set_id: string
          session_id: string
          start_time?: string
          end_time?: string | null
          timer_duration?: number | null
          answers: any // JSONB
          score?: number | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          practice_set_id?: string
          session_id?: string
          start_time?: string
          end_time?: string | null
          timer_duration?: number | null
          answers?: any // JSONB
          score?: number | null
          completed?: boolean
          created_at?: string
        }
      }
    }
  }
}

export interface WordPair {
  en: string
  zh: string
}

// Helper types for common operations
export type Job = Database['public']['Tables']['jobs']['Row']
export type JobInsert = Database['public']['Tables']['jobs']['Insert']
export type JobUpdate = Database['public']['Tables']['jobs']['Update']

export type Wordlist = Database['public']['Tables']['wordlists']['Row']
export type WordlistInsert = Database['public']['Tables']['wordlists']['Insert']
export type WordlistUpdate = Database['public']['Tables']['wordlists']['Update']

export type LLMMetric = Database['public']['Tables']['llm_metrics']['Row']
export type LLMMetricInsert = Database['public']['Tables']['llm_metrics']['Insert']

export type UploadCooldown = Database['public']['Tables']['upload_cooldowns']['Row']
export type UploadCooldownInsert = Database['public']['Tables']['upload_cooldowns']['Insert']
export type UploadCooldownUpdate = Database['public']['Tables']['upload_cooldowns']['Update']

export type PracticeSet = Database['public']['Tables']['practice_sets']['Row']
export type PracticeSetInsert = Database['public']['Tables']['practice_sets']['Insert']
export type PracticeSetUpdate = Database['public']['Tables']['practice_sets']['Update']

export type PracticeSession = Database['public']['Tables']['practice_sessions']['Row']
export type PracticeSessionInsert = Database['public']['Tables']['practice_sessions']['Insert']
export type PracticeSessionUpdate = Database['public']['Tables']['practice_sessions']['Update']
