import pdfParse from 'pdf-parse';

interface TextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[]; // [a, b, c, d, x, y] — PDF current transform matrix
  fontName?: string;
  hasEOL?: boolean;
}

/** Extended line representation with computed font size for heading/paragraph detection. */
interface LineInfo {
  y: number;
  items: TextItem[];
  fontSize: number;
}

// ─── Ligature / encoding normalization map (Issue 11) ─────────────────────────
const LIGATURE_MAP: Record<string, string> = {
  '\uFB00': 'ff',  // ﬀ
  '\uFB01': 'fi',  // ﬁ
  '\uFB02': 'fl',  // ﬂ
  '\uFB03': 'ffi', // ﬃ
  '\uFB04': 'ffl', // ﬄ
  '\uFB05': 'st',  // ﬅ
  '\uFB06': 'st',  // ﬆ
  '\u00AD': '',    // soft hyphen — remove silently
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Estimate font size from the PDF current transform matrix. */
function getFontSize(transform: number[]): number {
  return Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]);
}

/**
 * Issue 15: Returns true if the text item is significantly rotated (not horizontal).
 * Rotated text is usually decorative, watermarks, or sidebar labels — not body content.
 */
function isSignificantlyRotated(transform: number[]): boolean {
  const fontSize = getFontSize(transform);
  if (fontSize < 0.1) return false;
  return Math.abs(transform[1]) / fontSize > 0.3;
}

/** Issue 11: Replace known ligature codepoints with their ASCII equivalents. */
function normalizeLigatures(text: string): string {
  let result = text;
  for (const [from, to] of Object.entries(LIGATURE_MAP)) {
    result = result.split(from).join(to);
  }
  return result;
}

/**
 * Issue 19: Normalize Unicode special characters and encoding artifacts.
 * Issue 18: Math symbols (±, ×, ÷, ≤, ≥, ≠, ≈, √, ∑, ∫, π, etc.) are intentionally
 * preserved — they may appear in technical resumes or academic CVs.
 */
function normalizeSpecialChars(text: string): string {
  return text
    .replace(/\uFFFD/g, '?')                            // Unicode replacement char
    .replace(/\u00A0/g, ' ')                            // non-breaking space
    .replace(/[\u2002\u2003\u2009\u200A\u200B]/g, ' ')  // thin/em/en/zero-width spaces
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-') // various dashes → hyphen
    .replace(/[\u2018\u2019]/g, "'")                    // smart single quotes
    .replace(/[\u201C\u201D]/g, '"')                    // smart double quotes
    .replace(/\u2026/g, '...')                          // ellipsis character
    .replace(/\u2212/g, '-')                            // minus sign
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ''); // control chars
}

/**
 * Issue 23: Normalize various bullet point glyphs to a consistent '•'.
 * The downstream resume.parser already recognises '•' via BULLET_RE.
 */
function normalizeBullets(line: string): string {
  return line.replace(/^(\s*)[◦▪▸►▶‣⁃◆◇○●■□▷]\s+/u, '$1• ');
}

/** Compute the median of a numeric array. */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Issue 10: Conservative OCR artifact cleanup.
 * Only fixes patterns with very low false-positive risk.
 */
function cleanOcrArtifacts(line: string): string {
  // '|' used as 'l' inside a word: "sk|lls" → "skills"
  let result = line.replace(/(?<=[a-zA-Z])\|(?=[a-zA-Z])/g, 'l');
  // '|' at word start followed by lowercase: "|nternship" → "Internship"
  result = result.replace(/(?<!\S)\|(?=[a-z]{2,})/g, 'I');
  // '0' at word start followed by lowercase: "0rganization" → "Organization"
  result = result.replace(/(?<!\S)0(?=[a-z]{2,})/g, 'O');
  return result;
}

// ─── Page rendering ───────────────────────────────────────────────────────────

