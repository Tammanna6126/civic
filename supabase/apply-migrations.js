/**
 * CIVIC INTELLIGENCE — Supabase Migration Runner
 * 
 * This script reads 'supabase/migrations/001_initial_schema.sql' and applies
 * it directly to your Supabase PostgreSQL database.
 * 
 * Usage:
 *   node supabase/apply-migrations.js
 * 
 * Requirements:
 *   Ensure your server/.env or root .env has:
 *     DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
 *   OR you can paste the contents of 'supabase/migrations/001_initial_schema.sql'
 *   directly into the Supabase Dashboard -> SQL Editor and click 'Run'.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env or .env
const serverEnvPath = path.resolve(__dirname, '../server/.env');
const rootEnvPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

async function runMigration() {
  const migrationFilePath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
  
  if (!fs.existsSync(migrationFilePath)) {
    console.error(`❌ Migration file not found at: ${migrationFilePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
  console.log(`\n======================================================`);
  console.log(`🚀 CIVIC INTELLIGENCE — SUPABASE MIGRATION RUNNER`);
  console.log(`======================================================`);
  console.log(`📄 Reading SQL file: 001_initial_schema.sql (${(sqlContent.length / 1024).toFixed(1)} KB)`);

  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    console.log(`\n⚠️  DATABASE_URL environment variable is not set yet.`);
    console.log(`\n👉 EASY OPTION:`);
    console.log(`   1. Open your Supabase Cloud Dashboard: https://supabase.com/dashboard`);
    console.log(`   2. Select your project -> click "SQL Editor" on the left menu.`);
    console.log(`   3. Click "+ New query", paste the contents of:`);
    console.log(`      'supabase/migrations/001_initial_schema.sql'`);
    console.log(`   4. Click "Run" (green button). All 8 tables, RLS, and 45 complaints will be created instantly!\n`);
    console.log(`👉 CLI OPTION:`);
    console.log(`   Set DATABASE_URL in server/.env (Project Settings -> Database -> Connection String -> URI)`);
    console.log(`   Then re-run: node supabase/apply-migrations.js\n`);
    return;
  }

  try {
    let pg;
    try {
      pg = require('pg');
    } catch (e) {
      console.log(`📦 Installing 'pg' package temporarily to run direct database migration...`);
      require('child_process').execSync('npm install pg dotenv', { stdio: 'inherit' });
      pg = require('pg');
    }

    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    console.log(`🔌 Connecting to Supabase Cloud PostgreSQL...`);
    await client.connect();
    console.log(`✅ Connected successfully! Applying initial schema and synthetic seed data...`);

    await client.query(sqlContent);

    console.log(`🎉 Migration successfully applied!`);
    console.log(`   - 8 Normalized Tables created`);
    console.log(`   - Row Level Security (RLS) policies activated`);
    console.log(`   - Indexes and auto-update triggers configured`);
    console.log(`   - 45 Curated synthetic civic complaints and seed analyses loaded`);
    console.log(`======================================================\n`);

    await client.end();
  } catch (err) {
    console.error(`❌ Migration failed:`, err.message);
    console.log(`\n💡 Note: You can always paste 'supabase/migrations/001_initial_schema.sql' into the Supabase Dashboard SQL Editor directly to apply it in 1 second!`);
    process.exit(1);
  }
}

runMigration();
