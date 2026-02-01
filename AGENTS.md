# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js/Express API service (referred to as "Acquisitions API") that provides user authentication functionality using JWT tokens and cookies. The application uses:
- **Database**: PostgreSQL via Neon (serverless) with Drizzle ORM
- **Authentication**: JWT tokens stored in HTTP-only cookies
- **Validation**: Zod schemas
- **Logging**: Winston with file and console transports

## Development Commands

### Running the Application
```powershell
npm run dev
```
Runs the server with Node's `--watch` flag for auto-reloading on file changes. Server starts on port 3000 by default (configurable via `PORT` env variable).

### Database Management
```powershell
npm run db:generate    # Generate Drizzle migrations from schema changes
npm run db:migrate     # Apply migrations to database
npm run db:studio      # Open Drizzle Studio (database GUI)
```

### Code Quality
```powershell
npm run lint           # Check for linting errors
npm run lint:fix       # Auto-fix linting errors
npm run format         # Format all files with Prettier
npm run format:check   # Check formatting without modifying files
```

## Architecture

### Import Path Aliases
The project uses Node.js import maps (package.json `imports` field) for cleaner imports:
- `#src/*` → `./src/*`
- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`

Always use these aliases when adding new imports.

### Application Structure
- **Entry Point**: `src/index.js` loads environment variables and imports `src/server.js`
- **Server Setup**: `src/server.js` initializes the Express app from `src/app.js`
- **App Configuration**: `src/app.js` configures middleware (helmet, cors, morgan, cookie-parser) and registers routes

### Request Flow Pattern
1. **Route** (`src/routes/*.routes.js`) defines endpoint and maps to controller
2. **Controller** (`src/controllers/*.controller.js`) validates request using Zod schemas, calls service layer, handles responses
3. **Service** (`src/services/*.service.js`) contains business logic and database operations
4. **Model** (`src/models/*.model.js`) defines Drizzle ORM schema

### Database Configuration
The database connection (`src/config/database.js`) has special handling for local development:
- In development mode, it configures Neon to use `http://neon-local:5432/sql` endpoint
- Uses `@neondatabase/serverless` driver with Drizzle ORM
- Schema files are located in `src/models/*.js`
- Migration files are generated in the `drizzle/` directory

### Logging
Winston logger is configured in `src/config/logger.js`:
- Error logs → `logs/error.log`
- All logs → `logs/combined.log`
- Console output in non-production environments
- Log level controlled by `LOG_LEVEL` environment variable (default: 'info')

## Code Style Requirements

### ESLint Rules (enforced)
- **Indentation**: 2 spaces (SwitchCase: 1 additional level)
- **Line breaks**: Windows-style (`\r\n`)
- **Quotes**: Single quotes only
- **Semicolons**: Required
- **Variables**: No `var`, prefer `const`, unused vars starting with `_` are allowed
- **Functions**: Prefer arrow callbacks
- **Objects**: Use shorthand syntax

### Authentication Implementation
- JWT tokens are signed with `JWT_SECRET` env variable, expiry controlled by `JWT_EXPIRES_IN` (default: '1d')
- Tokens are stored as HTTP-only cookies with these settings:
  - `httpOnly: true`
  - `secure: true` in production only
  - `sameSite: 'strict'`
  - `maxAge: 15 * 60 * 1000` (15 minutes)
- JWT utilities are in `src/utils/jwt.js` (sign/verify methods)
- Cookie utilities are in `src/utils/cookies.js` (set/clear/get methods)

## Environment Variables

Required variables (create `.env` file):
- `DATABASE_URL`: PostgreSQL connection string for Neon database
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_EXPIRES_IN`: Token expiration time (e.g., '1d', '7d')
- `NODE_ENV`: Environment mode ('development', 'production')
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Winston log level (default: 'info')

## Adding New Features

### Adding a New Route/Feature
1. Create model in `src/models/*.model.js` using Drizzle schema syntax
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply migration
4. Create Zod validation schema in `src/validations/*.validation.js`
5. Create service functions in `src/services/*.service.js`
6. Create controller in `src/controllers/*.controller.js`
7. Create router in `src/routes/*.routes.js`
8. Register router in `src/app.js`

### Validation Pattern
All request validation uses Zod with the following pattern:
```javascript
const validationResult = schema.safeParse(req.body);
if (!validationResult.success) {
  return res.status(400).json({
    error: 'Validation failed',
    details: formatValidationError(validationResult.error)
  });
}
```
Use the `formatValidationError` utility from `#utils/format.js` for consistent error formatting.

### Error Handling Pattern
Controllers should:
- Catch errors in try/catch blocks
- Log errors with `logger.error()`
- Return appropriate HTTP status codes
- Pass unexpected errors to `next(e)` for Express error handling middleware
