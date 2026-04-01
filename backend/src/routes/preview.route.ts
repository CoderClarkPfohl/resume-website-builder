import { Router, Request, Response } from 'express';
import { VALID_TEMPLATE_IDS, renderTemplate } from '../generator/site.generator';
import { SAMPLE_RESUME, SAMPLE_SECTIONS } from '../generator/sample.data';

const router = Router();

// Sample-data preview (used by template cards before resume is available)
router.get('/preview/:templateId', (req: Request, res: Response): void => {
  const { templateId } = req.params;

  if (!VALID_TEMPLATE_IDS.includes(templateId)) {
    res.status(404).json({ error: 'Template not found.' });
    return;
  }

  try {
    const html = renderTemplate(SAMPLE_RESUME, templateId, SAMPLE_SECTIONS);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to render preview.';
    res.status(500).json({ error: message });
  }
});

// Live preview with the user's actual parsed resume data
router.post('/preview', (req: Request, res: Response): void => {
  const { parsed, templateId, enabledSections = [], config = {} } = req.body;

  if (!parsed || !templateId) {
    res.status(400).json({ error: 'Missing parsed or templateId.' });
    return;
  }

  if (!VALID_TEMPLATE_IDS.includes(templateId)) {
    res.status(400).json({ error: 'Invalid templateId.' });
    return;
  }

  try {
    const html = renderTemplate(parsed, templateId, enabledSections, config);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to render preview.';
    res.status(500).json({ error: message });
  }
});

export default router;
