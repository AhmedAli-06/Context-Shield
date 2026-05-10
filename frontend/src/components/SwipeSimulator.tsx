import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

interface SwipeSimulatorProps {
  assets: Array<{ id: string; name: string; asset_type: string }>
}

interface SwipeResult {
  decision: string
  reason?: string
  trust_score: number
  anomaly_score: number
  feature_vector: {
    project_score: number
    temporal_score: number
    baseline_score: number
    history_score: number
    anomaly_score: number
  }
  session_id?: string
  ghost_detected: boolean
  ghost_reason?: string
}

export function SwipeSimulator({ assets }: SwipeSimulatorProps) {
  const [result, setResult] = useState<SwipeResult | null>(null)
  const [loading, setLoading] = useState(false)

  const simulateSwipe = async (assetId: string) => {
    setLoading(true)
    setResult(null)

    try {
      const token = localStorage.getItem('cs_token')
      const response = await axios.post(
        `${API_URL}/access/simulate-swipe/${assetId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setResult(response.data)
    } catch (error: any) {
      toast.error('Swipe failed')
      setResult({
        decision: 'error',
        reason: error.response?.data?.detail || 'Failed to process swipe',
        trust_score: 0,
        anomaly_score: 0,
        feature_vector: {
          project_score: 0,
          temporal_score: 0,
          baseline_score: 0,
          history_score: 0,
          anomaly_score: 0,
        },
        ghost_detected: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'granted':
        return 'text-green-400'
      case 'advisory':
        return 'text-yellow-400'
      case 'denied':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-cyan-400 font-bold mb-2">Badge Swipe Simulator</h3>
        <p className="text-gray-500 text-sm">No assets available for simulation.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-4">
      <h3 className="text-cyan-400 font-bold">Badge Swipe Simulator</h3>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => simulateSwipe(assets[0]?.id)}
          disabled={loading || !assets[0]}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-sm font-medium"
        >
          Simulate Normal Swipe (Day Shift)
        </button>
        <button
          onClick={() => simulateSwipe(assets[1]?.id || assets[0]?.id)}
          disabled={loading || !assets[0]}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-sm font-medium"
        >
          Simulate Suspicious Swipe (Wrong Asset)
        </button>
      </div>

      {result && (
        <div className="bg-gray-800 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Decision:</span>
            <span className={`text-xl font-bold ${getDecisionColor(result.decision)}`}>
              {result.decision?.toUpperCase()}
            </span>
          </div>

          {result.reason && (
            <div className="text-sm text-gray-400">
              <span className="text-gray-500">Reason:</span> {result.reason}
            </div>
          )}

          {result.ghost_detected && (
            <div className="bg-red-900/30 border border-red-700 rounded p-2">
              <span className="text-red-400 font-semibold">Ghost Access Detected!</span>
              <p className="text-red-300 text-sm">{result.ghost_reason}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Trust Score:</span>
              <span
                className={
                  result.trust_score >= 0.7
                    ? 'text-green-400'
                    : result.trust_score >= 0.4
                      ? 'text-yellow-400'
                      : 'text-red-400'
                }
              >
                {result.trust_score.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Anomaly Score:</span>
              <span className={result.anomaly_score > 0.6 ? 'text-red-400' : 'text-gray-300'}>
                {result.anomaly_score.toFixed(3)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-2">
            <p className="text-gray-500 text-xs mb-1">Feature Vector:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Project:</span>
                <span>{result.feature_vector?.project_score?.toFixed(2) ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Temporal:</span>
                <span>{result.feature_vector?.temporal_score?.toFixed(2) ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Baseline:</span>
                <span>{result.feature_vector?.baseline_score?.toFixed(2) ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">History:</span>
                <span>{result.feature_vector?.history_score?.toFixed(2) ?? '-'}</span>
              </div>
            </div>
          </div>

          {result.session_id && (
            <div className="text-xs text-gray-500">Session ID: {result.session_id}</div>
          )}
        </div>
      )}

      <p className="text-gray-600 text-xs">
        Use the simulator to test the trust scoring system. Normal swipes during business hours
        should grant access. Off-hours or out-of-scope access should trigger alerts.
      </p>
    </div>
  )
}
