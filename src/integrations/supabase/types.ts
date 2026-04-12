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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      backup_artists: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          bio: string | null
          website: string | null
          social_handle: string | null
          aviation_connection: boolean | null
          aviation_description: string | null
          waitlist_position: number
          status: string
          assigned_grid_cell: string | null
          promoted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          bio?: string | null
          website?: string | null
          social_handle?: string | null
          aviation_connection?: boolean | null
          aviation_description?: string | null
          waitlist_position: number
          status?: string
          assigned_grid_cell?: string | null
          promoted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          bio?: string | null
          website?: string | null
          social_handle?: string | null
          aviation_connection?: boolean | null
          aviation_description?: string | null
          waitlist_position?: number
          status?: string
          assigned_grid_cell?: string | null
          promoted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_assigned_grid_cell"
            columns: ["assigned_grid_cell"]
            isOneToOne: false
            referencedRelation: "grid_assignments"
            referencedColumns: ["grid_cell"]
          },
        ]
      }
      artist_posts: {
        Row: {
          approved: boolean | null
          artist_id: string
          caption: string | null
          created_at: string
          grid_cell: string
          id: string
          media_type: string
          media_url: string
        }
        Insert: {
          approved?: boolean | null
          artist_id: string
          caption?: string | null
          created_at?: string
          grid_cell: string
          id?: string
          media_type?: string
          media_url: string
        }
        Update: {
          approved?: boolean | null
          artist_id?: string
          caption?: string | null
          created_at?: string
          grid_cell?: string
          id?: string
          media_type?: string
          media_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_posts_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          avatar_url: string | null
          aviation_connection: boolean | null
          aviation_description: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          social_handle: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          aviation_connection?: boolean | null
          aviation_description?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          social_handle?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          aviation_connection?: boolean | null
          aviation_description?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          social_handle?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      email_reminders: {
        Row: {
          artist_id: string
          email_type: string
          id: string
          sent_at: string
          status: string
        }
        Insert: {
          artist_id: string
          email_type: string
          id?: string
          sent_at?: string
          status?: string
        }
        Update: {
          artist_id?: string
          email_type?: string
          id?: string
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_reminders_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      grid_assignments: {
        Row: {
          artist_id: string | null
          assigned_at: string | null
          created_at: string
          grid_cell: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["grid_status"]
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          assigned_at?: string | null
          created_at?: string
          grid_cell: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["grid_status"]
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          assigned_at?: string | null
          created_at?: string
          grid_cell?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["grid_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grid_assignments_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          grid_cell: string
          id: string
          new_status: Database["public"]["Enums"]["grid_status"]
          old_status: Database["public"]["Enums"]["grid_status"] | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          grid_cell: string
          id?: string
          new_status: Database["public"]["Enums"]["grid_status"]
          old_status?: Database["public"]["Enums"]["grid_status"] | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          grid_cell?: string
          id?: string
          new_status?: Database["public"]["Enums"]["grid_status"]
          old_status?: Database["public"]["Enums"]["grid_status"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      grid_status: "registered" | "picked_up" | "dropped_off"
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
      grid_status: ["registered", "picked_up", "dropped_off"],
    },
  },
} as const
