import { useState, useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import type { RefObject } from 'react'
import type { Location } from '@/types/map'

interface AddLocationFormProps {
  mapRef: RefObject<mapboxgl.Map | null>
  coordinates: [number, number]
  onConfirm: (location: Location) => void
  onCancel: () => void
}

export function AddLocationForm({ mapRef, coordinates, onConfirm, onCancel }: AddLocationFormProps) {
  const [label, setLabel] = useState('')
  const [link, setLink] = useState('')

  // Ghost marker — shows the pin location while the form is open
  const ghostMarkerRef = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    ghostMarkerRef.current = new mapboxgl.Marker({ color: '#e67e22' })
      .setLngLat(coordinates)
      .addTo(map)

    return () => {
      ghostMarkerRef.current?.remove()
      ghostMarkerRef.current = null
    }
  }, [coordinates, mapRef])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    onConfirm({
      id: crypto.randomUUID(),
      coordinates,
      label: label.trim(),
      link: link.trim(),
    })
  }

  const coordDisplay = `${Math.abs(coordinates[1]).toFixed(4)}°${coordinates[1] >= 0 ? 'N' : 'S'}, ${Math.abs(coordinates[0]).toFixed(4)}°${coordinates[0] >= 0 ? 'E' : 'W'}`

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        background: 'white',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        minWidth: '280px',
        fontFamily: 'sans-serif',
      }}
    >
      <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#888' }}>
        New location at {coordDisplay}
      </p>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: '#333' }}>
          Label *
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            autoFocus
            required
            placeholder="e.g. The Iron Fortress"
            style={{
              display: 'block',
              width: '100%',
              marginTop: '4px',
              padding: '6px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '14px', fontSize: '13px', color: '#333' }}>
          Link
          <input
            type="url"
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="https://..."
            style={{
              display: 'block',
              width: '100%',
              marginTop: '4px',
              padding: '6px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </label>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '6px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              background: 'white',
              fontSize: '13px',
              color: '#333',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!label.trim()}
            style={{
              padding: '6px 12px',
              background: label.trim() ? '#2c3e50' : '#aaa',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: label.trim() ? 'pointer' : 'not-allowed',
              fontSize: '13px',
            }}
          >
            Add Location
          </button>
        </div>
      </form>
    </div>
  )
}
