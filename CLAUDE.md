# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BaseDrum is a Base MiniApp. A web-based techno drum machine built with Next.js, React, and Tone.js. It features a real-time sequencer with pattern-based music creation, 3D particle visual effects, and a comprehensive save/load system using a custom JSON format.

Critical: Make sure everything is mobile-first.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Core Architecture

### Audio Engine (Tone.js Integration)

- **Main sequencer**: `src/app/page.tsx` - Contains the primary audio setup, synthesis initialization, and transport control
- **Sequence callback**: `src/lib/sequenceCallback.ts` - Handles real-time pattern triggering for all instrument tracks during playback
- **Pattern system**: Uses 0-127 step indexing (128 steps total) where patterns are arrays of step numbers when instruments trigger
- **Synthesis**: Each track has dedicated Tone.js synthesizers (kick, bass, lead, etc.) with configurable parameters

### Data Management (Song Format)

- **Schema validation**: `src/lib/songSchema.ts` - Zod schemas for complete song data validation
- **Song data**: `src/lib/songData.ts` - Default song data and helper functions
- **Format specification**: `BaseDrumFormat.md` - Complete documentation of the JSON format
- **Data flow**: Song state → Pattern arrays → Tone.js sequence → Audio output

### UI Components

- **Main interface**: `src/app/page.tsx` - Circular gauges (filter/reverb), track buttons, play controls
- **Track editor**: `src/components/TrackEditor.tsx` - Modal with drum sequencer grid (32 steps) and piano roll editor for melodic tracks
- **Visual effects**: `src/components/ParticleBackground.tsx` - Three.js particle system that reacts to beat intensity

### Key Architectural Patterns

**Real-time State Synchronization**:

- `songData` state holds the complete song structure
- `songDataRef` provides real-time access for audio callbacks
- `muteStatesRef` manages mute states for immediate audio response
- Pattern changes in editor immediately update both UI and audio

**Track Type System**:

- **Drum tracks**: Use only `pattern` arrays (kick, snare, hihat, etc.)
- **Melodic tracks**: Use `pattern` + `notes` arrays where notes[i] corresponds to pattern[i]
- Track types determined by name: `["bass", "lead", "acid"]` are melodic, others are drum

**Modal Pattern Editor**:

- Drum tracks: 32-button grid representing bars/beats
- Melodic tracks: Piano keyboard + piano roll grid
- Real-time pattern visualization with current step highlighting during playback

## Data Format (basedrum-v1)

The application uses a comprehensive JSON format for song storage:

```typescript
interface SongData {
  metadata: { title, artist, bpm, bars, steps, format };
  effects: { filter: {...}, reverb: {...} };
  tracks: { [trackName]: TrackData };
  arrangement?: { [section]: { bars, activeTracks } };
}

interface TrackData {
  pattern: number[];        // Step numbers (0-127) where instrument triggers
  notes?: string[];         // Note values for melodic tracks
  velocity?: number[];      // Per-step velocity (0-1)
  ghostNotes?: number[];    // Softer hits
  muted: boolean;
  volume: number;           // dB
}
```

## Import/Export System

- **Save**: Exports complete song data as `.basedrum` file
- **Load**: Validates JSON against Zod schema before importing
- **Validation**: Comprehensive constraints (BPM 60-200, steps 0-127, velocities 0-1, etc.)
- **Error handling**: Specific validation error messages for debugging

## Audio Implementation Details

- **Step resolution**: 128 steps total, but UI shows 32 steps (every 4th step)
- **Pattern conversion**: UI step `i` maps to audio step `i * 4`
- **Timing**: Uses Tone.js Transport and Sequence for precise scheduling
- **Effects chain**: Filter (cutoff/type) → Reverb → Master output
- **Beat detection**: Kick/snare hits trigger particle intensity bursts

## Key Dependencies

- **Tone.js**: Web Audio API wrapper for synthesis and sequencing
- **Three.js + React Three Fiber**: 3D particle background effects
- **Zod**: Runtime schema validation for song data
- **React Icons**: UI iconography (FA icons for instruments)
- **TailwindCSS**: Styling framework
- **Next.js 15**: App router, Turbopack, dynamic imports for client components

## File Organization

```
src/
├── app/page.tsx           # Main drum machine interface
├── components/
│   ├── TrackEditor.tsx    # Pattern editor modal
│   └── ParticleBackground.tsx # 3D visual effects
└── lib/
    ├── songData.ts        # Song data structure & defaults
    ├── songSchema.ts      # Zod validation schemas
    └── sequenceCallback.ts # Real-time audio sequencing
```

## Mobile-First Design

The interface is designed mobile-first with:

- Touch-friendly button sizes
- Slide-up modals for editing
- Responsive grid layouts
- Gesture support for circular gauges
