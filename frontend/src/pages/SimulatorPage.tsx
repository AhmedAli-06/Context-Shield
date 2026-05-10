import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SwipeSimulator } from '../components/SwipeSimulator'
import { getAssets } from '../api'

interface Asset {
  id: string
  name: string
  asset_type: string
  location?: string
  criticality?: string
}

export default function SimulatorPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAssets()
      .then(r => {
        setAssets(r.data || [])
      })
      .catch(() => {
        setAssets([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-4xl mx-auto">
      <div className="page-header mb-6">
        <h2 className="text-2xl font-bold text-white">Badge Swipe Simulator</h2>
        <p className="text-gray-400">Test the trust scoring system with simulated badge swipes</p>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading assets...</div>
      ) : (
        <SwipeSimulator assets={assets} />
      )}

      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-cyan-400 font-semibold mb-2">How It Works</h3>
        <ul className="text-gray-400 text-sm space-y-2">
          <li>• The simulator tests badge swipes against the trust scoring engine</li>
          <li>
            • <span className="text-green-400">Normal access</span> (day shift, on-project) →
            Granted
          </li>
          <li>
            • <span className="text-yellow-400">Marginal access</span> (late hours, partial project
            match) → Advisory
          </li>
          <li>
            • <span className="text-red-400">Suspicious access</span> (off-hours, out-of-scope,
            ghost access) → Denied
          </li>
          <li>• Alerts are created automatically for low trust scores</li>
        </ul>
      </div>
    </motion.div>
  )
}
