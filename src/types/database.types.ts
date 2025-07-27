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
          points: number
          missions_completed: number
          last_login: string | null
          bio: string | null
          location: string | null
          interests: Json | null
          cover_url: string | null
          role: 'user' | 'admin'
          username: string | null
          forum_status: string
          status: 'active' | 'inactive' | 'suspended'
          main_goal: string | null
          admin_notes: string | null
          posts: number
          badges: number
          recent_activity: Json | null
          selected_schema_id: string | null
          selected_nutrition_plan: string | null
          nutrition_profile: any | null
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          full_name: string
          avatar_url?: string | null
          points?: number
          missions_completed?: number
          last_login?: string | null
          bio?: string | null
          location?: string | null
          interests?: Json | null
          cover_url?: string | null
          role?: 'user' | 'admin'
          username?: string | null
          forum_status?: string
          status?: 'active' | 'inactive' | 'suspended'
          main_goal?: string | null
          admin_notes?: string | null
          posts?: number
          badges?: number
          recent_activity?: Json | null
          selected_schema_id?: string | null
          selected_nutrition_plan?: string | null
          nutrition_profile?: any | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          points?: number
          missions_completed?: number
          last_login?: string | null
          bio?: string | null
          location?: string | null
          interests?: Json | null
          cover_url?: string | null
          role?: 'user' | 'admin'
          username?: string | null
          forum_status?: string
          status?: 'active' | 'inactive' | 'suspended'
          main_goal?: string | null
          admin_notes?: string | null
          posts?: number
          badges?: number
          recent_activity?: Json | null
          selected_schema_id?: string | null
          selected_nutrition_plan?: string | null
          nutrition_profile?: any | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          display_name: string | null
          bio: string | null
          location: string | null
          website: string | null
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          interests: string[] | null
          rank: string | null
          points: number | null
          missions_completed: number | null
          cover_url: string | null
          is_public: boolean | null
          show_email: boolean | null
          show_phone: boolean | null
          last_login: string | null
          main_goal: string | null
          badges: number | null
          posts: number | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          display_name?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          interests?: string[] | null
          rank?: string | null
          points?: number | null
          missions_completed?: number | null
          cover_url?: string | null
          is_public?: boolean | null
          show_email?: boolean | null
          show_phone?: boolean | null
          last_login?: string | null
          main_goal?: string | null
          badges?: number | null
          posts?: number | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          display_name?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          interests?: string[] | null
          rank?: string | null
          points?: number | null
          missions_completed?: number | null
          cover_url?: string | null
          is_public?: boolean | null
          show_email?: boolean | null
          show_phone?: boolean | null
          last_login?: string | null
          main_goal?: string | null
          badges?: number | null
          posts?: number | null
        }
      }
      academy_modules: {
        Row: {
          id: string
          title: string
          description: string
          short_description: string | null
          cover_image: string | null
          slug: string
          lessons_count: number
          total_duration: string
          enrolled_students: number
          completion_rate: number
          status: 'draft' | 'published' | 'archived'
          unlock_requirement: string | null
          order_index: number
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          short_description?: string | null
          cover_image?: string | null
          slug?: string
          lessons_count?: number
          total_duration?: string
          enrolled_students?: number
          completion_rate?: number
          status?: 'draft' | 'published' | 'archived'
          unlock_requirement?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          short_description?: string | null
          cover_image?: string | null
          slug?: string
          lessons_count?: number
          total_duration?: string
          enrolled_students?: number
          completion_rate?: number
          status?: 'draft' | 'published' | 'archived'
          unlock_requirement?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      academy_lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          duration: string
          type: 'video' | 'text' | 'exam'
          status: 'draft' | 'published' | 'archived'
          order_index: number
          views: number
          completion_rate: number
          video_url: string | null
          content: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          duration?: string
          type?: 'video' | 'text' | 'exam'
          status?: 'draft' | 'published' | 'archived'
          order_index?: number
          views?: number
          completion_rate?: number
          video_url?: string | null
          content?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          duration?: string
          type?: 'video' | 'text' | 'exam'
          status?: 'draft' | 'published' | 'archived'
          order_index?: number
          views?: number
          completion_rate?: number
          video_url?: string | null
          content?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      user_lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          watched_duration: number
          exam_score: number | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          watched_duration?: number
          exam_score?: number | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          watched_duration?: number
          exam_score?: number | null
          started_at?: string
          completed_at?: string | null
        }
      }
      user_module_unlocks: {
        Row: {
          id: string
          user_id: string
          module_id: string
          unlocked_at: string
          opened_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          unlocked_at?: string
          opened_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          unlocked_at?: string
          opened_at?: string | null
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