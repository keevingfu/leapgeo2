# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Leap GEO Platform** - A GEO (Generative Engine Optimization) content marketing platform for improving brand citation rates in AI search engines (ChatGPT, Claude, Perplexity, etc.).

Tech Stack: React 19 + TypeScript + Vite + Tailwind CSS 4 + Lucide Icons

## Development Commands

### Essential Commands
```bash
npm run dev           # Start dev server (default port: 5173)
npm run build         # Type-check + production build
npm run preview       # Preview production build
npm run type-check    # Run TypeScript compiler without emitting files
npm run lint          # Run ESLint
```

### Verification Scripts
```bash
npm run verify        # Run type-check + build (full verification)
npm run auto-verify   # Automated verification with colored output
npm run quick-check   # Quick health check
npm run health-check  # Detailed health check (Node.js script)
```

### Testing
```bash
npx playwright test                    # Run all E2E tests
npx playwright test --headed           # Run tests in headed mode
npx playwright test <test-file>        # Run specific test file
npx playwright show-report            # View test results
```

## Architecture Overview

### Modular Page-Based Architecture

The application uses a **Portal-based layout** with completely independent page components:

```
src/
├── App.tsx                          # Root component
├── main.tsx                         # Vite entry point
├── components/
│   ├── Layout/
│   │   └── Portal.tsx              # Main layout shell (sidebar + header + routing)
│   └── pages/                       # Self-contained page modules
│       ├── Dashboard.tsx
│       ├── Projects.tsx
│       ├── KnowledgeGraph.tsx
│       ├── PromptManagement.tsx
│       ├── ContentGenerator.tsx
│       ├── CitationTracking.tsx
│       └── Analytics.tsx
```

**Key Design Principle**: Portal.tsx handles ONLY layout and navigation. Each page component is fully independent with its own state, UI, and business logic.

### Page Routing Mechanism

Portal.tsx uses a simple switch-based routing:

```typescript
const [activePage, setActivePage] = useState('dashboard');

const renderPage = () => {
  switch (activePage) {
    case 'dashboard': return <Dashboard />;
    case 'projects': return <Projects />;
    // ... other pages
  }
};
```

Navigation items are defined in a hierarchical structure with sections (Overview, GEO Optimization, Commerce, System).

### Adding New Pages

1. Create component in `src/components/pages/NewPage.tsx`
2. Import in `Portal.tsx`
3. Add navigation item to `navigation` array
4. Add route case to `renderPage()` switch statement

## TypeScript Configuration

**Important**: Many existing page components use `// @ts-nocheck` to bypass type errors during rapid prototyping. For production:

1. Remove `@ts-nocheck` directives
2. Add proper TypeScript interfaces for props and state
3. Enable stricter type checking in tsconfig.json

## Styling Standards

### Tailwind CSS Patterns

The project uses Tailwind CSS 4 with PostCSS. Common component patterns:

- **Cards**: `bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg`
- **Primary Button**: `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700`
- **Secondary Button**: `px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50`
- **Page Title**: `text-3xl font-bold text-gray-900`
- **Spacing Container**: `space-y-6`

### Accessibility Issues

The codebase currently has accessibility warnings:
- Missing button `type` attributes (should be "button", "submit", or "reset")
- Select elements without accessible names (need `aria-label` or associated `<label>`)
- Avoid inline styles; prefer Tailwind classes

## Project-Specific Context

### GEO Platform Domain

This platform helps brands optimize content for AI search engines. Core concepts:

- **Citation Rate**: Percentage of AI responses that cite the brand (target: >28%)
- **Prompts**: Search queries optimized for AI platforms (P0/P1/P2 priority)
- **Knowledge Graph**: Entity relationships (Brand → Product → Feature → Problem → UserGroup)
- **Multi-Project**: Single platform managing multiple brand campaigns
- **9 Platform Strategy**: YouTube, Reddit, Quora, Medium, Wikipedia, LinkedIn, Twitter, Amazon, Official Site

### Mock Data Structure

All page components currently use inline mock data. Future backend integration will require:
- API client setup (Axios already installed)
- State management (Zustand already installed but unused)
- Loading/error states for async operations

## Verification Workflow

Before committing changes, the auto-verify script checks:
1. TypeScript type errors (`npm run type-check`)
2. Production build success (`npm run build`)

The script outputs colored results and exits with appropriate status codes.

## Known Technical Debt

1. **No React Router**: Uses custom routing in Portal.tsx (consider react-router-dom migration)
2. **No Global State**: Each page has isolated state (Zustand installed but not configured)
3. **Mock Data**: All components use hardcoded data arrays
4. **Type Safety**: Many `@ts-nocheck` directives need removal
5. **Accessibility**: Missing ARIA labels, button types, and semantic HTML improvements needed
6. **Coming Soon Pages**: 11 navigation items show placeholder "Coming Soon" pages

## UI Component Patterns

### Page Component Template

Every page follows this structure:

```typescript
const PageName: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page header with title and actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
          <p className="text-gray-600 mt-1">Description</p>
        </div>
        <div className="flex gap-3">
          {/* Action buttons */}
        </div>
      </div>

      {/* Page content cards */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Content */}
      </div>
    </div>
  );
};
```

### Icon System

Uses Lucide React icons with consistent sizing:
- Navigation icons: `size={20}`
- Page icons: `className="w-4 h-4"` or `className="w-5 h-5"`
- Large decorative icons: `className="w-12 h-12"` or `className="w-16 h-16"`

## Related Documentation

- `PROJECT-STRUCTURE.md` - Detailed architecture documentation
- `AUTOMATION-GUIDE.md` - Automated development workflows and MCP integration
- `FRONTEND-BUILD-PLAN.md` - Original 14-day development plan
- `portal.html` - Standalone HTML version for testing without build tools