/** Join text items on the same line, inserting spaces for significant gaps. */
function joinLineItems(items: TextItem[]): string {
  if (items.length === 0) return '';
  let result = items[0].str;
  for (let i = 1; i < items.length; i++) {
    const prevEnd = items[i - 1].transform[4] + items[i - 1].width;
    const curStart = items[i].transform[4];
    const gap = curStart - prevEnd;

    const avgCharWidth = items[i].width / Math.max(items[i].str.length, 1);
    const threshold = Math.min(items[i].height * 0.15, avgCharWidth * 0.4);

    // Issue 14: Negative gap with identical text = overlapping duplicate — skip
    if (gap < -5 && items[i].str === items[i - 1].str) {
      continue;
    }

    if (gap > threshold) {
      result += ' ';
    }
    result += items[i].str;
  }
  return result.trim();
}

/**
 * Issue 5: Detect table-like structures — 3+ consecutive lines with 3+ vertically
 * aligned item positions. When detected, items are joined with ' | ' separators
 * to preserve the tabular structure for downstream parsers.
 */
function detectAndFormatTables(lines: LineInfo[]): LineInfo[] {
  if (lines.length < 3) return lines;

  const ALIGN_TOLERANCE = 8; // X positions within 8pt are considered aligned

  function roundX(x: number): number {
    return Math.round(x / ALIGN_TOLERANCE) * ALIGN_TOLERANCE;
  }

  function getColumnPositions(line: LineInfo): number[] {
    return line.items.map((item) => roundX(item.transform[4]));
  }

  function sharedColumns(a: number[], b: number[]): number {
    return a.filter((pos) => b.some((bPos) => Math.abs(pos - bPos) <= ALIGN_TOLERANCE)).length;
  }

  // Mark table row regions
  const isTableRow = new Array(lines.length).fill(false);

  for (let start = 0; start < lines.length - 2; start++) {
    if (isTableRow[start]) continue; // already part of a table
    if (lines[start].items.length < 3) continue;

    const startCols = getColumnPositions(lines[start]);
    let tableEnd = start + 1;

    for (let j = start + 1; j < lines.length; j++) {
      if (lines[j].items.length < 2) break;
      const jCols = getColumnPositions(lines[j]);
      if (sharedColumns(startCols, jCols) >= 3) {
        tableEnd = j + 1;
      } else {
        break;
      }
    }

    if (tableEnd - start >= 3) {
      for (let k = start; k < tableEnd; k++) {
        isTableRow[k] = true;
      }
    }
  }

  return lines.map((line, i) => {
    if (!isTableRow[i]) return line;
    // Join table cells with pipe separator for downstream parsing
    const text = line.items.map((item) => item.str.trim()).filter(Boolean).join(' | ');
    return {
      ...line,
      items: [{ ...line.items[0], str: text, width: 0 }],
    };
  });
}

/**
 * Custom page renderer: preserves x/y positions for layout detection,
 * filters per-page noise, and reconstructs correct reading order.
 */
