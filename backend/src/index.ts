import express from 'express';
import cors from 'cors';
import path from 'path';
import uploadRouter from './routes/upload.route';
import generateRouter from './routes/generate.route';
import templatesRouter from './routes/templates.route';
import deployRouter from './routes/deploy.route';
import previewRouter from './routes/preview.route';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:4200', methods: ['GET', 'POST'] }));
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api', uploadRouter);
app.use('/api', generateRouter);
app.use('/api', templatesRouter);
app.use('/api', deployRouter);
app.use('/api', previewRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Serve generated sites — must come after API routes
const sitesDir = path.join(__dirname, '..', 'sites');
app.use('/sites', express.static(sitesDir));

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
