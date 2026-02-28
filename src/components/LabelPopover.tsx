import type { Location } from '@/types/map'

interface LabelPopoverProps {
  location: Location
  pixel: { x: number; y: number } | null
  onClose: () => void
}

export function LabelPopover({ location, pixel, onClose }: LabelPopoverProps) {
  const style: React.CSSProperties = pixel
    ? {
        position: 'absolute',
        left: pixel.x,
        top: pixel.y - 8,
        transform: 'translate(-50%, -100%)',
        zIndex: 10,
      }
    : {
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
      }

  return (
    <div
      style={{
        ...style,
        background: '#2c3e50',
        color: 'white',
        borderRadius: '6px',
        padding: '8px 12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        whiteSpace: 'nowrap',
      }}
    >
      <strong>{location.label}</strong>
      <button
        onClick={onClose}
        title="Close"
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}
