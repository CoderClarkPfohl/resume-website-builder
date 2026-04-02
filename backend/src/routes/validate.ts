import { Request, Response, NextFunction } from 'express';
import { VALID_TEMPLATE_IDS } from '../generator/site.generator';

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const ALLOWED_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display',
  'Merriweather', 'Source Sans 3', 'Nunito', 'Raleway', 'PT Serif', 'IBM Plex Sans',
];

/** Lightweight check that `parsed` has the minimum shape the generator needs. */
export function isValidParsedResume(parsed: unknown): parsed is Record<string, unknown> {
  if (!parsed || typeof parsed !== 'object') return false;
  const p = parsed as Record<string, unknown>;
  // name is the only strictly required field — everything else can be empty
  if (typeof p.name !== 'string') return false;
  if (p.experience !== undefined && !Array.isArray(p.experience)) return false;
  if (p.education !== undefined && !Array.isArray(p.education)) return false;
  if (p.skills !== undefined && !Array.isArray(p.skills)) return false;
  if (p.sections !== undefined && (typeof p.sections !== 'object' || p.sections === null)) return false;
  return true;
}

/** Validate and sanitize a TemplateConfig object. Returns a clean config. */
export function sanitizeConfig(raw: unknown): {
  accentColor?: string;
  density?: 'normal' | 'compact';
  fontFamily?: string;
} {
  if (!raw || typeof raw !== 'object') return {};
  const c = raw as Record<string, unknown>;
  const clean: Record<string, unknown> = {};

  if (typeof c.accentColor === 'string' && HEX_COLOR_RE.test(c.accentColor)) {
    clean.accentColor = c.accentColor;
  }
  if (c.density === 'compact') {
    clean.density = 'compact';
  }
  if (typeof c.fontFamily === 'string' && ALLOWED_FONTS.includes(c.fontFamily)) {
    clean.fontFamily = c.fontFamily;
  }
  return clean;
}

/** Validate templateId. */
export function isValidTemplateId(id: unknown): id is string {
  return typeof id === 'string' && VALID_TEMPLATE_IDS.includes(id);
}

/** Consistent JSON error response helper. */
export function sendError(res: Response, status: number, message: string) {
  res.status(status).json({ error: message });
}

/** Express middleware: reject JSON bodies larger than 2 MB. */
export function jsonSizeGuard(req: Request, res: Response, next: NextFunction): void {
  const len = req.headers['content-length'];
  if (len && parseInt(len, 10) > 2 * 1024 * 1024) {
    sendError(res, 413, 'Request body too large.');
    return;
  }
  next();
}
