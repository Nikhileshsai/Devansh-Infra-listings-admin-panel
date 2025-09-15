import { PropertyType, Amenity } from './types';

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'plot', label: 'Plot / Land' },
  { value: 'flat', label: 'Flat' },
  { value: 'villa', label: 'Villa' },
  { value: 'house', label: 'House' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'agricultural', label: 'Agricultural Land' },
  { value: 'others', label: 'Others' },
];

// Define base amenities for reuse
const facilities = {
  clubhouse: { name: 'Modern Clubhouse', icon: 'apartment' },
  pool: { name: 'Swimming Pool', icon: 'pool' },
  gym: { name: 'Gymnasium', icon: 'fitness_center' },
  power: { name: 'Power Backup', icon: 'power' },
  parking: { name: 'Car Parking', icon: 'local_parking' },
  lift: { name: 'Lift', icon: 'elevator' },
  water: { name: 'Water Supply', icon: 'water_drop' },
};

const recreation = {
  playground: { name: 'Playing Ground', icon: 'sports_soccer' },
  garden: { name: 'Rooftop Garden', icon: 'grass' },
  kidsArea: { name: 'Kids Play Area', icon: 'child_friendly' },
  track: { name: 'Jogging Track', icon: 'directions_run' },
  amphitheatre: { name: 'Amphitheatre', icon: 'theaters' },
};

const safety = {
  security: { name: '24/7 Security', icon: 'shield' },
  cctv: { name: 'CCTV Surveillance', icon: 'videocam' },
  gated: { name: 'Gated Community', icon: 'gite' },
  fire: { name: 'Fire Safety', icon: 'fire_extinguisher' },
};

// Create a unified set of amenities for residential properties like flats and villas
const residentialAmenities = {
  facilities: [facilities.clubhouse, facilities.pool, facilities.gym, facilities.power, facilities.parking, facilities.lift, facilities.water],
  recreation: [recreation.playground, recreation.garden, recreation.kidsArea, recreation.track],
  safety: [safety.security, safety.cctv, safety.gated, safety.fire],
};


// Define amenities tailored for each property type
export const AMENITIES_BY_TYPE: Partial<Record<PropertyType, Record<string, Amenity[]>>> = {
  plot: {
    facilities: [facilities.water],
    recreation: [recreation.playground, recreation.track],
    safety: [safety.gated, safety.security],
  },
  flat: residentialAmenities,
  villa: residentialAmenities,
  house: residentialAmenities,
  commercial: {
    facilities: [facilities.power, facilities.parking, facilities.lift, facilities.water],
    safety: [safety.security, safety.cctv, safety.fire],
  }
};

// Combine and deduplicate amenities for 'others' type
const allAmenitiesSources = [
    AMENITIES_BY_TYPE.plot,
    AMENITIES_BY_TYPE.flat,
    AMENITIES_BY_TYPE.villa,
    AMENITIES_BY_TYPE.house,
    AMENITIES_BY_TYPE.commercial,
].filter(Boolean) as Record<string, Amenity[]>[];

const combineAndDedupe = (category: string) => {
    const combined = allAmenitiesSources.flatMap(source => source[category] || []);
    return Array.from(new Map(combined.map(item => [item.name, item])).values());
};

AMENITIES_BY_TYPE.others = {
    facilities: combineAndDedupe('facilities'),
    recreation: combineAndDedupe('recreation'),
    safety: combineAndDedupe('safety'),
};
