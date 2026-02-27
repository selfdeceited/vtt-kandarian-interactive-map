import { MapboxMap } from '@/components/MapboxMap'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <MapboxMap
        config={{
          center: [-75.97, 42.187],
          zoom: 6,
          style: { version: 8, sources: {}, layers: [] },
        }}
      />
    </div>
  )
}

export default App
