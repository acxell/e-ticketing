# E-Ticketing System

A full-stack ticketing system built with Next.js, Express.js, and PostgreSQL.

## Overview

This project consists of two main parts:
- Frontend: Next.js application with Mantine UI
- Backend: Express.js API with Prisma ORM

## Tech Stack

### Frontend
- Next.js 13+ (App Router)
- TypeScript
- Mantine UI
- React Query
- Zustand (State Management)
- Axios

### Backend
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Express Validator

## Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL
- npm/yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/acxell/e-ticketing.git
cd e-ticketing
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
```bash
# In backend/.env
DATABASE_URL="postgres://username:password@localhost:5432/e-ticketing"
JWT_SECRET="your-secret-key"
PORT=2000

# In frontend/.env
NEXT_PUBLIC_API_URL="http://localhost:2000"
```

5. Run database migrations and data seeding:
```bash
cd backend
npx prisma db push
npm run seed
```

6. Start the applications:
you can use nodemon too
```bash
# Terminal 1 - Backend
cd backend
npm run dev
or
nodemon .

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Features

- 🔐 Role-based access control
- 🎫 Ticket management
- 👥 Customer management
- 📦 Package management
- 📊 Dashboard and reports
- 🔄 Real-time updates

## Project Structure

```
e-ticketing/
├── backend/         # Express.js API
├── frontend/        # Next.js application
└── README.md       # This file
```

See individual README files in each directory for more detailed information:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## License

MIT

## Author

Acxell