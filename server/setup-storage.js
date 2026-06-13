// Setup Supabase Storage buckets for the Recipe Book.
// Run once:  node setup-storage.js   (from the server/ directory)

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
// Bucket creation needs the service-role key.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKETS = [
  { name: 'recipe-images', public: true },   // finished dish photos
  { name: 'recipe-sources', public: true },  // original captured photos/handwriting
];

async function setup() {
  console.log('🔧 Setting up Supabase Storage buckets...\n');

  const { data: existing, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('❌ Failed to list buckets:', listError.message);
    console.log('\n⚠️  Create them manually in the Supabase dashboard (Storage → New bucket):');
    BUCKETS.forEach((b) => console.log(`   - ${b.name} (public: ${b.public})`));
    process.exit(1);
  }

  for (const bucket of BUCKETS) {
    if (existing?.some((b) => b.name === bucket.name)) {
      console.log(`✅ Bucket "${bucket.name}" already exists.`);
      continue;
    }
    const { error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: '10MB',
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    });
    if (error) {
      console.error(`❌ Failed to create "${bucket.name}":`, error.message);
    } else {
      console.log(`📦 Created bucket "${bucket.name}" (public: ${bucket.public}).`);
    }
  }

  console.log('\n✨ Storage setup complete.');
}

setup();
