import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { v4 as uuidv4 } from 'uuid';
import { ParsedResume, GenerateResponse, TemplateMetadata, GenericSection, TemplateConfig } from '../models/resume.model';

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

// Allowlist of Google Fonts to prevent injection
const ALLOWED_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display',
  'Merriweather', 'Source Sans 3', 'Nunito', 'Raleway', 'PT Serif', 'IBM Plex Sans',
];

/** Build a Google Fonts <link> tag if a custom font is selected. */
function buildFontLink(config: TemplateConfig): string {
  if (!config.fontFamily || !ALLOWED_FONTS.includes(config.fontFamily)) return '';
  const family = config.fontFamily.replace(/\s+/g, '+');
  return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${family}:wght@400;600;700&display=swap">`;
}

/** Build a <style> block from user config that overrides template defaults. */
function buildConfigCss(config: TemplateConfig): string {
  const parts: string[] = [];

  if (config.accentColor) {
    const c = config.accentColor;
    parts.push(
      `:root { --accent: ${c}; }`,
      `h2, h3 { color: ${c} !important; }`,
      `a { color: ${c} !important; }`,
      `.section-title, .section-heading, .section-label { color: ${c} !important; }`,
      `hr, .divider { border-color: ${c} !important; }`,
    );
  }

  if (config.density === 'compact') {
    parts.push(
      `body { line-height: 1.4 !important; }`,
      `.resume, .page, .container { padding: 28px 36px !important; }`,
      `section, .resume-section, .section { margin-bottom: 14px !important; }`,
      `.entry, .job, .edu-item, .project-item { margin-bottom: 10px !important; }`,
    );
  }

  if (config.fontFamily && ALLOWED_FONTS.includes(config.fontFamily)) {
    parts.push(
      `body, h1, h2, h3, h4, h5, h6, p, li, span, a { font-family: '${config.fontFamily}', system-ui, sans-serif !important; }`,
    );
  }

  return parts.join('\n');
}

/** Render a template to HTML without writing anything to disk. */
export function renderTemplate(
  parsed: ParsedResume,
  templateId: string,
  enabledSections: string[] = [],
  config: TemplateConfig = {}
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
  const visitorCount = Math.floor(Math.random() * 90000) + 10000;
  let html = template({ ...parsed, css, visitorCount, activeSections, enabledSections });

  // Inline CSS so the HTML is self-contained (preview iframe, srcdoc, blob URL)
  html = html.replace(/<link[^>]+href="style\.css"[^>]*\/?>/i, `<style>\n${css}\n</style>`);

  const fontLink = buildFontLink(config);
  const configCss = buildConfigCss(config);
  if (fontLink) html = html.replace('</head>', `${fontLink}\n</head>`);
  if (configCss) html = html.replace('</head>', `<style>\n${configCss}\n</style>\n</head>`);

  return html;
}

export async function generateSite(
  parsed: ParsedResume,
  templateId: string,
  enabledSections: string[] = [],
  config: TemplateConfig = {}
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
  let html = template({
    ...parsed,
    css,
    visitorCount,
    activeSections,
    enabledSections,
  });

  const fontLink = buildFontLink(config);
  const configCss = buildConfigCss(config);
  if (fontLink) html = html.replace('</head>', `${fontLink}\n</head>`);
  if (configCss) html = html.replace('</head>', `<style>\n${configCss}\n</style>\n</head>`);

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