async function renderPage(pageData: any): Promise<string> {
  const content = await pageData.getTextContent();
  let items: TextItem[] = content.items.filter(
    (item: any) => typeof item.str === 'string' && item.str.trim().length > 0
  );

  if (items.length === 0) return '';

  // Issue 15: Filter significantly rotated text (watermarks, decorative labels)
  items = items.filter((item) => !isSignificantlyRotated(item.transform));

  // Issue 14: Remove exact-duplicate text items (same position + text = hidden layers)
  const seenPositions = new Set<string>();
  items = items.filter((item) => {
    const key = `${Math.round(item.transform[4])},${Math.round(item.transform[5])},${item.str}`;
    if (seenPositions.has(key)) return false;
    seenPositions.add(key);
    return true;
  });

  if (items.length === 0) return '';

  // Issues 11, 19: Normalize ligatures and encoding at the item level
  items = items.map((item) => ({
    ...item,
    str: normalizeSpecialChars(normalizeLigatures(item.str)),
  }));

  // Group items into lines by y-position (items within 3pt of each other = same line)
  const Y_TOLERANCE = 3;
  const rawLines: { y: number; items: TextItem[] }[] = [];

  for (const item of items) {
    const y = item.transform[5];
    const existing = rawLines.find((l) => Math.abs(l.y - y) <= Y_TOLERANCE);
    if (existing) {
      existing.items.push(item);
    } else {
      rawLines.push({ y, items: [item] });
    }
  }

  // Issue 4: Sort lines top-to-bottom (higher y = higher on page in PDF coordinates)
  rawLines.sort((a, b) => b.y - a.y);

  // Sort items within each line left-to-right by x
  for (const line of rawLines) {
    line.items.sort((a, b) => a.transform[4] - b.transform[4]);
  }

  // Issues 2, 16: Compute dominant font size per line for heading/structure detection
  const lines: LineInfo[] = rawLines.map((line) => ({
    ...line,
    fontSize: median(line.items.map((i) => getFontSize(i.transform))),
  }));

  // Issue 7: Detect and remove page-number-only lines in top/bottom margins
  const allY = items.map((i) => i.transform[5]);
  const pageMinY = Math.min(...allY);
  const pageMaxY = Math.max(...allY);
  const pageHeight = pageMaxY - pageMinY;
  const marginThreshold = pageHeight > 0 ? pageHeight * 0.07 : 20;

  let contentLines = lines.filter((line) => {
    const inTopMargin = line.y > pageMaxY - marginThreshold;
    const inBottomMargin = line.y < pageMinY + marginThreshold;
    if (!inTopMargin && !inBottomMargin) return true;

    const lineText = line.items.map((i) => i.str).join('').trim();
    const isPageNumber =
      /^\d+$/.test(lineText) ||
      /^-\s*\d+\s*-$/.test(lineText) ||
      /^page\s+\d+(\s+of\s+\d+)?$/i.test(lineText) ||
      /^\d+\s*\/\s*\d+$/.test(lineText);

    return !isPageNumber;
  });

  // Issue 24: Filter footnote lines — small font at page bottom with footnote markers
  const bodyFontSizes = contentLines.map((l) => l.fontSize).filter((s) => s > 0);
  const medianFontSize = median(bodyFontSizes);

  if (medianFontSize > 0) {
    contentLines = contentLines.filter((line) => {
      // Only consider lines in the bottom 15% of the page
      if (line.y > pageMinY + pageHeight * 0.15) return true;
      if (line.fontSize < medianFontSize * 0.7) {
        const lineText = line.items.map((i) => i.str).join('').trim();
        // Footnote marker: starts with number, asterisk, or dagger followed by space/punctuation
        if (/^[\d*†‡§¶]+[\s.):]/.test(lineText)) return false;
        // Very small text in footer = fine print / legal disclaimers
        if (line.fontSize < medianFontSize * 0.5) return false;
      }
      return true;
    });
  }

  // Issue 5: Detect and format table rows
  contentLines = detectAndFormatTables(contentLines);

  // Issue 22: Compute median line spacing for paragraph boundary detection
  const spacings: number[] = [];
  for (let i = 1; i < contentLines.length; i++) {
    const gap = contentLines[i - 1].y - contentLines[i].y;
    if (gap > 0) spacings.push(gap);
  }
  const medianSpacing = median(spacings);

  // Issue 1 / Issue 13: Detect whether this page has a column layout.
  // Extended detection zone (20%-80%) catches sidebar layouts in addition to
  // balanced two-column layouts.
  const allX = items.map((i) => i.transform[4]);
  const pageMinX = Math.min(...allX);
  const pageMaxX = Math.max(...allX);
  const pageWidth = pageMaxX - pageMinX;

  let splitX: number | null = null;

  if (pageWidth > 100) {
    // Issue 13: Wider zone (20%-80%) to catch sidebar layouts
    const midZone = pageMinX + pageWidth * 0.2;
    const midZoneEnd = pageMinX + pageWidth * 0.8;

    const GAP_THRESHOLD = pageWidth * 0.08;
    let bestGapStart = 0;
    let bestGapSize = 0;

    for (const line of contentLines) {
      if (line.items.length < 2) continue;
      for (let i = 0; i < line.items.length - 1; i++) {
        const rightEdge = line.items[i].transform[4] + line.items[i].width;
        const nextLeft = line.items[i + 1].transform[4];
        const gap = nextLeft - rightEdge;
        if (
          gap > GAP_THRESHOLD &&
          rightEdge > midZone - pageWidth * 0.1 &&
          nextLeft < midZoneEnd + pageWidth * 0.1
        ) {
          if (gap > bestGapSize) {
            bestGapSize = gap;
            bestGapStart = rightEdge;
          }
        }
      }
    }

    if (bestGapSize > GAP_THRESHOLD) {
      const candidateSplit = bestGapStart + bestGapSize / 2;
      let bothSidesCount = 0;
      for (const line of contentLines) {
        const hasLeft = line.items.some((i) => i.transform[4] < candidateSplit - 10);
        const hasRight = line.items.some((i) => i.transform[4] > candidateSplit + 10);
        if (hasLeft && hasRight) bothSidesCount++;
      }
      // Issue 13: Lowered from 15% to 10% — sidebar layouts have fewer lines spanning both sides
      if (bothSidesCount >= contentLines.length * 0.10) {
        splitX = candidateSplit;
      }
    }
  }

  /**
   * Build output text from a group of lines, inserting blank lines at:
   * - Issue 22: Large Y-gaps (paragraph/section boundaries)
   * - Issues 2, 16: Lines with notably larger font size (headings)
   */
  function buildOutputLines(lineGroup: LineInfo[]): string[] {
    const result: string[] = [];
    for (let i = 0; i < lineGroup.length; i++) {
      if (i > 0) {
        const gap = lineGroup[i - 1].y - lineGroup[i].y;

        // Issue 22: Y-gap > 1.8× median spacing = paragraph or section boundary
        const isLargeGap = medianSpacing > 0 && gap > medianSpacing * 1.8;

        // Issues 2, 16: Font size > 1.25× median = likely heading; insert blank line before
        const isHeading =
          medianFontSize > 0 && lineGroup[i].fontSize > medianFontSize * 1.25;

        if (isLargeGap || isHeading) {
          if (result.length > 0 && result[result.length - 1] !== '') {
            result.push('');
          }
        }
      }
      result.push(joinLineItems(lineGroup[i].items));
    }
    return result;
  }

  if (splitX !== null) {
    // Two-column or sidebar: emit left column lines first, then right column lines
    const leftLines: LineInfo[] = [];
    const rightLines: LineInfo[] = [];

    for (const line of contentLines) {
      const leftItems = line.items.filter((i) => i.transform[4] < splitX!);
      const rightItems = line.items.filter((i) => i.transform[4] >= splitX!);

      if (leftItems.length > 0) {
        leftLines.push({
          y: line.y,
          items: leftItems,
          fontSize: median(leftItems.map((i) => getFontSize(i.transform))),
        });
      }
      if (rightItems.length > 0) {
        rightLines.push({
          y: line.y,
          items: rightItems,
          fontSize: median(rightItems.map((i) => getFontSize(i.transform))),
        });
      }
    }

    return [...buildOutputLines(leftLines), ...buildOutputLines(rightLines)].join('\n');
  }

  // Single column: build output with paragraph/heading breaks
  return buildOutputLines(contentLines).join('\n');
}

