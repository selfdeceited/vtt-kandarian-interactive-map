import { useState } from 'react'
import type { PathNode } from '@/types/map'

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

interface NodeEditFormProps {
  node: PathNode
  pathId: string
  pathNodeCount: number
  onSave: (updated: PathNode) => void
  onDeleteNode: (nodeId: string, pathId: string) => void
  onDeletePath: (pathId: string) => void
  onCancel: () => void
}

export function NodeEditForm({
  node,
  pathId,
  pathNodeCount,
  onSave,
  onDeleteNode,
  onDeletePath,
  onCancel,
}: NodeEditFormProps) {
  const [label, setLabel] = useState(node.label ?? '')
  const [link, setLink] = useState(node.link ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...node,
      label: label.trim() || undefined,
      link: link.trim() || undefined,
    })
  }

  // A path needs at least 2 nodes; if only 2 remain, deleting one deletes the path
  const canDeleteNode = pathNodeCount > 2

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
      <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#888' }}>Edit path node</p>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: '#333' }}>
          Label
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            autoFocus
            placeholder="Optional label"
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
          <div style={{ display: 'flex', gap: '6px' }}>
            {canDeleteNode ? (
              <button
                type="button"
                onClick={() => onDeleteNode(node.id, pathId)}
                style={{
                  padding: '6px 10px',
                  background: '#c0392b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Delete node
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onDeletePath(pathId)}
              style={{
                padding: '6px 10px',
                background: '#7f1c1c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Delete path
            </button>
          </div>
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
              style={{
                padding: '6px 12px',
                background: '#2c3e50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
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
