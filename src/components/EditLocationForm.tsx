import { useState } from 'react'
import type { Location } from '@/types/map'

interface EditLocationFormProps {
  location: Location
  onSave: (updated: Location) => void
  onDelete: (id: string) => void
  onCancel: () => void
}

export function EditLocationForm({ location, onSave, onDelete, onCancel }: EditLocationFormProps) {
  const [label, setLabel] = useState(location.label)
  const [link, setLink] = useState(location.link)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    onSave({ ...location, label: label.trim(), link: link.trim() })
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
      <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#888' }}>
        Edit location
      </p>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: '#333' }}>
          Label *
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            autoFocus
            required
            style={{
              display: 'block',
              width: '100%',
              marginTop: '4px',
              padding: '6px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '14px', fontSize: '13px', color: '#333' }}>
          Link
          <input
            type="url"
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="https://..."
            style={{
              display: 'block',
              width: '100%',
              marginTop: '4px',
              padding: '6px 8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </label>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => onDelete(location.id)}
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
            Delete
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
