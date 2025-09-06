// Song data structure based on dataformat.md
// Import types and schemas from dedicated schema file
export type { TrackData, SongData } from './songSchema';
export { 
  TrackDataSchema, 
  SongDataSchema,
  validateSongData,
  safeParseSongData,
  VALIDATION_CONSTRAINTS
} from './songSchema';

// Default song with basic techno pattern
export const DEFAULT_SONG: SongData = {
  metadata: {
    title: "Untitled",
    artist: "BaseDrum User",
    version: "1.0",
    created: new Date().toISOString(),
    bpm: 128,
    bars: 32,
    steps: 128,
    format: "basedrum-v1"
  },
  effects: {
    filter: {
      cutoff: 0.5,
      type: "lowpass",
      startFreq: 20000,
      endFreq: 350
    },
    reverb: {
      wet: 0.0,
      roomSize: 0.8,
      decay: 2.3
    }
  },
  tracks: {
    kick: {
      pattern: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 
                64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 104, 108, 112, 116, 120, 124],
      ghostNotes: [14, 30, 46, 62, 78, 94, 110, 126],
      velocity: Array(128).fill(1.0),
      muted: false,
      volume: -6
    },
    hihat909: {
      pattern: [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62,
                66, 70, 74, 78, 82, 86, 90, 94, 98, 102, 106, 110, 114, 118, 122, 126],
      velocity: Array(128).fill(0.8),
      muted: false,
      volume: -15
    },
    snare: {
      pattern: [36, 44, 52, 60, 68, 76, 84, 92, 100, 108, 116, 124], // Bars 9-32, on beat 2
      velocity: Array(128).fill(0.9),
      muted: false,
      volume: -8
    },
    hihat: {
      pattern: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31,
                33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61, 63],
      velocity: Array(128).fill(0.5),
      muted: false,
      volume: -18
    },
    bass: {
      pattern: [0, 6, 10, 14, 16, 22, 26, 30, 32, 38, 42, 46, 48, 54, 58, 62,
                64, 70, 74, 78, 80, 86, 90, 94, 96, 102, 106, 110, 112, 118, 122, 126],
      notes: ["A1", "A1", "C2", "A1", "F1", "F1", "G1", "A1",
              "A1", "A1", "C2", "A1", "F1", "F1", "G1", "A1",
              "A1", "A1", "C2", "A1", "F1", "F1", "G1", "A1",
              "A1", "A1", "C2", "A1", "F1", "F1", "G1", "A1"],
      velocity: Array(128).fill(0.9),
      muted: false,
      volume: -8
    },
    lead: {
      pattern: [36, 40, 44, 48, 52, 56, 60, 100, 104, 108, 112, 116, 120, 124], // Bars 9-16, 25-32
      notes: ["A4", "C5", "E5", "G5", "A4", "C5", "E5", 
              "G5", "A4", "C5", "E5", "G5", "A4", "C5"],
      velocity: Array(128).fill(0.6),
      muted: false,
      volume: -12
    },
    rumble: {
      pattern: [32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120], // Bars 9-32
      velocity: Array(128).fill(0.4),
      muted: false,
      volume: -20
    },
    ride: {
      pattern: [65, 69, 73, 77, 81, 85, 89, 93, 97, 101, 105, 109, 113, 117, 121, 125], // Bars 17-32, syncopated
      velocity: Array(128).fill(0.6),
      muted: false,
      volume: -14
    },
    clap: {
      pattern: [20, 28, 52, 60, 84, 92, 116, 124], // Bars 5-8, 13-16, 21-24, 29-32
      velocity: Array(128).fill(0.7),
      muted: false,
      volume: -10
    },
    acid: {
      pattern: [64, 65, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92,
                94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124],
      notes: ["A2", "A2", "C3", "A2", "F2", "F2", "G2", "A2",
              "C3", "C3", "E3", "C3", "A2", "A2", "B2", "C3",
              "A2", "A2", "C3", "A2", "F2", "F2", "G2", "A2",
              "C3", "C3", "E3", "C3", "A2", "A2", "B2", "C3"],
      velocity: Array(128).fill(0.8),
      muted: false,
      volume: -10
    }
  },
  arrangement: {
    intro: {
      bars: [1, 2, 3, 4],
      activeTracks: ["kick"]
    },
    buildup: {
      bars: [5, 6, 7, 8],
      activeTracks: ["kick", "hihat909", "bass"]
    },
    main: {
      bars: [9, 10, 11, 12, 13, 14, 15, 16],
      activeTracks: ["kick", "hihat909", "bass", "lead", "snare", "rumble"]
    },
    breakdown: {
      bars: [17, 18, 19, 20, 21, 22, 23, 24],
      activeTracks: ["kick", "bass", "acid", "ride"]
    },
    climax: {
      bars: [25, 26, 27, 28, 29, 30, 31, 32],
      activeTracks: "all"
    }
  }
};

// Helper functions
export function getStepNote(track: TrackData, step: number): string | undefined {
  if (!track.notes) return undefined;
  const patternIndex = track.pattern.indexOf(step);
  if (patternIndex === -1) return undefined;
  return track.notes[patternIndex];
}

export function setStepNote(track: TrackData, step: number, note: string): void {
  if (!track.notes) track.notes = [];
  const patternIndex = track.pattern.indexOf(step);
  if (patternIndex !== -1) {
    track.notes[patternIndex] = note;
  }
}

export function isStepActive(track: TrackData, step: number): boolean {
  return track.pattern.includes(step);
}

export function toggleStep(track: TrackData, step: number, note?: string): void {
  const index = track.pattern.indexOf(step);
  if (index > -1) {
    // Remove step
    track.pattern.splice(index, 1);
    if (track.notes) {
      track.notes.splice(index, 1);
    }
  } else {
    // Add step
    track.pattern.push(step);
    if (note && track.notes) {
      track.notes.push(note);
    }
    // Keep pattern sorted
    const sortedIndices = track.pattern
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => a.val - b.val);
    
    track.pattern = sortedIndices.map(item => item.val);
    if (track.notes) {
      const newNotes: string[] = [];
      sortedIndices.forEach(item => {
        newNotes.push(track.notes![item.idx] || "C3");
      });
      track.notes = newNotes;
    }
  }
}

export function saveSongToLocalStorage(song: SongData): void {
  localStorage.setItem('basedrum-current-song', JSON.stringify(song));
}

export function loadSongFromLocalStorage(): SongData | null {
  const saved = localStorage.getItem('basedrum-current-song');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved song:', e);
      return null;
    }
  }
  return null;
}

export function exportSongAsJSON(song: SongData): string {
  return JSON.stringify(song, null, 2);
}

export { importSongFromJSON } from './songSchema';