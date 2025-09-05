
export type PropertyType = 'plot' | 'flat' | 'villa' | 'commercial' | 'agricultural';
export type Language = 'en' | 'te';

export interface Amenity {
  name: string;
  icon: string;
}

export interface PlotDetails {
  area_sq_yards: number;
  plot_number?: string;
  road_facing?: string;
  survey_no?: string;
  gated_community?: boolean;
  amenities: Amenity[];
  investment_features?: string;
  connectivity?: string;
  brochure_url?: string;
}

export interface FlatDetails {
  bhk: number;
  floor: number;
  total_floors: number;
  sq_ft: number;
  car_parking?: boolean;
  furnishing?: 'Full' | 'Semi' | 'None';
  amenities: Amenity[];
  connectivity?: string;
  brochure_url?: string;
}

export interface VillaDetails extends Omit<FlatDetails, 'floor' | 'total_floors'> {
  private_pool?: boolean;
}

export interface CommercialDetails {
  sq_ft: number;
  property_type: 'Office' | 'Shop' | 'Showroom';
  floor?: number;
  amenities: Amenity[];
  connectivity?: string;
  brochure_url?: string;
}

export interface AgriculturalDetails {
  acres: number;
  survey_no?: string;
  water_source?: 'Borewell' | 'Canal' | 'River';
  investment_features?: string;
  connectivity?: string;
  brochure_url?: string;
}

export type ListingDetails = PlotDetails | FlatDetails | VillaDetails | CommercialDetails | AgriculturalDetails;

export interface Listing {
  id: number;
  slug: string;
  type: PropertyType;
  location: string;
  price: number;
  image_urls: string[];
  map_embed?: string;
  details: ListingDetails;
  created_at: string;
}

export interface ListingTranslation {
    id?: number;
    listing_id: number;
    title: string;
    description: string;
}

export interface ListingTranslationTelugu {
    id?: number;
    listing_id: number;
    title: string;
    description: string;
}

// For form data
export interface ListingFormData {
    id?: number;
    type: PropertyType;
    location: string;
    price: string;
    image_urls: string[];
    new_images?: File[];
    map_embed: string;
    details: any;
    en_title: string;
    en_description: string;
    te_title: string;
    te_description: string;
}

export interface Blog {
    id: number;
    slug: string;
    title: string;
    description: string;
    cover_image?: string;
    created_at: string;
    updated_at: string;
}

export interface BlogTranslation {
    id?: number;
    blog_id: number;
    title: string;
    description: string;
}

export interface BlogFormData {
    id?: number;
    cover_image: string;
    en_title: string;
    en_description: string;
    te_title: string;
    te_description: string;
    te_translation_id?: number;
}