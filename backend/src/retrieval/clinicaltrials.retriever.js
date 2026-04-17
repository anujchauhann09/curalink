const axios = require('axios');

const BASE_URL = 'https://clinicaltrials.gov/api/v2/studies';
const PAGE_SIZE = 20;

// statuses worth showing to users
const STATUSES = ['RECRUITING', 'ACTIVE_NOT_RECRUITING', 'COMPLETED', 'NOT_YET_RECRUITING'];

/**
 * ClinicalTrials Retriever — fetches trials across multiple statuses in parallel
 * location filtering applied post-fetch to prioritise nearby trials
 */
const fetch = async (disease, location) => {
  try {
    const requests = STATUSES.map((status) => fetchByStatus(disease, status));
    const results = await Promise.all(requests);

    const all = results.flat();

    // deduplicate by NCT ID
    const seen = new Set();
    const unique = all.filter((t) => {
      if (seen.has(t.nctId)) return false;
      seen.add(t.nctId);
      return true;
    });

    // location-aware sort — trials matching user location bubble up
    return location ? sortByLocation(unique, location) : unique;
  } catch (err) {
    console.warn('[ClinicalTrials] Retrieval failed:', err.message);
    return [];
  }
};

const fetchByStatus = async (disease, status) => {
  const res = await axios.get(BASE_URL, {
    params: {
      'query.cond': disease,
      'filter.overallStatus': status,
      pageSize: PAGE_SIZE,
      format: 'json',
    },
    timeout: 15000,
  });

  return (res.data?.studies || []).map((s) => parseTrial(s, status));
};

const parseTrial = (study, status) => {
  const proto = study.protocolSection || {};
  const id = proto.identificationModule || {};
  const status_ = proto.statusModule || {};
  const desc = proto.descriptionModule || {};
  const eligibility = proto.eligibilityModule || {};
  const contacts = proto.contactsLocationsModule || {};

  // extract locations
  const locations = (contacts.locations || []).map((l) =>
    [l.city, l.country].filter(Boolean).join(', ')
  );

  // extract primary contact
  const centralContacts = contacts.centralContacts || [];
  const contact = centralContacts[0]
    ? { name: centralContacts[0].name, email: centralContacts[0].email, phone: centralContacts[0].phone }
    : null;

  return {
    title: id.briefTitle || '',
    nctId: id.nctId || '',
    status: status_.overallStatus || status,
    phase: status_.phase || null,
    summary: desc.briefSummary || '',
    eligibility: eligibility.eligibilityCriteria || '',
    locations,
    contact,
    url: id.nctId ? `https://clinicaltrials.gov/study/${id.nctId}` : null,
    source: 'ClinicalTrials.gov',
    startDate: status_.startDateStruct?.date || null,
  };
};

/**
 * Sort trials so those matching user's location/country appear first
 */
const sortByLocation = (trials, location) => {
  const loc = location.toLowerCase();
  return [...trials].sort((a, b) => {
    const aMatch = a.locations.some((l) => l.toLowerCase().includes(loc));
    const bMatch = b.locations.some((l) => l.toLowerCase().includes(loc));
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });
};

module.exports = { fetch };
