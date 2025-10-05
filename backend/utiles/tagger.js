const stopwords = new Set([
  "the", "is", "in", "at", "of", "a", "and", "to", "it", "for",
  "on", "with", "as", "an", "be", "this", "that", "by", "from",
]);

function extractTags(text, maxTags = 6) {
  if (!text) return [];
  const tokens = text
    .replace(/[^\w\s]/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !stopwords.has(t) && t.length > 2);

  const freq = {};
  tokens.forEach((t) => (freq[t] = (freq[t] || 0) + 1));
  return Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, maxTags);
}

export default { extractTags };