// ─── Cross-page processing ────────────────────────────────────────────────────

/**
 * Issue 6: Remove content that repeats across pages (headers / footers).
 * A line is considered repeated if its normalised form appears on more than
 * half the pages (minimum threshold: 2 pages).
 */
function removeRepeatedContent(pageTexts: string[]): string[] {
  if (pageTexts.length < 2) return pageTexts;

  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

  const lineCounts = new Map<string, number>();
  for (const pageText of pageTexts) {
    const seenOnPage = new Set<string>();
    for (const line of pageText.split('\n')) {
      const n = norm(line);
      if (n.length < 3) continue;
      if (!seenOnPage.has(n)) {
        seenOnPage.add(n);
        lineCounts.set(n, (lineCounts.get(n) ?? 0) + 1);
      }
    }
  }

  const threshold = Math.max(2, pageTexts.length * 0.5);
  const repeatedLines = new Set<string>();
  for (const [line, count] of lineCounts) {
    if (count >= threshold) {
      repeatedLines.add(line);
    }
  }

  if (repeatedLines.size === 0) return pageTexts;

  return pageTexts.map((pageText) =>
    pageText
      .split('\n')
      .filter((line) => !repeatedLines.has(norm(line)))
      .join('\n')
  );
}

// ─── Text normalization ───────────────────────────────────────────────────────

