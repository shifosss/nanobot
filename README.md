# Nanobot Web App

This repo now uses a browser-first React + Vite + Tailwind setup so Figma-generated web code can be dropped in without going through React Native or Expo compatibility layers.

## Stack

- React 19
- Vite
- Tailwind CSS
- React Router
- Supabase Web SDK

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Environment

Create `.env` with:

```bash
Database_Project_URL=your-project-url
Database_Public_Anon_Key=your-public-anon-key
```

Only the public anon key belongs in the browser bundle. Do not expose Supabase service-role keys in client-side code.

## Structure

```text
src/
  components/
  pages/
  providers/
  lib/
  styles/
```

`src/styles/index.css` is the main Tailwind entry point and is intended to match the way Figma-exported web code expects global CSS to work.
