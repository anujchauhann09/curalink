import { motion } from 'framer-motion'
import ResearchCard from './ResearchCard'
import TrialCard from './TrialCard'

function SectionHeader({ icon, title, count }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-lg" role="img" aria-hidden="true">{icon}</span>
      <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
      {count > 0 && (
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: 'var(--color-skeleton)', color: 'var(--color-text-secondary)' }}
        >
          {count}
        </span>
      )}
    </div>
  )
}

export default function ResultsSection({ data }) {
  const { response } = data
  const pubs = response?.sources?.filter(s => s.type === 'publication') || []
  const trls = response?.sources?.filter(s => s.type === 'trial') || []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 mt-4"
    >
      {response?.conditionOverview && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
          <SectionHeader icon="🧠" title="Condition Overview" />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
            {response.conditionOverview}
          </p>
        </motion.div>
      )}

      {response?.researchInsights && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <SectionHeader icon="📋" title="Research Insights" />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
            {response.researchInsights}
          </p>
        </motion.div>
      )}

      {pubs.length > 0 && (
        <div>
          <SectionHeader icon="📚" title="Research Papers" count={pubs.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pubs.map((pub, i) => <ResearchCard key={pub.url || i} pub={pub} index={i} />)}
          </div>
        </div>
      )}

      {response?.clinicalTrials && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <SectionHeader icon="🧪" title="Clinical Trials Insights" />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
            {response.clinicalTrials}
          </p>
        </motion.div>
      )}

      {trls.length > 0 && (
        <div>
          <SectionHeader icon="🔬" title="Clinical Trials" count={trls.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trls.map((trial, i) => <TrialCard key={trial.url || i} trial={trial} index={i} />)}
          </div>
        </div>
      )}

      {response?.recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
          style={{
            border: '1px solid rgba(37,99,235,0.15)',
            backgroundColor: 'var(--color-recommendation-bg)',
          }}
        >
          <SectionHeader icon="💡" title="Personalized Recommendation" />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
            {response.recommendation}
          </p>
          <p
            className="text-xs mt-3 pt-3"
            style={{ color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)' }}
          >
            ⚠️ AI-generated research assistance. Always consult a qualified medical professional.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
