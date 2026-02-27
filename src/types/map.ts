export interface MapConfig {
  accessToken: string;
  center: [number, number];
  zoom: number;
  style: string | mapboxgl.Style;
}

export interface Location {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  label: string;
  link: string;
}
