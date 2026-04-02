import { Router, Request, Response } from 'express';
import { generateSite } from '../generator/site.generator';
import { isValidParsedResume, isValidTemplateId, sanitizeConfig, sendError } from './validate';

const router = Router();

router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  const { parsed, templateId, enabledSections = [], config: rawConfig = {} } = req.body;

  if (!isValidParsedResume(parsed)) {
    sendError(res, 400, 'Invalid or missing parsed resume data.');
    return;
  }

  if (!isValidTemplateId(templateId)) {
    sendError(res, 400, `Invalid templateId.`);
    return;
  }

  if (!Array.isArray(enabledSections)) {
    sendError(res, 400, 'enabledSections must be an array.');
    return;
  }

  const config = sanitizeConfig(rawConfig);

  try {
    const result = await generateSite(parsed as any, templateId, enabledSections, config);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate site.';
    sendError(res, 500, message);
  }
});

export default router;
