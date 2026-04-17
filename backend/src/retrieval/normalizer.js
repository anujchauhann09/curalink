/**
 * Normalizer — converts raw results from all three sources into a unified schema
 *
 * Unified publication shape:
 * { title, summary, year, authors, source, url, type: 'publication', citationCount }
 *
 * Unified trial shape:
 * { title, summary, year, authors, source, url, type: 'trial', status, eligibility, locations, contact }
 */

const normalizePublication = (raw, source) => ({
  title: clean(raw.title),
  summary: clean(raw.abstract),
  year: raw.year || null,
  authors: raw.authors || [],
  source,
  url: raw.url || null,
  type: 'publication',
  citationCount: raw.citationCount || 0,
});

const normalizeTrial = (raw) => ({
  title: clean(raw.title),
  summary: clean(raw.summary),
  year: raw.startDate ? parseInt(raw.startDate.split('-')[0]) : null,
  authors: [],
  source: 'ClinicalTrials.gov',
  url: raw.url || null,
  type: 'trial',
  status: raw.status || null,
  phase: raw.phase || null,
  eligibility: clean(raw.eligibility),
  locations: raw.locations || [],
  contact: raw.contact || null,
  nctId: raw.nctId || null,
});

// normalize all results from all three retrievers into unified arrays
const normalizeAll = ({ pubmed, openAlex, trials }) => {
  const publications = [
    ...pubmed.map((r) => normalizePublication(r, 'PubMed')),
    ...openAlex.map((r) => normalizePublication(r, 'OpenAlex')),
  ];

  const normalizedTrials = trials.map(normalizeTrial);

  return { publications, trials: normalizedTrials };
};

const clean = (str) => (str || '').replace(/\s+/g, ' ').trim();

module.exports = { normalizeAll, normalizePublication, normalizeTrial };
