# Pet Registration System Kupwara

## Overview

This is a pet registration system for Animal Husbandry Department, Kupwara that allows pet owners to register their dogs and cats. The application features a multi-step approval workflow where registrations go through veterinary review before final authority approval. The system generates official registration certificates with QR codes for approved pets.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### District and Block Structure
The system is configured specifically for Kupwara district with the following blocks and veterinary dispensaries:
- **Kupwara Block**: Kupwara, Kandi Kupwara, Batpora, Drugmulla
- **Trehgam Block**: Trehgam, Jumagund, Awoora
- **Kralpora Block**: Kralpora, Budnambal, Harie, Chowkibal, Keran
- **Karnah Block**: Karnah, Chiterkote, Nachian
- **Sogam Block**: Sogam, Tikipora, Machil, Doniwari, Kurhama, Kalaroos, Lalpora
- **Handwara Block**: Handwara, Langate, Vilgam, Chogal, Mawar, Shatgund Bala
- **DVH Block**: DVH

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state, Zustand for client state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom theme variables
- **Build Tool**: Vite

The frontend follows a page-based structure with shared components. Key pages include:
- Home: Landing page with portal selection
- Owner Portal: Pet registration form for owners (requires block and dispensary selection)
- Vet Portal: Review pending registrations, approve/reject (each vet sees only their dispensary)
- Authority Portal: Final approval workflow
- Success: Registration confirmation and certificate display

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON API under `/api` prefix
- **Development**: tsx for TypeScript execution, Vite dev server with HMR

The server uses a clean separation between routes, storage, and static file serving. In development, Vite middleware handles frontend assets; in production, static files are served from the built `dist/public` directory.

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Migrations**: Managed via `drizzle-kit push`

Key database tables:
- `users`: Basic user authentication (id, username, password)
- `vet_officers`: Veterinary officer accounts with block and dispensary assignments
- `pet_registrations`: Full pet registration records with owner info, pet details, vaccination status, block, dispensary, and approval workflow status

### Authentication
- **Owner Portal**: No authentication required
- **Vet Portal**: Individual login credentials per dispensary (e.g., vet_kupwara/vet123)
- **Authority Portal**: password `admin123`
- Vet officers are auto-created on first login using DEFAULT_VET_CREDENTIALS from `shared/kupwara-data.ts`

### Registration Workflow
1. Owner submits registration (selects block and dispensary) → status: `pending_vet_review`
2. Vet at assigned dispensary reviews and approves → status: `pending_authority_approval`
3. Authority approves → status: `approved` (certificate available)
4. Any step can reject → status: `rejected`

Registration numbers follow format: `JK/Kupwara/{species}/{year}/{serial}`

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Uses `pg` client library with Drizzle ORM

### Key NPM Packages
- `@tanstack/react-query`: Server state management
- `react-hook-form` + `@hookform/resolvers`: Form handling with Zod validation
- `react-qr-code`: QR code generation for certificates
- `wouter`: Client-side routing
- `zustand`: Client state management
- `drizzle-orm` + `drizzle-zod`: Database ORM and schema validation

### Build & Development
- `vite`: Frontend build tool
- `esbuild`: Server bundling for production
- `tsx`: TypeScript execution for development
- Custom Vite plugins for Replit integration (dev banner, cartographer, meta images)
