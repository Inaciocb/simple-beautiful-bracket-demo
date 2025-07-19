
# simple-beautiful-bracket Package Documentation

This document provides comprehensive instructions on how to integrate and use the `simple-beautiful-bracket` component in your React application. The component is a flexible, interactive tournament bracket visualizer that supports single-elimination formats. It handles dynamic bracket generation, user interactions (e.g., editing competitors, selecting winners), and high-quality image exports for sharing.

## Features

- **Dynamic Bracket Rendering**: Automatically positions matches, connectors, and a champion card based on the number of rounds and competitors.
- **Interactive Mode**: Allows editing competitor names/subtitles directly in the bracket, selecting winners to advance them, and managing byes for odd-numbered competitors.
- **Static Display**: Can be used as a non-interactive view by omitting callback props.
- **Customizable Layout**: Adjust match card dimensions and gaps via props for fine-tuned spacing.
- **Theming and Effects**: Built-in themes (Space, Sunset, Ocean, Gold) for exported images, with toggles for particles, vignette, champion display, and subtitles.
- **Image Export**: Generate crisp PNG images via a share modal, with real-time previews and options for visual enhancements.
- **Data Generation Utility**: `generateBracketData` function to create bracket structures from a list of competitors, supporting "random" (simulated winners) or "manual" (user-filled) modes.
- **Competitor Management**: Supports adding/removing competitors, image uploads, and state propagation for changes.
- **Responsive Design**: Scales to fit containers, with overflow handling for large brackets.
- **Animations and Effects**: Uses Framer Motion for smooth transitions and includes particle effects for visual flair.

The package is built with TypeScript, React hooks, Framer Motion, Lucide Icons, and html-to-image. It's client-side only (marked `"use client"` for Next.js compatibility).

## Prerequisites and Installation

### Required Dependencies
Install these via npm or yarn:

- `react` and `react-dom`: ^18.0.0
- `framer-motion`: ^10.0.0
- `lucide-react`: ^0.0.0
- `html-to-image`: ^1.0.0
- `@types/react` and `@types/react-dom` (for TypeScript)

Example:
```
npm install react react-dom framer-motion lucide-react html-to-image @types/react @types/react-dom
```

### Setup
1. Install the package: `npm install simple-beautiful-bracket`
2. Import components and types in your code.
3. Ensure Tailwind CSS is configured (for styles like `bg-slate-900`, `text-white`). If not using Tailwind, adapt the classes to your CSS framework.
4. Handle images: Use `crossOrigin="anonymous"` for external images to avoid CORS issues during export. Proxy third-party images if needed.

## Data Structures

### Competitor
Represents a participant (e.g., player, team, or track).

```tsx
export type Competitor = {
  id: string; // Unique identifier
  name: string; // Primary display name
  subtitle?: string; // Optional secondary text (e.g., team/artist)
  images?: { url: string }[]; // Array of image URLs; first one is used
};
```

### Match
A single contest in a round.

```tsx
export type Match = {
  a: Competitor | null; // First competitor (null for empty slots)
  b: Competitor | null; // Second competitor (null for byes or empty slots)
};
```

- Brackets are arrays of rounds (`Match[][]`), starting with the initial round.
- Winners mirror rounds (`Competitor[][]`), using IDs to track advancements.

## Components

### BracketPage
The main component for displaying the bracket and share functionality.

#### Props
| Prop                  | Type                                                                 | Required | Default | Description |
|-----------------------|----------------------------------------------------------------------|----------|---------|-------------|
| rounds                | Match[][]                                                            | Yes      | -       | Array of rounds with matches. |
| winners               | Competitor[][]                                                       | Yes      | -       | Array of winners per round, aligned with `rounds`. |
| onCompetitorChange    | (roundIndex: number, matchIndex: number, key: 'a' \| 'b', field: 'name' \| 'subtitle', value: string) => void | No       | -       | Callback for editing a competitor's name or subtitle in the bracket. |
| onWinnerSelect        | (roundIndex: number, matchIndex: number, winner: Competitor) => void | No       | -       | Callback for selecting a winner, which advances them and clears future slots. |
| matchWidth            | number                                                               | No       | 310     | Width of each match card (pixels). |
| matchHeight           | number                                                               | No       | 150     | Height of each match card (pixels). |
| hGap                  | number                                                               | No       | 80      | Horizontal gap between rounds (pixels). |
| vGap                  | number                                                               | No       | 25      | Vertical gap between matches in the first round (doubles per subsequent round). |

- If callbacks are omitted, the bracket is static (no editing/selecting).
- Champion is auto-detected from the last winners array.

## Usage

### Basic Example (Static Bracket)
For a non-interactive display:

