import { motion } from 'framer-motion'

const SOURCE_COLORS = {
  PubMed: { bg: 'rgba(219,234,254,0.6)', color: '#1d4ed8' },
  OpenAlex: { bg: 'rgba(237,233,254,0.6)', color: '#6d28d9' },
}

export default function ResearchCard({ pub, index }) {
  const authors = pub.authors?.slice(0, 3).join(', ') || 'Unknown authors'
  const hasMore = (pub.authors?.length || 0) > 3
  const sourceStyle = SOURCE_COLORS[pub.source] || { bg: 'var(--color-skeleton)', color: 'var(--color-text-secondary)' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card flex flex-col gap-3"
      style={{ transition: 'box-shadow 0.2s' }}
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
          {pub.title || 'Untitled'}
        </h3>
        <span
          className="text-xs font-medium px-2 py-1 rounded-lg shrink-0"
          style={{ backgroundColor: sourceStyle.bg, color: sourceStyle.color }}
        >
          {pub.source}
        </span>
      </div>

      <p
        className="text-xs leading-relaxed"
        style={{
          color: 'var(--color-text-secondary)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {pub.summary || 'No abstract available.'}
      </p>

      <div
        className="flex items-center justify-between pt-2"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <span>{authors}{hasMore ? ' et al.' : ''}</span>
          {pub.year && (
            <span style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}> · {pub.year}</span>
          )}
        </div>
        {pub.url && (
          <a
            href={pub.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary flex items-center gap-1"
            style={{ textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >
            View
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        )}
      </div>
    </motion.div>
  )
}
