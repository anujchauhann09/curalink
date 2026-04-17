const axios = require('axios');

const BASE_URL = 'https://api.openalex.org/works';
const PER_PAGE = 50; // fetch 2 pages = 100 results

/**
 * OpenAlex Retriever — fetches two pages in parallel for depth
 * uses relevance sort for page 1, date sort for page 2 to get both
 * most relevant and most recent results in the candidate pool
 */
const fetch = async (query) => {
  try {
    const [relevancePage, recentPage] = await Promise.all([
      fetchPage(query, 1, 'relevance_score:desc'),
      fetchPage(query, 2, 'publication_date:desc'),
    ]);

    // deduplicate by OpenAlex ID
    const seen = new Set();
    return [...relevancePage, ...recentPage].filter((r) => {
      if (seen.has(r.openAlexId)) return false;
      seen.add(r.openAlexId);
      return true;
    });
  } catch (err) {
    console.warn('[OpenAlex] Retrieval failed:', err.message);
    return [];
  }
};

const fetchPage = async (query, page, sort) => {
  const res = await axios.get(BASE_URL, {
    params: {
      search: query,
      'per-page': PER_PAGE,
      page,
      sort,
      'filter': 'from_publication_date:2015-01-01', // last 10 years for recency
    },
    headers: { 'User-Agent': 'Curalink/1.0 (medical-research-assistant)' },
    timeout: 15000,
  });

  return (res.data?.results || []).map(parseWork);
};

const parseWork = (work) => {
  const authors = (work.authorships || [])
    .map((a) => a.author?.display_name)
    .filter(Boolean)
    .slice(0, 5);

  return {
    title: work.title || '',
    abstract: work.abstract_inverted_index ? reconstructAbstract(work.abstract_inverted_index) : '',
    year: work.publication_year || null,
    authors,
    openAlexId: work.id,
    url: work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : work.id,
    source: 'OpenAlex',
    citationCount: work.cited_by_count || 0,
  };
};

/**
 * OpenAlex stores abstracts as inverted index { word: [positions] }
 * reconstruct into readable text
 */
const reconstructAbstract = (invertedIndex) => {
  if (!invertedIndex) return '';
  const words = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) words[pos] = word;
  }
  return words.filter(Boolean).join(' ');
};

module.exports = { fetch };
