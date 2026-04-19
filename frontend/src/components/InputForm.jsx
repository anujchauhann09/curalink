import { useState } from 'react'
import { motion } from 'framer-motion'

export default function InputForm({ onSubmit, loading }) {
  const [disease, setDisease] = useState('')
  const [location, setLocation] = useState('')
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!disease.trim()) return
    onSubmit({ disease, location, query })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card"
    >
      <div className="mb-5">
        <h2
          className="text-lg sm:text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Start your research
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Enter a disease and your question to get research-backed insights.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Disease <span className="text-red-400">*</span>
            </label>
            <input
              className="input-field"
              placeholder="e.g. Lung Cancer"
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
              disabled={loading}
              required
              autoComplete="off"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Location
            </label>
            <input
              className="input-field"
              placeholder="e.g. India"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Your Question
          </label>
          <input
            className="input-field"
            placeholder="e.g. latest treatment options"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !disease.trim()}
          className="btn-primary w-full sm:w-auto"
        >
          {loading ? (
            <>
              <span
                className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}
              />
              Researching...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Search Research
            </>
          )}
        </button>
      </form>
    </motion.div>
  )
}
