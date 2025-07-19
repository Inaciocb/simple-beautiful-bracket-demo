Tournament Bracket Component Documentation
This document provides instructions on how to properly integrate and use the React Tournament Bracket component. The component is designed to visualize a series of matches, display winners for each round, and allow for the generation of a high-quality, shareable image of the final bracket.

Features ✨
Dynamic Sizing: The main bracket view automatically scales to fit its container.

Theming: Includes four built-in themes (Space, Sunset, Ocean, Gold) for the exported image.

Customizable Export: Easily toggle the visibility of the champion, track artists, and a "Made with" watermark on the final image.

High-Quality Image Export: Uses html-to-image to generate a crisp 1920x1080 PNG, perfect for sharing.

Mock Data Generation: Includes a simple utility to generate mock data for testing purposes.

Data Structures 📊
To use the component correctly, you must provide data in a specific format. The component's functionality depends entirely on the structure of the rounds and winners props.

Track Object
Each competitor in the bracket is a Track object.

export type Track = {
  id: string; // A unique identifier for the track
  name: string; // The name of the song
  images?: { url: string }[]; // An array of images. The first one is used.
  artists?: { name: string }[]; // An array of artists. Their names are joined.
};

Match Object
Each Match represents a single contest between two tracks.

export type Match = {
  a: Track; // The first competitor. This is required.
  b: Track | null; // The second competitor. Can be null in case of a BYE.
};

Core Props: rounds and winners
The BracketPage component requires two main props:

rounds: An array of arrays, where each inner array represents a round of the tournament (Match[][]).

rounds[0] is the first round, rounds[1] is the second, and so on.

Each match in a round must be an object conforming to the Match type.

winners: An array of arrays that mirrors the structure of rounds and contains the Track objects of the winners for each round (Track[][]).

winners[0] should contain the winners of the matches in rounds[0].

The order is not important, as the component finds the winner by matching the id.

The final winner (the champion) is determined by being the single entry in the last array of the winners prop (e.g., winners[winners.length - 1][0]).

⚠️ Critical: The data integrity between rounds and winners is essential. An incorrect or incomplete winners prop will cause the bracket to render incorrectly or fail to display a champion.

How to Use 🚀
Below is a complete example based on the provided page.tsx file. It demonstrates how to generate data and pass it to the BracketPage component.

In a real application, you would fetch your rounds and winners data from an API instead of using the generateMockData function.

// 1. Import necessary components and types
import React, { useState, useEffect, FC } from 'react';
import { BracketPage, Match, Track } from './BracketComponent'; // Assuming component is in this path

// 2. (Optional) Data generation logic for your app
// In a real app, this data would come from your backend.
const generateAppData = (size: number): { rounds: Match[][]; winners: Track[][] } => {
    const tracks: Track[] = Array.from({ length: size }, (_, i) => ({
        id: `track_${i + 1}`,
        name: `Song Title ${i + 1}`,
        images: [{ url: `https://placehold.co/200x200/4f46e5/ffffff?text=${i + 1}` }],
        artists: [{ name: `Artist Name ${i + 1}` }],
    }));

    let currentRoundTracks = [...tracks];
    const allRounds: Match[][] = [];
    const allWinners: Track[][] = [];

    while (currentRoundTracks.length > 1) {
        const roundMatches: Match[] = [];
        const roundWinners: Track[] = [];
        for (let i = 0; i < currentRoundTracks.length; i += 2) {
            const trackA = currentRoundTracks[i];
            const trackB = currentRoundTracks[i + 1] || null;
            roundMatches.push({ a: trackA, b: trackB });
            const winner = trackB ? (Math.random() > 0.5 ? trackA : trackB) : trackA;
            roundWinners.push(winner);
        }
        allRounds.push(roundMatches);
        allWinners.push(roundWinners);
        currentRoundTracks = roundWinners;
    }
    return { rounds: allRounds, winners: allWinners };
};


// 3. Your main App or Page component
const App: FC = () => {
    const [data, setData] = useState<{ rounds: Match[][]; winners: Track[][] } | null>(null);
    const [bracketSize, setBracketSize] = useState(16);

    useEffect(() => {
        setData(generateAppData(bracketSize));
    }, [bracketSize]);

    // Add a key to BracketPage to ensure it re-renders when data changes
    const handleGenerateData = (size: number) => {
        setBracketSize(size);
    };

    return (
        <div style={{ backgroundColor: '#111827', color: 'white', fontFamily: 'sans-serif' }}>
            <header className="p-6 bg-gray-800 shadow-lg">
                <h1 className="text-3xl font-bold text-center text-white">Bracket Component Tester</h1>
                <p className="text-center text-gray-400 mt-2">Select a bracket size to generate mock data.</p>
                <div className="flex justify-center gap-4 mt-6">
                    {[8, 16, 32].map(size => (
                        <button key={size} onClick={() => handleGenerateData(size)} className={`px-6 py-2 rounded-lg text-lg font-medium bg-slate-700 text-white transition-transform hover:translate-y-[-2px] ${bracketSize === size ? 'bg-blue-500 font-bold' : ''}`}>
                            {size} Tracks
                        </button>
                    ))}
                </div>
            </header>
            <main>
                {data ? (
                    <BracketPage rounds={data.rounds} winners={data.winners} key={bracketSize} />
                ) : (
                    <div className="text-center p-10">Generating data...</div>
                )}
            </main>
        </div>
    );
};

export default App;

Troubleshooting and Best Practices
Image CORS Errors: The html-to-image library requires that all images loaded onto the canvas are served with permissive Access-Control-Allow-Origin headers. If you are using images from a third-party service (like Spotify), you may encounter CORS errors. The best solution is to proxy these images through your own backend.

Component Not Updating: If you change the bracket data and the component doesn't re-render correctly, ensure you are passing a key prop to the `<BracketPage />
