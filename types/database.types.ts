export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      filming_locations: {
        Row: {
          created_at: string | null
          episode: string | null
          filming_date: string | null
          id: string
          location_id: string | null
          notes: string | null
          production_id: string | null
          scene_description: string | null
          season: number | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          episode?: string | null
          filming_date?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          production_id?: string | null
          scene_description?: string | null
          season?: number | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          episode?: string | null
          filming_date?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          production_id?: string | null
          scene_description?: string | null
          season?: number | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "filming_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "filming_locations_full"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "filming_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filming_locations_production_id_fkey"
            columns: ["production_id"]
            isOneToOne: false
            referencedRelation: "filming_locations_full"
            referencedColumns: ["production_id"]
          },
          {
            foreignKeyName: "filming_locations_production_id_fkey"
            columns: ["production_id"]
            isOneToOne: false
            referencedRelation: "productions"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          caption: string | null
          created_at: string | null
          filming_location_id: string | null
          id: string
          source: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          filming_location_id?: string | null
          id?: string
          source?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          filming_location_id?: string | null
          id?: string
          source?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_filming_location_id_fkey"
            columns: ["filming_location_id"]
            isOneToOne: false
            referencedRelation: "filming_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "images_filming_location_id_fkey"
            columns: ["filming_location_id"]
            isOneToOne: false
            referencedRelation: "filming_locations_full"
            referencedColumns: ["filming_location_id"]
          },
        ]
      }
      locations: {
        Row: {
          accessibility: string | null
          address: string | null
          city: string | null
          country: string
          created_at: string | null
          description: string | null
          google_place_id: string | null
          id: string
          latitude: number | null
          location_type: string | null
          longitude: number | null
          name: string
          state_province: string | null
          updated_at: string | null
        }
        Insert: {
          accessibility?: string | null
          address?: string | null
          city?: string | null
          country: string
          created_at?: string | null
          description?: string | null
          google_place_id?: string | null
          id?: string
          latitude?: number | null
          location_type?: string | null
          longitude?: number | null
          name: string
          state_province?: string | null
          updated_at?: string | null
        }
        Update: {
          accessibility?: string | null
          address?: string | null
          city?: string | null
          country?: string
          created_at?: string | null
          description?: string | null
          google_place_id?: string | null
          id?: string
          latitude?: number | null
          location_type?: string | null
          longitude?: number | null
          name?: string
          state_province?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          filming_location_id: string | null
          id: string
          parent_id: string | null
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          filming_location_id?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          filming_location_id?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_filming_location_id_fkey"
            columns: ["filming_location_id"]
            isOneToOne: false
            referencedRelation: "filming_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_filming_location_id_fkey"
            columns: ["filming_location_id"]
            isOneToOne: false
            referencedRelation: "filming_locations_full"
            referencedColumns: ["filming_location_id"]
          },
          {
            foreignKeyName: "posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      productions: {
        Row: {
          backdrop_url: string | null
          created_at: string | null
          description: string | null
          genres: string[] | null
          id: string
          imdb_id: string | null
          poster_url: string | null
          release_year: number | null
          title: string
          tmdb_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          backdrop_url?: string | null
          created_at?: string | null
          description?: string | null
          genres?: string[] | null
          id?: string
          imdb_id?: string | null
          poster_url?: string | null
          release_year?: number | null
          title: string
          tmdb_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          backdrop_url?: string | null
          created_at?: string | null
          description?: string | null
          genres?: string[] | null
          id?: string
          imdb_id?: string | null
          poster_url?: string | null
          release_year?: number | null
          title?: string
          tmdb_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_by: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_by?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_by?: string | null
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      filming_locations_full: {
        Row: {
          accessibility: string | null
          address: string | null
          backdrop_url: string | null
          city: string | null
          country: string | null
          episode: string | null
          filming_date: string | null
          filming_location_created_at: string | null
          filming_location_id: string | null
          genres: string[] | null
          google_place_id: string | null
          image_count: number | null
          imdb_id: string | null
          latitude: number | null
          location_description: string | null
          location_id: string | null
          location_name: string | null
          location_type: string | null
          longitude: number | null
          notes: string | null
          post_count: number | null
          poster_url: string | null
          production_description: string | null
          production_id: string | null
          production_title: string | null
          production_type: string | null
          release_year: number | null
          scene_description: string | null
          season: number | null
          state_province: string | null
          tmdb_id: string | null
          verified: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const