
# simple-beautiful-bracket Package Documentation

This documentation
provides instructions on how to integrate and use the `simple-beautiful-bracket` component in your application. The component is a flexible tournament bracket visualizer that supports single-elimination formats. It handles dynamic bracket generation and image exports for sharing. It was originally built for a Song Ranking application and that is why the objects are named 'Tracks' or 'Songs'; that may be updated in the future.

An example of a good use of the package is this very demo application. You can find the deployed website [here](https://simple-beautiful-bracket.vercel.app/), the source code is app/page.tsx.  
Feel free to use it for your projects.

## Use examples
Music app:
<img width="1602" height="818" alt="image" src="https://github.com/user-attachments/assets/2fa4ad0c-de76-44d9-a052-1659c460605a" />
Bracket Generation:
<img width="997" height="444" alt="image" src="https://github.com/user-attachments/assets/cf4c1580-8246-45c5-8159-b76f15ca1665" />



## Tutorial

Install the package using npm:

```bash
npm install simple-beautiful-bracket@latest
```

## Features

- **Dynamic Bracket Rendering**: Automatically positions matches, connectors, and a champion card based on the number of rounds and tracks.
- **Static Display**: The main component provides a view-only bracket.
- **Theming and Effects for Export**: Built-in themes (Space, Sunset, Ocean, Gold) are available for exported images, with toggles for champion display, artist names, and a watermark.
- **Image Export**: Generate crisp PNG images via a share modal, with real-time previews and options for visual enhancements.
- **Data Generation Utility**: The `generateMockData` function creates bracket structures from a list of tracks, simulating random winners.
- **Responsive Design**: The bracket scales to fit its container, with overflow handling for large brackets.
- **Animations and Effects**: Uses Framer Motion for smooth transitions.

The package is built with TypeScript, React hooks, Framer Motion, Lucide Icons, and html-to-image. It's designed to be used client-side (marked `"use client"` for Next.js compatibility).

## Prerequisites and Installation

### Required Dependencies

Before using `simple-beautiful-bracket`, ensure you have the following dependencies installed in your project. You can install them via npm or yarn:

- `react` and `react-dom`: ^18.0.0
- `framer-motion`: ^10.0.0
- `lucide-react`: ^0.0.0
- `html-to-image`: ^1.0.0
- `@types/react` and `@types/react-dom` (if you are using TypeScript)

Example installation command:

```bash
npm install react react-dom framer-motion lucide-react html-to-image @types/react @types/react-dom
```

### Setup

1. Install the package: `npm install simple-beautiful-bracket`
2. Import components and types in your code.
3. **Tailwind CSS**: The component's styling relies on Tailwind CSS classes. Ensure Tailwind CSS is configured in your project. If you are not using Tailwind, you will need to adapt the component's internal class names to your preferred CSS framework or custom stylesheets.
4. **Image Handling**: For competitor images, use `crossOrigin="anonymous"` in your `img` tags to avoid Cross-Origin Resource Sharing (CORS) issues, especially during the image export process. If you encounter CORS issues with third-party images, consider proxying them through your own server.

## Data Structures

The package uses specific data structures to define tracks (competitors) and matches within the bracket.

### Track

Represents a participant in the bracket, such as a song.

```typescript
export type Track = {
  id: string; // Unique identifier for the track
  name: string; // The primary display name of the track (e.g., song title)
  images?: { url: string }[]; // An array of image URLs for the track; the first URL is used
  artists?: { name: string }[]; // An array of artists associated with the track
};
```

### Match

Represents a single contest between two tracks in a round.

```typescript
export type Match = {
  a: Track; // The first track in the match
  b: Track | null; // The second track in the match. Can be null for a "BYE"
};
```

- Brackets are structured as arrays of rounds (`Match[][]`), with the first array representing the initial round.
- Winners are tracked in a parallel structure (`Track[][]`), using their IDs to manage advancements through the rounds.

## Components

### BracketPage

This is the primary component you will use to display your tournament bracket. It renders the bracket and provides access to the share functionality.

#### Props

| Prop     | Type        | Required | Default | Description                          |
|----------|-------------|----------|---------|--------------------------------------|
| `rounds` | `Match[][]` | Yes     | -       | An array representing all rounds and their matches. |
| `winners`| `Track[][]` | Yes     | -       | An array representing the winners for each round.   |

- The champion of the tournament is automatically detected from the last entry in the `winners` array.

#### Preparing Data for BracketPage

Let's break down how you prepare the `rounds` and `winners` data for the `BracketPage` component.

- **`Track`**: This type defines a single competitor (like a song in this example). It needs an `id` (a unique identifier), a `name` (the display name), optional `images` (an array of URLs, where the first one is used), and optional `artists` (an array of artist names associated with the track).

- **`Match`**: This type represents a single matchup between two `Track`s.
  - `a`: The first `Track` in the match.
  - `b`: The second `Track` in the match. This can be `null` if it's a "BYE" (meaning one competitor advances automatically because there's no opponent).

