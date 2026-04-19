import { motion } from 'framer-motion'

const STATUS_STYLES = {
  RECRUITING: { bg: 'rgba(16,185,129,0.1)', color: '#059669' },
  NOT_YET_RECRUITING: { bg: 'rgba(245,158,11,0.1)', color: '#b45309' },
  ACTIVE_NOT_RECRUITING: { bg: 'rgba(37,99,235,0.1)', color: '#1d4ed8' },
  COMPLETED: { bg: 'var(--color-skeleton)', color: 'var(--color-text-secondary)' },
}

export default function TrialCard({ trial, index }) {
  const statusStyle = STATUS_STYLES[trial.status] || STATUS_STYLES.COMPLETED
  const locations = trial.locations?.slice(0, 2).join(', ') || 'Location not specified'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card flex flex-col gap-3"
      style={{
        borderLeft: '4px solid #10B981',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className="text-sm font-semibold leading-snug flex-1"
          style={{
            color: 'var(--color-text-primary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {trial.title || 'Untitled Trial'}
        </h3>
        <span
          className="text-xs font-medium px-2 py-1 rounded-lg shrink-0"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
        >
          {trial.status?.replace(/_/g, ' ') || 'Unknown'}
        </span>
      </div>

      {trial.summary && (
        <p
          className="text-xs leading-relaxed"
          style={{
            color: 'var(--color-text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {trial.summary}
        </p>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span style={{ wordBreak: 'break-word' }}>{locations}</span>
        </div>

        {trial.phase && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
            </svg>
            Phase: {trial.phase}
          </div>
        )}

        {trial.contact?.email && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span style={{ wordBreak: 'break-all' }}>{trial.contact.email}</span>
          </div>
        )}
      </div>

      {trial.url && (
        <div className="pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          <a
            href={trial.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-accent flex items-center gap-1"
            style={{ textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >
            View Trial
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      )}
    </motion.div>
  )
}
