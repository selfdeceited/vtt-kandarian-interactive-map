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

export interface MapDefinition {
  id: string;
  label: string;
  imageUrl: string;
  imageCoordinates: [
    [number, number],
    [number, number],
    [number, number],
    [number, number],
  ];
  center: [number, number];
  zoom: number;
}

export interface MapStore {
  map: string; // matches MapDefinition.id
  markers: Location[];
}