- **`Match[][]` (Rounds Data)**: This is an array where each element is itself an array of `Match` objects. Each inner array represents a _round_ in your tournament. So, `rounds[0]` would be the first round, `rounds[1]` would be the second, and so on.

- **`Track[][]` (Winners Data)**: This is a parallel structure to `rounds`. Each inner array here contains the `Track` objects that won their respective matches in that specific round and are advancing. The `BracketPage` component uses these `Track` IDs to highlight the winners in each match and determine the overall champion.

##### A Simple Tutorial Example

Let's walk through how you would create and use this data, just like the `App` component in the `bracket.tsx` file does.

**Step 1: Define Your Tracks (Competitors)**

First, you need a list of all participants. In our example, these are `Track` objects.

```typescript
import { BracketPage, generateMockData, Track, Match } from 'simple-beautiful-bracket';

// Let's manually define some initial tracks for a small bracket (e.g., 4 tracks)
const myTracks: Track[] = [
  {
    id: 'track_alpha',
    name: 'Alpha Song',
    images: [{ url: 'https://placehold.co/200x200/FF0000/ffffff?text=A' }],
    artists: [{ name: 'Artist One' }],
  },
  {
    id: 'track_beta',
    name: 'Beta Tune',
    images: [{ url: 'https://placehold.co/200x200/00FF00/ffffff?text=B' }],
    artists: [{ name: 'Artist Two' }],
  },
  {
    id: 'track_gamma',
    name: 'Gamma Groove',
    images: [{ url: 'https://placehold.co/200x200/0000FF/ffffff?text=C' }],
    artists: [{ name: 'Artist Three' }],
  },
  {
    id: 'track_delta',
    name: 'Delta Beat',
    images: [{ url: 'https://placehold.co/200x200/FFFF00/000000?text=D' }],
    artists: [{ name: 'Artist Four' }],
  },
];
```

**Step 2: Generate the Bracket Structure**

The `simple-beautiful-bracket` package provides a `generateMockData` function to help you create the `rounds` and `winners` arrays automatically. This function simulates random winners, filling out the bracket for you.

```typescript
// Using generateMockData with our custom tracks (though generateMockData creates its own tracks)
// For a real scenario where you have custom tracks and want a bracket built from them,
// you would need to implement a bracket generation logic that uses your 'myTracks'.
// For this example, we'll use the package's generateMockData which creates its own tracks.

// Let's generate a bracket for 4 participants using the provided utility:
const { rounds, winners } = generateMockData(4); // This will create 4 mock tracks and simulate matches.
```

The `generateMockData` function takes a `size` (number of tracks) and produces the `rounds` and `winners` data needed.

**Step 3: Render Your Bracket with `BracketPage`**

Finally, pass the `rounds` and `winners` data to the `BracketPage` component in your React application.

```typescript
import React from 'react';
// Assuming BracketPage, generateMockData, Track, Match are imported from 'simple-beautiful-bracket'

function MyCustomBracketApp() {
  const [bracketData, setBracketData] = React.useState<{ rounds: Match[][]; winners: Track[][] } | null>(null);

  React.useEffect(() => {
    // Generate data for 8 tracks when the component mounts
    setBracketData(generateMockData(8)); //
  }, []);

  if (!bracketData) {
    return <div>Loading bracket...</div>;
  }

  return (
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ textAlign: 'center', padding: '20px', fontSize: '2em' }}>My Tournament</h1>
      <BracketPage rounds={bracketData.rounds} winners={bracketData.winners} />
    </div>
  );
}

export default MyCustomBracketApp;
```

In this `MyCustomBracketApp` example, we use `generateMockData(8)` to create a bracket for 8 participants. The `rounds` and `winners` arrays are then passed directly to the `BracketPage` component, which handles all the rendering. You'll see the bracket displayed, and the "Share" button will allow you to export it.

### BracketShareView

This component is an internal utility used by the `ShareModal` to render the bracket specifically for image export. Its dimensions and styling options are pre-configured for optimal high-quality image generation and are not directly customizable via props on `BracketPage`.

#### Internal Dimensions & Styling

- `matchWidth`: 300 pixels
- `matchHeight`: 90 pixels
- `hGap`: 60 pixels (horizontal gap between rounds)
- `vGap`: 20 pixels (vertical gap between matches)
- `championCardWidth`: 200 pixels
- `championGap`: 60 pixels
- The component's internal canvas dimensions for image generation are `1920px` x `1080px` for standard brackets and `3840px` x `2160px` for brackets with more than 50 competitors, ensuring high resolution exports.

