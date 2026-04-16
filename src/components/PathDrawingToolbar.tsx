const BTN: React.CSSProperties = {
  background: 'rgba(44,62,80,0.85)',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '6px 10px',
  fontSize: '12px',
  cursor: 'pointer',
  backdropFilter: 'blur(4px)',
  whiteSpace: 'nowrap',
}

const BTN_DISABLED: React.CSSProperties = {
  ...BTN,
  opacity: 0.4,
  cursor: 'not-allowed',
}

interface PathDrawingToolbarProps {
  isDrawingPath: boolean
  nodeCount: number
  onStartDrawing: () => void
  onFinishPath: () => void
  onCancelPath: () => void
}

export function PathDrawingToolbar({
  isDrawingPath,
  nodeCount,
  onStartDrawing,
  onFinishPath,
  onCancelPath,
}: PathDrawingToolbarProps) {
  const BASE: React.CSSProperties = {
    position: 'absolute',
    top: '52px',
    left: '10px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  }

  if (!isDrawingPath) {
    return (
      <div style={BASE}>
        <button style={BTN} onClick={onStartDrawing}>
          Draw Path
        </button>
      </div>
    )
  }

  return (
    <div style={BASE}>
      <span style={{ color: 'white', fontSize: '12px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
      </span>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          style={nodeCount >= 2 ? BTN : BTN_DISABLED}
          disabled={nodeCount < 2}
          onClick={onFinishPath}
        >
          Finish
        </button>
        <button style={BTN} onClick={onCancelPath}>
          Cancel
        </button>
      </div>
    </div>
  )
}
