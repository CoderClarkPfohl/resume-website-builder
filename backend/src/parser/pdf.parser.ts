import pdfParse from 'pdf-parse';

interface TextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[]; // [scaleX, skewX, skewY, scaleY, x, y]
}

/**
 * Custom page renderer that preserves x/y positions so we can detect
 * multi-column layouts and reconstruct reading order correctly.
 */
async function renderPage(pageData: any): Promise<string> {
  const content = await pageData.getTextContent();
  const items: TextItem[] = content.items.filter(
    (item: any) => typeof item.str === 'string' && item.str.trim().length > 0
  );

  if (items.length === 0) return '';

  // Group items into lines by y-position (items within 3pt are the same line)
  const Y_TOLERANCE = 3;
  const lines: { y: number; items: TextItem[] }[] = [];

  for (const item of items) {
    const y = item.transform[5];
    const existing = lines.find((l) => Math.abs(l.y - y) <= Y_TOLERANCE);
    if (existing) {
      existing.items.push(item);
    } else {
      lines.push({ y, items: [item] });
    }
  }

  // Sort lines top-to-bottom (higher y = higher on page in PDF coords)
  lines.sort((a, b) => b.y - a.y);

  // Sort items within each line left-to-right by x
  for (const line of lines) {
    line.items.sort((a, b) => a.transform[4] - b.transform[4]);
  }

  // Detect whether this page has a two-column layout.
  // Heuristic: look for a significant horizontal gap in the middle of the page.
  const allX = items.map((i) => i.transform[4]);
  const pageMinX = Math.min(...allX);
  const pageMaxX = Math.max(...allX);
  const pageWidth = pageMaxX - pageMinX;

  let splitX: number | null = null;

  if (pageWidth > 100) {
    // Collect all x-positions from multi-item lines (lines with items on both sides)
    const midZone = pageMinX + pageWidth * 0.3;
    const midZoneEnd = pageMinX + pageWidth * 0.7;

    // Count how many lines have items on both sides of a potential split
    const xStarts = lines
      .filter((l) => l.items.length > 1)
      .flatMap((l) => l.items.map((i) => i.transform[4]));

    // Build a histogram of x-positions in the middle zone
    const GAP_THRESHOLD = pageWidth * 0.08;
    let bestGapStart = 0;
    let bestGapSize = 0;

    // For each line, find gaps between consecutive items
    for (const line of lines) {
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

    // Only split if we found a consistent gap and enough lines use it
    if (bestGapSize > GAP_THRESHOLD) {
      const candidateSplit = bestGapStart + bestGapSize / 2;
      // Verify: at least 20% of lines have content on both sides
      let bothSidesCount = 0;
      for (const line of lines) {
        const hasLeft = line.items.some((i) => i.transform[4] < candidateSplit - 10);
        const hasRight = line.items.some((i) => i.transform[4] > candidateSplit + 10);
        if (hasLeft && hasRight) bothSidesCount++;
      }
      if (bothSidesCount >= lines.length * 0.15) {
        splitX = candidateSplit;
      }
    }
  }

  if (splitX !== null) {
    // Two-column: emit left column lines first, then right column lines
    const leftLines: string[] = [];
    const rightLines: string[] = [];

    for (const line of lines) {
      const leftItems = line.items.filter((i) => i.transform[4] < splitX!);
      const rightItems = line.items.filter((i) => i.transform[4] >= splitX!);

      if (leftItems.length > 0) {
        leftLines.push(joinLineItems(leftItems));
      }
      if (rightItems.length > 0) {
        rightLines.push(joinLineItems(rightItems));
      }
    }

    return [...leftLines, ...rightLines].join('\n');
  }

  // Single column: just join items per line
  return lines.map((l) => joinLineItems(l.items)).join('\n');
}

/** Join text items on the same line, inserting spaces for significant gaps. */
function joinLineItems(items: TextItem[]): string {
  if (items.length === 0) return '';
  let result = items[0].str;
  for (let i = 1; i < items.length; i++) {
    const prevEnd = items[i - 1].transform[4] + items[i - 1].width;
    const curStart = items[i].transform[4];
    const gap = curStart - prevEnd;

    // Use the smaller of two heuristics to avoid missing word spaces:
    // 1) A fraction of font height (catches most normal word gaps)
    // 2) A fraction of average character width (adapts to font size)
    const avgCharWidth = items[i].width / Math.max(items[i].str.length, 1);
    const threshold = Math.min(items[i].height * 0.15, avgCharWidth * 0.4);

    if (gap > threshold) {
      result += ' ';
    }
    result += items[i].str;
  }
  return result.trim();
}

/**
 * Post-process extracted text to fix common PDF artifacts:
 * - Missing spaces between concatenated words (e.g. "SoftwareEngineering" → "Software Engineering")
 * - Missing spaces between text and numbers (e.g. "Clark812" → "Clark 812")
 * - Collapsed all-caps section headers (e.g. "SKILLSANDQUALIFICATIONS" → "SKILLS AND QUALIFICATIONS")
 */
function normalizeExtractedText(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      let result = line;

      // Skip lines that are likely URLs — normalization would break them
      if (/https?:\/\/|linkedin\.com|github\.com|\.com\/|\.org\/|\.io\//i.test(result)) {
        return result;
      }

      // Insert space between a lowercase letter and an uppercase letter ("SoftwareEngineering")
      result = result.replace(/([a-z])([A-Z])/g, '$1 $2');

      // Insert space between a letter and a digit when likely a word boundary ("Clark812", "GPA3.60")
      // But not inside version numbers, dates, or known patterns like "C#", "C++"
      result = result.replace(/([a-zA-Z])(\d)/g, (match, letter, digit, offset) => {
        // Don't split inside common patterns: GPA followed by number, or single letter + digit
        const before = result.slice(Math.max(0, offset - 3), offset + 1);
        if (/GPA$/i.test(before)) return match; // "GPA3.60" → keep, will be caught by GPA regex
        return `${letter} ${digit}`;
      });

      // Insert space between a digit and a letter ("6067clark" → "6067 clark")
      result = result.replace(/(\d)([a-zA-Z])/g, '$1 $2');

      // Fix collapsed all-caps words: "SKILLSANDQUALIFICATIONS" → "SKILLS AND QUALIFICATIONS"
      // Only for lines that are entirely uppercase and longer than typical words
      if (/^[A-Z\s&/(),.-]+$/.test(result.trim()) && result.trim().length > 15) {
        // Try to split known conjunctions: AND, OF, FOR, IN
        result = result.replace(/([A-Z]{2,})(AND|FOR|THE|OF|IN)([A-Z]{2,})/g, '$1 $2 $3');
      }

      return result;
    })
    .join('\n');
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer, {
    pagerender: renderPage,
  });

  let text = result.text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (text.trim().length < 100) {
    throw new Error(
      'Could not extract enough text from the PDF. The file may be scanned or image-based.'
    );
  }

  text = normalizeExtractedText(text);
  return text;
}
