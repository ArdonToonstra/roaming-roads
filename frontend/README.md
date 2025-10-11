# Roaming Roads Frontend

A modern Next.js 15 frontend for the Roaming Roads travel blog, consuming data from the Payload CMS backend.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4 + Typography plugin
- **Language**: TypeScript
- **Icons**: Lucide React
- **Themes**: Dark/Light mode support
- **Data Source**: Payload CMS API

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

Create a `.env.local` file:

```env
# CMS API URL (your deployed Payload CMS)
NEXT_PUBLIC_CMS_URL=https://your-cms-domain.vercel.app

# Optional: Enable draft mode for preview
CMS_SECRET=your-payload-secret
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── lib/                # Utilities and API functions
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

## Features

- 🌍 Travel blog with trip details
- 🗺️ Interactive maps
- 📱 Responsive design
- 🌙 Dark/light theme
- 🔍 Search functionality
- 📖 Rich content display
- ⚡ Static generation for performance
