import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { v4 as uuidv4 } from 'uuid';
import { ParsedResume, GenerateResponse, TemplateMetadata } from '../models/resume.model';

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const SITES_DIR = path.join(__dirname, '..', '..', 'sites');

export const VALID_TEMPLATE_IDS = [
  'classic', 'modern', 'minimal', 'terminal', 'bento',
  'dark', 'editorial', 'glass', 'sidebar', 'retro',
];

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

export async function generateSite(
  parsed: ParsedResume,
  templateId: string
): Promise<GenerateResponse> {
  const templateDir = path.join(TEMPLATES_DIR, templateId);
  const hbsPath = path.join(templateDir, 'index.hbs');
  const cssPath = path.join(templateDir, 'style.css');

  const hbsSource = fs.readFileSync(hbsPath, 'utf-8');
  const css = fs.readFileSync(cssPath, 'utf-8');

  const template = Handlebars.compile(hbsSource);
  const visitorCount = Math.floor(Math.random() * 90000) + 10000;
  const html = template({ ...parsed, css, visitorCount });

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
