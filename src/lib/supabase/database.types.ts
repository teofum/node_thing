export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string | null;
          price_at_time: number;
          shader_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          price_at_time: number;
          shader_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          price_at_time?: number;
          shader_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_shader_id_fkey";
            columns: ["shader_id"];
            isOneToOne: false;
            referencedRelation: "shaders";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string | null;
          id: string;
          order_id: string;
          price: number;
          shader_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          order_id: string;
          price: number;
          shader_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          order_id?: string;
          price?: number;
          shader_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_shader_id_fkey";
            columns: ["shader_id"];
            isOneToOne: false;
            referencedRelation: "shaders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string | null;
          id: string;
          status: string;
          total_amount: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          status?: string;
          total_amount: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          status?: string;
          total_amount?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          cancelled: boolean | null;
          id: string;
          is_premium: boolean | null;
          subscription_id: string | null;
          username: string;
        };
        Insert: {
          cancelled?: boolean | null;
          id: string;
          is_premium?: boolean | null;
          subscription_id?: string | null;
          username: string;
        };
        Update: {
          cancelled?: boolean | null;
          id?: string;
          is_premium?: boolean | null;
          subscription_id?: string | null;
          username?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          created_at: string | null;
          data: Json;
          id: string;
          name: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          data: Json;
          id?: string;
          name?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          data?: Json;
          id?: string;
          name?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      purchases: {
        Row: {
          id: string;
          order_id: string;
          purchased_at: string | null;
          shader_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          purchased_at?: string | null;
          shader_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          purchased_at?: string | null;
          shader_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchases_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchases_shader_id_fkey";
            columns: ["shader_id"];
            isOneToOne: false;
            referencedRelation: "shaders";
            referencedColumns: ["id"];
          },
        ];
      };
      ratings: {
        Row: {
          comment: string | null;
          created_at: string | null;
          id: string;
          rating: number | null;
          shader_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          rating?: number | null;
          shader_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          rating?: number | null;
          shader_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ratings_shader_id_fkey";
            columns: ["shader_id"];
            isOneToOne: false;
            referencedRelation: "shaders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ratings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      shaders: {
        Row: {
          average_rating: number | null;
          category_id: number;
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          node_config: Json | null;
          price: number;
          published: boolean | null;
          rating_count: number | null;
          step: number | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          average_rating?: number | null;
          category_id: number;
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          node_config?: Json | null;
          price: number;
          published?: boolean | null;
          rating_count?: number | null;
          step?: number | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          average_rating?: number | null;
          category_id?: number;
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          node_config?: Json | null;
          price?: number;
          published?: boolean | null;
          rating_count?: number | null;
          step?: number | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_shaders_category_id";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_shaders_user_id";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      checkout_cart: {
        Args: { user_uuid: string };
        Returns: string;
      };
      finish_payment: {
        Args: { order_uuid: string; user_uuid: string };
        Returns: boolean;
      };
      get_user_email_by_username: {
        Args: { username_param: string };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
