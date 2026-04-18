// response parser — extracts structured sections from raw LLM output
// handles cases where the LLM doesn't follow the format perfectly
const parse = (raw, { publications = [], trials = [] } = {}) => {
  const sections = extractSections(raw);

  return {
    conditionOverview: sections['Condition Overview'] || extractFallback(raw, 0),
    researchInsights: sections['Research Insights'] || extractFallback(raw, 1),
    clinicalTrials: sections['Clinical Trials'] || extractFallback(raw, 2),
    recommendation: sections['Personalized Recommendation'] || extractFallback(raw, 3),
    sources: formatSources(publications, trials),
    rawResponse: raw,
  };
};


// extract sections by markdown headers (## Section Name)
const extractSections = (text) => {
  const sections = {};
  const pattern = /##\s+(.+?)\n([\s\S]*?)(?=##\s+|\s*$)/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (value) sections[key] = value;
  }
  return sections;
};


// fallback — split by paragraphs if headers not found
const extractFallback = (text, index) => {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
  return paragraphs[index] || '';
};


// format source attribution for the response
const formatSources = (publications, trials) => {
  const pubSources = publications.slice(0, 6).map((p) => ({
    title: p.title,
    authors: p.authors?.slice(0, 3) || [],
    year: p.year,
    source: p.source,
    url: p.url,
    type: 'publication',
  }));

  const trialSources = trials.slice(0, 4).map((t) => ({
    title: t.title,
    status: t.status,
    source: t.source,
    url: t.url,
    type: 'trial',
    nctId: t.nctId,
  }));

  return [...pubSources, ...trialSources];
};

module.exports = { parse };
