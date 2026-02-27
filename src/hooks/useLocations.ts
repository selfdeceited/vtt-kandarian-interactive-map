import { useState, useCallback, useEffect, useRef } from 'react'
import type { Location } from '@/types/map'

const SILO_UUID = '8ee3d1ad-fe62-4ac5-9838-8b1ccbccac89'
const PUBLIC_URL = `/api/jsonsilo/public/${SILO_UUID}`
const MANAGE_URL = `/api/jsonsilo/api/v1/manage/${SILO_UUID}`

async function fetchLocations(): Promise<Location[]> {
  const res = await fetch(PUBLIC_URL)
  if (!res.ok) throw new Error(`Failed to fetch locations: ${res.status}`)
  const data: unknown = await res.json()
  if (!Array.isArray(data)) throw new Error('Unexpected response shape')
  return data as Location[]
}

async function persistLocations(locations: Location[]): Promise<void> {
  const res = await fetch(MANAGE_URL, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-MAN-API': import.meta.env.VITE_SILO_JSON_KEY,
    },
    body: JSON.stringify({ file_data: locations }),
  })
  if (!res.ok) throw new Error(`Failed to save locations: ${res.status}`)
}

export type LocationsStatus = 'loading' | 'ready' | 'error'

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [status, setStatus] = useState<LocationsStatus>('loading')
  const [isSyncing, setIsSyncing] = useState(false)
  const locationsRef = useRef<Location[]>([])

  useEffect(() => {
    let cancelled = false
    fetchLocations()
      .then(data => {
        if (!cancelled) {
          locationsRef.current = data
          setLocations(data)
          setStatus('ready')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => { cancelled = true }
  }, [])

  const persist = useCallback((next: Location[]) => {
    setIsSyncing(true)
    persistLocations(next)
      .catch(console.error)
      .finally(() => setIsSyncing(false))
  }, [])

  const addLocation = useCallback((location: Location) => {
    const next = [...locationsRef.current, location]
    locationsRef.current = next
    setLocations(next)
    persist(next)
  }, [persist])

  const deleteLocation = useCallback((id: string) => {
    const next = locationsRef.current.filter(l => l.id !== id)
    locationsRef.current = next
    setLocations(next)
    persist(next)
  }, [persist])

  const updateLocation = useCallback((updated: Location) => {
    const next = locationsRef.current.map(l => l.id === updated.id ? updated : l)
    locationsRef.current = next
    setLocations(next)
    persist(next)
  }, [persist])

  return { locations, status, isSyncing, addLocation, deleteLocation, updateLocation }
}
