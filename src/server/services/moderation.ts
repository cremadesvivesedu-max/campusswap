const suspiciousTerms = ["deposit first", "gift card", "wire transfer", "crypto only", "too good to be true"];

export function findSuspiciousKeywords(input: string) {
  const lowered = input.toLowerCase();
  return suspiciousTerms.filter((term) => lowered.includes(term));
}

export function shouldModerateListing(title: string, description: string) {
  return findSuspiciousKeywords(`${title} ${description}`).length > 0;
}
