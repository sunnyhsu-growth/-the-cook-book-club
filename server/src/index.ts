// MUST be first — loads .env before database.ts / claude.ts read process.env.
import './loadEnv.js';

import express from 'express';
import cors from 'cors';
import { testConnection } from './database.js';
import extractRoutes from './routes/extract.js';

console.log('🔍 Checking environment variables...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log(
  'SUPABASE key:',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    ? '✅ Set'
    : '❌ Missing',
);
console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing');
console.log('CLAUDE_MODEL:', process.env.CLAUDE_MODEL || 'claude-opus-4-8 (default)');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow the configured client origin plus any localhost port (Vite may pick
// 5173/5174/… depending on what's free), so dev "just works".
app.use(
  cors({
    origin: (origin, cb) => {
      const ok =
        !origin ||
        origin === process.env.CLIENT_URL ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      cb(null, ok);
    },
    credentials: true,
  }),
);
// Recipe photos arrive base64-encoded, so raise the body limit.
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

testConnection();

app.use('/api/extract', extractRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Recipe Book server is running!',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('🍳 Recipe Book backend is ready!');
});
