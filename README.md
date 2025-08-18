# HabitTracker - Next.js Habit Tracking App

A modern, full-featured habit tracking application built with Next.js 14, Firebase, and Tailwind CSS.

## Features

🎯 **Core Functionality**
- Create and manage daily/weekly habits
- Track completion with intuitive UI
- View progress with streaks and completion rates
- Detailed analytics and statistics
- Goal setting and progress visualization

🎨 **Modern Design**
- Beautiful blue-themed UI (no purple!)
- Dark/light mode support with system preference detection
- Fully responsive design for all devices
- Smooth animations and transitions

🔐 **Authentication**
- Firebase Auth with email/password
- Google Sign-in integration
- Protected routes and user profiles

📊 **Analytics & Visualization**
- Activity calendar heatmap (GitHub-style)
- Progress charts and trend analysis
- Individual habit statistics
- Overall completion metrics

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS 3 with custom theme
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Testing**: Playwright MCP
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd habittracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Firebase Setup

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow access to subcollections (habits, completions)
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### Authentication
Enable the following sign-in methods in Firebase Console:
- Email/Password
- Google

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── habits/           # Habit management
│   ├── stats/            # Statistics page
│   └── profile/          # User profile
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── auth/             # Auth-related components
│   ├── habits/           # Habit-specific components
│   ├── dashboard/        # Dashboard components
│   ├── charts/           # Data visualization
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utilities and configurations
└── types/                # TypeScript type definitions
```

## Key Components

- **Dashboard**: Overview with statistics and quick habit completion
- **Habit Management**: CRUD operations for habits with categories and goals
- **Progress Tracking**: Visual calendars and charts showing completion trends
- **Statistics**: Detailed analytics per habit and overall progress
- **Theme System**: Dark/light mode with smooth transitions

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Playwright tests
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ using Next.js, Firebase, and Tailwind CSS.