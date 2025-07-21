# Habitualize Frontend

This is the frontend for the Habitualize app, built with React 19, Vite, and TanStack Query.

## Overview

- **Framework**: React 19 with modern hooks and functional components
- **Build Tool**: Vite for fast development and optimized builds
- **Data Management**: TanStack Query for server state management and caching
- **Date Utilities**: date-fns for robust date manipulation
- **Styling**: CSS modules with responsive design
- **Code Quality**: ESLint + Prettier for consistent code formatting
- **Routing**: React Router DOM for client-side navigation

## Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:5000` (see backend README)

## Quickstart

```sh
npm install
npm run dev
```

The development server will start at [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` — Start development server (port 3000)
- `npm run build` — Build for production
- `npm run preview` — Preview production build locally
- `npm run lint` — Lint code with ESLint
- `npm run format` — Format code with Prettier
- `npm run clean` — Remove build output and Vite cache

### Configuration Files

- `vite.config.js` — Vite configuration (port 3000, auto-open browser)
- `eslint.config.js` — ESLint configuration for code quality
- `.prettierrc` — Prettier configuration for code formatting

## Key Dependencies

### Core Libraries

- **React 19**: Modern React with concurrent features
- **React Router DOM 6**: SPA routing and navigation
- **TanStack Query**: Server state management, caching, and synchronization
- **date-fns**: Comprehensive date utility library
- **Vite**: Fast build tool and development server

### Development Tools

- **ESLint**: Code linting with React-specific rules
- **Prettier**: Code formatting
- **React DevTools**: TanStack Query DevTools for debugging

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# Backend API URL (optional - defaults to http://127.0.0.1:5000)
VITE_API_BASE_URL=http://localhost:5000
```

### Backend Integration

The frontend expects the backend to be running on `http://localhost:5000`.
Key API endpoints used:

- Categories: `/categories`
- Sequences: `/sequences`  
- Habits: `/habits`

## Component Architecture

### State Management Strategy

- **Server State**: TanStack Query for all backend data (habits, sequences, categories)
- **Local State**: React useState/useEffect for UI state (selected date, modals, etc.)
- **Custom Hooks**: Encapsulate business logic and data operations

### Key Features

- **Date Navigation**: Week/month view with habit tracking by date
- **Category Management**: Create, edit, and organize habit categories
- **Habit Dashboard**: Add, complete, and track habit progress
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Optimistic updates with automatic cache invalidation

## Development Notes

### Code Organization

- Components are organized by feature domain
- Custom hooks handle all data operations
- API service centralizes backend communication
- Utilities provide shared functionality

### Best Practices

- Use functional components with hooks
- Implement proper error boundaries
- Follow React Query patterns for server state
- Maintain consistent code formatting with Prettier

### Troubleshooting

**Common Issues:**

1. **Backend Connection**: Ensure backend is running on port 5000
2. **CORS Errors**: Backend has CORS enabled, check network tab for details
3. **Build Errors**: Clear node_modules and reinstall dependencies
4. **Port Conflicts**: Change port in `vite.config.js` if 3000 is occupied

For full-stack setup and backend configuration, see the main project README.
