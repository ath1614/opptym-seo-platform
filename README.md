# Opptym SEO Platform

A modern, comprehensive SEO optimization platform built with Next.js 14, featuring advanced tools for keyword research, competitor analysis, rank tracking, and organic traffic growth.

## 🚀 Features

- **Modern Tech Stack**: Built with Next.js 14, TypeScript, and TailwindCSS
- **Beautiful UI**: ShadCN/UI components with dark/light mode support
- **Smooth Animations**: Framer Motion for modern, engaging animations
- **SEO Optimized**: Comprehensive metadata, OpenGraph, and Twitter cards
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Theme Support**: Dark and light mode with system preference detection

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: ShadCN/UI
- **Animations**: Framer Motion
- **Theme**: next-themes
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
│   ├── ui/             # ShadCN/UI components
│   ├── navbar.tsx      # Navigation component
│   ├── footer.tsx      # Footer component
│   └── theme-provider.tsx # Theme provider
├── lib/                # Utility libraries
├── models/             # TypeScript type definitions
├── styles/             # Global styles and CSS
└── utils/              # Utility functions
```

### Root Directory Cleanup
- `tests/` — manual test and verification scripts (run with `node tests/<script>.js`)
- `scripts/` — utility scripts for seeding, debugging, and maintenance (run with `node scripts/<script>.js`)
- `docs/` — markdown documentation and reports
- Root now contains only configuration and documentation files for clarity.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd opptym-seo-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update the `.env.local` file with your actual values.

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Environment Variables

Copy `.env.example` to `.env.local` and update the following variables:

- `NEXT_PUBLIC_APP_URL`: Your application URL
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_SITE_NAME`: Site name for SEO
- `NEXT_PUBLIC_SITE_DESCRIPTION`: Site description for SEO
- Add your API keys for various SEO services

## 🎨 Customization

### Themes
The project supports both dark and light themes. The theme provider is configured in `src/app/layout.tsx`.

### Components
ShadCN/UI components can be added using:
```bash
npx shadcn@latest add [component-name]
```

### Styling
Global styles are in `src/app/globals.css`. TailwindCSS configuration is in `tailwind.config.ts`.

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔧 Configuration

### TypeScript
TypeScript is configured in `tsconfig.json` with strict settings and path aliases.

### ESLint
ESLint is configured with Next.js recommended rules in `.eslintrc.json`.

### TailwindCSS
TailwindCSS is configured in `tailwind.config.ts` with ShadCN/UI integration.

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, email support@opptymseo.com or create an issue in the repository.