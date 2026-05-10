import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Key, Plus, Trash2, Copy, Check, RefreshCw, Shield } from 'lucide-react'
import { getApiKeys, createApiKey, deleteApiKey } from '../api'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { SkeletonTable } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'

interface ApiKey {
  id: string
  name: string
  prefix?: string
  key?: string
  scopes?: string
  is_active: boolean
  created_at: string
  last_used_at?: string
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newScopes, setNewScopes] = useState('read')
  const [creating, setCreating] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    getApiKeys()
      .then(r => setKeys(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await createApiKey(newName, newScopes)
      const fullKey = res.data?.key || res.data?.api_key || ''
      setCreatedKey(fullKey)
      toast.success('API key created!')
      setNewName('')
      load()
    } catch {
      toast.error('Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteApiKey(deleteId)
      toast.success('API key deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete API key')
    }
  }

  const copyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={item}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>API Keys</h2>
            <p>Manage programmatic access keys ({keys.length} keys)</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost btn-sm" onClick={load}>
              <RefreshCw size={13} /> Refresh
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={14} /> Create Key
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div className="card" variants={item}>
        <div className="card-header">
          <h3>API Keys</h3>
          <span style={{ fontSize: '12px', color: 'var(--stone)' }}>
            {keys.filter(k => k.is_active).length} active
          </span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <SkeletonTable rows={4} />
          ) : keys.length === 0 ? (
            <EmptyState
              icon={Key}
              title="No API keys"
              description="Create your first API key to integrate with external systems."
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Prefix</th>
                    <th>Scopes</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Last Used</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map(k => (
                    <tr key={k.id}>
                      <td style={{ fontWeight: 500, color: 'var(--charcoal)' }}>{k.name}</td>
                      <td>
                        <code
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            color: 'var(--ash)',
                          }}
                        >
                          {k.prefix || '—'}
                        </code>
                      </td>
                      <td>
                        <span className="badge">
                          <span
                            className="badge-dot"
                            style={{ background: 'var(--accent-blue)' }}
                          />
                          {k.scopes || 'read'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${k.is_active ? 'allow' : 'denied'}`}>
                          <span className="badge-dot" />
                          {k.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--stone)' }}>
                        {new Date(k.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--stone)' }}>
                        {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => setDeleteId(k.id)}
                          style={{ color: 'var(--accent-red)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false)
          setCreatedKey(null)
        }}
        title="Create API Key"
      >
        {createdKey ? (
          <div>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--accent-yellow)',
                marginBottom: 'var(--space-lg)',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <Shield size={14} /> Copy this key now — you won't see it again!
            </p>
            <div className="api-key-display">
              <code>{createdKey}</code>
              <button className="btn btn-ghost btn-sm" onClick={copyKey}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 'var(--space-xl)' }}
              onClick={() => {
                setShowCreate(false)
                setCreatedKey(null)
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="form-group">
              <label>Key name</label>
              <input
                className="form-input"
                placeholder="e.g. CI/CD Integration"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Scopes</label>
              <select
                className="form-input"
                value={newScopes}
                onChange={e => setNewScopes(e.target.value)}
              >
                <option value="read">Read only</option>
                <option value="read,write">Read & Write</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 'var(--space-lg)' }}
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
            >
              {creating ? 'Creating...' : 'Generate Key'}
            </button>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete API Key">
        <p style={{ fontSize: '13px', color: 'var(--ash)', marginBottom: 'var(--space-xl)' }}>
          This will permanently revoke this API key. Any services using it will lose access.
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{
              background: 'var(--accent-red)',
              color: 'white',
              borderColor: 'var(--accent-red)',
            }}
            onClick={handleDelete}
          >
            Delete Key
          </button>
        </div>
      </Modal>
    </motion.div>
  )
}
