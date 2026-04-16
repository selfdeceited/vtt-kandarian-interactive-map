interface PathsToggleProps {
  showPaths: boolean
  onToggle: () => void
}

export function PathsToggle({ showPaths, onToggle }: PathsToggleProps) {
  return (
    <button
      onClick={onToggle}
      title={showPaths ? 'Hide paths' : 'Show paths'}
      style={{
        background: showPaths ? 'rgba(44,62,80,0.85)' : 'rgba(44,62,80,0.4)',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 10px',
        fontSize: '14px',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="13" height="13">
        <circle cx="3" cy="13" r="2" fill="currentColor" />
        <circle cx="13" cy="3" r="2" fill="currentColor" />
        <path d="M3 13 C3 7, 8 7, 13 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {!showPaths && (
          <line x1="1" y1="15" x2="15" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        )}
      </svg>
      Paths
    </button>
  )
}
