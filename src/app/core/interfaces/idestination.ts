export interface IDestination {
  id: number;
  slug: string;
  tours_count: number;
  parent_id: number;
  display_order: number;
  global: boolean;
  enabled: boolean;
  featured: boolean;
  banner: string;
  featured_image: string;
  gallery: string[];
  title: string;
  description: string;
}