```tsx
import { BracketPage, generateBracketData, Competitor } from 'simple-beautiful-bracket';

const competitors: Competitor[] = [
  { id: '1', name: 'Competitor 1', subtitle: 'Team A', images: [{ url: 'image1.jpg' }] },
  // ... more competitors
];

const { rounds, winners } = generateBracketData(competitors, false); // Random mode

function MyPage() {
  return <BracketPage rounds={rounds} winners={winners} />;
}
```

### Interactive Example (Full State Management)
For a fully editable bracket, manage state and use callbacks. This mirrors the tester app's logic.

```tsx
import React, { useState, useEffect } from 'react';
import { BracketPage, generateBracketData, Competitor, Match } from 'simple-beautiful-bracket';

const App: React.FC = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [bracketData, setBracketData] = useState<{ rounds: Match[][]; winners: Competitor[][] } | null>(null);

  useEffect(() => {
    // Load initial competitors (e.g., from API)
    const initial = Array.from({ length: 8 }, (_, i) => ({
      id: `comp_${i + 1}`,
      name: `Competitor ${i + 1}`,
      subtitle: `Subtitle ${i + 1}`,
      images: [{ url: `https://placehold.co/200x200?text=${i + 1}` }],
    }));
    setCompetitors(initial);
    setBracketData(generateBracketData(initial, true)); // Manual mode
  }, []);

  const handleCompetitorChange = (roundIndex: number, matchIndex: number, key: 'a' | 'b', field: 'name' | 'subtitle', value: string) => {
    if (!bracketData) return;
    const newRounds = JSON.parse(JSON.stringify(bracketData.rounds));
    const newWinners = JSON.parse(JSON.stringify(bracketData.winners));
    const competitor = newRounds[roundIndex][matchIndex][key];
    if (competitor) {
      const id = competitor.id;
      const updated = { ...competitor, [field]: value };
      // Propagate changes through all rounds and winners
      for (let r = 0; r < newRounds.length; r++) {
        for (let m = 0; m < newRounds[r].length; m++) {
          if (newRounds[r][m].a?.id === id) newRounds[r][m].a = updated;
          if (newRounds[r][m].b?.id === id) newRounds[r][m].b = updated;
        }
      }
      for (let w = 0; w < newWinners.length; w++) {
        for (let i = 0; i < newWinners[w].length; i++) {
          if (newWinners[w][i].id === id) newWinners[w][i] = updated;
        }
      }
      setBracketData({ rounds: newRounds, winners: newWinners });
    }
  };

  const handleWinnerSelect = (roundIndex: number, matchIndex: number, winner: Competitor) => {
    if (!bracketData) return;
    let newRounds = JSON.parse(JSON.stringify(bracketData.rounds));
    let newWinners = JSON.parse(JSON.stringify(bracketData.winners));
    // Clear future progression logic (copy from code: clearFutureProgression, update winners, advance to next rounds)
    // Full implementation as in the provided code's handleWinnerSelect
    setBracketData({ rounds: newRounds, winners: newWinners });
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* UI for adding/editing competitors */}
      {bracketData && (
        <BracketPage
          rounds={bracketData.rounds}
          winners={bracketData.winners}
          onCompetitorChange={handleCompetitorChange}
          onWinnerSelect={handleWinnerSelect}
          matchWidth={310}
          matchHeight={150}
          hGap={80}
          vGap={25}
        />
      )}
    </div>
  );
};

export default App;
```

### Generating Bracket Data
Use `generateBracketData(competitors: Competitor[], isManual = false)` to build the structure:
- `isManual: true`: Creates empty higher rounds for user filling.
- `isManual: false`: Simulates random winners.
- Handles byes for odd counts.
- Max competitors: 1024 (performance limit).

### Share Modal Options
In the modal (opened via Share button):
- Themes: Space, Sunset, Ocean, Gold.
- Toggles: Champion, Subtitle, Particles (animated/static dots), Vignette (shadow overlay).

## Troubleshooting and Best Practices

### Common Issues
- **CORS Errors on Export**: Ensure images have CORS headers. Use `crossOrigin="anonymous"` and proxy if needed. Increase timeouts in `toPng` for slow loads.
- **State Mutations**: Always deep-copy `rounds`/`winners` in callbacks to trigger React re-renders.
- **Large Brackets**: For >64 competitors, adjust gaps/widths; performance may drop—test scaling.
- **No Champion**: Ensure `winners` has a final entry; regenerate if needed.
- **Image Uploads**: Use `FileReader` for local previews, as shown in the code.

### Best Practices
- **State Management**: Use deep copies for immutability. Integrate with Redux/Zustand for complex apps.
- **Customization**: Extend themes by forking the code. Add ARIA labels for accessibility.
- **Testing**: Use React Testing Library for snapshots. Test with odd/even competitor counts.
- **Deployment**: In Next.js, place in client components. Optimize images for faster exports.
- **Limitations**: Power-of-2 structures preferred; byes auto-handled. No multi-bracket support.

For issues, check console logs. Contribute via GitHub (linked in the app). This ensures seamless integration and a bug-free experience.
