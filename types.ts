export type PropertyType = 'plot' | 'flat' | 'villa' | 'house' | 'commercial' | 'agricultural' | 'others';
export type Language = 'en' | 'te';

export interface Amenity {
  name: string;
  icon: string;
}

// Base interfaces for common fields to reduce repetition
interface BasePropertyDetails {
    amenities: Amenity[];
    connectivity?: string;
    brochure_url?: string;
    youtube_embed_url?: string;
    note_en?: string;
    note_te?: string;
}

interface BaseListedEntityDetails extends BasePropertyDetails {
    construction_status?: 'Ready to Move' | 'Under Construction';
    listed_by?: 'Owner' | 'Agent' | 'Builder';
}

interface BaseResidentialDetails extends BaseListedEntityDetails {
    bhk: number;
    bath_rooms?: number;
    furnishing?: 'Full' | 'Semi' | 'None';
    super_built_up_area_sqft: number;
    carpet_area_sqft?: number;
    maintenance?: number;
    car_parking?: number; // 0 for none, 1, 2, etc.
    facing?: string;
    uds?: string;
    age_of_property_years?: number;
}


// Specific property type details
export interface HouseDetails extends BaseResidentialDetails {
    total_floors?: number;
    floor_no?: number;
}

export interface FlatDetails extends BaseResidentialDetails {
    total_floors: number;
    floor_no: number;
}

export interface VillaDetails extends BaseResidentialDetails {
    private_pool?: boolean;
    total_floors?: number; // A villa can have multiple floors
}

export interface CommercialDetails extends BaseListedEntityDetails {
    property_type: 'Office' | 'Shop' | 'Showroom';
    furnishing?: 'Full' | 'Semi' | 'None';
    super_built_up_area_sqft: number;
    carpet_area_sqft?: number;
    maintenance?: number;
    car_parking?: number;
    washrooms?: number;
}

export interface PlotDetails extends BasePropertyDetails {
    listed_by?: 'Owner' | 'Agent' | 'Builder';
    plot_area_sq_yards: number;
    length_ft?: number;
    breadth_ft?: number;
    facing?: string;
    survey_no?: string;
    gated_community?: boolean;
    investment_features?: string;
}

export interface AgriculturalDetails {
  acres: number;
  survey_no?: string;
  water_source?: 'Borewell' | 'Canal' | 'River';
  investment_features?: string;
  connectivity?: string;
  brochure_url?: string;
  youtube_embed_url?: string;
  note_en?: string;
  note_te?: string;
}

export interface OtherDetails {
  area: string; // Flexible area field
  amenities: Amenity[];
  investment_features?: string;
  connectivity?: string;
  brochure_url?: string;
  youtube_embed_url?: string;
  note_en?: string;
  note_te?: string;
}


export type ListingDetails = PlotDetails | FlatDetails | VillaDetails | HouseDetails | CommercialDetails | AgriculturalDetails | OtherDetails;

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

export interface FooterContent {
    id?: number;
    company_name: string;
    hero_subtitle_en: string;
    hero_subtitle_te: string;
    contact_us_title_en: string;
    contact_us_title_te: string;
    phone_number: string;
    email: string;
    company_address: string;
    follow_us_title_en: string;
    follow_us_title_te: string;
    instagram_url: string;
    facebook_url: string;
    youtube_url: string;
    copyright_notice_en: string;
    copyright_notice_te: string;
}

export interface HeroContent {
    id?: number;
    background_image_url: string;
    hero_title_en: string;
    hero_title_te: string;
    hero_subtitle_en: string;
    hero_subtitle_te: string;
}