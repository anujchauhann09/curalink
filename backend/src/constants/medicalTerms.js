// Medical keyword maps used during query expansion

// intent keyword → medical expansion terms (static — these don't vary per disease)
const INTENT_KEYWORDS = Object.freeze({
  treatment: ['treatment', 'therapy', 'intervention', 'management', 'therapeutic'],
  trials: ['clinical trial', 'randomized controlled trial', 'RCT', 'phase 3', 'study'],
  research: ['research', 'study', 'findings', 'evidence', 'publication'],
  symptoms: ['symptoms', 'diagnosis', 'presentation', 'signs', 'manifestation'],
  drugs: ['drug', 'medication', 'pharmacotherapy', 'pharmaceutical', 'dosage'],
  surgery: ['surgery', 'surgical intervention', 'procedure', 'operation'],
  prevention: ['prevention', 'prophylaxis', 'risk reduction', 'screening'],
});

// intent detection — maps user query keywords to intent categories
const INTENT_PATTERNS = Object.freeze([
  { pattern: /trial|study|research|investigat/i, intent: 'trials' },
  { pattern: /treat|therap|cure|manag/i, intent: 'treatment' },
  { pattern: /symptom|diagnos|sign|present/i, intent: 'symptoms' },
  { pattern: /drug|medic|pharma|dose/i, intent: 'drugs' },
  { pattern: /surg|operat|procedur/i, intent: 'surgery' },
  { pattern: /prevent|screen|risk/i, intent: 'prevention' },
]);

module.exports = { INTENT_KEYWORDS, INTENT_PATTERNS };
