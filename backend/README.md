# E-Ticketing System Backend

Express.js backend for the E-Ticketing system with Prisma ORM and PostgreSQL.

## Tech Stack

- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Express Validator

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js         # Seed data
├── src/
│   ├── auth/           # Authentication
│   ├── customers/      # Customer management
│   ├── tickets/        # Ticket management
│   ├── packages/       # Package management
│   ├── roles/          # Role management
│   ├── users/          # User management
│   ├── middleware/     # Custom middleware
│   └── index.js        # Entry point
└── package.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env file
cp .env

# Add required variables
DATABASE_URL="postgres://username:password@localhost:5432/e-ticketing"
JWT_SECRET="your-secret-key"
PORT=2000
```

3. Run migrations:
```bash
npx prisma db push
```

4. Seed the database:
```bash
npx prisma db seed
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

### Authentication

```http
POST /auth/login
Content-Type: application/json

{
    "username": "admin",
    "password": "password"
}
```

### Tickets

```http
# Get all tickets
GET /tickets

# Create ticket
POST /tickets
{
    "title": "New Ticket",
    "description": "Description",
    "customerId": 1,
    "priority": "MEDIUM"
}

# Update ticket status
PATCH /tickets/:id/status
{
    "status": "IN_PROGRESS"
}
```

### Users

```http
# Get all users
GET /users

# Create user
POST /users
{
    "username": "newuser",
    "password": "password",
    "email": "user@example.com",
    "roleId": 1
}
```

### Packages

```http
# Get all packages
GET /packages

# Create package
POST /packages
{
    "name": "Basic Package",
    "code": "BASIC",
    "price": 99.99
}
```

## Error Handling

The API uses standard HTTP status codes and returns errors in this format:

```json
{
    "success": false,
    "error": "Error message",
    "errors": ["Validation error 1", "Validation error 2"]
}
```

## Database Schema

Key models include:
- User
- Ticket
- Customer
- Package
- Role
- Permission

See `prisma/schema.prisma` for complete schema details.

## Development

### Code Style
- Use async/await
- Follow repository pattern
- Implement proper error handling
- Use middleware for common functionality

### Adding New Features
1. Create new directory in `src/`
2. Add controller, service, and repository files
3. Update routes in `index.js`
4. Add necessary Prisma schema changes
5. Run migrations

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables
3. Run database migrations:
```bash
npx prisma migrate deploy
```

4. Start the server:
```bash
npm start
```

5. I've installed and include nodemon for the backend
run `nodemon .` for using it and it will run based on your port declaration and usage

## Common Issues

1. Database connection issues:
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check network access

2. Authentication issues:
   - Verify JWT_SECRET is set
   - Check token expiration
   - Verify user credentials

## License

MIT