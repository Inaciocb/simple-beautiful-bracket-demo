# Documentation for Track Bracket Tournament Component

## Introduction

This React component suite is designed to visualize a single-elimination tournament bracket for tracks (e.g., songs or music items). It supports displaying matches across multiple rounds, highlighting winners, and crowning a champion. Key features include:

- **Dynamic Bracket Rendering**: Automatically calculates positions, connectors, and scaling based on the number of rounds and matches.
- **Theming**: Predefined themes (space, sunset, ocean, gold) with customizable gradients, colors, and styles.
- **Sharing Modal**: A modal for previewing and downloading the bracket as a PNG image, with options to toggle champion display, artist names, and watermark.
- **Mock Data Generation**: A tester app (`App`) that generates random mock data for bracket sizes of 8, 16, or 32 tracks.
- **Responsive Design**: The main view scales to fit the container, with overflow handling for large brackets.

The code is written in TypeScript and uses modern React features (hooks like `useState`, `useRef`, `useEffect`, `useMemo`). It is marked as `"use client"` for client-side rendering in frameworks like Next.js.

This documentation ensures proper usage to avoid errors and bugs, including handling edge cases like odd-numbered tracks (BYEs), null values, CORS issues with images, and performance considerations for large brackets.

## Prerequisites and Installation

### Required Dependencies
Install the following packages via npm or yarn. These are essential for the components to function:

- `react` and `react-dom`: ^18.0.0 (core React libraries).
- `framer-motion`: ^10.0.0 (for animations in modals and buttons).
- `lucide-react`: ^0.0.0 (icon library for Crown, Share, X, Download, etc.).
- `html-to-image`: ^1.0.0 (for converting the bracket to a PNG image).
- `@types/react` and `@types/react-dom`: For TypeScript support.

Example installation command:
```
npm install react react-dom framer-motion lucide-react html-to-image @types/react @types/react-dom
```

### Setup in Your Project
1. **Copy the Code**: Paste the provided code into a file like `Bracket.tsx` or `App.tsx` in your React project.
2. **Import and Use**: Export the main component (`BracketPage` or `App`) and render it in your app.
3. **Fonts and Styles**: The code uses Tailwind CSS classes (e.g., `bg-gray-900`, `text-white`). Ensure Tailwind CSS is set up in your project (via `tailwind.config.js` and PostCSS). If not using Tailwind, replace classes with equivalent CSS.
4. **Image Handling**: Images are loaded from URLs (e.g., Spotify-style track images). Use `crossOrigin="anonymous"` to avoid CORS issues during image export.
5. **Browser Compatibility**: Tested in modern browsers (Chrome, Firefox). Uses ES6+ features; polyfill if needed for older browsers.

### Potential Setup Pitfalls
- **CORS Errors**: If track images are from external domains (e.g., Spotify), ensure the server allows CORS. The `toPng` function uses `{ mode: 'cors', cache: 'no-cache' }` to mitigate this, but test with real images.
- **React Strict Mode**: If enabled, `useEffect` may run twice - this is harmless here but could cause duplicate renders in development.
- **Node.js Version**: Requires Node.js ^18 for modern features.

## Usage

### Main Components
The code defines several interconnected components. The entry point is `App`, which wraps everything for testing. For production, use `BracketPage` directly with your data.

#### 1. `App` (Tester Component)
This is a top-level wrapper for testing with mock data. It allows selecting bracket sizes and generates random winners.

- **Props**: None.
- **Usage Example**:
  ```tsx
  import App from './Bracket'; // Assuming the file is Bracket.tsx

  function MyApp() {
    return <App />;
  }
  ```
- **Behavior**: 
  - Displays a header with buttons to generate brackets for 8, 16, or 32 tracks.
  - Uses `generateMockData` to create random tracks, matches, and winners.
  - Renders `BracketPage` with the generated data.
- **Customization**: Modify `generateMockData` to use real data (e.g., fetch from an API).

#### 2. `BracketPage`
The core page component that displays the bracket and share button.

- **Props**:
  - `rounds: Match[][]`: Array of rounds, where each round is an array of `Match` objects. Each `Match` has `a: Track` (required) and `b: Track | null` (optional for BYEs).
  - `winners: Track[][]`: Array of winners per round, mirroring the structure of `rounds`.
- **Usage Example**:
  ```tsx
  import { BracketPage } from './Bracket';

  const myRounds = [ /* Your match data */ ];
  const myWinners = [ /* Your winner data */ ];

  function MyPage() {
    return <BracketPage rounds={myRounds} winners={myWinners} />;
  }
  ```
- **Behavior**:
  - Validates input: If `rounds` or `winners` are empty/invalid, shows an error message.
  - Determines the champion from the last winner array.
  - Includes a "Share" button to open the modal.
  - Renders `MainBracketView` for the interactive bracket.

#### 3. `MainBracketView`
Renders the scalable bracket view (used in `BracketPage`).

- **Props**:
  - `rounds: Match[][]`
  - `winners: Track[][]`
  - `champion: Track`
