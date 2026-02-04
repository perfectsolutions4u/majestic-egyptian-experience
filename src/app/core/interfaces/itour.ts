export interface Itour {
  id: number;
  display_order: number;
  slug: string;
  code: string;
  reviews_number: number;
  adult_price: number;
  child_price: number;
  infant_price: number;
  pricing_groups: PricingGroup[];
  enabled: boolean;
  featured: boolean;
  featured_image: string;
  gallery: string[];
  duration_in_days: number;
  start_from: number;
  calender_availability: CalenderAvailability;
  rate: number;
  overview_text: string;
  title: string;
  overview: string;
  highlights: any;
  excluded: string;
  included: string;
  duration: string;
  type: string;
  run: string;
  pickup_time: string;
  destinations: Destination[];
  categories: Category[];
  reviews: any[];
  days?: TourDay[];
  options?: Option[];
}

export interface Option {
  id: number;
  name: string;
  description: string;
  adult_price: number;
  child_price: number;
  pricing_groups?: PricingGroup[];
}

export interface TourDay {
  id: number;
  title: string;
  description: string;
  tour_id: number;
  translations?: any[];
  days?: any[];
  safeDescription?: any; // For sanitized HTML
}

export interface PricingGroup {
  from: number;
  to: number;
  price: number;
  child_price: number;
}

export interface CalenderAvailability {
  day_numbers: any[];
  day_names: any[];
  month_names: any[];
  years: any[];
}

export interface Destination {
  id: number;
  slug: string;
  tours_count: number;
  parent_id: any;
  display_order: number;
  global: boolean;
  enabled: boolean;
  featured: boolean;
  banner: any;
  featured_image: any;
  gallery: any;
  title: string;
  description: string;
  pivot: Pivot;
}

export interface Pivot {
  tour_id: number;
  destination_id: number;
}

export interface Category {
  id: number;
  slug: string;
  tours_count: number;
  parent_id: any;
  display_order: number;
  enabled: boolean;
  featured: boolean;
  banner: any;
  featured_image: string;
  gallery: any;
  title: string;
  description: string;
  pivot: Pivot2;
}

export interface Pivot2 {
  tour_id: number;
  category_id: number;
}
