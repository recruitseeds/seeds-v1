export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      applicant_files: {
        Row: {
          applicant_id: string
          created_at: string
          file_name: string
          file_type: Database['public']['Enums']['file_type']
          id: string
          is_default_resume: boolean | null
          mime_type: string | null
          parsed_resume_data: Json | null
          size_bytes: number | null
          storage_path: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          created_at?: string
          file_name: string
          file_type: Database['public']['Enums']['file_type']
          id?: string
          is_default_resume?: boolean | null
          mime_type?: string | null
          parsed_resume_data?: Json | null
          size_bytes?: number | null
          storage_path: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          created_at?: string
          file_name?: string
          file_type?: Database['public']['Enums']['file_type']
          id?: string
          is_default_resume?: boolean | null
          mime_type?: string | null
          parsed_resume_data?: Json | null
          size_bytes?: number | null
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'applicant_files_applicant_id_fkey'
            columns: ['applicant_id']
            isOneToOne: false
            referencedRelation: 'applicants'
            referencedColumns: ['user_id']
          },
        ]
      }
      applicant_tracker_entries: {
        Row: {
          applicant_id: string
          applied_at: string | null
          company_logo_url: string | null
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_role: string | null
          created_at: string
          id: string
          job_id: string | null
          job_title: string
          job_url: string | null
          location: string | null
          location_type: Database['public']['Enums']['location_type'] | null
          next_step_date: string | null
          next_step_description: string | null
          notes: Json | null
          salary_max: number | null
          salary_min: number | null
          salary_notes: string | null
          saved_at: string | null
          source: Database['public']['Enums']['tracker_source']
          status: Database['public']['Enums']['tracker_status']
          updated_at: string
        }
        Insert: {
          applicant_id: string
          applied_at?: string | null
          company_logo_url?: string | null
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_role?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_title: string
          job_url?: string | null
          location?: string | null
          location_type?: Database['public']['Enums']['location_type'] | null
          next_step_date?: string | null
          next_step_description?: string | null
          notes?: Json | null
          salary_max?: number | null
          salary_min?: number | null
          salary_notes?: string | null
          saved_at?: string | null
          source?: Database['public']['Enums']['tracker_source']
          status?: Database['public']['Enums']['tracker_status']
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          applied_at?: string | null
          company_logo_url?: string | null
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_role?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_title?: string
          job_url?: string | null
          location?: string | null
          location_type?: Database['public']['Enums']['location_type'] | null
          next_step_date?: string | null
          next_step_description?: string | null
          notes?: Json | null
          salary_max?: number | null
          salary_min?: number | null
          salary_notes?: string | null
          saved_at?: string | null
          source?: Database['public']['Enums']['tracker_source']
          status?: Database['public']['Enums']['tracker_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'applicant_tracker_entries_applicant_id_fkey'
            columns: ['applicant_id']
            isOneToOne: false
            referencedRelation: 'applicants'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'applicant_tracker_entries_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'job_pipeline_stats'
            referencedColumns: ['job_id']
          },
          {
            foreignKeyName: 'applicant_tracker_entries_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'applicant_tracker_entries_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs_with_stats'
            referencedColumns: ['id']
          },
        ]
      }
      applicant_tracker_history: {
        Row: {
          created_at: string
          entry_id: string
          id: string
          new_status: Database['public']['Enums']['tracker_status']
          note: string | null
          previous_status: Database['public']['Enums']['tracker_status'] | null
        }
        Insert: {
          created_at?: string
          entry_id: string
          id?: string
          new_status: Database['public']['Enums']['tracker_status']
          note?: string | null
          previous_status?: Database['public']['Enums']['tracker_status'] | null
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: string
          new_status?: Database['public']['Enums']['tracker_status']
          note?: string | null
          previous_status?: Database['public']['Enums']['tracker_status'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'applicant_tracker_history_entry_id_fkey'
            columns: ['entry_id']
            isOneToOne: false
            referencedRelation: 'applicant_tracker_entries'
            referencedColumns: ['id']
          },
        ]
      }
      applicants: {
        Row: {
          bio: string | null
          created_at: string
          github_url: string | null
          headline: string | null
          is_profile_complete: boolean | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          portfolio_url: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          github_url?: string | null
          headline?: string | null
          is_profile_complete?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          github_url?: string | null
          headline?: string | null
          is_profile_complete?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_url?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'applicants_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      application_forms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          fields: Json
          id: string
          is_default: boolean | null
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          fields?: Json
          id?: string
          is_default?: boolean | null
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          fields?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'application_forms_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'application_forms_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organization_stats'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'application_forms_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          author_id: string
          content: Json
          created_at: string
          id: string
          note_type: string | null
          stage_id: string | null
          updated_at: string
        }
        Insert: {
          application_id: string
          author_id: string
          content: Json
          created_at?: string
          id?: string
          note_type?: string | null
          stage_id?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string
          author_id?: string
          content?: Json
          created_at?: string
          id?: string
          note_type?: string | null
          stage_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'application_notes_application_id_fkey'
            columns: ['application_id']
            isOneToOne: false
            referencedRelation: 'applications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'application_notes_application_id_fkey'
            columns: ['application_id']
            isOneToOne: false
            referencedRelation: 'applications_detailed'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'application_notes_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'application_notes_stage_id_fkey'
            columns: ['stage_id']
            isOneToOne: false
            referencedRelation: 'job_pipeline_stats'
            referencedColumns: ['stage_id']
          },
          {
            foreignKeyName: 'application_notes_stage_id_fkey'
            columns: ['stage_id']
            isOneToOne: false
            referencedRelation: 'pipeline_stages'
            referencedColumns: ['id']
          },
        ]
      }
      applications: {
        Row: {
          applicant_email: string | null
          applicant_id: string
          applied_at: string
          created_at: string
          current_stage_id: string | null
          form_data: Json | null
          id: string
          job_id: string
          rejected_at: string | null
          rejection_email_sent_at: string | null
          rejection_reason: string | null
          resume_file_id: string | null
          score: number | null
          status: Database['public']['Enums']['application_status']
          updated_at: string
        }
        Insert: {
          applicant_email?: string | null
          applicant_id: string
          applied_at?: string
          created_at?: string
          current_stage_id?: string | null
          form_data?: Json | null
          id?: string
          job_id: string
          rejected_at?: string | null
          rejection_email_sent_at?: string | null
          rejection_reason?: string | null
          resume_file_id?: string | null
          score?: number | null
          status?: Database['public']['Enums']['application_status']
          updated_at?: string
        }
        Update: {
          applicant_email?: string | null
          applicant_id?: string
          applied_at?: string
          created_at?: string
          current_stage_id?: string | null
          form_data?: Json | null
          id?: string
          job_id?: string
          rejected_at?: string | null
          rejection_email_sent_at?: string | null
          rejection_reason?: string | null
          resume_file_id?: string | null
          score?: number | null
          status?: Database['public']['Enums']['application_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'applications_applicant_id_fkey'
            columns: ['applicant_id']
            isOneToOne: false
            referencedRelation: 'applicants'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'applications_current_stage_id_fkey'
            columns: ['current_stage_id']
            isOneToOne: false
            referencedRelation: 'job_pipeline_stats'
            referencedColumns: ['stage_id']
          },
          {
            foreignKeyName: 'applications_current_stage_id_fkey'
            columns: ['current_stage_id']
            isOneToOne: false
            referencedRelation: 'pipeline_stages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'applications_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'job_pipeline_stats'
            referencedColumns: ['job_id']
          },
          {
            foreignKeyName: 'applications_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'applications_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs_with_stats'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'applications_resume_file_id_fkey'
            columns: ['resume_file_id']
            isOneToOne: false
            referencedRelation: 'applicant_files'
            referencedColumns: ['id']
          },
        ]
      }
      job_templates: {
        Row: {
          content: Json | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          experience_level: Database['public']['Enums']['experience_level'] | null
          id: string
          is_default: boolean | null
          job_type: Database['public']['Enums']['job_type'] | null
          location_type: Database['public']['Enums']['location_type'] | null
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          experience_level?: Database['public']['Enums']['experience_level'] | null
          id?: string
          is_default?: boolean | null
          job_type?: Database['public']['Enums']['job_type'] | null
          location_type?: Database['public']['Enums']['location_type'] | null
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          experience_level?: Database['public']['Enums']['experience_level'] | null
          id?: string
          is_default?: boolean | null
          job_type?: Database['public']['Enums']['job_type'] | null
          location_type?: Database['public']['Enums']['location_type'] | null
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'job_templates_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'job_templates_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organization_stats'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'job_templates_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      jobs: {
        Row: {
          application_form_id: string | null
          closed_at: string | null
          content: Json | null
          created_at: string
          created_by: string | null
          department: string | null
          experience_level: Database['public']['Enums']['experience_level'] | null
          hiring_manager_id: string | null
          id: string
          job_type: Database['public']['Enums']['job_type']
          location: string | null
          location_type: Database['public']['Enums']['location_type']
          organization_id: string
          pipeline_id: string | null
          published_at: string | null
          salary_max: number | null
          salary_min: number | null
          salary_type: Database['public']['Enums']['salary_type'] | null
          slug: string
          status: Database['public']['Enums']['job_status']
          title: string
          updated_at: string
        }
        Insert: {
          application_form_id?: string | null
          closed_at?: string | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          experience_level?: Database['public']['Enums']['experience_level'] | null
          hiring_manager_id?: string | null
          id?: string
          job_type?: Database['public']['Enums']['job_type']
          location?: string | null
          location_type?: Database['public']['Enums']['location_type']
          organization_id: string
          pipeline_id?: string | null
          published_at?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_type?: Database['public']['Enums']['salary_type'] | null
          slug: string
          status?: Database['public']['Enums']['job_status']
          title: string
          updated_at?: string
        }
        Update: {
          application_form_id?: string | null
          closed_at?: string | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          experience_level?: Database['public']['Enums']['experience_level'] | null
          hiring_manager_id?: string | null
          id?: string
          job_type?: Database['public']['Enums']['job_type']
          location?: string | null
          location_type?: Database['public']['Enums']['location_type']
          organization_id?: string
          pipeline_id?: string | null
          published_at?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_type?: Database['public']['Enums']['salary_type'] | null
          slug?: string
          status?: Database['public']['Enums']['job_status']
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'jobs_application_form_id_fkey'
            columns: ['application_form_id']
            isOneToOne: false
            referencedRelation: 'application_forms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'jobs_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'jobs_hiring_manager_id_fkey'
            columns: ['hiring_manager_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'jobs_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organization_stats'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'jobs_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'jobs_pipeline_fk'
            columns: ['pipeline_id']
            isOneToOne: false
            referencedRelation: 'pipelines'
            referencedColumns: ['id']
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database['public']['Enums']['member_role']
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database['public']['Enums']['member_role']
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database['public']['Enums']['member_role']
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organization_invitations_invited_by_fkey'
            columns: ['invited_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_invitations_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organization_stats'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'organization_invitations_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: Database['public']['Enums']['member_role']
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: Database['public']['Enums']['member_role']
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: Database['public']['Enums']['member_role']
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organization_members_invited_by_fkey'
            columns: ['invited_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_members_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organization_stats'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'organization_members_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          duration_days: number | null
          id: string
          name: string
          pipeline_id: string
          stage_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          name: string
          pipeline_id: string
          stage_order: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          id?: string
          name?: string
          pipeline_id?: string
          stage_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pipeline_stages_pipeline_id_fkey'
            columns: ['pipeline_id']
            isOneToOne: false
            referencedRelation: 'pipelines'
            referencedColumns: ['id']
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_template: boolean | null
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean | null
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pipelines_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pipelines_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organization_stats'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'pipelines_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'saved_jobs_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'job_pipeline_stats'
            referencedColumns: ['job_id']
          },
          {
            foreignKeyName: 'saved_jobs_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'saved_jobs_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs_with_stats'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'saved_jobs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      applications_detailed: {
        Row: {
          applicant_avatar: string | null
          applicant_email: string | null
          applicant_email_from_profile: string | null
          applicant_headline: string | null
          applicant_id: string | null
          applicant_linkedin: string | null
          applicant_location: string | null
          applicant_name: string | null
          applied_at: string | null
          created_at: string | null
          current_stage_color: string | null
          current_stage_id: string | null
          current_stage_name: string | null
          current_stage_order: number | null
          form_data: Json | null
          id: string | null
          job_department: string | null
          job_id: string | null
          job_location: string | null
          job_slug: string | null
          job_title: string | null
          organization_id: string | null
          organization_name: string | null
          organization_slug: string | null
          parsed_resume_data: Json | null
          rejected_at: string | null
          rejection_email_sent_at: string | null
          rejection_reason: string | null
          resume_file_id: string | null
          resume_file_name: string | null
          resume_storage_path: string | null
          score: number | null
          status: Database['public']['Enums']['application_status'] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'applications_applicant_id_fkey'
            columns: ['applicant_id']
            isOneToOne: false
            referencedRelation: 'applicants'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'applications_current_stage_id_fkey'
            columns: ['current_stage_id']
            isOneToOne: false
            referencedRelation: 'job_pipeline_stats'
            referencedColumns: ['stage_id']
          },
          {
            foreignKeyName: 'applications_current_stage_id_fkey'
            columns: ['current_stage_id']
            isOneToOne: false
            referencedRelation: 'pipeline_stages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'applications_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'job_pipeline_stats'
            referencedColumns: ['job_id']
          },
          {
            foreignKeyName: 'applications_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'applications_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs_with_stats'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'applications_resume_file_id_fkey'
            columns: ['resume_file_id']
            isOneToOne: false
            referencedRelation: 'applicant_files'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'jobs_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organization_stats'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'jobs_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      job_pipeline_stats: {
        Row: {
          application_count: number | null
          job_id: string | null
          pipeline_id: string | null
          stage_color: string | null
          stage_id: string | null
          stage_name: string | null
          stage_order: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'jobs_pipeline_fk'
            columns: ['pipeline_id']
            isOneToOne: false
            referencedRelation: 'pipelines'
            referencedColumns: ['id']
          },
        ]
      }
      jobs_with_stats: {
        Row: {
          active_applications: number | null
          application_form_id: string | null
          closed_at: string | null
          content: Json | null
          created_at: string | null
          created_by: string | null
          department: string | null
          experience_level: Database['public']['Enums']['experience_level'] | null
          hiring_manager_id: string | null
          id: string | null
          job_type: Database['public']['Enums']['job_type'] | null
          location: string | null
          location_type: Database['public']['Enums']['location_type'] | null
          new_applications: number | null
          organization_id: string | null
          organization_logo: string | null
          organization_name: string | null
          organization_slug: string | null
          pipeline_id: string | null
          published_at: string | null
          salary_max: number | null
          salary_min: number | null
          salary_type: Database['public']['Enums']['salary_type'] | null
          slug: string | null
          status: Database['public']['Enums']['job_status'] | null
          title: string | null
          total_applications: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'jobs_application_form_id_fkey'
            columns: ['application_form_id']
            isOneToOne: false
            referencedRelation: 'application_forms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'jobs_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'jobs_hiring_manager_id_fkey'
            columns: ['hiring_manager_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'jobs_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organization_stats'
            referencedColumns: ['organization_id']
          },
          {
            foreignKeyName: 'jobs_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'jobs_pipeline_fk'
            columns: ['pipeline_id']
            isOneToOne: false
            referencedRelation: 'pipelines'
            referencedColumns: ['id']
          },
        ]
      }
      organization_stats: {
        Row: {
          active_jobs: number | null
          closed_jobs: number | null
          draft_jobs: number | null
          hired_applications: number | null
          interviewing_applications: number | null
          new_applications: number | null
          offered_applications: number | null
          organization_id: string | null
          rejected_applications: number | null
          reviewing_applications: number | null
          total_applications: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invitation: { Args: { invite_token: string }; Returns: string }
      add_external_job_to_tracker: {
        Args: {
          p_company_name: string
          p_job_title: string
          p_job_url?: string
          p_location?: string
          p_location_type?: Database['public']['Enums']['location_type']
          p_source?: Database['public']['Enums']['tracker_source']
        }
        Returns: string
      }
      apply_to_job: {
        Args: {
          p_form_data?: Json
          p_job_id: string
          p_resume_file_id?: string
        }
        Returns: string
      }
      cleanup_expired_invitations: { Args: never; Returns: number }
      clone_pipeline: {
        Args: {
          p_as_template?: boolean
          p_new_name?: string
          p_source_pipeline_id: string
        }
        Returns: string
      }
      close_job: { Args: { p_job_id: string }; Returns: undefined }
      create_default_pipeline: {
        Args: { p_organization_id: string }
        Returns: string
      }
      create_job_from_template: {
        Args: {
          p_organization_id: string
          p_slug?: string
          p_template_id: string
          p_title: string
        }
        Returns: string
      }
      create_organization: {
        Args: { org_name: string; org_slug?: string }
        Returns: string
      }
      ensure_applicant_profile: { Args: never; Returns: string }
      generate_slug: { Args: { input_text: string }; Returns: string }
      get_invitation_by_token: {
        Args: { invite_token: string }
        Returns: {
          accepted_at: string
          email: string
          expires_at: string
          id: string
          organization_id: string
          organization_name: string
          role: Database['public']['Enums']['member_role']
        }[]
      }
      get_job_applications_kanban: {
        Args: { p_job_id: string }
        Returns: {
          applicant_avatar: string
          applicant_email: string
          applicant_headline: string
          applicant_id: string
          applicant_name: string
          application_id: string
          applied_at: string
          score: number
          stage_color: string
          stage_id: string
          stage_name: string
          stage_order: number
          status: Database['public']['Enums']['application_status']
        }[]
      }
      get_my_organizations: {
        Args: never
        Returns: {
          joined_at: string
          organization_id: string
          organization_logo: string
          organization_name: string
          organization_slug: string
          role: Database['public']['Enums']['member_role']
        }[]
      }
      get_org_role: {
        Args: { org_id: string }
        Returns: Database['public']['Enums']['member_role']
      }
      get_pending_rejection_emails: {
        Args: { p_organization_id: string }
        Returns: {
          applicant_email: string
          applicant_name: string
          application_id: string
          job_title: string
          rejected_at: string
        }[]
      }
      get_pipeline_with_stages: {
        Args: { p_pipeline_id: string }
        Returns: {
          is_template: boolean
          pipeline_description: string
          pipeline_id: string
          pipeline_name: string
          stage_color: string
          stage_description: string
          stage_duration_days: number
          stage_id: string
          stage_name: string
          stage_order: number
        }[]
      }
      get_public_job: {
        Args: { p_job_slug: string; p_org_slug: string }
        Returns: {
          application_form_id: string
          content: Json
          department: string
          experience_level: Database['public']['Enums']['experience_level']
          id: string
          job_type: Database['public']['Enums']['job_type']
          location: string
          location_type: Database['public']['Enums']['location_type']
          organization_id: string
          organization_logo: string
          organization_name: string
          published_at: string
          salary_max: number
          salary_min: number
          salary_type: Database['public']['Enums']['salary_type']
          slug: string
          title: string
        }[]
      }
      get_public_jobs: {
        Args: { p_org_slug: string }
        Returns: {
          department: string
          experience_level: Database['public']['Enums']['experience_level']
          id: string
          job_type: Database['public']['Enums']['job_type']
          location: string
          location_type: Database['public']['Enums']['location_type']
          published_at: string
          salary_max: number
          salary_min: number
          salary_type: Database['public']['Enums']['salary_type']
          slug: string
          title: string
        }[]
      }
      get_tracker_stats: {
        Args: never
        Returns: {
          applied: number
          interviewing: number
          offers: number
          rejected: number
          saved: number
          total: number
          upcoming_steps: number
        }[]
      }
      has_org_role: {
        Args: {
          org_id: string
          required_role: Database['public']['Enums']['member_role']
        }
        Returns: boolean
      }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      mark_rejection_email_sent: {
        Args: { p_application_id: string }
        Returns: undefined
      }
      move_application_to_stage: {
        Args: { p_application_id: string; p_stage_id: string }
        Returns: undefined
      }
      publish_job: { Args: { p_job_id: string }; Returns: undefined }
      reject_application: {
        Args: { p_application_id: string; p_reason?: string }
        Returns: undefined
      }
      reorder_pipeline_stages: {
        Args: { p_pipeline_id: string; p_stage_ids: string[] }
        Returns: undefined
      }
      save_job_to_tracker: { Args: { p_job_id: string }; Returns: string }
      search_public_jobs: {
        Args: {
          p_experience_level?: Database['public']['Enums']['experience_level']
          p_job_type?: Database['public']['Enums']['job_type']
          p_limit?: number
          p_location_type?: Database['public']['Enums']['location_type']
          p_offset?: number
          p_query?: string
        }
        Returns: {
          department: string
          experience_level: Database['public']['Enums']['experience_level']
          id: string
          job_type: Database['public']['Enums']['job_type']
          location: string
          location_type: Database['public']['Enums']['location_type']
          organization_id: string
          organization_logo: string
          organization_name: string
          organization_slug: string
          published_at: string
          salary_max: number
          salary_min: number
          salary_type: Database['public']['Enums']['salary_type']
          slug: string
          title: string
        }[]
      }
      set_default_resume: { Args: { p_file_id: string }; Returns: undefined }
      toggle_saved_job: { Args: { p_job_id: string }; Returns: boolean }
      update_tracker_status: {
        Args: {
          p_entry_id: string
          p_new_status: Database['public']['Enums']['tracker_status']
          p_note?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      application_status: 'new' | 'reviewing' | 'interviewing' | 'offered' | 'hired' | 'rejected' | 'withdrawn'
      experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
      file_type: 'resume' | 'cover_letter' | 'portfolio' | 'other'
      job_status: 'draft' | 'published' | 'closed' | 'archived'
      job_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'temporary' | 'volunteer'
      location_type: 'remote' | 'onsite' | 'hybrid'
      member_role: 'owner' | 'admin' | 'member'
      salary_type: 'hourly' | 'monthly' | 'yearly'
      tracker_source: 'platform' | 'external' | 'referral' | 'recruiter'
      tracker_status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'accepted' | 'withdrawn'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: ['new', 'reviewing', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn'],
      experience_level: ['entry', 'mid', 'senior', 'lead', 'executive'],
      file_type: ['resume', 'cover_letter', 'portfolio', 'other'],
      job_status: ['draft', 'published', 'closed', 'archived'],
      job_type: ['full_time', 'part_time', 'contract', 'internship', 'temporary', 'volunteer'],
      location_type: ['remote', 'onsite', 'hybrid'],
      member_role: ['owner', 'admin', 'member'],
      salary_type: ['hourly', 'monthly', 'yearly'],
      tracker_source: ['platform', 'external', 'referral', 'recruiter'],
      tracker_status: ['saved', 'applied', 'interviewing', 'offer', 'rejected', 'accepted', 'withdrawn'],
    },
  },
} as const
