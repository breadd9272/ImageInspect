# Tanker Calculation - Vercel Deployment

## Quick Deploy to Vercel

1. **Connect your GitHub repository to Vercel**
2. **Build settings will be automatically detected**
3. **Environment variables setup** (if needed for database):
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add your database connection strings

## File Structure

```
/api/                    # Vercel serverless functions
├── time-entries.js      # GET, POST /api/time-entries
├── time-entries/[id].js # PUT, DELETE /api/time-entries/:id
└── settings.js          # GET, PUT /api/settings

/client/                 # Frontend React app
/shared/                 # Shared types and schemas
vercel.json             # Vercel configuration
```

## API Endpoints

- `GET /api/time-entries` - Get all time entries
- `POST /api/time-entries` - Create new time entry
- `PUT /api/time-entries/[id]` - Update time entry
- `DELETE /api/time-entries/[id]` - Delete time entry
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

## Build Process

The app will automatically:
1. Build the React frontend using Vite
2. Deploy API functions as serverless functions
3. Serve static files from the built frontend

## Database

The app currently uses in-memory storage. For production, connect a database by:
1. Setting up a database (like Neon PostgreSQL)
2. Adding environment variables in Vercel dashboard
3. Updating the storage layer to use the database

Your app is now Vercel-ready! 🚀