import type { LocationType } from '@/types/map'

const OPTIONS: LocationType[] = ['settlement', 'other']

interface TypeSegmentProps {
  value: LocationType
  onChange: (type: LocationType) => void
}

export function TypeSegment({ value, onChange }: TypeSegmentProps) {
  return (
    <div
      style={{
        display: 'flex',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid #ccc',
        marginBottom: '14px',
      }}
    >
      {OPTIONS.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            flex: 1,
            padding: '5px 0',
            fontSize: '12px',
            border: 'none',
            cursor: opt === value ? 'default' : 'pointer',
            background: opt === value ? '#2c3e50' : 'white',
            color: opt === value ? 'white' : '#555',
            textTransform: 'capitalize',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
