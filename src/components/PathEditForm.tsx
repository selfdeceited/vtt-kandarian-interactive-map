import { useState } from 'react'
import type { Path } from '@/types/map'

const INPUT_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: '4px',
  padding: '6px 8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '14px',
  boxSizing: 'border-box',
}

interface PathEditFormProps {
  path: Path
  onSave: (updated: Path) => void
  onDelete: (pathId: string) => void
  onCancel: () => void
}

export function PathEditForm({ path, onSave, onDelete, onCancel }: PathEditFormProps) {
  const [label, setLabel] = useState(path.label)
  const [link, setLink] = useState(path.link ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    onSave({ ...path, label: label.trim(), link: link.trim() || undefined })
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        background: 'white',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        minWidth: '280px',
        fontFamily: 'sans-serif',
      }}
    >
      <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#888' }}>Edit path</p>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: '#333' }}>
          Name *
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            autoFocus
            required
            style={INPUT_STYLE}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '14px', fontSize: '13px', color: '#333' }}>
          Link
          <input
            type="url"
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="https://..."
            style={INPUT_STYLE}
          />
        </label>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => onDelete(path.id)}
            style={{
              padding: '6px 12px',
              background: '#c0392b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Delete path
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                background: 'white',
                fontSize: '13px',
                color: '#333',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!label.trim()}
              style={{
                padding: '6px 12px',
                background: label.trim() ? '#2c3e50' : '#aaa',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: label.trim() ? 'pointer' : 'not-allowed',
                fontSize: '13px',
              }}
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
