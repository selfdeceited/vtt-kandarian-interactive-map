import type mapboxgl from 'mapbox-gl'

export interface MapConfig {
  accessToken: string
  center: [number, number]
  zoom: number
  style: string | mapboxgl.Style
}

export interface MarkerData {
  id: string
  coordinates: [number, number]
  label: string
  description?: string
}
