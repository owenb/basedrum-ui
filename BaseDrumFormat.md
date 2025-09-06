# BaseDrum Format Documentation

## Overview

BaseDrum uses a JSON-based format for storing and sharing techno drum machine patterns. This format includes complete song data with patterns, synthesis parameters, effects settings, and arrangement information.

## Format Version

Current version: **basedrum-v1**

## Schema Validation

All BaseDrum files are validated using Zod schemas to ensure data integrity and prevent runtime errors.

## File Structure

### Complete Example

```json
{
  "metadata": {
    "title": "My Track",
    "artist": "Producer Name",
    "version": "1.0",
    "created": "2025-09-06T14:30:00Z",
    "bpm": 128,
    "bars": 32,
    "steps": 128,
    "format": "basedrum-v1"
  },
  "effects": {
    "filter": {
      "cutoff": 0.5,
      "type": "lowpass",
      "startFreq": 20000,
      "endFreq": 350
    },
    "reverb": {
      "wet": 0.2,
      "roomSize": 0.8,
      "decay": 2.3
    }
  },
  "tracks": {
    "kick": {
      "pattern": [0, 4, 8, 12, 16, 20, 24, 28],
      "ghostNotes": [2, 6, 10, 14],
      "velocity": [1.0, 0.8, 1.0, 0.9, 1.0, 0.8, 1.0, 0.9],
      "muted": false,
      "volume": -6,
      "synthesis": {
        "type": "synth",
        "envelope": {
          "attack": 0.01,
          "decay": 0.3,
          "sustain": 0,
          "release": 0.3
        }
      }
    },
    "bass": {
      "pattern": [0, 6, 10, 14, 16, 22, 26, 30],
      "notes": ["A1", "A1", "C2", "A1", "F1", "F1", "G1", "A1"],
      "velocity": [0.9, 0.8, 0.9, 0.8, 0.9, 0.8, 0.9, 0.8],
      "muted": false,
      "volume": -8
    }
  },
  "arrangement": {
    "intro": {
      "bars": [1, 2, 3, 4],
      "activeTracks": ["kick"]
    },
    "main": {
      "bars": [9, 10, 11, 12, 13, 14, 15, 16],
      "activeTracks": "all"
    }
  }
}
```

## Field Specifications

### Metadata
- **title**: Song title (string)
- **artist**: Artist name (string)  
- **version**: Version number (string)
- **created**: ISO timestamp (string)
- **bpm**: Beats per minute (integer, 60-200)
- **bars**: Number of bars (integer, 1-64)
- **steps**: Total steps (integer, 16-128)
- **format**: Format identifier (string, "basedrum-v1")

### Effects
#### Filter
- **cutoff**: Filter cutoff position (float, 0-1)
- **type**: Filter type (string, e.g., "lowpass", "highpass")
- **startFreq**: Start frequency in Hz (float, 20-20000)
- **endFreq**: End frequency in Hz (float, 20-20000)

#### Reverb
- **wet**: Reverb wet level (float, 0-1)
- **roomSize**: Room size parameter (float, 0-1)
- **decay**: Decay time in seconds (float, 0-10)

### Tracks
Each track contains:
- **pattern**: Array of step numbers where instrument triggers (integers, 0-127)
- **notes**: Note values for melodic tracks (optional, array of strings)
- **velocity**: Velocity per step (optional, array of floats 0-1)
- **ghostNotes**: Softer hit steps (optional, array of integers 0-127)
- **muted**: Mute state (boolean)
- **volume**: Volume in dB (float)
- **synthesis**: Synthesis parameters (optional, object)

### Arrangement (Optional)
Defines song structure with sections:
- **bars**: Array of bar numbers (integers, min 1)
- **activeTracks**: Array of track names or "all" (string array or literal "all")

## Validation Rules

### Pattern Validation
- Step numbers must be integers between 0-127
- Pattern array can be empty but must be defined
- Notes array length should match pattern array length for melodic tracks

### Value Constraints
- BPM: 60-200 BPM
- Bars: 1-64 bars maximum
- Steps: 16-128 steps total
- Velocity: 0.0-1.0 range
- Filter frequencies: 20-20000 Hz
- Effect parameters: 0.0-1.0 range (except decay: 0-10s)

### Required Fields
- All metadata fields are required
- All effects settings are required
- Track pattern and muted fields are required
- Volume field is required per track

## Using the Schema

The schema is implemented in `src/lib/songSchema.ts` using Zod for comprehensive validation.

### In TypeScript/JavaScript

```typescript
import { SongDataSchema, validateSongData, importSongFromJSON } from './lib/songSchema';

// Method 1: Direct validation
try {
  const validSong = SongDataSchema.parse(jsonData);
  console.log('Valid song data:', validSong);
} catch (error) {
  console.error('Validation failed:', error.message);
}

// Method 2: Using helper function
try {
  const validSong = validateSongData(jsonData);
  console.log('Valid song data:', validSong);
} catch (error) {
  console.error('Validation failed:', error.message);
}

// Method 3: Safe parsing with result object
import { safeParseSongData } from './lib/songSchema';
const result = safeParseSongData(jsonData);
if (result.success) {
  console.log('Valid song data:', result.data);
} else {
  console.error('Validation errors:', result.error.errors);
}

// Method 4: Import from JSON string (recommended)
try {
  const song = importSongFromJSON(jsonString);
  console.log('Successfully imported:', song.metadata.title);
} catch (error) {
  console.error('Import failed:', error.message);
}
```

### Schema File Location

The complete Zod schema is defined in:
- **File**: `src/lib/songSchema.ts`
- **Exports**: Types, schemas, validation functions, and constraints
- **Usage**: Import validation functions for safe data handling

### Common Track Types

#### Drum Tracks
- Use only `pattern` array for trigger points
- Optional `ghostNotes` for accent variations
- Optional `velocity` array for dynamics

```json
{
  "kick": {
    "pattern": [0, 4, 8, 12],
    "ghostNotes": [2, 6, 10, 14],
    "velocity": [1.0, 0.8, 1.0, 0.9],
    "muted": false,
    "volume": -6
  }
}
```

#### Melodic Tracks
- Use `pattern` for trigger timing
- Use `notes` for pitch information
- Notes array should align with pattern array

```json
{
  "bass": {
    "pattern": [0, 6, 10, 14],
    "notes": ["A1", "C2", "F1", "G1"],
    "muted": false,
    "volume": -8
  }
}
```

## File Extensions

- **Recommended**: `.basedrum`
- **Alternative**: `.json`

## Error Handling

The schema provides detailed validation errors:

```
Validation error: Expected number, received string at tracks.kick.volume
```

Common validation errors:
- Invalid step numbers (must be 0-127)
- Invalid BPM range (must be 60-200)
- Missing required fields
- Invalid velocity values (must be 0-1)
- Mismatched pattern/notes array lengths

## Best Practices

1. **Always validate** imported data using the schema
2. **Keep patterns sorted** in ascending step order
3. **Align arrays** - notes array should match pattern array indices
4. **Use meaningful names** for tracks and arrangement sections
5. **Include metadata** for proper identification and versioning
6. **Test exports** by re-importing to verify format correctness

## Migration from Other Formats

### From MIDI
- Convert MIDI note-on events to pattern steps
- Map MIDI velocities to 0-1 range
- Extract tempo as BPM
- Manually define synthesis parameters

### From Ableton Live
- Export MIDI clips and convert to patterns
- Map Ableton's velocity (1-127) to 0-1 range
- Recreate effect settings manually
- Define arrangement sections based on Live's session

## Version History

- **basedrum-v1**: Initial format with full synthesis parameter support