# Google OAuth Publishing Checklist

This app uses Google OAuth to connect Google Calendar and request:

- `https://www.googleapis.com/auth/calendar.events`

That scope is sensitive because it allows the app to create and manage Google Calendar events requested by the user. Public access requires Google OAuth app publishing and, depending on Google's review, sensitive scope verification.

## Current canonical production domain

Use this domain consistently for production until a custom domain is purchased:

- App URL: `https://weekly-task-organizer.vercel.app`
- OAuth callback: `https://weekly-task-organizer.vercel.app/api/google/auth/callback`
- Privacy Policy: `https://weekly-task-organizer.vercel.app/privacy`
- Terms of Service: `https://weekly-task-organizer.vercel.app/terms`
- Public app information page: `https://weekly-task-organizer.vercel.app/about`

## Google Cloud project

Calendar OAuth currently uses the OAuth client from:

- Project ID: `weekly-task-organizer-482121`
- Project number: `192928334172`

## Required Google Console configuration

In Google Cloud Console, select project `weekly-task-organizer-482121`.

## Required Vercel configuration

In Vercel, project `weekly-task-organizer-next`, update the Production environment variables:

- `NEXT_PUBLIC_APP_URL=https://weekly-task-organizer.vercel.app`
- `GOOGLE_REDIRECT_URI=https://weekly-task-organizer.vercel.app/api/google/auth/callback`

Redeploy production after changing these values. Environment variable changes do not affect an already-built deployment until a new deployment is created.

### 1. OAuth consent screen / Google Auth Platform

Set or verify:

- User type: External
- Publishing status: Production
- App name: Weekly Task Organizer
- User support email: `danyeracevedo94@gmail.com`
- Developer contact email: `danyeracevedo94@gmail.com`
- App homepage: `https://weekly-task-organizer.vercel.app/about`
- Privacy policy: `https://weekly-task-organizer.vercel.app/privacy`
- Terms of service: `https://weekly-task-organizer.vercel.app/terms`

### 2. Authorized domains

Add:

- `weekly-task-organizer.vercel.app`

If Google does not accept a `vercel.app` subdomain as an authorized/verified app domain, purchase and configure a custom domain, then replace all production URLs and OAuth redirect URIs with that domain.

### 3. OAuth client redirect URI

In the Web OAuth client, add exactly:

- `https://weekly-task-organizer.vercel.app/api/google/auth/callback`

Remove stale production redirect URIs only after confirming no deployment uses them.

### 4. Scopes

Declare:

- `https://www.googleapis.com/auth/calendar.events`

Suggested scope justification:

> Weekly Task Organizer uses Google Calendar access only when a signed-in user chooses to connect their calendar. The app creates, reads, updates, and deletes events that the user explicitly schedules from their weekly task list. Calendar data is not sold, used for advertising, or shared with third parties.

### 5. Demo video for verification

Record a short video showing:

1. The public app page and privacy policy.
2. User sign-in.
3. Connecting Google Calendar.
4. Creating a task and scheduling it as a Google Calendar event.
5. Updating or deleting that event from the app, if available.
6. Explaining that Calendar access is optional and used only for requested task scheduling.

### 6. Submit for verification

Submit the OAuth app for Google verification from the Google Auth Platform / OAuth consent screen flow.

## Deployment checklist

Before submitting verification:

1. Merge and deploy the routes added for OAuth review:
   - `/about`
   - `/privacy`
   - `/terms`
2. Open each production URL in a private browser window and confirm it is publicly accessible.
3. Confirm the Connect Google Calendar button generates an OAuth URL whose `redirect_uri` is:
   - `https://weekly-task-organizer.vercel.app/api/google/auth/callback`
4. Confirm the OAuth consent screen uses:
   - App homepage: `https://weekly-task-organizer.vercel.app/about`
   - Privacy policy: `https://weekly-task-organizer.vercel.app/privacy`
   - Terms of service: `https://weekly-task-organizer.vercel.app/terms`

## Vercel domain note

It is reasonable to try verification with `weekly-task-organizer.vercel.app` first because the app is publicly hosted there. However, a custom domain is still the more professional and lower-risk option for Google review because it is easier to prove ownership, branding, and long-term control.
