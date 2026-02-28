import type { MapDefinition } from '@/types/map'

interface MapSwitcherPanelProps {
  maps: MapDefinition[]
  activeMapId: string
  onSelect: (mapId: string) => void
}

export function MapSwitcherPanel({ maps, activeMapId, onSelect }: MapSwitcherPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '10px',
        transform: 'translateY(-50%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontFamily: 'sans-serif',
      }}
    >
      {maps.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          title={m.label}
          style={{
            padding: '8px 14px',
            background: m.id === activeMapId ? '#2c3e50' : 'rgba(44,62,80,0.55)',
            color: 'white',
            border: m.id === activeMapId ? '2px solid white' : '2px solid transparent',
            borderRadius: '4px',
            cursor: m.id === activeMapId ? 'default' : 'pointer',
            fontSize: '13px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            transition: 'background 0.15s, border-color 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
