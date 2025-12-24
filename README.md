# Weekly Task Organizer

A Next.js web application for managing weekly tasks with real-time synchronization, priority management, and Google Calendar integration.

## Features

- 📋 **Task Management**: Create, edit, delete, and organize tasks by day and priority
- 👥 **Dual Roles**: Administrator view (full control) and User view (Ramon - task completion only)
- 🔄 **Real-time Sync**: Firebase Realtime Database synchronization
- 📅 **Google Calendar Integration**: Convert tasks to Google Calendar events
- 🎨 **Modern UI**: Tailwind CSS v4 with "Sapphire Nightfall" theme
- 📊 **Statistics**: Weekly task completion tracking

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project configured (see `project.md` for details)
- Google Cloud project with Calendar API enabled (see `GOOGLE_CLOUD_SETUP.md` for detailed instructions)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd weekly-task-organizer-next
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local` (if exists) or create `.env.local`
   - Add your Firebase configuration variables
   - Add your Google OAuth credentials (see `GOOGLE_CLOUD_SETUP.md`)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Google Calendar Setup

**📖 For detailed step-by-step instructions on configuring Google Cloud Console and OAuth credentials, see [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md)**

Quick summary:
1. Create a Google Cloud project
2. Enable Google Calendar API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials (Web application)
5. Add redirect URI: `http://localhost:3000/api/google/auth/callback`
6. Copy Client ID and Client Secret to `.env.local`

## Project Documentation

- **[project.md](./project.md)**: Complete project context, architecture, and implementation notes
- **[GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md)**: Detailed Google Cloud Console setup guide

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
