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
      academy_ebooks: {
        Row: {
          id: string
          lesson_id: string
          title: string
          description: string | null
          file_url: string
          file_size: number | null
          page_count: number
          status: 'draft' | 'published' | 'archived'
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          description?: string | null
          file_url: string
          file_size?: number | null
          page_count?: number
          status?: 'draft' | 'published' | 'archived'
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          description?: string | null
          file_url?: string
          file_size?: number | null
          page_count?: number
          status?: 'draft' | 'published' | 'archived'
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
      training_schemas: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          difficulty: string
          status: string
          cover_image: string | null
          estimated_duration: string | null
          target_audience: string | null
          schema_nummer: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string
          difficulty?: string
          status?: string
          cover_image?: string | null
          estimated_duration?: string | null
          target_audience?: string | null
          schema_nummer?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          difficulty?: string
          status?: string
          cover_image?: string | null
          estimated_duration?: string | null
          target_audience?: string | null
          schema_nummer?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_schema_periods: {
        Row: {
          id: string
          user_id: string
          training_schema_id: string
          start_date: string
          end_date: string
          status: 'active' | 'completed' | 'paused' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          training_schema_id: string
          start_date: string
          end_date?: string
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          training_schema_id?: string
          start_date?: string
          end_date?: string
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      training_schema_days: {
        Row: {
          id: string
          schema_id: string
          day_number: number
          name: string
          description: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          schema_id: string
          day_number: number
          name: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          schema_id?: string
          day_number?: number
          name?: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      training_schema_exercises: {
        Row: {
          id: string
          schema_day_id: string
          exercise_id: string | null
          exercise_name: string
          sets: number
          reps: number
          rest_time: number
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          schema_day_id: string
          exercise_id?: string | null
          exercise_name: string
          sets?: number
          reps?: number
          rest_time?: number
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          schema_day_id?: string
          exercise_id?: string | null
          exercise_name?: string
          sets?: number
          reps?: number
          rest_time?: number
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string

          primary_muscle: string | null
          equipment: string | null
          difficulty: string | null
          video_url: string | null
          instructions: string
          worksheet_url: string | null
          secondary_muscles: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          primary_muscle?: string | null
          equipment?: string | null
          difficulty?: string | null
          video_url?: string | null
          instructions: string
          worksheet_url?: string | null
          secondary_muscles?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          primary_muscle?: string | null
          equipment?: string | null
          difficulty?: string | null
          video_url?: string | null
          instructions?: string
          worksheet_url?: string | null
          secondary_muscles?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      user_training_schema_progress: {
        Row: {
          id: string
          user_id: string
          schema_id: string
          current_day: number
          total_days_completed: number
          total_workouts_completed: number
          last_workout_date: string | null
          started_at: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          schema_id: string
          current_day?: number
          total_days_completed?: number
          total_workouts_completed?: number
          last_workout_date?: string | null
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          schema_id?: string
          current_day?: number
          total_days_completed?: number
          total_workouts_completed?: number
          last_workout_date?: string | null
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          schema_id: string
          day_number: number
          started_at: string
          completed_at: string | null
          duration_minutes: number | null
          mode: string
          notes: string | null
          rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          schema_id: string
          day_number: number
          started_at?: string
          completed_at?: string | null
          duration_minutes?: number | null
          mode?: string
          notes?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          schema_id?: string
          day_number?: number
          started_at?: string
          completed_at?: string | null
          duration_minutes?: number | null
          mode?: string
          notes?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      workout_exercises: {
        Row: {
          id: string
          session_id: string
          exercise_name: string
          sets_completed: number
          reps_completed: number
          weight_kg: number | null
          rest_time_seconds: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          exercise_name: string
          sets_completed?: number
          reps_completed?: number
          weight_kg?: number | null
          rest_time_seconds?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          exercise_name?: string
          sets_completed?: number
          reps_completed?: number
          weight_kg?: number | null
          rest_time_seconds?: number
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
} 