#### Share Options (Configurable within the Share Modal UI)

When you open the share modal, you'll find options to customize the appearance of the exported image:

- **Themes**:
  - `space`: A dark, cosmic-inspired gradient (`radial-gradient(ellipse at top, #374151, #111827, black)`).
  - `sunset`: A warm, vibrant gradient (`linear-gradient(135deg, #ff7e5f, #feb47b)`).
  - `ocean`: A refreshing blue-green gradient (`linear-gradient(to right, #43cea2, #185a9d)`).
  - `gold`: A rich, metallic gradient (`radial-gradient(circle, #D4AF37, #B48628, #8F5F17)`).
- **Show Champion**: Toggles the visibility of the dedicated champion card in the exported image.
- **Show Artists**: Toggles the visibility of artist names displayed under track titles.
- **Show Watermark**: Toggles the visibility of the "Made with TrackPicker" watermark.

### MainBracketView

This component is also an internal part of `BracketPage` responsible for rendering the interactive bracket view. Its dimensions are internally defined and are not directly configurable.

#### Internal Dimensions

- `matchWidth`: 280 pixels
- `matchHeight`: 80 pixels
- `hGap`: 50 pixels (horizontal gap between rounds)
- `vGap`: 15 pixels (vertical gap between matches)
- `championCardWidth`: 180 pixels
- `championGap`: 50 pixels

## Usage

Here’s how you can quickly integrate and use the `simple-beautiful-bracket` component in your React application.

### Step 1: Import Components and Data Generator

First, import the necessary components and the `generateMockData` function from the package.

```typescript
import { BracketPage, generateMockData, Track } from 'simple-beautiful-bracket';
```

### Step 2: Generate Your Bracket Data

The `generateMockData` function helps you create the `rounds` and `winners` data needed for the `BracketPage`. This function will automatically create a bracket structure and simulate random winners for you.

```typescript
// Example: Generate mock data for a bracket with 16 tracks
const { rounds, winners } = generateMockData(16);
```

The `size` parameter in `generateMockData(size: number)` specifies the initial number of tracks in your bracket. While the function can handle any number, powers of 2 (e.g., 8, 16, 32) are ideal for complete bracket structures without "BYE" matches.

### Step 3: Render the BracketPage Component

Pass the `rounds` and `winners` data as props to the `BracketPage` component within your React application.

```typescript
function MyBracketDisplay() {
  return <BracketPage rounds={rounds} winners={winners} />;
}

export default MyBracketDisplay;
```

### Share Modal

Once your bracket is displayed, you'll see a "Share" button. Clicking this button will open a modal that allows you to:

- **Choose a Theme**: Select from various visual themes to apply to your bracket image.
- **Toggle Options**: Decide whether to show the champion, artists, and a watermark on the exported image.
- **Download Image**: Generate and download a high-quality PNG image of your bracket.

## Troubleshooting and Best Practices

### Common Issues

- **CORS Errors on Export**: If you encounter issues when exporting images, especially with competitor images, ensure that the image URLs are served with appropriate CORS (Cross-Origin Resource Sharing) headers. Alternatively, you might need to proxy those images through your own server.
- **No Champion Displayed**: Verify that your `winners` data array is correctly populated all the way to the final round. If the `rounds` or `winners` data is empty or incomplete, the component might not be able to determine or display a champion.
- **Bracket Appears Condensed**: For a very large number of tracks, the bracket might appear too dense. The `BracketShareView` automatically adjusts the output image resolution for over 50 competitors to maintain visual quality in exports.
- **Missing Data Message**: If the `rounds` or `winners` props are not provided or contain no data, `BracketPage` will display a message indicating that bracket data is not available.

### Best Practices

- **Immutable State Management**: When managing your `rounds` and `winners` data in your application's state, always practice immutability. This means creating new arrays or objects when making changes, rather than directly modifying existing ones. This approach ensures proper React re-renders and helps prevent unexpected behavior.
- **Image Optimization**: For optimal performance and export quality, use appropriately sized and optimized images for your `Track` objects.
- **Accessibility**: If you are providing custom `Track` data, consider adding meaningful `alt` attributes to your images for improved accessibility.
- **Styling Customization**: The component leverages Tailwind CSS for its styling. While built-in themes are provided for the share modal, more granular styling customization would typically involve forking the package and modifying the component's internal Tailwind CSS classes directly.

If you encounter any issues, always check your browser's console logs for error messages, as they often provide valuable clues.

Feel free to reach out with any suggestions or questions!  

**Email**: inaciocbuemo@gmail.com  

**LinkedIn**: [in/inaciocb](https://www.linkedin.com/in/inaciocb/)
