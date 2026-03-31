import { Router } from 'express';
import { getTemplateMetadata } from '../generator/site.generator';

const router = Router();

router.get('/templates', (_req, res) => {
  res.json({ templates: getTemplateMetadata() });
});

export default router;
