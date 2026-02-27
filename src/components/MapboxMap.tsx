import type { RefObject } from 'react'

// Required for map to render correctly
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapboxMapProps {
  containerRef: RefObject<HTMLDivElement | null>
  className?: string
}

export function MapboxMap({ containerRef, className }: MapboxMapProps) {
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
