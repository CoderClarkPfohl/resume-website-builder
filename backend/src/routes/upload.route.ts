import { Router, Request, Response } from 'express';
import multer from 'multer';
import { extractPdfText } from '../parser/pdf.parser';
import { extractDocxText } from '../parser/docx.parser';
import { parseResume } from '../parser/resume.parser';

const router = Router();

const ALLOWED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload a PDF or DOCX file.'));
    }
  },
});

router.post('/upload', upload.single('resume'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded.' });
    return;
  }

  try {
    const { buffer, mimetype } = req.file;
    let rawText: string;

    if (mimetype === 'application/pdf') {
      rawText = await extractPdfText(buffer);
    } else {
      rawText = await extractDocxText(buffer);
    }

    const parsed = parseResume(rawText);
    res.json({ parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse resume.';
    res.status(400).json({ error: message });
  }
});

export default router;
