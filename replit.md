# Overview

This is a full-stack time tracking calculator application built with React, Express.js, and PostgreSQL. The application allows users to track work hours for four team members (Nafees, Waqas, Cheetan, and Nadeem), calculate per-minute rates based on a configurable base amount, and manage time entries with CRUD operations. The frontend features a modern UI built with shadcn/ui components and Tailwind CSS, while the backend provides RESTful APIs for data management and calculations.

# User Preferences

Preferred communication style: Simple, everyday language.
User language: Urdu/English mix (user communicates in Urdu).

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Framework**: Express.js with TypeScript for REST API development
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Shared TypeScript schema definitions using Drizzle and Zod for validation
- **Storage**: Abstracted storage interface with in-memory implementation for development
- **Validation**: Zod schemas for request/response validation and type safety

## Data Storage
- **Database**: PostgreSQL configured via Drizzle with migrations support
- **Tables**: `time_entries` for tracking work hours and `settings` for configuration
- **ORM**: Drizzle ORM provides type-safe database queries and automatic TypeScript types
- **Migrations**: Drizzle Kit manages database schema changes and migrations

## Authentication & Authorization
- **Current State**: No authentication implemented - application is open access
- **Session Management**: Express session middleware configured for future authentication needs

## Development Environment
- **Build Tool**: Vite for fast development server and optimized production builds
- **Package Manager**: npm with lock file for dependency management
- **TypeScript**: Strict configuration with path mapping for clean imports
- **Hot Reload**: Vite HMR for instant development feedback

# External Dependencies

## Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL driver optimized for serverless environments
- **drizzle-orm**: Modern TypeScript ORM for database operations
- **express**: Web framework for REST API server
- **@tanstack/react-query**: Server state management and caching for React

## UI & Styling Libraries
- **@radix-ui/***: Headless UI components for accessibility and customization
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library with React components

## Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **drizzle-kit**: Database migration and introspection tool
- **esbuild**: Fast JavaScript bundler for production builds

## Form & Validation
- **react-hook-form**: Performant forms library
- **zod**: Schema validation library
- **@hookform/resolvers**: Validation resolvers for React Hook Form

## Date & Utility Libraries
- **date-fns**: Modern date utility library
- **clsx**: Utility for constructing className strings
- **nanoid**: URL-safe unique ID generator