# EstateConnect

EstateConnect is a real estate networking platform designed to help property professionals connect, discover opportunities, and build relationships across international markets.

## Features

- **Authentication:** Sign up and log in using Supabase Auth.
- **Professional profiles:** Create and save profile information.
- **My Network:** Discover agents, search profiles, and send or manage connection requests.
- **Opportunities:** Browse buyer requests, property opportunities, and agent collaborations.
- **Communities:** Explore professional real estate communities.
- **Responsive interface:** Built with Next.js and Tailwind CSS.

## Tech Stack

- [Next.js](https://nextjs.org/) with the App Router
- React
- TypeScript
- Tailwind CSS
- [Supabase](https://supabase.com/) for authentication and database functionality

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- A Supabase project

### Installation

Clone the repository, then open its folder:

```bash
git clone YOUR_REPOSITORY_URL
cd estateconnect
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root and configure the Supabase credentials expected by `src/lib/supabase.ts`.

For example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Use the actual variable names expected by your project. Never commit secret service-role keys or passwords.

### Run Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```text
estateconnect/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── profile-setup/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       └── supabase.ts
├── public/
├── .env.local
├── package.json
└── README.md
```

## Database

EstateConnect uses Supabase tables for profile and connection functionality. Configure the required tables, columns, and Row Level Security policies in your Supabase project before deploying.

## Deployment

EstateConnect can be deployed to a platform that supports Next.js, such as Vercel.

Before deploying:

1. Verify the application runs locally.
2. Configure the required environment variables in the hosting platform.
3. Configure Supabase authentication URLs and redirect URLs for the deployed domain.
4. Verify database permissions and Row Level Security policies.
5. Test sign-up, login, profiles, and connection requests in the deployed application.

## Current Status

EstateConnect is under active development. Some opportunity and community features may currently use browser-local storage or demo data rather than shared database records.

## License

No license has been specified yet.