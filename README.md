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
GOOGLE_CALLBACK_URL=your_callback_url
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

### Setting up the subdomain

1. In your DNS provider (where grantrigby.dev is registered):
   - Add an A record for `freelance.grantrigby.dev` pointing to your server's IP
   - Or add a CNAME record pointing to your GitHub Pages URL

2. Configure Google OAuth:
   - Update the authorized redirect URIs in Google Cloud Console to include:
     `https://freelance.grantrigby.dev/api/auth/google/callback`

3. Set up environment variables in your deployment environment

## License

MIT License - see LICENSE file for details

## Author

Grant Rigby ([@grantis](https://github.com/grantis))