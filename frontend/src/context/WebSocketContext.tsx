import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

interface WebSocketContextValue {
  status: ConnectionStatus
  sendMessage: (data: unknown) => void
  lastMessage: unknown | null
}

const WebSocketContext = createContext<WebSocketContextValue>(null!)

export const useWebSocket = () => useContext(WebSocketContext)

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live'
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [lastMessage, setLastMessage] = useState<unknown>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const retryCountRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setStatus('connecting')

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('connected')
        retryCountRef.current = 0
      }

      ws.onclose = () => {
        setStatus('disconnected')
        wsRef.current = null

        // Exponential backoff reconnection
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = Math.pow(2, retryCountRef.current) * BASE_DELAY_MS
          console.log(`WebSocket disconnected. Reconnecting in ${delay}ms (attempt ${retryCountRef.current + 1}/${MAX_RETRIES})...`)
          reconnectTimeoutRef.current = setTimeout(() => {
            retryCountRef.current++
            connect()
          }, delay)
        } else {
          console.error(`WebSocket failed to reconnect after ${MAX_RETRIES} attempts`)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)
        } catch {
          setLastMessage(event.data)
        }
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      setStatus('disconnected')
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  const sendMessage = useCallback((data: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ status, sendMessage, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  )
}