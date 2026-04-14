# Deployment Guide - FlashFix AI (Modular Version)

This project has been refactored from a monolithic HTML file to a modern React + Vite + TypeScript project.

## Local Development
1. `npm install`
2. `npm run dev`

## Production Build
1. `npm run build`
2. The production files will be generated in the `dist/` folder.

## AWS Deployment
1. Ensure AWS CLI is configured.
2. Run the deployment script:
   ```powershell
   ./deploy-aws.ps1
   ```
   Note: The script has been updated to upload the contents of the `dist/` folder.

## Supabase Configuration
1. Create a Supabase project.
2. Run the SQL schema provided in `.kiro/specs/comprehensive-project-improvement/supabase_schema.sql`.
3. Add the following to your `.env` file:
   ```
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```
