# E-Ticketing System Frontend

Next.js frontend for the E-Ticketing system with Mantine UI and TypeScript.

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Mantine UI
- React Query
- Zustand
- Axios

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js 13 App Router pages
│   │   ├── customers/       # Customer management
│   │   ├── login/          # Authentication
│   │   ├── packages/       # Package management
│   │   ├── roles/          # Role management
│   │   ├── tickets/        # Ticket management
│   │   ├── users/          # User management
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # Shared components
│   │   ├── AppShell.tsx    # Main layout wrapper
│   │   └── ...
│   └── lib/               # Utilities and configs
│       ├── api.ts         # API client
│       ├── permissions.ts  # Permission helpers
│       └── store.ts       # Zustand store
├── public/               # Static files
└── package.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env.local file
cp .env.example .env.local

# Add required variables
NEXT_PUBLIC_API_URL="http://localhost:2000"
```

3. Start the development server:
```bash
npm run dev
```

## Features

### Authentication
- Login page with form validation
- JWT token management
- Protected routes
- Role-based access control

### Ticket Management
- Create and update tickets
- Status management
- Priority levels
- Ticket assignment
- Filtering and search

### Customer Management
- Customer registration
- Package assignment
- Customer details view
- Search functionality

### Package Management
- Create and edit packages
- Price management
- Package assignment

### User Management
- User creation
- Role assignment
- Permission management

## Components

### AppShell
Main layout component with:
- Navigation sidebar
- Header with user info
- Responsive design

### Form Components
- Input validation
- Error handling
- Loading states
- Success feedback

### Table Components
- Sorting
- Filtering
- Pagination
- Action buttons

## State Management

Using Zustand for:
- Authentication state
- User preferences
- UI state

Example:
```typescript
import { useAuthStore } from '@/lib/store';

const user = useAuthStore(state => state.user);
```

## API Integration

Using React Query for:
- Data fetching
- Cache management
- Optimistic updates
- Error handling

Example:
```typescript
const { data, isLoading } = useQuery(['tickets'], fetchTickets);
```

## Styling

Using Mantine UI with:
- Custom theme
- Responsive design
- Dark mode support
- CSS modules for custom styling

## Development

### Adding New Features
1. Create new page in `src/app`
2. Add necessary components
3. Set up API integration
4. Add to navigation
5. Implement permissions

### Code Style
- Use TypeScript
- Follow component patterns
- Implement proper error handling
- Use loading states

## Building for Production

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## Performance Optimization

- Image optimization
- Code splitting
- Cache management
- Bundle size optimization

## Common Issues

1. API Connection:
   - Check NEXT_PUBLIC_API_URL
   - Verify API is running
   - Check CORS settings

2. Authentication:
   - Clear local storage
   - Check token expiration
   - Verify API endpoints

## License

MIT