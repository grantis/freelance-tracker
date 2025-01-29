import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeLocalEnvironment() {
  console.log('🚀 Initializing local development environment...');

  try {
    // 1. Check if .env exists, if not create it from template
    console.log('📝 Setting up environment variables...');
    const envPath = path.join(__dirname, '..', '.env');
    const envExamplePath = path.join(__dirname, '..', '.env.example');

    try {
      await fs.access(envPath);
      console.log('✅ .env file already exists');
    } catch {
      const envTemplate = `# Database Configuration
DATABASE_URL=postgresql://localhost:5432/freelance_tracker

# Google OAuth Configuration
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback`;

      await fs.writeFile(envPath, envTemplate);
      console.log('✅ Created .env file with local configuration');
    }

    // 2. Check PostgreSQL installation
    console.log('🔍 Checking PostgreSQL installation...');
    try {
      await execAsync('psql --version');
      console.log('✅ PostgreSQL is installed');
    } catch {
      console.error('❌ PostgreSQL is not installed. Please install PostgreSQL 16 and try again.');
      process.exit(1);
    }

    // 3. Create PostgreSQL database if it doesn't exist
    console.log('🐘 Setting up PostgreSQL database...');
    try {
      await execAsync('psql -l | grep freelance_tracker');
      console.log('✅ Database already exists');
    } catch {
      try {
        await execAsync('createdb freelance_tracker');
        console.log('✅ Created database: freelance_tracker');
      } catch (error) {
        console.error('❌ Failed to create database. Please ensure PostgreSQL is running and you have the right permissions.');
        process.exit(1);
      }
    }

    // 4. Push database schema
    console.log('🔄 Pushing database schema...');
    try {
      await execAsync('npm run db:push');
      console.log('✅ Database schema pushed successfully');
    } catch (error) {
      console.error('❌ Failed to push database schema:', error);
      process.exit(1);
    }

    console.log('\n🎉 Local environment initialization complete!');
    console.log('\nNext steps:');
    console.log('1. Set up Google OAuth credentials in .env file');
    console.log('2. Run `npm run dev` to start the development server');
    console.log('\nTo get Google OAuth credentials:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a new project or select an existing one');
    console.log('3. Enable the Google+ API');
    console.log('4. Create OAuth 2.0 credentials');
    console.log('5. Add http://localhost:3000 to Authorized JavaScript origins');
    console.log('6. Add http://localhost:3000/api/auth/google/callback to Authorized redirect URIs');
  } catch (error) {
    console.error('❌ Error during initialization:', error);
    process.exit(1);
  }
}

initializeLocalEnvironment();