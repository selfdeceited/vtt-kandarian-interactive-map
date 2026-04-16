export interface MapConfig {
  accessToken: string;
  center: [number, number];
  zoom: number;
  style: string | mapboxgl.Style;
}

export type LocationType = 'settlement' | 'other';

export interface Location {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  label: string;
  link: string;
  type: LocationType;
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

export interface PathNode {
  id: string;
  coordinates: [number, number];
  label?: string;
  link?: string;
}

export interface Path {
  id: string;
  nodes: PathNode[];
  label: string;
  link?: string;
}

export interface MapStore {
  map: string; // matches MapDefinition.id
  markers: Location[];
  paths?: Path[];
}
