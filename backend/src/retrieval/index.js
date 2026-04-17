const pubmed = require('./pubmed.retriever');
const openAlex = require('./openalex.retriever');
const clinicalTrials = require('./clinicaltrials.retriever');
const { normalizeAll } = require('./normalizer');

/**
 * Retrieval Orchestrator — runs all three sources in parallel
 *
 * Uses broadQuery for PubMed + OpenAlex (maximum recall)
 * Uses disease directly for ClinicalTrials 
*/
const retrieve = async ({ broadQuery, disease, location }) => {
  const startTime = Date.now();

  // parallel fetch — all three sources simultaneously
  const [pubmedRaw, openAlexRaw, trialsRaw] = await Promise.all([
    pubmed.fetch(broadQuery),
    openAlex.fetch(broadQuery),
    clinicalTrials.fetch(disease, location),
  ]);

  const { publications, trials } = normalizeAll({
    pubmed: pubmedRaw,
    openAlex: openAlexRaw,
    trials: trialsRaw,
  });

  const elapsed = Date.now() - startTime;

  console.log(
    `[Retrieval] pubmed=${pubmedRaw.length} openalex=${openAlexRaw.length} trials=${trialsRaw.length} time=${elapsed}ms`
  );

  return {
    publications,
    trials,
    meta: {
      totalPublications: publications.length,
      totalTrials: trials.length,
      retrievalTimeMs: elapsed,
    },
  };
};

module.exports = { retrieve };
