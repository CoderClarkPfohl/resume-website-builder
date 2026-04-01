import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { v4 as uuidv4 } from 'uuid';
import { ParsedResume, GenerateResponse, TemplateMetadata, GenericSection } from '../models/resume.model';

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const SITES_DIR = path.join(__dirname, '..', '..', 'sites');

export const VALID_TEMPLATE_IDS = [
  'classic', 'modern', 'minimal', 'terminal', 'bento',
  'dark', 'editorial', 'glass', 'sidebar', 'retro',
];

// Importance order for sections — lower number = higher priority
const SECTION_IMPORTANCE: Record<string, number> = {
  summary: 10,
  professionalProfile: 11,
  personalBranding: 12,
  careerHighlights: 13,
  experience: 20,
  relevantExperience: 21,
  internshipExperience: 22,
  leadershipExperience: 23,
  volunteerExperience: 24,
  freelanceContract: 25,
  militaryExperience: 26,
  teachingMentorship: 27,
  education: 30,
  relevantCoursework: 31,
  capstoneThesis: 32,
  skills: 40,
  technicalSkills: 41,
  coreCompetencies: 42,
  toolsTechnologies: 43,
  technicalCompetencies: 44,
  projects: 50,
  openSourceContributions: 51,
  githubPortfolio: 52,
  portfolioHighlights: 53,
  caseStudies: 54,
  certifications: 60,
  certificationsInProgress: 61,
  trainingWorkshops: 62,
  professionalDevelopment: 63,
  awards: 70,
  keyAchievements: 71,
  publications: 80,
  patents: 81,
  conferences: 82,
  professionalAffiliations: 90,
  activities: 91,
  interests: 92,
  languages: 93,
  securityClearance: 94,
  impactSection: 95,
  problemSolving: 96,
  grantsFunding: 97,
  exhibitions: 98,
  performances: 99,
  testimonials: 100,
  references: 101,
  other: 999,
};

// Register Handlebars helpers
Handlebars.registerHelper('join', (arr: string[], sep: string) => {
  if (!Array.isArray(arr)) return '';
  return arr.join(typeof sep === 'string' ? sep : ', ');
});

Handlebars.registerHelper('dateRange', (start: string, end: string) => {
  if (!start) return '';
  return end ? `${start} – ${end}` : start;
});

Handlebars.registerHelper('hasItems', (arr: unknown[]) => Array.isArray(arr) && arr.length > 0);

Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

/** Render a template to HTML without writing anything to disk. */
export function renderTemplate(
  parsed: ParsedResume,
  templateId: string,
  enabledSections: string[] = []
): string {
  const templateDir = path.join(TEMPLATES_DIR, templateId);
  const hbsSource = fs.readFileSync(path.join(templateDir, 'index.hbs'), 'utf-8');
  const css = fs.readFileSync(path.join(templateDir, 'style.css'), 'utf-8');

  const allSections = parsed.sections || {};
  const activeSections: GenericSection[] = enabledSections
    .map((key) => allSections[key])
    .filter(Boolean)
    .sort((a, b) => (SECTION_IMPORTANCE[a.key] ?? 500) - (SECTION_IMPORTANCE[b.key] ?? 500));

  const template = Handlebars.compile(hbsSource);
  return template({ ...parsed, css, visitorCount: 42195, activeSections, enabledSections });
}

export async function generateSite(
  parsed: ParsedResume,
  templateId: string,
  enabledSections: string[] = []
): Promise<GenerateResponse> {
  const visitorCount = Math.floor(Math.random() * 90000) + 10000;
  const cssPath = path.join(TEMPLATES_DIR, templateId, 'style.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  const allSections = parsed.sections || {};
  const activeSections: GenericSection[] = enabledSections
    .map((key) => allSections[key])
    .filter(Boolean)
    .sort((a, b) => (SECTION_IMPORTANCE[a.key] ?? 500) - (SECTION_IMPORTANCE[b.key] ?? 500));

  const hbsSource = fs.readFileSync(path.join(TEMPLATES_DIR, templateId, 'index.hbs'), 'utf-8');
  const template = Handlebars.compile(hbsSource);
  const html = template({
    ...parsed,
    css,
    visitorCount,
    activeSections,
    enabledSections,
  });

  const siteId = uuidv4();
  const siteDir = path.join(SITES_DIR, siteId);

  fs.mkdirSync(siteDir, { recursive: true });
  fs.writeFileSync(path.join(siteDir, 'index.html'), html, 'utf-8');
  fs.writeFileSync(path.join(siteDir, 'style.css'), css, 'utf-8');

  const port = process.env.PORT || 3000;
  const siteUrl = `http://localhost:${port}/sites/${siteId}/`;

  return { siteId, siteUrl };
}

export function getSiteDir(siteId: string): string {
  return path.join(SITES_DIR, siteId);
}

export function getTemplateMetadata(): TemplateMetadata[] {
  return VALID_TEMPLATE_IDS.map((id) => {
    const metaPath = path.join(TEMPLATES_DIR, id, 'meta.json');
    if (fs.existsSync(metaPath)) {
      return JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as TemplateMetadata;
    }
    return { id, name: id, description: '' };
  });
}
