import { useState, useCallback, useEffect, useRef } from 'react'
import type { Location, LocationType, MapStore } from '@/types/map'

function normaliseMarker(m: unknown): Location {
  const loc = m as Record<string, unknown>
  return {
    id: loc.id as string,
    coordinates: loc.coordinates as [number, number],
    label: loc.label as string,
    link: (loc.link as string) ?? '',
    type: (['settlement', 'other'].includes(loc.type as string) ? loc.type : 'other') as LocationType,
  }
}

const SILO_UUID = '8ee3d1ad-fe62-4ac5-9838-8b1ccbccac89'
const PUBLIC_URL = `/api/jsonsilo/public/${SILO_UUID}`
const MANAGE_URL = `/api/jsonsilo/api/v1/manage/${SILO_UUID}`

async function fetchStore(): Promise<MapStore[]> {
  const res = await fetch(PUBLIC_URL)
  if (!res.ok) throw new Error(`Failed to fetch store: ${res.status}`)
  const data: unknown = await res.json()
  if (!Array.isArray(data)) return []
  // Legacy flat Location[] — migrate to MapStore[] under 'kandarian'
  if (data.length === 0 || !('map' in data[0])) {
    return [{ map: 'kandarian', markers: data.map(normaliseMarker) }]
  }
  return (data as MapStore[]).map(s => ({ ...s, markers: s.markers.map(normaliseMarker) }))
}

async function persistStore(store: MapStore[]): Promise<void> {
  const res = await fetch(MANAGE_URL, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-MAN-API': import.meta.env.VITE_SILO_JSON_KEY,
    },
    body: JSON.stringify({ file_data: store }),
  })
  if (!res.ok) throw new Error(`Failed to save store: ${res.status}`)
}

function getMarkers(store: MapStore[], mapId: string): Location[] {
  return store.find(s => s.map === mapId)?.markers ?? []
}

function setMarkers(store: MapStore[], mapId: string, markers: Location[]): MapStore[] {
  const exists = store.some(s => s.map === mapId)
  if (exists) {
    return store.map(s => s.map === mapId ? { ...s, markers } : s)
  }
  return [...store, { map: mapId, markers }]
}

export type LocationsStatus = 'loading' | 'ready' | 'error'

export function useLocations(mapId: string) {
  const [store, setStore] = useState<MapStore[]>([])
  const [status, setStatus] = useState<LocationsStatus>('loading')
  const [isSyncing, setIsSyncing] = useState(false)
  const storeRef = useRef<MapStore[]>([])

  useEffect(() => {
    let cancelled = false
    fetchStore()
      .then(data => {
        if (!cancelled) {
          storeRef.current = data
          setStore(data)
          setStatus('ready')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => { cancelled = true }
  }, [])

  const persist = useCallback((next: MapStore[]) => {
    setIsSyncing(true)
    persistStore(next)
      .catch(console.error)
      .finally(() => setIsSyncing(false))
  }, [])

  const addLocation = useCallback((location: Location) => {
    const current = getMarkers(storeRef.current, mapId)
    const next = setMarkers(storeRef.current, mapId, [...current, location])
    storeRef.current = next
    setStore(next)
    persist(next)
  }, [mapId, persist])

  const deleteLocation = useCallback((id: string) => {
    const current = getMarkers(storeRef.current, mapId)
    const next = setMarkers(storeRef.current, mapId, current.filter(l => l.id !== id))
    storeRef.current = next
    setStore(next)
    persist(next)
  }, [mapId, persist])

  const updateLocation = useCallback((updated: Location) => {
    const current = getMarkers(storeRef.current, mapId)
    const next = setMarkers(storeRef.current, mapId, current.map(l => l.id === updated.id ? updated : l))
    storeRef.current = next
    setStore(next)
    persist(next)
  }, [mapId, persist])

  const locations = getMarkers(store, mapId)

  return { locations, status, isSyncing, addLocation, deleteLocation, updateLocation }
}
