# Overview

This is a modern full-stack web application for Mintoro, an educational platform offering personal development and career counseling courses. The application features a React-based frontend with TypeScript, a Node.js/Express backend, and uses Drizzle ORM with PostgreSQL for data persistence. The platform allows users to browse courses, view detailed course information, and submit inquiries through a contact form.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development and build tooling
- **Routing**: Wouter for client-side routing with pages for home, courses, course details, about, and contact
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Styling**: Tailwind CSS with a custom design system using CSS variables for consistent theming

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for courses and inquiries
- **Request Handling**: Express middleware for JSON parsing, logging, and error handling
- **Development**: Custom Vite integration for development server with HMR support

## Data Storage Solutions
- **Database**: PostgreSQL with Neon Database as the cloud provider
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: Shared TypeScript schemas with Zod validation for runtime type checking
- **Migration**: Drizzle Kit for database migrations and schema synchronization
- **Fallback**: In-memory storage implementation for development/testing scenarios

## API Structure
- `GET /api/courses` - Retrieve all available courses
- `GET /api/courses/:id` - Retrieve specific course details
- `POST /api/inquiries` - Create new inquiry submissions
- `GET /api/inquiries` - Retrieve all inquiries (admin functionality)

## Development Tools
- **Build System**: Vite with React plugin for fast development and optimized production builds
- **Code Quality**: TypeScript for static type checking with strict mode enabled
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer
- **Development Experience**: Runtime error overlay and development banner for Replit environment

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **TypeScript**: Full TypeScript support with strict configuration
- **Build Tools**: Vite, ESBuild for production builds

## Database and ORM
- **Neon Database**: PostgreSQL cloud database service (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database toolkit (drizzle-orm, drizzle-kit)
- **Validation**: Zod schema validation library (drizzle-zod integration)

## UI and Styling
- **Component Library**: Shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Icons**: Lucide React icon library
- **Utilities**: clsx and tailwind-merge for conditional styling

## State Management and Data Fetching
- **TanStack Query**: Server state management and caching (@tanstack/react-query)
- **Form Handling**: React Hook Form with Hookform resolvers for validation

## Development and Deployment
- **Replit Integration**: Custom Vite plugins for Replit environment
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Date Handling**: date-fns for date manipulation and formatting