const EMAIL_RE = /[\w.+'-]+@[\w-]+\.[a-zA-Z]{2,}/;
// Standard dash/dot/space separators
const PHONE_RE = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}(\s*(x|ext\.?|extension)\s*\d{1,6})?/i;
// No-separator 10-digit US phone (e.g. "8124306067")
const PHONE_NOSEP_RE = /\b(\d{3})(\d{3})(\d{4})\b/;
// Comma-separated phone (from PDF linearization: "812, 430, 6067")
const PHONE_COMMA_RE = /\b(\d{3}),\s*(\d{3}),\s*(\d{4})\b/;
// International formats: +44 20 7946 0958, +91-9876543210, etc.
const PHONE_INTL_RE = /\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{0,4}/;
// Allow optional spaces within the path segment (PDF extraction can split "clark-pfohl" across items)
const LINKEDIN_RE = /linkedin\.com\/in\/([\w-]+(?:\s*[\w-]+)*)/i;
const GITHUB_RE = /github\.com\/([\w-]+)/i;
const WEBSITE_RE = /https?:\/\/[\w.-]+\.[a-zA-Z]{2,}[\w./?=#%-]*/i;
const NAME_INVALID_RE = /[@\d()\\/{}[\]]/;

export interface ContactFields {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  website?: string;
  location?: string;
}

export function extractContactFields(headerLines: string[]): ContactFields {
  let name = '';
  let email = '';
  let phone = '';
  let linkedin: string | undefined;
  let github: string | undefined;
  let website: string | undefined;
  let location: string | undefined;

  // Scan all header lines (no arbitrary limit — the header blob can be large after PDF linearization)
  const scanLines = headerLines;

  // Also build a joined version of the first ~10 lines to catch URLs or phone numbers
  // that span multiple lines due to PDF text extraction
  const joinedBlob = scanLines.slice(0, 20).join(' ');

  // Extract from the joined blob first (catches split URLs and comma-phones)
  if (!phone) {
    const commaMatch = joinedBlob.match(PHONE_COMMA_RE);
    if (commaMatch) phone = `${commaMatch[1]}-${commaMatch[2]}-${commaMatch[3]}`;
  }
  if (!phone) {
    const match = joinedBlob.match(PHONE_RE);
    if (match) phone = match[0].trim();
  }
  if (!phone) {
    const match = joinedBlob.match(PHONE_INTL_RE);
    if (match) phone = match[0].trim();
  }
  if (!email) {
    const match = joinedBlob.match(EMAIL_RE);
    if (match) email = match[0];
  }
  if (!linkedin) {
    const match = joinedBlob.match(LINKEDIN_RE);
    if (match) linkedin = `linkedin.com/in/${match[1].replace(/\s+/g, '')}`;
  }
  if (!github) {
    const match = joinedBlob.match(GITHUB_RE);
    if (match) github = `github.com/${match[1]}`;
  }
  if (!website) {
    const urlMatches = [...joinedBlob.matchAll(new RegExp(WEBSITE_RE.source, 'gi'))];
    const nonLinkedinOrGithub = urlMatches.find((m) => !LINKEDIN_RE.test(m[0]) && !GITHUB_RE.test(m[0]));
    if (nonLinkedinOrGithub) website = nonLinkedinOrGithub[0];
  }

  // Then scan line-by-line to fill anything still missing
  for (const line of scanLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (!email) {
      const match = trimmed.match(EMAIL_RE);
      if (match) email = match[0];
    }

    if (!phone) {
      const commaMatch = trimmed.match(PHONE_COMMA_RE);
      if (commaMatch) phone = `${commaMatch[1]}-${commaMatch[2]}-${commaMatch[3]}`;
    }
    if (!phone) {
      const match = trimmed.match(PHONE_RE);
      if (match) phone = match[0].trim();
    }
    if (!phone) {
      const match = trimmed.match(PHONE_INTL_RE);
      if (match) phone = match[0].trim();
    }
    if (!phone) {
      const nosepMatch = trimmed.match(PHONE_NOSEP_RE);
      // Only match no-separator if the line is short (likely a contact line, not a random number)
      if (nosepMatch && trimmed.length <= 20) phone = `${nosepMatch[1]}-${nosepMatch[2]}-${nosepMatch[3]}`;
    }

    if (!linkedin) {
      const match = trimmed.match(LINKEDIN_RE);
      if (match) linkedin = `linkedin.com/in/${match[1].replace(/\s+/g, '')}`;
    }

    if (!github) {
      const match = trimmed.match(GITHUB_RE);
      if (match) github = `github.com/${match[1]}`;
    }

    if (!website && !LINKEDIN_RE.test(trimmed) && !GITHUB_RE.test(trimmed)) {
      const match = trimmed.match(WEBSITE_RE);
      if (match) website = match[0];
    }
  }

  // Name: first short line that looks like a person's name (check first 15 lines)
  // Common connector words that appear in sentences but not in names
  const NAME_STOP_WORDS = /^(and|the|of|in|from|at|to|a|an|for|with|by|or|on|as|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|that|this|these|those|it|its)$/i;

  function isNameCandidate(text: string): boolean {
    if (!/^[\p{L}\s\-.',]+$/u.test(text)) return false;
    const words = text.split(/\s+/);
    if (words.length < 2 || words.length > 5) return false;
    if (!words.every(w => /^\p{Lu}/u.test(w))) return false;
    if (words.some(w => NAME_STOP_WORDS.test(w))) return false;
    return true;
  }

  for (const line of scanLines.slice(0, 15)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.length > 60) continue;
    if (EMAIL_RE.test(trimmed)) continue;
    if (PHONE_RE.test(trimmed) || PHONE_COMMA_RE.test(trimmed)) continue;
    if (WEBSITE_RE.test(trimmed)) continue;
    if (NAME_INVALID_RE.test(trimmed)) {
      // Line has digits/special chars — try extracting the leading letter-only portion
      // Handles PDF concatenation: "CLARK PFOHL 812-430-6067" → "CLARK PFOHL"
      const leadingLetters = trimmed.match(/^([\p{L}\s\-.',]+)/u);
      if (leadingLetters) {
        const candidate = leadingLetters[1].trim();
        if (candidate.length <= 60 && isNameCandidate(candidate)) {
          name = candidate;
          break;
        }
      }
      continue;
    }
    if (isNameCandidate(trimmed)) {
      name = trimmed;
      break;
    }
  }

  // Location heuristic: look for "City, State", "City, State ZIP", "City, Country", or just "Remote"
  const LOCATION_RE = /^[A-Z][\p{L}\s.'-]+,\s+[A-Z]{2}(\s+\d{5}(-\d{4})?)?$|^[A-Z][\p{L}\s.'-]+,\s+[\p{Lu}][\p{L}\s.'-]+$/u;
  const REMOTE_RE = /^remote$/i;
  for (const line of scanLines) {
    const trimmed = line.trim();
    if (trimmed === name) continue;
    if (LOCATION_RE.test(trimmed) || REMOTE_RE.test(trimmed)) {
      location = trimmed;
      break;
    }
  }

  return { name, email, phone, linkedin, github, website, location };
}

// Date range extraction helpers used by experience parser
export const DATE_MONTH = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
export const DATE_SEASON = '(?:Spring|Summer|Fall|Autumn|Winter)';
export const DATE_YEAR = '(?:19|20)\\d{2}';
// A single date token: "Jan 2020", "Fall 2020", "2020", or "Expected May 2025"
const DATE_TOKEN = `(?:(?:Expected|Anticipated)\\s+)?(?:${DATE_MONTH}|${DATE_SEASON})[\\s,]*${DATE_YEAR}|(?:Expected|Anticipated)\\s+${DATE_YEAR}|${DATE_YEAR}`;
export const DATE_RANGE_RE = new RegExp(
  `(${DATE_TOKEN})\\s*[-–—to]+\\s*(${DATE_TOKEN}|Present|Current|Now|Ongoing)`,
  'i'
);
export const DATE_SINGLE_RE = new RegExp(
  `(${DATE_TOKEN})`,
  'i'
);

export function extractGpa(text: string): string | undefined {
  const match = text.match(/GPA[:\s]+(\d\.\d{1,2})/i);
  return match ? match[1] : undefined;
}
