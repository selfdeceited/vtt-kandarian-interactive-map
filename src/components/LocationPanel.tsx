import type { Location } from '@/types/map'

// Navbar height of the embedded wiki site (vtt-kandarian-world-info.vercel.app)
// We shift the iframe up by this amount so the fixed navbar is clipped above the container.
const NAVBAR_HEIGHT = 60

interface LocationPanelProps {
  location: Location
  onClose: () => void
}

export function LocationPanel({ location, onClose }: LocationPanelProps) {
  return (
    <>
      <style>{`
        .location-panel {
          position: absolute;
          top: 20px;
          right: 20px;
          bottom: 20px;
          width: 480px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        }
        @media (max-width: 519px) {
          .location-panel {
            right: 8px;
            width: calc(100vw - 16px);
          }
        }
      `}</style>
    <div className="location-panel">
      {/* Panel header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: '#2c3e50',
          color: 'white',
          fontFamily: 'sans-serif',
          fontSize: '14px',
          flexShrink: 0,
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
            fontSize: '18px',
            lineHeight: 1,
            padding: '0 4px',
          }}
        >
          ×
        </button>
      </div>

      {/* iframe container — overflow hidden clips the navbar shifted above the top edge */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {location.link ? (
          <iframe
            src={location.link}
            style={{
              width: '100%',
              // Taller than the container by NAVBAR_HEIGHT so content fills the space after shifting up
              height: `calc(100% + ${NAVBAR_HEIGHT}px)`,
              border: 'none',
              display: 'block',
              // Shift up so the fixed navbar is above the clipping boundary
              marginTop: -NAVBAR_HEIGHT,
            }}
            title={location.label}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#888',
              fontFamily: 'sans-serif',
              fontSize: '13px',
            }}
          >
            No link provided for this location.
          </div>
        )}
      </div>
    </div>
    </>
  )
}
