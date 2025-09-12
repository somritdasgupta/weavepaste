# WeavePaste

A real-time collaborative text editor built with React and TypeScript that enables seamless text sharing across multiple devices and users.

## Overview

WeavePaste is a web-based collaborative editor that allows users to share and edit text content in real-time. It features session-based collaboration, QR code sharing, clipboard synchronization, and responsive design for both desktop and mobile devices.

## Features

- **Real-time Collaboration**: Multiple users can edit the same document simultaneously
- **Session Management**: Create and join collaborative sessions with unique codes
- **QR Code Sharing**: Generate QR codes for easy session sharing across devices
- **Clipboard Synchronization**: Auto-sync clipboard content across connected devices
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Multiple View Modes**: Switch between editor and viewer modes
- **History Tracking**: View and restore previous edits and clipboard syncs
- **Auto-save**: Automatic content saving with real-time synchronization

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS
- **Component Library**: Radix UI (shadcn/ui)
- **Backend**: Supabase (PostgreSQL database with real-time subscriptions)
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **Package Manager**: Bun

## Installation

### Prerequisites

- Node.js (version 18 or higher)
- Bun package manager (recommended) or npm

### Setup

1. Clone the repository:

```bash
git clone https://github.com/somritdasgupta/weavepaste.git
cd weavepaste
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Configure Supabase:

   - Create a new Supabase project
   - Add your Supabase URL and anon key to `.env.local`
   - Run the database migrations from the `supabase/migrations` directory

5. Start the development server:

```bash
bun dev
# or
npm run dev
```

The application will be available at `http://localhost:5173`.

## Usage

### Creating a Session

1. Visit the application homepage
2. Click "Create New Session"
3. Share the generated session code with collaborators
4. Start typing and editing collaboratively

### Joining a Session

1. Enter a session code on the homepage, or
2. Scan a QR code from an existing session, or
3. Use a direct link with the session code

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Send/sync content
- `Tab`: Insert spaces in editor mode
- Standard text editing shortcuts (Ctrl+C, Ctrl+V, etc.)

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── CollaborativeEditor.tsx
│   └── QRCodeGenerator.tsx
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/      # Supabase client and types
├── lib/               # Utility functions
├── pages/             # Page components
└── main.tsx           # Application entry point
```

## API Reference

The application uses Supabase for backend services:

- **Sessions Table**: Stores session data and content
- **Users Table**: Manages connected users and their states
- **Real-time Subscriptions**: Live updates for collaborative editing

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

Created by [Somrit Dasgupta](https://github.com/somritdasgupta)

## Support

For issues, feature requests, or questions, please open an issue on the GitHub repository.
