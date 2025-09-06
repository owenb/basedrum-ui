import { z } from 'zod';

/**
 * Zod validation schema for BaseDrum song format (basedrum-v1)
 * 
 * This schema validates the complete JSON structure for BaseDrum songs,
 * ensuring data integrity and preventing runtime errors during import/export.
 */

// Track data validation schema
export const TrackDataSchema = z.object({
  // Pattern: Array of step numbers where instrument triggers (0-127)
  pattern: z.array(z.number().int().min(0).max(127)),
  
  // Notes: Note values for melodic tracks (optional, indexed by step)
  notes: z.array(z.string()).optional(),
  
  // Velocity: Per-step velocity values (optional, 0-1 range)
  velocity: z.array(z.number().min(0).max(1)).optional(),
  
  // Ghost notes: Softer hit steps (optional, 0-127 range)
  ghostNotes: z.array(z.number().int().min(0).max(127)).optional(),
  
  // Mute state: Boolean indicating if track is muted
  muted: z.boolean(),
  
  // Volume: Track volume in decibels
  volume: z.number(),
  
  // Synthesis: Complete synthesizer parameters (optional, for save/load)
  synthesis: z.any().optional(),
});

// Main song data validation schema
export const SongDataSchema = z.object({
  // Song metadata
  metadata: z.object({
    title: z.string().min(1, "Title cannot be empty"),
    artist: z.string().min(1, "Artist cannot be empty"),
    version: z.string(),
    created: z.string(), // ISO timestamp
    bpm: z.number().int().min(60, "BPM must be at least 60").max(200, "BPM cannot exceed 200"),
    bars: z.number().int().min(1, "Must have at least 1 bar").max(64, "Cannot exceed 64 bars"),
    steps: z.number().int().min(16, "Must have at least 16 steps").max(128, "Cannot exceed 128 steps"),
    format: z.string().refine(val => val === "basedrum-v1", {
      message: "Format must be 'basedrum-v1'"
    }),
  }),
  
  // Effects chain settings
  effects: z.object({
    filter: z.object({
      cutoff: z.number().min(0).max(1),
      type: z.string(),
      startFreq: z.number().min(20).max(20000),
      endFreq: z.number().min(20).max(20000),
    }),
    reverb: z.object({
      wet: z.number().min(0).max(1),
      roomSize: z.number().min(0).max(1),
      decay: z.number().min(0).max(10),
    }),
  }),
  
  // Track definitions (record of track name to track data)
  tracks: z.record(z.string(), TrackDataSchema),
  
  // Arrangement sections (optional)
  arrangement: z.record(z.string(), z.object({
    bars: z.array(z.number().int().min(1)),
    activeTracks: z.union([
      z.array(z.string()), 
      z.literal("all")
    ]),
  })).optional(),
});

// Type exports for TypeScript usage
export type TrackData = z.infer<typeof TrackDataSchema>;
export type SongData = z.infer<typeof SongDataSchema>;

/**
 * Validates song data against the BaseDrum schema
 * @param data - Raw data to validate
 * @returns Validated song data
 * @throws ZodError if validation fails
 */
export function validateSongData(data: unknown): SongData {
  return SongDataSchema.parse(data);
}

/**
 * Safely validates song data, returning result with error info
 * @param data - Raw data to validate
 * @returns Success result with data or failure with error
 */
export function safeParseSongData(data: unknown): {
  success: true;
  data: SongData;
} | {
  success: false;
  error: z.ZodError;
} {
  const result = SongDataSchema.safeParse(data);
  return result;
}

/**
 * Validates and formats a JSON string as BaseDrum song data
 * @param jsonString - JSON string to parse and validate
 * @returns Validated song data
 * @throws Error for JSON parsing issues or ZodError for validation issues
 */
export function importSongFromJSON(jsonString: string): SongData {
  try {
    const parsed = JSON.parse(jsonString);
    return validateSongData(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
    throw error; // Re-throw validation errors as-is
  }
}

/**
 * Common validation patterns and constraints
 */
export const VALIDATION_CONSTRAINTS = {
  BPM_MIN: 60,
  BPM_MAX: 200,
  BARS_MIN: 1,
  BARS_MAX: 64,
  STEPS_MIN: 16,
  STEPS_MAX: 128,
  STEP_MIN: 0,
  STEP_MAX: 127,
  VELOCITY_MIN: 0,
  VELOCITY_MAX: 1,
  FREQ_MIN: 20,
  FREQ_MAX: 20000,
  EFFECT_MIN: 0,
  EFFECT_MAX: 1,
  REVERB_DECAY_MAX: 10,
  SUPPORTED_FORMATS: ['basedrum-v1'] as const,
} as const;