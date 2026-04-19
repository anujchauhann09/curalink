import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InputForm from '../components/InputForm'
import ResultsSection from '../components/ResultsSection'
import ChatThread from '../components/ChatThread'
import ChatInput from '../components/ChatInput'
import { sendMessage } from '../services/api'

export default function Home() {
  const [phase, setPhase] = useState('search')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [activeResult, setActiveResult] = useState(null)
  const [turns, setTurns] = useState([])

  const submit = async (payload) => {
    setLoading(true)
    setError(null)
    const userMessage = payload.query || payload.disease
    setTurns((prev) => [...prev, { userMessage, response: null }])

    try {
      const data = await sendMessage(payload)
      setSessionId(data.sessionId)
      setActiveResult(data)
      setTurns((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { userMessage, response: data.response }
        return updated
      })
      if (phase === 'search') setPhase('chat')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch research. Please try again.')
      setTurns((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setPhase('search')
    setTurns([])
    setActiveResult(null)
    setSessionId(null)
    setError(null)
  }

  return (
    <div
      style={{
        height: 'calc(100vh - 56px)',
        height: 'calc(100dvh - 56px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AnimatePresence mode="wait">
        {phase === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '2.5rem 1rem 2.5rem',
              overflowY: 'auto',
            }}
          >
            <div style={{ width: '100%', maxWidth: '640px' }} className="space-y-8">
              <div className="text-center">
                <h1
                  className="text-2xl sm:text-4xl font-semibold tracking-tight"
                  style={{ color: 'var(--color-text-primary)', lineHeight: 1.25 }}
                >
                  Research-backed insights,
                  <br />
                  <span className="text-primary">powered by AI.</span>
                </h1>
                <p
                  className="mt-3 text-sm leading-relaxed mx-auto"
                  style={{ color: 'var(--color-text-secondary)', maxWidth: '420px' }}
                >
                  Enter a disease and your question. CuraLink retrieves and synthesizes
                  the latest research papers and clinical trials for you.
                </p>
              </div>

              <InputForm onSubmit={submit} loading={loading} />

              {error && (
                <div
                  className="p-4 rounded-xl text-sm flex items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(254,226,226,0.8)',
                    border: '1px solid rgba(252,165,165,0.5)',
                    color: '#dc2626',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            style={{ flex: 1, display: 'flex', overflow: 'hidden' }}
          >
            <div
              className="hidden lg:flex flex-col"
              style={{
                width: '500px',
                flexShrink: 0,
                borderRight: '1px solid var(--color-border)',
                overflowY: 'auto',
              }}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Research Results
                  </h2>
                  <button
                    onClick={handleReset}
                    className="text-xs transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#2563EB'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                  >
                    ← New search
                  </button>
                </div>
                {activeResult && <ResultsSection data={activeResult} />}
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div
                className="lg:hidden flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  CuraLink Chat
                </span>
                <button
                  onClick={handleReset}
                  className="text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ← New search
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }} className="sm:px-6">
                <ChatThread turns={turns} loading={loading} />
              </div>

              {error && (
                <div
                  className="mx-4 mb-2 p-3 rounded-xl text-xs"
                  style={{
                    backgroundColor: 'rgba(254,226,226,0.8)',
                    border: '1px solid rgba(252,165,165,0.5)',
                    color: '#dc2626',
                  }}
                >
                  {error}
                </div>
              )}

              <ChatInput onSend={(q) => submit({ query: q, sessionId })} loading={loading} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
