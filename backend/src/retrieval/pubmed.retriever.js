const axios = require('axios');
const https = require('https');
const env = require('../config/env');

const SEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const FETCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
const BATCH_SIZE = 100;

// force IPv4 — prevents AggregateError ETIMEDOUT from IPv6 timeout racing IPv4
const httpsAgent = new https.Agent({ family: 4 });

/**
 * PubMed Retriever — two-step: search (get IDs) → fetch (get full records)
 * returns raw XML parsed into normalizable objects
 */
const fetch = async (query) => {
  try {
    const ids = await searchIds(query);
    if (!ids.length) return [];
    return await fetchDetails(ids);
  } catch (err) {
    // retry once on timeout before giving up
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
      console.warn('[PubMed] Timeout on first attempt, retrying...');
      try {
        const ids = await searchIds(query);
        if (!ids.length) return [];
        return await fetchDetails(ids);
      } catch (retryErr) {
        console.warn('[PubMed] Retry also failed:', retryErr.code || retryErr.message);
        return [];
      }
    }
    console.warn('[PubMed] Retrieval failed:', err.response?.status, err.response?.data || err.message || err);
    return [];
  }
};

const searchIds = async (query) => {
  // PubMed esearch is strict — simplify complex boolean queries to avoid 400/empty results
  const sanitized = sanitizeQuery(query);

  const params = {
    db: 'pubmed',
    term: sanitized,
    retmax: BATCH_SIZE,
    sort: 'pub date',
    retmode: 'json',
    ...(env.pubmedApiKey && { api_key: env.pubmedApiKey }),
  };

  const res = await axios.get(SEARCH_URL, { params, timeout: 15000, httpsAgent });
  return res.data?.esearchresult?.idlist || [];
};

/**
 * PubMed query sanitizer — strips complex OR chains from broadQuery
 * extracts the core disease + intent terms PubMed handles best
 */
const sanitizeQuery = (query) => {
  // extract first term from each parenthesised group
  const groups = [...query.matchAll(/\(([^)]+)\)/g)].map((m) => {
    const first = m[1].split(' OR ')[0].trim();
    return first;
  });

  if (groups.length >= 2) return groups.join(' ');

  // fallback — strip parens and OR, keep AND logic
  return query.replace(/[()]/g, '').replace(/ OR [^ ]*/g, '').replace(/ AND /g, ' ').trim();
};

const fetchDetails = async (ids) => {
  const res = await axios.get(FETCH_URL, {
    params: {
      db: 'pubmed',
      id: ids.join(','),
      retmode: 'xml',
      ...(env.pubmedApiKey && { api_key: env.pubmedApiKey }),
    },
    timeout: 20000,
    httpsAgent,
  });

  return parseXml(res.data);
};

/**
 * minimal XML parser — extracts fields without a heavy dependency
 * handles PubMed's PubmedArticle structure
 */
const parseXml = (xml) => {
  const articles = [];
  const articleBlocks = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) || [];

  for (const block of articleBlocks) {
    const title = extractTag(block, 'ArticleTitle');
    const abstract = extractTag(block, 'AbstractText');
    const year = extractTag(block, 'PubDate>.*?<Year') || extractTag(block, 'Year');
    const pmid = extractTag(block, 'PMID');

    // extract authors
    const authorBlocks = block.match(/<Author[^>]*>[\s\S]*?<\/Author>/g) || [];
    const authors = authorBlocks.map((a) => {
      const last = extractTag(a, 'LastName') || '';
      const fore = extractTag(a, 'ForeName') || '';
      return `${last} ${fore}`.trim();
    }).filter(Boolean).slice(0, 5);

    if (!title) continue;

    articles.push({
      title,
      abstract: abstract || '',
      year: year ? parseInt(year) : null,
      authors,
      pmid,
      url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : null,
      source: 'PubMed',
    });
  }

  return articles;
};

const extractTag = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/`, 'i'));
  return match ? match[1].replace(/<[^>]+>/g, '').trim() : null;
};

module.exports = { fetch };
