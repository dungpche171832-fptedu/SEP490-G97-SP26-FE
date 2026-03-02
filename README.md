# Project Title

Next.js App

# Project Description

A modern Next.js application built with the App Router and TypeScript, using TailwindCSS and Ant Design for UI, plus ESLint and Prettier for consistent code quality. The project includes lint-staged and Husky pre-commit hooks to enforce formatting and linting before commits.

# Key Features

- Next.js App Router architecture
- Type-safe development with TypeScript
- Styling with TailwindCSS and Ant Design
- Opinionated code quality via ESLint and Prettier
- Pre-commit checks with lint-staged and Husky

# Tech Stack

- Next.js (App Router)
- React
- TypeScript
- TailwindCSS
- Ant Design (antd)
- ESLint
- Prettier
- Husky + lint-staged

# Installation

1. Install dependencies:

```bash
npm install
```

# Development

1. Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

# Production Build

1. Build the app:

```bash
npm run build
```

2. Start the production server:

```bash
npm run start
```

# Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the app for production
- `npm run start`: Run the production server
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix lint issues
- `npm run format`: Format code with Prettier
- `npm run prepare`: Install Husky hooks

# Folder Structure

- `.husky`: Git hooks configuration (pre-commit)
- `public`: Static assets served at the site root
- `src`: Application source code
- `src/app`: App Router routes, layouts, and pages
- `src/components`: Reusable UI components
- `src/hooks`: Custom React hooks
- `src/lib`: Shared utilities and libraries
- `src/styles`: Global styles and Tailwind setup
- `src/types`: Shared TypeScript types and interfaces

# Contribution Guidelines

1. Create a new branch for your change.
2. Keep code formatted and linted (pre-commit hooks will help).
3. Submit a clear, focused pull request describing the change.

# License

No license file is currently provided. All rights reserved unless a license is added.
