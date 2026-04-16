const PathIcon = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" style={{ flexShrink: 0 }}>
    <circle cx="3" cy="13" r="2.2" fill={color} />
    <circle cx="13" cy="3" r="2.2" fill={color} />
    <path d="M3 13 C3 7, 8 7, 13 3" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
)

interface PathLabelPopoverProps {
  label: string
  color: string
  pixel: { x: number; y: number }
  onClose: () => void
}

export function PathLabelPopover({ label, color, pixel, onClose }: PathLabelPopoverProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: pixel.x,
        top: pixel.y - 8,
        transform: 'translate(-50%, -100%)',
        zIndex: 10,
        background: '#2c3e50',
        color: 'white',
        borderRadius: '6px',
        padding: '8px 12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      <PathIcon color={color} />
      <strong>{label}</strong>
      <button
        onPointerDown={e => { e.stopPropagation(); onClose(); }}
        title="Close"
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          padding: 0,
          pointerEvents: 'all',
        }}
      >
        ×
      </button>
    </div>
  )
}
