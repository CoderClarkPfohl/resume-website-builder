import { Router, Request, Response } from 'express';
import { renderTemplate } from '../generator/site.generator';
import { SAMPLE_RESUME, SAMPLE_SECTIONS } from '../generator/sample.data';
import { isValidParsedResume, isValidTemplateId, sanitizeConfig, sendError } from './validate';

const router = Router();

// Sample-data preview (used by template cards before resume is available)
router.get('/preview/:templateId', (req: Request, res: Response): void => {
  const { templateId } = req.params;

  if (!isValidTemplateId(templateId)) {
    sendError(res, 404, 'Template not found.');
    return;
  }

  try {
    const html = renderTemplate(SAMPLE_RESUME, templateId, SAMPLE_SECTIONS);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to render preview.';
    sendError(res, 500, message);
  }
});

// Live preview with the user's actual parsed resume data
router.post('/preview', (req: Request, res: Response): void => {
  const { parsed, templateId, enabledSections = [], config: rawConfig = {} } = req.body;

  if (!isValidParsedResume(parsed)) {
    sendError(res, 400, 'Invalid or missing parsed resume data.');
    return;
  }

  if (!isValidTemplateId(templateId)) {
    sendError(res, 400, 'Invalid templateId.');
    return;
  }

  if (!Array.isArray(enabledSections)) {
    sendError(res, 400, 'enabledSections must be an array.');
    return;
  }

  const config = sanitizeConfig(rawConfig);

  try {
    const html = renderTemplate(parsed as any, templateId, enabledSections, config);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to render preview.';
    sendError(res, 500, message);
  }
});

export default router;