- **Key Features**:
  - Uses `ResizeObserver` to dynamically scale the bracket to fit the container.
  - Draws connectors with SVG paths.
  - Displays tracks with images, names (artists hidden by default here, but shown in share view).
- **Pitfalls to Avoid**:
  - Ensure the parent container has a defined width/height (e.g., `min-h-[80vh]`).
  - For very large brackets (>64 tracks), performance may degrade due to many DOM elements - optimize by limiting rounds or using virtualization.

#### 4. `ShareModal`
A modal for customizing and downloading the bracket as an image.

- **Props**:
  - `showModal: boolean`: Controls visibility.
  - `onClose: () => void`: Callback to close the modal.
  - `champion: Track`
  - `rounds: Match[][]`
  - `winners: Track[][]`
- **Options (Internal State)**:
  - `theme: string` (one of: 'space', 'sunset', 'ocean', 'gold').
  - `showChampion: boolean` (default: true).
  - `showArtists: boolean` (default: true).
  - `showWatermark: boolean` (default: true).
- **Behavior**:
  - Renders a preview using `BracketShareView`.
  - Theme buttons change the background gradient and colors.
  - Toggle buttons for options update the preview in real-time.
  - "Download Image" button generates a PNG via `toPng` and downloads it.
- **Usage**: Typically controlled by state in the parent (e.g., `BracketPage`).
- **Pitfalls**:
  - Image generation uses a temporary off-screen DOM node - ensure no conflicting global styles.
  - Delays (e.g., `setTimeout`) are used for rendering; increase if images don't load in time.
  - Error Handling: Catches failures in `toPng` and shows feedback (e.g., "Error creating image.").

#### 5. `BracketShareView`
The static view used in the share modal for image export (fixed 1920x1080 resolution).

- **Props**:
  - `rounds: Match[][]`
  - `winners: Track[][]`
  - `champion: Track`
  - `options: ShareOptions` (theme and toggles).
- **Behavior**:
  - Fixed size for consistent exports.
  - Applies theme styles.
  - Optionally shows champion, artists, and watermark.
  - Scales down if the bracket exceeds 1800x1000.
- **Pitfalls**:
  - Images must load fully before export - use placeholders if URLs are invalid.
  - Watermark uses a base64 SVG; replace if needed.

### Data Structures
- **Track**:
  ```tsx
  type Track = {
    id: string;
    name: string;
    images?: { url: string }[];
    artists?: { name: string }[];
  };
  ```
  - `images[0].url` is used for display; falls back to placeholder.
- **Match**:
  ```tsx
  type Match = {
    a: Track;
    b: Track | null; // null for BYE
  };
  ```
- **Input Validation**:
  - `rounds` should be a power-of-2 structure (e.g., 16 tracks → rounds of 8, 4, 2, 1 matches).
  - `winners` must align with `rounds` (e.g., winners[0] has winners from rounds[0]).
  - Champion is `winners[winners.length - 1][0]`.

### Generating Data
Use `generateMockData(size: number)` to create test data:
- Supports any size, handles odd numbers with BYEs.
- Randomly selects winners.
- Example: `const { rounds, winners } = generateMockData(16);`

## Examples

### Basic Integration
```tsx
import { BracketPage } from './Bracket';
import { generateMockData } from './Bracket'; // Export this function if needed

const { rounds, winners } = generateMockData(16);

function Demo() {
  return <BracketPage rounds={rounds} winners={winners} />;
}
```

### Custom Data
Fetch real data (e.g., from Spotify API) and map to `Track[]`, then build `rounds` and simulate `winners`.

## Troubleshooting and Best Practices

### Common Errors and Fixes
- **Image Not Loading in Export**: Ensure `crossOrigin="anonymous"` on `<img>`. Test with local images. If CORS blocks, proxy images.
- **Blank PNG Download**: Increase `setTimeout` delays in `handleDownload` (e.g., to 1000ms) for image loading.
- **Scaling Issues**: If bracket overflows, adjust `matchWidth`, `hGap` constants. Use `overflow-x-auto` on parent.
- **No Champion Detected**: Ensure `winners` has at least one round with one track.
- **Animation Glitches**: Framer Motion requires a unique key on animated elements; already handled with `key={`${r}-${i}`}`.
- **Performance**: For >32 tracks, memoize more (already uses `useMemo` for positions/connectors).
- **TypeScript Errors**: Ensure props match types; null-check optional fields (e.g., `track.images?.[0]?.url`).

### Best Practices
- **Real Data Integration**: Replace mock data with API calls in `useEffect`.
- **Accessibility**: Add ARIA labels to buttons/icons. Use semantic HTML.
- **Testing**: Unit test with Jest/React Testing Library (e.g., snapshot `BracketShareView`).
- **Customization**: Extend themes by adding to `themes` object.
- **Deployment**: In Next.js, ensure `"use client"` is at the top for client-only features.

This setup ensures a bug-free experience when followed. If issues persist, check console logs for errors during render/export.
