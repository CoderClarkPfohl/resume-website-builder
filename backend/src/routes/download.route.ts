import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { getSiteDir } from '../generator/site.generator';

const router = Router();

// GET /api/download/:siteId — stream the generated site as a .zip
router.get('/download/:siteId', (req: Request, res: Response): void => {
  const { siteId } = req.params;

  if (!siteId || !/^[\w-]+$/.test(siteId)) {
    res.status(400).json({ error: 'Invalid siteId.' });
    return;
  }

  const siteDir = getSiteDir(siteId);
  if (!fs.existsSync(siteDir)) {
    res.status(404).json({ error: 'Site not found. Generate it first.' });
    return;
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="resume-site.zip"`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });

  archive.pipe(res);
  archive.directory(siteDir, false);
  archive.finalize();
});

export default router;
