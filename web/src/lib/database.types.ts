export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: number;
          title: string;
          author: string | null;
          price: number | null;
          description: string | null;
          image_url: string | null;
          published_at: string | null;
          is_preorder: boolean;
          kyobo_url: string | null;
          aladin_url: string | null;
          yes24_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['books']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['books']['Insert']>;
      };
    };
  };
}

export type BookRow = Database['public']['Tables']['books']['Row'];
