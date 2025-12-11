# EU4 Space Wiki - Development Rules

This document outlines the core technologies and architectural guidelines for maintaining the EU4 Space Wiki application.

## Tech Stack & Guidelines

1.  **Framework:** React (using Vite for tooling).
2.  **Language:** TypeScript is mandatory for all components and utilities.
3.  **Styling:** Use Tailwind CSS exclusively for styling, adhering to the custom space theme defined in `index.html`.
4.  **UI Components:** Utilize components from `components/ui/Shared.tsx` (or shadcn/ui equivalents if introduced) for consistency.
5.  **Icons:** Use the `lucide-react` library for all icons.
6.  **Data & Backend:** Supabase is the sole provider for database operations, authentication, and file storage (Supabase Storage).
7.  **Routing:** State-based routing is managed within `App.tsx`.
8.  **Rich Text:** Use `react-quill` for rich text editing, ensuring image uploads are handled via Supabase Storage.
9.  **Caching:** Implement client-side caching using `lib/cache.ts` (localStorage) to minimize redundant API calls.
10. **Architecture:** Maintain a clear separation of concerns: `src/pages/` for views, `src/components/` for reusable UI, `src/contexts/` for global state, and `lib/` for backend utilities.