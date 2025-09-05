import { PropertyType, Amenity } from './types';

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'plot', label: 'Plot' },
  { value: 'flat', label: 'Flat' },
  { value: 'villa', label: 'Villa' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'agricultural', label: 'Agricultural Land' },
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

// Define amenities tailored for each property type
export const AMENITIES_BY_TYPE: Partial<Record<PropertyType, Record<string, Amenity[]>>> = {
  plot: {
    facilities: [facilities.water],
    recreation: [recreation.playground, recreation.track],
    safety: [safety.gated, safety.security],
  },
  flat: {
    facilities: [facilities.clubhouse, facilities.pool, facilities.gym, facilities.power, facilities.parking, facilities.lift, facilities.water],
    recreation: [recreation.garden, recreation.kidsArea, recreation.track],
    safety: [safety.security, safety.cctv, safety.fire],
  },
  villa: {
    facilities: [facilities.clubhouse, facilities.pool, facilities.gym, facilities.power, facilities.parking, facilities.water],
    recreation: [recreation.garden, recreation.kidsArea, recreation.track, recreation.playground],
    safety: [safety.security, safety.cctv, safety.gated, safety.fire],
  },
  commercial: {
    facilities: [facilities.power, facilities.parking, facilities.lift, facilities.water],
    safety: [safety.security, safety.cctv, safety.fire],
  }
};
