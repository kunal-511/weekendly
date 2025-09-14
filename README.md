# Weekendly

A comprehensive weekend planning application that helps users discover, plan, and share their perfect weekend itineraries with intelligent features and seamless integrations.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Integrations](#api-integrations)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)

## Features

### Core Functionality
- **Interactive Weekend Planning**: Drag-and-drop interface for organizing activities across Saturday and Sunday
- **Activity Discovery**: Browse curated activities across multiple categories (outdoor, dining, entertainment, etc.)
- **Smart Search & Filtering**: Multi-criteria search with mood-based filters (energy levels, social preferences, vibes)
- **Time Management**: Intelligent time slot organization (Morning, Afternoon, Evening) with duration tracking

### Advanced Features
- **Time Clash Detection**: Automatic detection and resolution of scheduling conflicts
- **Weather Integration**: Real-time weather forecasts with weather-aware activity recommendations
- **Location-Based Discovery**: Google Maps integration for finding nearby restaurants, entertainment, and activities
- **Holiday Awareness**: Automatic detection of long weekends and holiday planning opportunities
- **Notes System**: Add personal notes to activities with persistent storage

### Export & Sharing
- **Multiple Export Formats**: PNG, PDF, ICS calendar, and text formats
- **Template System**: Various aspect ratios (Instagram Story, Square, Print-friendly)
- **Social Media Integration**: Direct sharing to Twitter, Facebook, and WhatsApp
- **Calendar Export**: Generate .ics files for importing into calendar applications

### Data & Performance
- **Data Storage**: IndexedDB storage with localStorage fallback
- **Theme System**: Multiple visual themes with smooth transitions
- **Responsive Design**: Mobile-first design with touch-friendly interactions
- **Error Recovery**: Comprehensive error handling with data recovery mechanisms

## Demo

Visit the live application at: [Weekendly](https://weekendly-ecru.vercel.app/)

## Installation

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kunal-511/weekendly.git
   cd weekendly
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure your environment variables** (see [Configuration](#configuration) section)

5. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Getting Started
1. **Browse Activities**: Explore the activity catalog or use search/filters to find specific types of activities
2. **Plan Your Weekend**: Drag activities to time slots (Morning, Afternoon, Evening) for Saturday and Sunday
3. **Add Personal Touches**: Add notes to activities and customize your schedule
4. **Export & Share**: Generate beautiful visual cards or export to calendar format

### Key Interactions
- **Drag & Drop**: Move activities between time slots and days
- **Time Clash Resolution**: Handle scheduling conflicts with suggested alternatives
- **Weather Awareness**: View weather forecasts and get weather-appropriate recommendations
- **Theme Switching**: Change visual themes to match your mood

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_SIGNING_SECRET=your_google_maps_signing_secret

```

## API Integrations

### Google Maps Integration
- **Places API**: Restaurant and venue discovery
- **Geocoding**: Location search and coordinate conversion
- **Maps JavaScript API**: Interactive map features

### Weather Service
- **OpenWeatherMap API**: 5-day weather forecasts
- **Geolocation**: Automatic location detection

### Data Persistence
- **IndexedDB**: Primary client-side storage
- **localStorage**: Fallback storage mechanism
- **Automatic Sync**: Debounced saves with error recovery

## Technologies Used

### Frontend Framework
- **Next.js** - React framework with App Router
- **TypeScript** - Type-safe JavaScript

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### State Management & Data
- **React Context** - Global state management
- **IndexedDB** - Client-side database
- **Custom Hooks** - Reusable stateful logic

### Drag & Drop
- **@dnd-kit** - Modern drag and drop library

### Export & Generation
- **html-to-image** - Generate images from DOM
- **jsPDF** - PDF document generation
- **ICS** - Calendar file generation

### Date & Time
- **date-fns** - Modern date utility library

## Project Structure

```
weekendly/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # Reusable UI components
│   ├── context/               # React Context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions and configurations
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Helper functions
├── public/                    # Static assets
├── styles/                    # Global styles
└── README.md                  # Project documentation
```


---

Made with ❤️ by [Kunal](https://github.com/kunal-511)