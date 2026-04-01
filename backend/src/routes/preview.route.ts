import { Router, Request, Response } from 'express';
import { VALID_TEMPLATE_IDS, renderTemplate } from '../generator/site.generator';
import { SAMPLE_RESUME, SAMPLE_SECTIONS } from '../generator/sample.data';

const router = Router();

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

export default router;
