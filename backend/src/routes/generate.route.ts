import { Router, Request, Response } from 'express';
import { GenerateRequest } from '../models/resume.model';
import { generateSite, VALID_TEMPLATE_IDS } from '../generator/site.generator';

const router = Router();

router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  const body = req.body as GenerateRequest;

  if (!body.parsed || !body.templateId) {
    res.status(400).json({ error: 'Missing parsed resume data or templateId.' });
    return;
  }

  if (!VALID_TEMPLATE_IDS.includes(body.templateId)) {
    res.status(400).json({
      error: `Invalid templateId. Must be one of: ${VALID_TEMPLATE_IDS.join(', ')}`,
    });
    return;
  }

  const enabledSections = body.enabledSections || [];

  try {
    const result = await generateSite(body.parsed, body.templateId, enabledSections);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate site.';
    res.status(500).json({ error: message });
  }
});

export default router;