/**
 * Post-process extracted text to fix common PDF artifacts:
 * - Issues 8, 10, 11, 12, 19, 23
 */
function normalizeExtractedText(text: string): string {
  // Issue 8: Pre-pass — merge hyphenated line breaks before splitting into lines.
  text = text.replace(/([a-zA-Z])-\n([a-z])/g, '$1$2');

  return text
    .split('\n')
    .map((line) => {
      let result = line;

      // Issue 19: Belt-and-suspenders special char normalization
      result = normalizeSpecialChars(result);

      // Issue 11: Belt-and-suspenders ligature normalization
      result = normalizeLigatures(result);

      // Issue 23: Normalize bullet glyphs to '•'
      result = normalizeBullets(result);

      // Issue 10: Conservative OCR artifact cleanup
      result = cleanOcrArtifacts(result);

      // Skip lines that are likely URLs — further normalization would break them
      if (/https?:\/\/|linkedin\.com|github\.com|\.com\/|\.org\/|\.io\//i.test(result)) {
        return result;
      }

      // Issue 12: Insert space between lowercase→uppercase ("SoftwareEngineering")
      result = result.replace(/([a-z])([A-Z])/g, '$1 $2');

      // Issue 12: Insert space between letter and digit ("Clark812" → "Clark 812")
      result = result.replace(/([a-zA-Z])(\d)/g, (match, letter, digit, offset) => {
        const before = result.slice(Math.max(0, offset - 3), offset + 1);
        if (/GPA$/i.test(before)) return match; // "GPA3.60" — keep for GPA extractor
        return `${letter} ${digit}`;
      });

      // Issue 12: Insert space between digit and letter ("6067clark" → "6067 clark")
      result = result.replace(/(\d)([a-zA-Z])/g, '$1 $2');

      // Issue 12: Fix collapsed all-caps section headers ("SKILLSANDQUALIFICATIONS")
      if (/^[A-Z\s&/(),.-]+$/.test(result.trim()) && result.trim().length > 15) {
        result = result.replace(/([A-Z]{2,})(AND|FOR|THE|OF|IN)([A-Z]{2,})/g, '$1 $2 $3');
      }

      return result;
    })
    .join('\n');
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pageTexts: string[] = [];

  // Issue 20: Collect per-page text in the closure so we can do cross-page
  // analysis without re-parsing, keeping memory proportional to text size.
  await pdfParse(buffer, {
    pagerender: async (pageData: any) => {
      const text = await renderPage(pageData);
      pageTexts.push(text);
      return text;
    },
  });

  const rawText = pageTexts.join('\n');
  if (rawText.trim().length < 100) {
    // Issue 9: Clear error for scanned/image-based PDFs
    throw new Error(
      'Could not extract enough text from the PDF. The file may be scanned or image-based. ' +
      'Please use a PDF with a text layer, or run OCR on the document first.'
    );
  }

  // Issue 6: Strip repeated headers/footers found across pages
  const cleanedPages = removeRepeatedContent(pageTexts);

  let text = cleanedPages
    .join('\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  text = normalizeExtractedText(text);
  return text;
}

/**
 * Issue 25: Extract PDF metadata (title, author, creator) — useful as fallback
 * for name/title detection when text-based extraction is insufficient.
 */
export async function extractPdfMetadata(
  buffer: Buffer
): Promise<{ title?: string; author?: string; creator?: string }> {
  const result = await pdfParse(buffer);
  return {
    title: result.info?.Title || undefined,
    author: result.info?.Author || undefined,
    creator: result.info?.Creator || undefined,
  };
}
