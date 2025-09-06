# BaseDrum Song Data Format

## Overview

This document describes the JSON-based data format for storing and loading BaseDrum techno songs. The format is designed to capture all aspects of the drum machine state including patterns, synthesis parameters, effects, and arrangement.

## Format Versions

- **basedrum-v1**: Initial format supporting 32-bar sequences with full synthesis parameter storage

## File Structure

### Metadata
```json
{
  "metadata": {
    "title": "Song Title",
    "artist": "Artist Name", 
    "version": "1.0",
    "created": "2025-09-06T14:30:00Z",
    "bpm": 120,
    "bars": 32,
    "steps": 128,
    "format": "basedrum-v1"
  }
}
```

### Effects Chain
```json
{
  "effects": {
    "filter": {
      "cutoff": 0.5,
      "type": "lowpass",
      "startFreq": 20000,
      "endFreq": 350
    },
    "reverb": {
      "wet": 0.0,
      "roomSize": 0.8,
      "decay": 2.3
    }
  }
}
```

### Track Definitions
Each track contains:
- **pattern**: Array of step numbers where the instrument triggers
- **synthesis**: Complete synthesizer parameters for recreation
- **velocity/volume**: Playback parameters
- **conditional patterns**: Bar-specific or rule-based triggering

```json
{
  "tracks": {
    "kick": {
      "pattern": [0, 4, 8, 12, 16, 20, 24, 28],
      "ghostNotes": [14, 30, 46, 62],
      "velocity": 1.0,
      "muted": false,
      "volume": -6,
      "synthesis": {
        "type": "synth",
        "note": "C1",
        "envelope": {
          "attack": 0.01,
          "decay": 0.3,
          "sustain": 0,
          "release": 0.3
        }
      }
    }
  }
}
```

## Synthesis Types

### Standard Synth
```json
{
  "type": "synth",
  "note": "C1",
  "envelope": { "attack": 0.01, "decay": 0.3, "sustain": 0, "release": 0.3 }
}
```

### TR-909 Hi-Hat
```json
{
  "type": "909hihat",
  "oscillators": [320, 540, 800],
  "envelope": { "attack": 0.001, "decay": 0.05, "sustain": 0, "release": 0.01 }
}
```

### MonoSynth with Filter
```json
{
  "type": "monoSynth",
  "envelope": { "attack": 0.05, "decay": 0.2, "sustain": 0.1, "release": 0.8 },
  "filter": { "frequency": 800, "Q": 8 }
}
```

## Advanced Features

### Conditional Patterns
For tracks that only play during specific bars:
```json
{
  "conditionalPattern": {
    "bars": [9, 10, 11, 12, 13, 14, 15, 16],
    "steps": [1, 5, 9, 13, 17, 21, 25, 29]
  }
}
```

### Arrangement Sections
Define song structure with active tracks per section:
```json
{
  "arrangement": {
    "intro": {
      "bars": [1, 2, 3, 4],
      "activeTracks": ["kick"]
    },
    "buildup": {
      "bars": [5, 6, 7, 8], 
      "activeTracks": ["kick", "hihat909", "bass"]
    },
    "climax": {
      "bars": [25, 26, 27, 28, 29, 30, 31, 32],
      "activeTracks": "all"
    }
  }
}
```

## Implementation Strategy

### Saving Songs
1. Extract current patterns from Tone.Sequence
2. Capture all synthesizer parameters
3. Store effect settings and mute states
4. Add metadata and timestamp
5. Serialize to JSON and save to localStorage/file

### Loading Songs
1. Parse JSON and validate format version
2. Recreate all synthesizers with stored parameters
3. Rebuild Tone.Sequence with patterns
4. Apply effect settings and mute states
5. Update UI controls to match loaded state

## Benefits Over Alternatives

### vs. MIDI
- ✅ Stores complete synthesizer state (envelope, oscillator frequencies)
- ✅ Preserves web audio-specific parameters
- ✅ Human-readable and debuggable
- ✅ Supports conditional/polymetric patterns

### vs. Ableton Link
- ✅ Designed for storage, not just sync
- ✅ Simpler for single-app use cases
- ✅ Includes arrangement and mix information

### vs. Binary Formats
- ✅ Cross-platform compatibility
- ✅ Version control friendly
- ✅ Easy to inspect and modify manually
- ✅ Web-native (no special parsing libraries needed)

## File Extensions
- `.basedrum` - Recommended extension for saved songs
- `.json` - Also acceptable for compatibility

## Future Considerations
- Compression for large pattern data
- Support for audio samples/recordings
- Collaboration features (merge conflicts, etc.)
- Export to standard formats (MIDI, audio)