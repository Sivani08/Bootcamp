export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          created_at: string
          description: string
          id: string
          meta: Json | null
          minutes: number
          trainee_id: string
          type: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          meta?: Json | null
          minutes?: number
          trainee_id: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          meta?: Json | null
          minutes?: number
          trainee_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          bootcamp_id: string
          created_at: string
          ends_on: string | null
          id: string
          name: string
          starts_on: string | null
        }
        Insert: {
          bootcamp_id: string
          created_at?: string
          ends_on?: string | null
          id?: string
          name: string
          starts_on?: string | null
        }
        Update: {
          bootcamp_id?: string
          created_at?: string
          ends_on?: string | null
          id?: string
          name?: string
          starts_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batches_bootcamp_id_fkey"
            columns: ["bootcamp_id"]
            isOneToOne: false
            referencedRelation: "bootcamps"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamps: {
        Row: {
          created_at: string
          description: string | null
          ends_on: string | null
          id: string
          name: string
          starts_on: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_on?: string | null
          id?: string
          name: string
          starts_on?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_on?: string | null
          id?: string
          name?: string
          starts_on?: string | null
        }
        Relationships: []
      }
      coding_attempts: {
        Row: {
          code: string | null
          created_at: string
          id: string
          output: string | null
          passed: boolean
          problem_id: string
          trainee_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          output?: string | null
          passed?: boolean
          problem_id: string
          trainee_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          output?: string | null
          passed?: boolean
          problem_id?: string
          trainee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coding_attempts_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "coding_problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coding_attempts_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_problems: {
        Row: {
          created_at: string
          difficulty: string
          domain_id: string | null
          expected_output: string | null
          id: string
          prompt: string
          starter_code: string | null
          title: string
          topic: string | null
        }
        Insert: {
          created_at?: string
          difficulty?: string
          domain_id?: string | null
          expected_output?: string | null
          id?: string
          prompt: string
          starter_code?: string | null
          title: string
          topic?: string | null
        }
        Update: {
          created_at?: string
          difficulty?: string
          domain_id?: string | null
          expected_output?: string | null
          id?: string
          prompt?: string
          starter_code?: string | null
          title?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coding_problems_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_scorecards: {
        Row: {
          application_comment: string | null
          application_score: number | null
          challenges: string | null
          coding_comment: string | null
          coding_score: number | null
          communication_comment: string | null
          communication_score: number | null
          created_at: string
          evaluator_member_id: string
          feedback_comment: string | null
          feedback_score: number | null
          id: string
          improvement_comment: string | null
          improvement_score: number | null
          initiative_comment: string | null
          initiative_score: number | null
          involvement_comment: string | null
          involvement_score: number | null
          key_strengths: string | null
          meeting_id: string | null
          other_comments: string | null
          participant_role: Database["public"]["Enums"]["app_role"]
          participation_comment: string | null
          participation_score: number | null
          preparedness_comment: string | null
          preparedness_score: number | null
          problem_solving_comment: string | null
          problem_solving_score: number | null
          session_date: string
          session_highlights: string | null
          session_number: number
          session_type: string
          team_name: string | null
          trainee_id: string
          understanding_comment: string | null
          understanding_score: number | null
          updated_at: string
        }
        Insert: {
          application_comment?: string | null
          application_score?: number | null
          challenges?: string | null
          coding_comment?: string | null
          coding_score?: number | null
          communication_comment?: string | null
          communication_score?: number | null
          created_at?: string
          evaluator_member_id: string
          feedback_comment?: string | null
          feedback_score?: number | null
          id?: string
          improvement_comment?: string | null
          improvement_score?: number | null
          initiative_comment?: string | null
          initiative_score?: number | null
          involvement_comment?: string | null
          involvement_score?: number | null
          key_strengths?: string | null
          meeting_id?: string | null
          other_comments?: string | null
          participant_role: Database["public"]["Enums"]["app_role"]
          participation_comment?: string | null
          participation_score?: number | null
          preparedness_comment?: string | null
          preparedness_score?: number | null
          problem_solving_comment?: string | null
          problem_solving_score?: number | null
          session_date?: string
          session_highlights?: string | null
          session_number?: number
          session_type?: string
          team_name?: string | null
          trainee_id: string
          understanding_comment?: string | null
          understanding_score?: number | null
          updated_at?: string
        }
        Update: {
          application_comment?: string | null
          application_score?: number | null
          challenges?: string | null
          coding_comment?: string | null
          coding_score?: number | null
          communication_comment?: string | null
          communication_score?: number | null
          created_at?: string
          evaluator_member_id?: string
          feedback_comment?: string | null
          feedback_score?: number | null
          id?: string
          improvement_comment?: string | null
          improvement_score?: number | null
          initiative_comment?: string | null
          initiative_score?: number | null
          involvement_comment?: string | null
          involvement_score?: number | null
          key_strengths?: string | null
          meeting_id?: string | null
          other_comments?: string | null
          participant_role?: Database["public"]["Enums"]["app_role"]
          participation_comment?: string | null
          participation_score?: number | null
          preparedness_comment?: string | null
          preparedness_score?: number | null
          problem_solving_comment?: string | null
          problem_solving_score?: number | null
          session_date?: string
          session_highlights?: string | null
          session_number?: number
          session_type?: string
          team_name?: string | null
          trainee_id?: string
          understanding_comment?: string | null
          understanding_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connect_scorecards_evaluator_member_id_fkey"
            columns: ["evaluator_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connect_scorecards_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connect_scorecards_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          domain_id: string
          estimated_hours: number | null
          id: string
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain_id: string
          estimated_hours?: number | null
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain_id?: string
          estimated_hours?: number | null
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          batch_id: string
          color: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          batch_id: string
          color?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          batch_id?: string
          color?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "domains_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          category: string
          comments: string | null
          created_at: string
          from_member_id: string
          id: string
          kind: Database["public"]["Enums"]["app_role"]
          rating: number
          trainee_id: string
        }
        Insert: {
          category: string
          comments?: string | null
          created_at?: string
          from_member_id: string
          id?: string
          kind: Database["public"]["Enums"]["app_role"]
          rating: number
          trainee_id: string
        }
        Update: {
          category?: string
          comments?: string | null
          created_at?: string
          from_member_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["app_role"]
          rating?: number
          trainee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_from_member_id_fkey"
            columns: ["from_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string
          description: string
          id: string
          status: Database["public"]["Enums"]["idea_status"]
          title: string
          trainee_id: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          category?: string
          created_at?: string
          description: string
          id?: string
          status?: Database["public"]["Enums"]["idea_status"]
          title: string
          trainee_id: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          status?: Database["public"]["Enums"]["idea_status"]
          title?: string
          trainee_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["app_role"]
          message: string | null
          reason: string | null
          requested_for: string
          response_note: string | null
          status: Database["public"]["Enums"]["meeting_status"]
          trainee_id: string
          updated_at: string
          with_member_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["app_role"]
          message?: string | null
          reason?: string | null
          requested_for: string
          response_note?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          trainee_id: string
          updated_at?: string
          with_member_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["app_role"]
          message?: string | null
          reason?: string | null
          requested_for?: string
          response_note?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          trainee_id?: string
          updated_at?: string
          with_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_with_member_id_fkey"
            columns: ["with_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          email: string
          employee_id: string | null
          full_name: string
          id: string
          is_demo: boolean
          joining_date: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          employee_id?: string | null
          full_name: string
          id?: string
          is_demo?: boolean
          joining_date?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["app_role"]
          status?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          employee_id?: string | null
          full_name?: string
          id?: string
          is_demo?: boolean
          joining_date?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      module_progress: {
        Row: {
          completed_at: string | null
          id: string
          minutes: number
          module_id: string
          status: Database["public"]["Enums"]["work_status"]
          trainee_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          minutes?: number
          module_id: string
          status?: Database["public"]["Enums"]["work_status"]
          trainee_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          minutes?: number
          module_id?: string
          status?: Database["public"]["Enums"]["work_status"]
          trainee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_progress_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          duration_min: number
          id: string
          kind: string
          order_index: number
          resource_url: string | null
          title: string
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          duration_min?: number
          id?: string
          kind?: string
          order_index?: number
          resource_url?: string | null
          title: string
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          duration_min?: number
          id?: string
          kind?: string
          order_index?: number
          resource_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          id: string
          link: string | null
          member_id: string
          read: boolean
          title: string
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          link?: string | null
          member_id: string
          read?: boolean
          title: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          link?: string | null
          member_id?: string
          read?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          created_at: string
          id: string
          percentage: number | null
          quiz_id: string
          score: number
          total: number
          trainee_id: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          id?: string
          percentage?: number | null
          quiz_id: string
          score?: number
          total?: number
          trainee_id: string
        }
        Update: {
          answers?: Json | null
          created_at?: string
          id?: string
          percentage?: number | null
          quiz_id?: string
          score?: number
          total?: number
          trainee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_index: number
          id: string
          marks: number
          options: Json
          order_index: number
          prompt: string
          quiz_id: string
          topic: string | null
        }
        Insert: {
          correct_index: number
          id?: string
          marks?: number
          options: Json
          order_index?: number
          prompt: string
          quiz_id: string
          topic?: string | null
        }
        Update: {
          correct_index?: number
          id?: string
          marks?: number
          options?: Json
          order_index?: number
          prompt?: string
          quiz_id?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string | null
          created_at: string
          domain_id: string | null
          due_at: string | null
          duration_min: number
          id: string
          title: string
          topic: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          domain_id?: string | null
          due_at?: string | null
          duration_min?: number
          id?: string
          title: string
          topic?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          domain_id?: string | null
          due_at?: string | null
          duration_min?: number
          id?: string
          title?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          generated_at: string
          id: string
          payload: Json
          period_label: string
          scope: string
          title: string
        }
        Insert: {
          generated_at?: string
          id?: string
          payload: Json
          period_label: string
          scope: string
          title: string
        }
        Update: {
          generated_at?: string
          id?: string
          payload?: Json
          period_label?: string
          scope?: string
          title?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          batch_id: string | null
          course_id: string | null
          created_at: string
          description: string | null
          domain_id: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          mime_type: string
          module_id: string | null
          storage_path: string
          task_id: string | null
          trainee_id: string | null
          updated_at: string
          uploaded_by: string
          uploaded_by_role: Database["public"]["Enums"]["app_role"]
          visibility: string
        }
        Insert: {
          batch_id?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          domain_id?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          mime_type: string
          module_id?: string | null
          storage_path: string
          task_id?: string | null
          trainee_id?: string | null
          updated_at?: string
          uploaded_by: string
          uploaded_by_role: Database["public"]["Enums"]["app_role"]
          visibility?: string
        }
        Update: {
          batch_id?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          domain_id?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          mime_type?: string
          module_id?: string | null
          storage_path?: string
          task_id?: string | null
          trainee_id?: string | null
          updated_at?: string
          uploaded_by?: string
          uploaded_by_role?: Database["public"]["Enums"]["app_role"]
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      task_submissions: {
        Row: {
          content: string | null
          created_at: string
          id: string
          score: number | null
          status: Database["public"]["Enums"]["work_status"]
          submitted_at: string | null
          task_id: string
          trainee_id: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["work_status"]
          submitted_at?: string | null
          task_id: string
          trainee_id: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["work_status"]
          submitted_at?: string | null
          task_id?: string
          trainee_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_submissions_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          batch_id: string | null
          course_id: string | null
          created_at: string
          description: string | null
          domain_id: string | null
          due_at: string | null
          id: string
          kind: string
          module_id: string | null
          priority: string
          submission_type: string
          title: string
          trainee_id: string | null
        }
        Insert: {
          batch_id?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          domain_id?: string | null
          due_at?: string | null
          id?: string
          kind?: string
          module_id?: string | null
          priority?: string
          submission_type?: string
          title: string
          trainee_id?: string | null
        }
        Update: {
          batch_id?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          domain_id?: string | null
          due_at?: string | null
          id?: string
          kind?: string
          module_id?: string | null
          priority?: string
          submission_type?: string
          title?: string
          trainee_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      trainees: {
        Row: {
          batch_id: string
          buddy_member_id: string | null
          created_at: string
          domain_id: string
          id: string
          last_active_at: string | null
          learning_hours: number
          longest_streak: number
          member_id: string
          mentor_member_id: string | null
          status: Database["public"]["Enums"]["trainee_status"]
          status_reason: string | null
          streak_days: number
          updated_at: string
        }
        Insert: {
          batch_id: string
          buddy_member_id?: string | null
          created_at?: string
          domain_id: string
          id?: string
          last_active_at?: string | null
          learning_hours?: number
          longest_streak?: number
          member_id: string
          mentor_member_id?: string | null
          status?: Database["public"]["Enums"]["trainee_status"]
          status_reason?: string | null
          streak_days?: number
          updated_at?: string
        }
        Update: {
          batch_id?: string
          buddy_member_id?: string | null
          created_at?: string
          domain_id?: string
          id?: string
          last_active_at?: string | null
          learning_hours?: number
          longest_streak?: number
          member_id?: string
          mentor_member_id?: string | null
          status?: Database["public"]["Enums"]["trainee_status"]
          status_reason?: string | null
          streak_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainees_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainees_buddy_member_id_fkey"
            columns: ["buddy_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainees_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainees_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainees_mentor_member_id_fkey"
            columns: ["mentor_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_trainee: { Args: { _trainee_id: string }; Returns: boolean }
      claim_demo_seat: {
        Args: {
          _full_name: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      my_member_id: { Args: never; Returns: string }
      my_trainee_id: { Args: never; Returns: string }
      supports_trainee: { Args: { _trainee_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "mentor" | "buddy" | "trainee"
      idea_status:
        | "new"
        | "under_review"
        | "accepted"
        | "rejected"
        | "implemented"
      meeting_status:
        | "requested"
        | "accepted"
        | "rejected"
        | "rescheduled"
        | "completed"
        | "cancelled"
      trainee_status: "on_track" | "at_risk" | "behind"
      work_status:
        | "not_started"
        | "in_progress"
        | "submitted"
        | "reviewed"
        | "completed"
        | "overdue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "mentor", "buddy", "trainee"],
      idea_status: [
        "new",
        "under_review",
        "accepted",
        "rejected",
        "implemented",
      ],
      meeting_status: [
        "requested",
        "accepted",
        "rejected",
        "rescheduled",
        "completed",
        "cancelled",
      ],
      trainee_status: ["on_track", "at_risk", "behind"],
      work_status: [
        "not_started",
        "in_progress",
        "submitted",
        "reviewed",
        "completed",
        "overdue",
      ],
    },
  },
} as const
