# Freelance Hours Tracker

A comprehensive web application for tracking freelance hours and managing client relationships. Built with TypeScript, React, and Express.

## Features

- 🔐 Secure Google OAuth authentication
- 📊 Track hours by client
- 👥 Client management system
- 📱 Responsive design
- ⚡ Real-time updates
- 🎨 Modern UI with shadcn components

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, PostgreSQL with Drizzle ORM
- **Authentication**: Google OAuth
- **Deployment**: Custom domain deployment

## Development

1. Clone the repository:
```bash
git clone https://github.com/[your-username]/freelance-tracker.git
cd freelance-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Copy `.env.example` to `.env` and fill in your credentials:
```
DATABASE_URL=your_postgresql_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://freelance.grantrigby.dev/api/auth/google/callback
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

### Custom Domain Setup (freelance.grantrigby.dev)

1. Deploy on Replit:
   - Push your changes to the repository
   - In Replit, click the "Deploy" button
   - Wait for the deployment to complete

2. Configure Custom Domain:
   - In Replit, go to "Tools" -> "Custom Domains"
   - Add your domain: `freelance.grantrigby.dev`
   - Follow Replit's instructions to set up DNS records
   - Wait for SSL certificate provisioning (can take a few minutes)

3. Update DNS Records:
   - In your DNS provider (where grantrigby.dev is registered):
   - Add a CNAME record for `freelance` pointing to your Replit deployment URL
   - Example: `freelance.grantrigby.dev` -> `your-repl.repl.co`

4. Configure Google OAuth:
   - Go to Google Cloud Console
   - Navigate to your project's OAuth 2.0 configuration
   - Add the following authorized redirect URI:
     ```
     https://freelance.grantrigby.dev/api/auth/google/callback
     ```
   - Make sure to also add the domain to authorized domains:
     ```
     freelance.grantrigby.dev
     ```

5. Verify Deployment:
   - Visit https://freelance.grantrigby.dev
   - Ensure HTTPS is working correctly
   - Test Google OAuth login functionality

## License

MIT License - see LICENSE file for details

## Author

Grant Rigby ([@grantis](https://github.com/grantis))

