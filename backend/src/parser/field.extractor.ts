const EMAIL_RE = /[\w.+'-]+@[\w-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/;
const LINKEDIN_RE = /linkedin\.com\/in\/([\w-]+)/i;
const WEBSITE_RE = /https?:\/\/[\w.-]+\.[a-zA-Z]{2,}[\w./?=#%-]*/i;
const NAME_INVALID_RE = /[@\d()\\/{}[\]]/;

export interface ContactFields {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  website?: string;
  location?: string;
}

export function extractContactFields(headerLines: string[]): ContactFields {
  let name = '';
  let email = '';
  let phone = '';
  let linkedin: string | undefined;
  let website: string | undefined;
  let location: string | undefined;

  // Scan header lines for contact info
  const scanLines = headerLines.slice(0, 25);

  for (const line of scanLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (!email) {
      const match = trimmed.match(EMAIL_RE);
      if (match) email = match[0];
    }

    if (!phone) {
      const match = trimmed.match(PHONE_RE);
      if (match) phone = match[0];
    }

    if (!linkedin) {
      const match = trimmed.match(LINKEDIN_RE);
      if (match) linkedin = `linkedin.com/in/${match[1]}`;
    }

    if (!website && !LINKEDIN_RE.test(trimmed)) {
      const match = trimmed.match(WEBSITE_RE);
      if (match) website = match[0];
    }
  }

  // Name: first short line that looks like a person's name
  for (const line of scanLines.slice(0, 10)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.length > 60) continue;
    if (EMAIL_RE.test(trimmed)) continue;
    if (PHONE_RE.test(trimmed)) continue;
    if (WEBSITE_RE.test(trimmed)) continue;
    if (NAME_INVALID_RE.test(trimmed)) continue;
    // Should be mostly letters, spaces, hyphens, periods, apostrophes
    if (/^[A-Za-z\s\-.']+$/.test(trimmed) && trimmed.split(/\s+/).length >= 2) {
      name = trimmed;
      break;
    }
  }

  // Location heuristic: look for "City, State" or "City, Country" pattern
  const LOCATION_RE = /^[A-Z][a-zA-Z\s]+,\s+[A-Z]{2}(\s+\d{5})?$|^[A-Z][a-zA-Z\s]+,\s+[A-Z][a-zA-Z\s]+$/;
  for (const line of scanLines) {
    const trimmed = line.trim();
    if (LOCATION_RE.test(trimmed) && trimmed !== name) {
      location = trimmed;
      break;
    }
  }

  return { name, email, phone, linkedin, website, location };
}

// Date range extraction helpers used by experience parser
export const DATE_MONTH = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
export const DATE_YEAR = '(?:19|20)\\d{2}';
export const DATE_RANGE_RE = new RegExp(
  `(${DATE_MONTH}[\\s,]*${DATE_YEAR}|${DATE_YEAR})\\s*[-–—to]+\\s*(${DATE_MONTH}[\\s,]*${DATE_YEAR}|${DATE_YEAR}|Present|Current|Now|Ongoing)`,
  'i'
);
export const DATE_SINGLE_RE = new RegExp(
  `(${DATE_MONTH}[\\s,]*${DATE_YEAR}|${DATE_YEAR})`,
  'i'
);

export function extractGpa(text: string): string | undefined {
  const match = text.match(/GPA[:\s]+(\d\.\d{1,2})/i);
  return match ? match[1] : undefined;
}
