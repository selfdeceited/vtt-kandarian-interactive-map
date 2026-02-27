interface EditModeToggleProps {
  isEditMode: boolean
  onToggle: () => void
}

export function EditModeToggle({ isEditMode, onToggle }: EditModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      title={isEditMode ? 'Exit edit mode' : 'Enter edit mode — click the map to add locations'}
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        padding: '8px 14px',
        background: isEditMode ? '#c0392b' : '#2c3e50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontFamily: 'sans-serif',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        transition: 'background 0.15s',
      }}
    >
      {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
    </button>
  )
}
