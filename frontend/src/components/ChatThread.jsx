import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function UserBubble({ message }) {
  return (
    <div className="flex justify-end">
      <div
        className="text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm leading-relaxed"
        style={{
          backgroundColor: '#2563EB',
          color: '#ffffff',
          maxWidth: 'min(80%, 480px)',
          wordBreak: 'break-word',
        }}
      >
        {message}
      </div>
    </div>
  )
}

function AssistantBubble({ turn }) {
  const { response } = turn
  if (!response) return null

  return (
    <div className="flex justify-start">
      <div style={{ maxWidth: 'min(90%, 560px)', width: '100%' }} className="space-y-3">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(37,99,235,0.1)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            CuraLink
          </span>
        </div>

        {response.conditionOverview && (
          <div
            className="rounded-2xl rounded-tl-sm p-4"
            style={{ backgroundColor: 'var(--color-chat-bubble-ai)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Overview</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
              {response.conditionOverview}
            </p>
          </div>
        )}

        {response.researchInsights && (
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: 'var(--color-chat-bubble-ai)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Research Insights
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
              {response.researchInsights}
            </p>
          </div>
        )}

        {response.clinicalTrials && (
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: 'var(--color-chat-bubble-ai)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">Clinical Trials</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
              {response.clinicalTrials}
            </p>
          </div>
        )}

        {response.recommendation && (
          <div
            className="rounded-2xl p-4 border"
            style={{
              backgroundColor: 'var(--color-recommendation-bg)',
              borderColor: 'rgba(37,99,235,0.15)',
            }}
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">💡 Recommendation</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
              {response.recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatThread({ turns, loading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns, loading])

  return (
    <div className="flex flex-col gap-6 py-4 px-1 sm:px-2">
      <AnimatePresence initial={false}>
        {turns.map((turn, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <UserBubble message={turn.userMessage} />
            <AssistantBubble turn={turn} />
          </motion.div>
        ))}
      </AnimatePresence>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm pl-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{
                  backgroundColor: 'rgba(37,99,235,0.4)',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
          Researching...
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
