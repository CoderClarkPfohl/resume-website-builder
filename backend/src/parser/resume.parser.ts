import { ParsedResume, WorkExperience, Education, GenericSection, GenericEntry } from '../models/resume.model';
import {
  detectSections,
  SectionName,
  SECTION_DISPLAY_TITLES,
  EXPERIENCE_LIKE_SECTIONS,
  EDUCATION_LIKE_SECTIONS,
  LIST_LIKE_SECTIONS,
  TEXT_LIKE_SECTIONS,
  ALL_SECTION_NAMES,
} from './section.detector';
import {
  extractContactFields,
  DATE_RANGE_RE,
  DATE_SINGLE_RE,
  extractGpa,
} from './field.extractor';

const BULLET_RE = /^[•\-\*\u2022\u25CF\u25AA\u2013>]\s+/;
const DEGREE_RE = /\b(B\.?S\.?|B\.?A\.?|B\.?E\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|Ph\.?D\.?|Bachelor(?:'s)?|Master(?:'s)?|Doctor(?:ate)?|Associate(?:'s)?|A\.?A\.?|A\.?S\.?)\b/i;

function isBullet(line: string): boolean {
  return BULLET_RE.test(line) || /^\s{2,}/.test(line);
}

function stripBullet(line: string): string {
  return line.replace(BULLET_RE, '').replace(/^\s+/, '').trim();
}

function splitTitleCompany(line: string): { title: string; company: string } {
  const atMatch = line.match(/^(.+?)\s+at\s+(.+)$/i);
  if (atMatch) return { title: atMatch[1].trim(), company: atMatch[2].trim() };

  const pipeMatch = line.match(/^(.+?)\s*\|\s*(.+)$/);
  if (pipeMatch) return { title: pipeMatch[1].trim(), company: pipeMatch[2].trim() };

  const dashMatch = line.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (dashMatch) return { title: dashMatch[1].trim(), company: dashMatch[2].trim() };

  const commaMatch = line.match(/^(.+?),\s+(.+)$/);
  if (commaMatch) return { title: commaMatch[1].trim(), company: commaMatch[2].trim() };

  return { title: line, company: '' };
}

function parseExperience(lines: string[]): WorkExperience[] {
  const jobs: WorkExperience[] = [];
  let currentJob: Partial<WorkExperience> | null = null;
  let pendingLines: string[] = [];

  function commitJob() {
    if (!currentJob) return;
    jobs.push({
      company: currentJob.company || '',
      title: currentJob.title || '',
      startDate: currentJob.startDate || '',
      endDate: currentJob.endDate || '',
      location: currentJob.location,
      bullets: currentJob.bullets || [],
    });
    currentJob = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const dateRangeMatch = line.match(DATE_RANGE_RE);
    if (dateRangeMatch) {
      commitJob();

      const startDate = dateRangeMatch[1].trim();
      const endDate = dateRangeMatch[2].trim();
      const lineWithoutDate = line.replace(DATE_RANGE_RE, '').trim();
      const context = [...pendingLines.slice(-2), lineWithoutDate].filter(Boolean).join(' | ');
      pendingLines = [];

      const { title, company } = context
        ? splitTitleCompany(context)
        : { title: '', company: '' };

      currentJob = { title, company, startDate, endDate, bullets: [] };
      continue;
    }

    if (currentJob) {
      if (isBullet(line)) {
        currentJob.bullets = currentJob.bullets || [];
        currentJob.bullets.push(stripBullet(line));
      } else {
        const trimmed = line.trim();
        if (!currentJob.company && trimmed) {
          const { title, company } = splitTitleCompany(`${currentJob.title} | ${trimmed}`);
          currentJob.title = title;
          currentJob.company = company;
        }
      }
    } else {
      pendingLines.push(line.trim());
    }
  }

  commitJob();
  return jobs;
}

function parseEducation(lines: string[]): Education[] {
  const items: Education[] = [];
  let current: Partial<Education> | null = null;

  function commit() {
    if (!current) return;
    items.push({
      institution: current.institution || '',
      degree: current.degree || '',
      field: current.field,
      startDate: current.startDate,
      endDate: current.endDate,
      gpa: current.gpa,
    });
    current = null;
  }

  const INSTITUTION_RE = /university|college|institute|school|academy/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const degreeMatch = trimmed.match(DEGREE_RE);
    const dateMatch = trimmed.match(DATE_RANGE_RE) || trimmed.match(DATE_SINGLE_RE);
    const isInstitution = INSTITUTION_RE.test(trimmed);
    const gpa = extractGpa(trimmed);

    if (degreeMatch || isInstitution) {
      if (degreeMatch && current && !current.degree) {
        current.degree = trimmed.replace(DATE_RANGE_RE, '').trim();
        if (dateMatch) {
          const rangeMatch = trimmed.match(DATE_RANGE_RE);
          if (rangeMatch) {
            current.startDate = rangeMatch[1];
            current.endDate = rangeMatch[2];
          }
        }
        continue;
      }

      commit();
      current = {};

      if (isInstitution) {
        current.institution = trimmed.replace(DATE_RANGE_RE, '').trim();
        if (dateMatch) {
          const rangeMatch = trimmed.match(DATE_RANGE_RE);
          if (rangeMatch) {
            current.startDate = rangeMatch[1];
            current.endDate = rangeMatch[2];
          }
        }
      } else {
        current.degree = trimmed.replace(DATE_RANGE_RE, '').trim();
        if (dateMatch) {
          const rangeMatch = trimmed.match(DATE_RANGE_RE);
          if (rangeMatch) {
            current.startDate = rangeMatch[1];
            current.endDate = rangeMatch[2];
          }
        }
      }
    } else if (current) {
      if (!current.institution && !DEGREE_RE.test(trimmed)) {
        current.institution = trimmed.replace(DATE_RANGE_RE, '').trim();
      } else if (!current.degree && degreeMatch) {
        current.degree = trimmed.replace(DATE_RANGE_RE, '').trim();
      }
      if (gpa) current.gpa = gpa;
      if (dateMatch && !current.startDate) {
        const rangeMatch = trimmed.match(DATE_RANGE_RE);
        if (rangeMatch) {
          current.startDate = rangeMatch[1];
          current.endDate = rangeMatch[2];
        }
      }
    }
  }

  commit();
  return items;
}

function parseSkills(lines: string[]): string[] {
  const raw = lines.join(', ');
  return raw
    .split(/[,;|\n•\-\*\u2022]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 50);
}

function parseSummary(lines: string[]): string {
  return lines
    .map((l) => l.replace(BULLET_RE, '').trim())
    .filter(Boolean)
    .join(' ');
}

// Parse lines into generic entries (heading/subheading/date/bullets)
function parseGenericEntries(lines: string[]): GenericEntry[] {
  const entries: GenericEntry[] = [];
  let current: Partial<GenericEntry> | null = null;
  let pendingLines: string[] = [];

  function commit() {
    if (!current) return;
    entries.push({
      heading: current.heading || '',
      subheading: current.subheading,
      date: current.date,
      bullets: current.bullets || [],
    });
    current = null;
  }

  for (const line of lines) {
    const dateMatch = line.match(DATE_RANGE_RE);

    if (dateMatch) {
      commit();
      const lineWithoutDate = line.replace(DATE_RANGE_RE, '').trim();
      const context = [...pendingLines.slice(-2), lineWithoutDate].filter(Boolean).join(' — ');
      pendingLines = [];

      const { title, company } = splitTitleCompany(context || lineWithoutDate);
      current = {
        heading: title || company,
        subheading: company && title ? company : undefined,
        date: `${dateMatch[1].trim()} – ${dateMatch[2].trim()}`,
        bullets: [],
      };
      continue;
    }

    if (current) {
      if (isBullet(line)) {
        current.bullets = current.bullets || [];
        current.bullets.push(stripBullet(line));
      } else {
        const trimmed = line.trim();
        if (!current.subheading && trimmed && trimmed !== current.heading) {
          current.subheading = trimmed;
        }
      }
    } else {
      pendingLines.push(line.trim());
    }
  }

  commit();

  // If no date-based entries were found, treat each non-bullet line as an entry heading
  // and bullet lines as its bullets
  if (entries.length === 0 && lines.length > 0) {
    let entry: Partial<GenericEntry> | null = null;
    for (const line of lines) {
      if (isBullet(line)) {
        if (!entry) {
          entry = { heading: '', bullets: [] };
        }
        entry.bullets = entry.bullets || [];
        entry.bullets.push(stripBullet(line));
      } else {
        if (entry) {
          entries.push({
            heading: entry.heading || '',
            subheading: entry.subheading,
            date: entry.date,
            bullets: entry.bullets || [],
          });
        }
        entry = { heading: line.trim(), bullets: [] };
      }
    }
    if (entry) {
      entries.push({
        heading: entry.heading || '',
        subheading: entry.subheading,
        date: entry.date,
        bullets: entry.bullets || [],
      });
    }
  }

  return entries;
}

function parseListItems(lines: string[]): string[] {
  const raw = lines.join(', ');
  return raw
    .split(/[,;|\n•\-\*\u2022]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 80);
}

function parseTextBlock(lines: string[]): string {
  return lines
    .map((l) => l.replace(BULLET_RE, '').trim())
    .filter(Boolean)
    .join(' ');
}

function getSectionType(key: SectionName): 'experience' | 'education' | 'list' | 'text' | 'entries' {
  if (EXPERIENCE_LIKE_SECTIONS.includes(key)) return 'experience';
  if (EDUCATION_LIKE_SECTIONS.includes(key)) return 'education';
  if (LIST_LIKE_SECTIONS.includes(key)) return 'list';
  if (TEXT_LIKE_SECTIONS.includes(key)) return 'text';
  return 'entries';
}

export function parseResume(rawText: string): ParsedResume {
  const sectionMap = detectSections(rawText);

  const contactFields = extractContactFields([
    ...sectionMap.header,
    ...sectionMap.summary.slice(0, 5),
  ]);

  // Parse the core sections the old way for backwards compat
  const experience = parseExperience(sectionMap.experience);
  const education = parseEducation(sectionMap.education);
  const skills = parseSkills(sectionMap.skills);
  const summary = parseSummary(sectionMap.summary);

  // Build GenericSection map for ALL detected sections (including core ones)
  const sections: Record<string, GenericSection> = {};

  for (const key of ALL_SECTION_NAMES) {
    const lines = sectionMap[key];
    if (!lines || lines.length === 0) continue;
    if (key === 'header') continue;

    const type = getSectionType(key);
    const section: GenericSection = {
      key,
      title: SECTION_DISPLAY_TITLES[key],
      type,
    };

    switch (type) {
      case 'text':
        section.textContent = parseTextBlock(lines);
        break;
      case 'list':
        section.listItems = parseListItems(lines);
        break;
      case 'experience':
      case 'entries':
        section.entries = parseGenericEntries(lines);
        break;
      case 'education':
        // Education is handled by the dedicated parser, but also store as entries
        section.entries = parseGenericEntries(lines);
        break;
    }

    sections[key] = section;
  }

  // Also ensure the core sections appear in the sections map with their canonical data
  if (summary) {
    sections['summary'] = {
      key: 'summary',
      title: SECTION_DISPLAY_TITLES.summary,
      type: 'text',
      textContent: summary,
    };
  }

  if (experience.length > 0) {
    sections['experience'] = {
      key: 'experience',
      title: SECTION_DISPLAY_TITLES.experience,
      type: 'experience',
      entries: experience.map((e) => ({
        heading: e.title,
        subheading: e.company + (e.location ? ` · ${e.location}` : ''),
        date: e.startDate ? `${e.startDate} – ${e.endDate || 'Present'}` : undefined,
        bullets: e.bullets,
      })),
    };
  }

  if (education.length > 0) {
    sections['education'] = {
      key: 'education',
      title: SECTION_DISPLAY_TITLES.education,
      type: 'education',
      entries: education.map((e) => ({
        heading: e.institution,
        subheading: `${e.degree || ''}${e.field ? ` in ${e.field}` : ''}`.trim() || undefined,
        date: e.startDate ? `${e.startDate} – ${e.endDate || ''}` : undefined,
        bullets: e.gpa ? [`GPA: ${e.gpa}`] : [],
      })),
    };
  }

  if (skills.length > 0) {
    sections['skills'] = {
      key: 'skills',
      title: SECTION_DISPLAY_TITLES.skills,
      type: 'list',
      listItems: skills,
    };
  }

  return {
    name: contactFields.name,
    email: contactFields.email,
    phone: contactFields.phone,
    location: contactFields.location,
    linkedin: contactFields.linkedin,
    website: contactFields.website,
    summary,
    experience,
    education,
    skills,
    sections,
  };
}
