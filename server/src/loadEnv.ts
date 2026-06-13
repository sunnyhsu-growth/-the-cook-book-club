import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Loaded as the very first import in index.ts so that every subsequently
// imported module (database.ts, claude.ts) sees the env vars. ESM hoists all
// imports above executable code, so dotenv MUST run from an imported module —
// not from a dotenv.config() call placed beneath the imports.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
