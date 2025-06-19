export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string
          avatar_url: string | null
          rank: string
          points: number
          missions_completed: number
          last_login: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          full_name: string
          avatar_url?: string | null
          rank?: string
          points?: number
          missions_completed?: number
          last_login?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          rank?: string
          points?: number
          missions_completed?: number
          last_login?: string | null
        }
      }
      missions: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          points: number
          category: string
          difficulty: string
          completion_criteria: Json
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          points: number
          category: string
          difficulty: string
          completion_criteria: Json
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          points?: number
          category?: string
          difficulty?: string
          completion_criteria?: Json
        }
      }
      user_missions: {
        Row: {
          id: string
          user_id: string
          mission_id: string
          status: 'pending' | 'completed' | 'failed'
          completed_at: string | null
          proof: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          mission_id: string
          status?: 'pending' | 'completed' | 'failed'
          completed_at?: string | null
          proof?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          mission_id?: string
          status?: 'pending' | 'completed' | 'failed'
          completed_at?: string | null
          proof?: Json | null
        }
      }
    }
  }
} 