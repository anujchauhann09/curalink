// prompt builder — constructs the LLM prompt from ranked research data

const MAX_ABSTRACT_LENGTH = 150;
const MAX_PUBLICATIONS = 4;
const MAX_TRIALS = 3;


const build = ({ disease, query, location, publications, trials, conversationHistory = [] }) => {
  const pubSection = formatPublications(publications.slice(0, MAX_PUBLICATIONS));
  const trialSection = formatTrials(trials.slice(0, MAX_TRIALS));
  const historySection = formatHistory(conversationHistory);
  const locationNote = location ? `Patient location: ${location}` : '';

  return `You are a medical research assistant. Synthesize the research below into structured insights. Use ONLY provided data. No hallucination.

PATIENT CONTEXT:
- Disease: ${disease}
- Query: ${query}
${locationNote}
${historySection}
RESEARCH PUBLICATIONS:
${pubSection}

CLINICAL TRIALS:
${trialSection}

Respond with exactly these four sections:

## Condition Overview
Brief explanation of ${disease} in context of "${query}".

## Research Insights
Key findings from the publications above. Reference titles and authors.

## Clinical Trials
Relevant trials summary with status and locations.${location ? ` Highlight trials near ${location}.` : ''}

## Personalized Recommendation
Actionable guidance based on the data${location ? ` for a patient in ${location}` : ''}. Advise consulting a specialist.`;
};

const formatPublications = (pubs) => {
  if (!pubs.length) return 'No publications available.';
  return pubs.map((p, i) => {
    const authors = p.authors?.length ? p.authors.slice(0, 3).join(', ') : 'Unknown authors';
    const abstract = (p.summary || '').slice(0, MAX_ABSTRACT_LENGTH);
    return `[${i + 1}] "${p.title}"
    Authors: ${authors} | Year: ${p.year || 'N/A'} | Source: ${p.source}
    Summary: ${abstract}${abstract.length === MAX_ABSTRACT_LENGTH ? '...' : ''}
    URL: ${p.url || 'N/A'}`;
  }).join('\n\n');
};

const formatTrials = (trials) => {
  if (!trials.length) return 'No clinical trials available.';
  return trials.map((t, i) => {
    const locations = t.locations?.slice(0, 3).join(', ') || 'Location not specified';
    return `[${i + 1}] "${t.title}"
    Status: ${t.status || 'N/A'} | Phase: ${t.phase || 'N/A'}
    Locations: ${locations}
    Summary: ${(t.summary || '').slice(0, 200)}
    URL: ${t.url || 'N/A'}`;
  }).join('\n\n');
};


// include last 2 conversation turns for context continuity
const formatHistory = (history) => {
  if (!history.length) return '';
  const recent = history.slice(-4); // last 2 turns (user + assistant each)
  const formatted = recent.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  return `\nCONVERSATION HISTORY:\n${formatted}\n`;
};

module.exports = { build };
