import { TrackData, SongData } from './songData';

// Musical theory definitions
export const SCALES = {
  'minor': [0, 2, 3, 5, 7, 8, 10],           // Natural minor
  'minor_pentatonic': [0, 3, 5, 7, 10],      // Minor pentatonic
  'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],  // Harmonic minor
  'dorian': [0, 2, 3, 5, 7, 9, 10],          // Dorian mode
  'phrygian': [0, 1, 3, 5, 7, 8, 10],        // Phrygian mode
} as const;

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

// Groove templates for authentic techno feels
export const GROOVE_TEMPLATES: Record<string, GrooveTemplate> = {
  'straight': {
    name: 'Straight',
    swingAmount: 0,
    microTiming: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 16 16th notes
    accentPattern: [1, 0.7, 0.8, 0.7, 1, 0.7, 0.8, 0.7, 1, 0.7, 0.8, 0.7, 1, 0.7, 0.8, 0.7],
    description: 'Clean, mechanical 4/4 - Berlin techno style'
  },
  'subtle_swing': {
    name: 'Subtle Swing',
    swingAmount: 0.1,
    microTiming: [0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 5, 0], // Slight delay on off-beats
    accentPattern: [1, 0.6, 0.9, 0.7, 1, 0.6, 0.9, 0.7, 1, 0.6, 0.9, 0.7, 1, 0.6, 0.9, 0.7],
    description: 'Slight shuffle feel - Detroit house influence'
  },
  'groove_swing': {
    name: 'Groove Swing',
    swingAmount: 0.2,
    microTiming: [0, -2, 8, 0, 0, -2, 8, 0, 0, -2, 8, 0, 0, -2, 8, 0], // Pull back + push forward
    accentPattern: [1, 0.5, 0.95, 0.6, 1, 0.5, 0.95, 0.6, 1, 0.5, 0.95, 0.6, 1, 0.5, 0.95, 0.6],
    description: 'Pronounced groove - classic house/techno swing'
  },
  'drunk_groove': {
    name: 'Drunk Groove',
    swingAmount: 0.15,
    microTiming: [-3, 2, 8, -1, 3, -2, 10, 1, -2, 3, 7, 0, 2, -3, 9, -1], // Random-ish variations
    accentPattern: [1, 0.4, 0.85, 0.6, 0.9, 0.5, 0.95, 0.7, 1, 0.45, 0.9, 0.65, 0.95, 0.5, 0.9, 0.6],
    description: 'Loose, human feel - underground techno vibe'
  },
  'minimal_pulse': {
    name: 'Minimal Pulse',
    swingAmount: 0.05,
    microTiming: [0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0], // Very subtle push
    accentPattern: [1, 0.3, 0.7, 0.4, 1, 0.3, 0.7, 0.4, 1, 0.3, 0.7, 0.4, 1, 0.3, 0.7, 0.4],
    description: 'Subtle minimal groove - hypnotic and steady'
  },
  'berlin_machine': {
    name: 'Berlin Machine',
    swingAmount: 0,
    microTiming: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Perfect quantization
    accentPattern: [1, 0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.9],
    description: 'Relentless machine precision - Berlin hard techno'
  },
  'driving_force': {
    name: 'Driving Force',
    swingAmount: 0,
    microTiming: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], // Slight push on off-beats
    accentPattern: [1, 0.8, 0.9, 0.8, 1, 0.8, 0.9, 0.8, 1, 0.8, 0.9, 0.8, 1, 0.8, 0.9, 0.8],
    description: 'Driving industrial force - modern hard techno'
  }
};

export type ScaleType = keyof typeof SCALES;
export type KeyType = typeof KEYS[number];

// Pattern generation configuration
export interface PatternConfig {
  density: number;      // 0-1: How many steps are active
  groove: number;       // 0-1: Amount of swing/humanization  
  complexity: number;   // 0-1: Pattern complexity (polyrhythms, etc.)
  swing: number;        // 0-1: Amount of swing timing (shuffle)
  humanization: number; // 0-1: Micro-timing and velocity variations
  seed?: number;        // For reproducible randomness
}

// Groove templates for different techno styles
export interface GrooveTemplate {
  name: string;
  swingAmount: number;
  microTiming: number[];  // Timing offsets for each 16th note
  accentPattern: number[]; // Velocity accents (0-1) for each 16th note
  description: string;
}

export interface MusicalConfig {
  key: KeyType;
  scale: ScaleType;
  octave: number;
}

// Advanced pattern types
export interface GeneratedPattern {
  pattern: number[];
  notes?: string[];
  velocity: number[];
  ghostNotes?: number[];
  timing?: number[];     // Micro-timing offsets in milliseconds
  accents?: number[];    // Accent pattern (0-1) for each step
}

// Track arrangement structure for proper techno buildup/breakdown
export interface TrackArrangement {
  sections: {
    name: string;
    startBar: number;
    endBar: number;
    activeInstruments: string[];
    intensity: number; // 0-1 for filter/volume automation
  }[];
  totalBars: number;
}

export class PatternGenerator {
  private rng: () => number;
  
  constructor(seed?: number) {
    // Simple seeded random number generator for reproducible patterns
    let s = seed || Math.floor(Math.random() * 1000000);
    this.rng = () => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }

  // Generate scale notes in a specific key and octave
  generateScale(key: KeyType, scale: ScaleType, octave: number): string[] {
    const keyIndex = NOTE_NAMES.indexOf(key);
    const scaleIntervals = SCALES[scale];
    
    return scaleIntervals.map(interval => {
      const noteIndex = (keyIndex + interval) % 12;
      const noteName = NOTE_NAMES[noteIndex];
      return `${noteName}${octave}`;
    });
  }

  // Generate a rhythmic pattern for drums with groove
  generateDrumPattern(
    config: PatternConfig, 
    length: number = 32, 
    grooveTemplate?: GrooveTemplate
  ): GeneratedPattern {
    const pattern: number[] = [];
    const velocity: number[] = [];
    const timing: number[] = [];
    const { density, groove, complexity, swing, humanization } = config;
    
    // Use provided groove template or default
    const template = grooveTemplate || GROOVE_TEMPLATES.straight;
    
    for (let i = 0; i < length; i++) {
      const stepPosition = i % 16; // Position within a bar (16th notes)
      const baseChance = density;
      
      // Emphasis based on musical position
      const isDownbeat = i % 4 === 0;
      const isBackbeat = i % 4 === 2;
      const isOffbeat = i % 2 === 1;
      
      // Base probability with musical emphasis
      let chance = baseChance;
      if (isDownbeat) chance += 0.4;
      else if (isBackbeat) chance += 0.2;
      else if (isOffbeat) chance += 0.1;
      
      // Add complexity through polyrhythms and syncopation
      if (complexity > 0.5) {
        // Add triplet feel
        if (i % 3 === 0) chance += 0.15;
        // Add syncopation
        if (i % 8 === 6) chance += complexity * 0.2;
      }
      
      // Groove-based probability adjustment
      const grooveAccent = template.accentPattern[stepPosition] || 0.7;
      chance *= (0.5 + grooveAccent * 0.5);
      
      if (this.rng() < Math.min(1, chance)) {
        const stepNumber = i * 4;
        pattern.push(stepNumber);
        
        // Apply groove template velocity
        let vel = grooveAccent;
        
        // Add humanization to velocity
        if (humanization > 0) {
          const humanVariation = (this.rng() - 0.5) * humanization * 0.3;
          vel = Math.max(0.2, Math.min(1, vel + humanVariation));
        }
        
        velocity.push(vel);
        
        // Calculate micro-timing
        let timeOffset = 0;
        
        // Apply swing
        if (swing > 0 && isOffbeat) {
          timeOffset += swing * 15; // Up to 15ms swing delay
        }
        
        // Apply groove template micro-timing
        const templateTiming = template.microTiming[stepPosition] || 0;
        timeOffset += templateTiming * groove;
        
        // Add humanization to timing
        if (humanization > 0) {
          const humanTiming = (this.rng() - 0.5) * humanization * 10;
          timeOffset += humanTiming;
        }
        
        timing.push(timeOffset);
      }
    }
    
    return {
      pattern: pattern.sort((a, b) => a - b),
      velocity: this.expandVelocityArray(velocity, 128),
      timing,
      accents: velocity
    };
  }

  // Generate a melodic pattern with notes
  generateMelodicPattern(
    config: PatternConfig, 
    musicalConfig: MusicalConfig,
    length: number = 32
  ): GeneratedPattern {
    const scale = this.generateScale(musicalConfig.key, musicalConfig.scale, musicalConfig.octave);
    const pattern: number[] = [];
    const notes: string[] = [];
    const velocity: number[] = [];
    
    let lastNoteIndex = 0; // For smooth voice leading
    
    for (let i = 0; i < length; i++) {
      const chance = config.density * (1 + config.complexity * 0.5);
      
      if (this.rng() < chance) {
        const step = i * 4;
        pattern.push(step);
        
        // Intelligent note selection with voice leading
        const maxJump = config.complexity > 0.5 ? 4 : 2;
        const direction = this.rng() > 0.5 ? 1 : -1;
        const jump = Math.floor(this.rng() * maxJump) * direction;
        
        lastNoteIndex = Math.max(0, Math.min(scale.length - 1, lastNoteIndex + jump));
        notes.push(scale[lastNoteIndex]);
        
        // Dynamic velocity based on position and complexity
        const baseVelocity = 0.7;
        const variation = config.complexity * 0.3;
        velocity.push(baseVelocity + (this.rng() - 0.5) * variation);
      }
    }
    
    return { pattern, notes, velocity: this.expandVelocityArray(velocity, 128) };
  }

  // Generate ghost notes for humanization
  generateGhostNotes(mainPattern: number[], config: PatternConfig): number[] {
    const ghostNotes: number[] = [];
    const ghostChance = config.groove * 0.3;
    
    for (let i = 0; i < 128; i++) {
      if (!mainPattern.includes(i) && this.rng() < ghostChance) {
        // Prefer ghost notes around main hits
        const nearMainHit = mainPattern.some(hit => Math.abs(hit - i) <= 2);
        if (nearMainHit && this.rng() < 0.7) {
          ghostNotes.push(i);
        }
      }
    }
    
    return ghostNotes;
  }

  // Expand velocity array to match full pattern length
  private expandVelocityArray(velocities: number[], targetLength: number): number[] {
    const expanded = new Array(targetLength).fill(0.7);
    // This would be used differently in a real implementation
    return expanded;
  }

  // Generate a complete techno track with proper structure and gradual buildup
  generateConsistentTrack(
    baseConfig: PatternConfig,
    musicalConfig: MusicalConfig,
    grooveTemplate?: GrooveTemplate,
    seed?: number
  ): Partial<SongData['tracks']> {
    if (seed) this.rng = this.createSeededRNG(seed);
    
    const template = grooveTemplate || GROOVE_TEMPLATES.straight;
    
    // Generate simple, hypnotic patterns (like real techno)
    const patterns = this.generateHypnoticPatterns(baseConfig, musicalConfig, template);
    
    // Create track arrangement with buildup, peak, breakdown
    const arrangement = this.createTechnoArrangement();
    
    // Apply arrangement to create structured track
    return this.applyArrangementToPatterns(patterns, arrangement);
  }

  // Generate simple, hypnotic patterns (Jeff Mills style - simple but effective)
  private generateHypnoticPatterns(
    baseConfig: PatternConfig,
    musicalConfig: MusicalConfig,
    template: GrooveTemplate
  ): Record<string, GeneratedPattern> {
    const patterns: Record<string, GeneratedPattern> = {};
    
    // KICK - Simple 4/4 with density control
    patterns.kick = this.generateSimpleKick(template, baseConfig);
    
    // HIHAT - Off-beat groove with complexity
    patterns.hihat909 = this.generateOffbeatHihat(template, baseConfig);
    
    // SNARE - Minimal backbeat accent
    patterns.snare = this.generateMinimalSnare(template);
    
    // CLAP - Layered backbeat for fuller sound
    patterns.clap = this.generateBackbeatClap(template);
    
    // BASS - Simple root note foundation
    patterns.bass = this.generateHypnoticBass(musicalConfig, baseConfig);
    
    // LEAD - The main hypnotic loop (like "The Bells")
    patterns.lead = this.generateHypnoticLead(musicalConfig, baseConfig, template);
    
    // ACID - Density-controlled accent texture
    patterns.acid = this.generateSparseAcid(musicalConfig, baseConfig, template);
    
    return patterns;
  }

  // Create proper techno arrangement: Short intro -> Quick buildup -> Extended peak
  private createTechnoArrangement(): TrackArrangement {
    return {
      totalBars: 32,
      sections: [
        {
          name: "intro",
          startBar: 0,
          endBar: 2, // Much shorter - just 2 bars of kick
          activeInstruments: ["kick"],
          intensity: 0.4
        },
        {
          name: "buildup1", 
          startBar: 2,
          endBar: 8,
          activeInstruments: ["kick", "snare", "hihat909"], // Snare comes in early for groove
          intensity: 0.6
        },
        {
          name: "buildup2",
          startBar: 8, 
          endBar: 16,
          activeInstruments: ["kick", "snare", "hihat909", "clap", "bass"], // Add clap and bass
          intensity: 0.8
        },
        {
          name: "buildup3",
          startBar: 16,
          endBar: 24,
          activeInstruments: ["kick", "snare", "hihat909", "clap", "bass", "lead"], // Add lead first
          intensity: 0.9
        },
        {
          name: "peak",
          startBar: 24,
          endBar: 32,
          activeInstruments: ["kick", "snare", "hihat909", "clap", "bass", "lead", "acid"], // Full arrangement
          intensity: 1.0
        }
      ]
    };
  }

  // Apply arrangement to patterns - this creates the actual track structure
  private applyArrangementToPatterns(
    patterns: Record<string, GeneratedPattern>,
    arrangement: TrackArrangement
  ): Partial<SongData['tracks']> {
    const tracks: Partial<SongData['tracks']> = {};
    const totalSteps = arrangement.totalBars * 16; // 16 steps per bar
    
    // For each instrument, create the full track pattern based on arrangement
    Object.keys(patterns).forEach(instrumentName => {
      const basePattern = patterns[instrumentName];
      const fullPattern: number[] = [];
      const fullNotes: string[] = [];
      const fullVelocity: number[] = [];
      
      // Go through each section and add pattern if instrument is active
      arrangement.sections.forEach(section => {
        if (section.activeInstruments.includes(instrumentName)) {
          const sectionStartStep = section.startBar * 16;
          const sectionLengthSteps = (section.endBar - section.startBar) * 16;
          
          // Repeat the base pattern throughout this section
          for (let sectionStep = 0; sectionStep < sectionLengthSteps; sectionStep++) {
            const absoluteStep = sectionStartStep + sectionStep;
            const patternStep = sectionStep % 16; // Base patterns are 16 steps (1 bar)
            
            // Check if this pattern step should trigger
            if (basePattern.pattern.includes(patternStep)) {
              const patternIndex = basePattern.pattern.indexOf(patternStep);
              
              fullPattern.push(absoluteStep);
              
              if (basePattern.notes && basePattern.notes[patternIndex]) {
                fullNotes.push(basePattern.notes[patternIndex]);
              }
              
              // Apply section intensity to velocity
              const baseVel = basePattern.velocity[patternIndex] || 0.7;
              fullVelocity.push(baseVel * section.intensity);
            }
          }
        }
      });
      
      // Only create track if it has patterns
      if (fullPattern.length > 0) {
        tracks[instrumentName as keyof SongData['tracks']] = {
          pattern: fullPattern,
          notes: fullNotes.length > 0 ? fullNotes : undefined,
          velocity: this.expandVelocityArray(fullVelocity, totalSteps),
          muted: false,
          volume: this.getInstrumentVolume(instrumentName),
          ghostNotes: basePattern.ghostNotes
        };
      }
    });
    
    return tracks;
  }

  // Get appropriate volume for each instrument
  private getInstrumentVolume(instrumentName: string): number {
    const volumes: Record<string, number> = {
      kick: -6,
      hihat909: -15,
      snare: -8,
      clap: -10,
      bass: -8,
      lead: -10,
      acid: -14
    };
    return volumes[instrumentName] || -10;
  }

  // Simple hypnotic pattern generators (Jeff Mills style - less is more)
  
  // Simple 4/4 kick with density control
  private generateSimpleKick(template: GrooveTemplate, config?: PatternConfig): GeneratedPattern {
    const pattern: number[] = [];
    const velocity: number[] = [];
    
    // Basic 4/4 pattern with density control
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 0) {
        // Density affects whether we skip some kicks
        if (!config || this.rng() < Math.max(0.6, config.density)) {
          pattern.push(i);
          const baseVel = 0.9;
          const variation = config?.humanization ? (this.rng() - 0.5) * config.humanization * 0.2 : 0;
          velocity.push(Math.max(0.5, Math.min(1.0, baseVel + variation)));
        }
      }
    }
    
    return {
      pattern,
      velocity: this.expandVelocityArray(velocity, 16)
    };
  }
  
  // Off-beat hihat groove with density control
  private generateOffbeatHihat(template: GrooveTemplate, config?: PatternConfig): GeneratedPattern {
    const pattern: number[] = [];
    const velocity: number[] = [];
    
    // Off-beat pattern with density affecting how many hits
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 2) {
        // Density controls how often hihats trigger
        if (!config || this.rng() < config.density) {
          pattern.push(i);
          const baseVel = 0.6;
          const variation = config?.humanization ? this.rng() * config.humanization * 0.3 : this.rng() * 0.2;
          velocity.push(baseVel + variation);
        }
      }
      // Complexity adds extra 16th note hihats
      if (config && config.complexity > 0.5 && i % 2 === 1 && this.rng() < config.complexity * 0.5) {
        pattern.push(i);
        velocity.push(0.4 + this.rng() * 0.2);
      }
    }
    
    return {
      pattern,
      velocity: this.expandVelocityArray(velocity, 16)
    };
  }
  
  // Minimal snare accent
  private generateMinimalSnare(template: GrooveTemplate): GeneratedPattern {
    const pattern: number[] = [];
    const velocity: number[] = [];
    
    // Classic backbeat: step 8 (2nd beat)
    pattern.push(8);
    velocity.push(0.8);
    
    return {
      pattern,
      velocity: this.expandVelocityArray(velocity, 16)
    };
  }
  
  // Backbeat clap to layer with snare
  private generateBackbeatClap(template: GrooveTemplate): GeneratedPattern {
    const pattern: number[] = [];
    const velocity: number[] = [];
    
    // Same backbeat as snare but slightly different timing/velocity
    pattern.push(8); // 2nd beat 
    velocity.push(0.7); // Slightly quieter than snare
    
    return {
      pattern,
      velocity: this.expandVelocityArray(velocity, 16)
    };
  }
  
  // Rolling techno bass - 16th note foundation (like real techno)
  private generateHypnoticBass(musicalConfig: MusicalConfig, config: PatternConfig): GeneratedPattern {
    const pattern: number[] = [];
    const notes: string[] = [];
    const velocity: number[] = [];
    
    // Create rolling 16th note bassline - THIS is real techno
    const scale = this.generateScale(musicalConfig.key, musicalConfig.scale, 2);
    const bassNotes = [scale[0], scale[1], scale[0], scale[2]]; // Simple 4-note rolling pattern
    
    // 16th note rolling pattern - density controls how many play
    for (let i = 0; i < 16; i++) {
      if (this.rng() < config.density * 0.8) { // High probability for rolling effect
        pattern.push(i);
        notes.push(bassNotes[i % bassNotes.length]);
        
        // Create rolling velocity pattern
        const baseVel = 0.7;
        const accent = (i % 4 === 0) ? 0.15 : 0; // Accent on beats
        const variation = config.humanization ? (this.rng() - 0.5) * config.humanization * 0.2 : 0;
        velocity.push(Math.max(0.4, Math.min(0.9, baseVel + accent + variation)));
      }
    }
    
    // Ensure at least the main beats for foundation
    if (!pattern.includes(0)) {
      pattern.unshift(0);
      notes.unshift(scale[0]);
      velocity.unshift(0.8);
    }
    
    return {
      pattern: pattern.sort((a, b) => a - b),
      notes,
      velocity: this.expandVelocityArray(velocity, 16)
    };
  }
  
  // Melodic techno lead - evolving melodic sequences (like The Bells)
  private generateHypnoticLead(musicalConfig: MusicalConfig, config: PatternConfig, template: GrooveTemplate): GeneratedPattern {
    const pattern: number[] = [];
    const notes: string[] = [];
    const velocity: number[] = [];
    
    // Create evolving melodic sequence - this is the main hook
    const scale = this.generateScale(musicalConfig.key, musicalConfig.scale, 4);
    
    // Classic techno melodic patterns - based on "The Bells" style
    const positions = [0, 2, 4, 6, 8, 10, 12, 14]; // 8th note pattern
    const melodyPattern = [
      scale[0], scale[2], scale[1], scale[0], // Rising then back to root
      scale[1], scale[3], scale[2], scale[1]  // Higher sequence
    ];
    
    positions.forEach((pos, index) => {
      // Complexity controls how full the melody is
      if (this.rng() < config.complexity * 0.9 + 0.3) { // Minimum 30%, up to full
        pattern.push(pos);
        notes.push(melodyPattern[index % melodyPattern.length]);
        
        // Create evolving velocity for movement
        const baseVel = 0.6;
        const evolution = Math.sin((index / positions.length) * Math.PI) * 0.3; // Sine wave evolution
        const variation = config.humanization ? (this.rng() - 0.5) * config.humanization * 0.2 : 0;
        velocity.push(Math.max(0.4, Math.min(0.9, baseVel + evolution + variation)));
      }
    });
    
    // Ensure at least some notes for the hook
    if (pattern.length < 3) {
      pattern.push(0, 4, 8);
      notes.push(scale[0], scale[1], scale[0]);
      velocity.push(0.7, 0.6, 0.5);
    }
    
    return {
      pattern: pattern.sort((a, b) => a - b),
      notes,
      velocity: this.expandVelocityArray(velocity, 16)
    };
  }
  
  // Authentic TB-303 acid sequences with slides and accents
  private generateSparseAcid(musicalConfig: MusicalConfig, config: PatternConfig, template: GrooveTemplate): GeneratedPattern {
    const pattern: number[] = [];
    const notes: string[] = [];
    const velocity: number[] = [];
    
    // Generate classic TB-303 style sequence
    const scale = this.generateScale(musicalConfig.key, 'minor', 3);
    
    // TB-303 classic patterns: 16th note sequences with slides and accents
    const acidPositions = [1, 3, 6, 8, 10, 12, 15]; // Classic acid timing
    const acidNotes = [
      scale[0], scale[2], scale[1], scale[0], // Classic acid run
      scale[3], scale[1], scale[0]  // Return to root
    ];
    
    acidPositions.forEach((pos, index) => {
      // Density affects how many acid notes trigger
      if (this.rng() < config.density * 0.7 + 0.2) { // 20% minimum density
        pattern.push(pos);
        notes.push(acidNotes[index % acidNotes.length]);
        
        // TB-303 style velocity with accents
        let baseVel = 0.5;
        
        // Classic accent pattern (every 4th note gets accent)
        if (index % 4 === 0) baseVel += 0.3; // Accent
        
        // Add some complexity-based variation
        if (config.complexity > 0.6 && this.rng() > 0.7) baseVel += 0.2;
        
        // Humanization
        const variation = config.humanization ? (this.rng() - 0.5) * config.humanization * 0.2 : 0;
        velocity.push(Math.max(0.3, Math.min(0.9, baseVel + variation)));
      }
    });
    
    // Ensure minimum acid activity
    if (pattern.length < 2) {
      pattern.push(1, 6);
      notes.push(scale[0], scale[1]);
      velocity.push(0.6, 0.4);
    }
    
    return {
      pattern: pattern.sort((a, b) => a - b),
      notes,
      velocity: this.expandVelocityArray(velocity, 16)
    };
  }

  // Specialized pattern generators
  private generateOffbeatPattern(length: number): number[] {
    const pattern: number[] = [];
    for (let i = 0; i < length; i++) {
      // Emphasize off-beats (2, 6, 10, 14...)
      if (i % 4 === 1 || i % 4 === 3) {
        if (this.rng() > 0.3) {
          pattern.push(i * 4);
        }
      }
    }
    return pattern;
  }

  private generateBackbeatPattern(length: number): number[] {
    const pattern: number[] = [];
    for (let i = 0; i < length; i++) {
      // Emphasize beats 2 and 4 (classic snare placement)
      if (i % 8 === 4) { // Beat 2 of each bar
        pattern.push(i * 4);
      }
    }
    return pattern;
  }

  // Generate rolling techno lead - the primary rhythmic foundation
  private generateTechnoRollingLead(musicalConfig: MusicalConfig, config: PatternConfig, grooveTemplate: GrooveTemplate): GeneratedPattern {
    const scale = this.generateScale(musicalConfig.key, musicalConfig.scale, musicalConfig.octave || 3);
    const pattern: number[] = [];
    const notes: string[] = [];
    const velocity: number[] = [];
    const timing: number[] = [];
    
    // Rolling 1/16th note patterns - the main rhythmic driver
    const totalSteps = 128;
    for (let i = 0; i < totalSteps; i++) {
      const stepPosition = i % 16;
      
      // High density for rolling foundation - this is the main groove
      let chance = config.density * 0.8; // Base rolling density
      
      // Emphasize the rolling 16th note pattern
      if (i % 2 === 0) chance += 0.1; // On-beats stronger
      if (i % 4 === 0) chance += 0.15; // Quarter note emphasis
      
      // Groove template influence for the foundation
      const grooveAccent = grooveTemplate.accentPattern[stepPosition] || 0.8;
      chance *= grooveAccent;
      
      if (this.rng() < chance) {
        pattern.push(i);
        
        // Lead note selection: melodic but driving
        const noteIndex = Math.floor(this.rng() * Math.min(4, scale.length)); // Limit to lower scale notes
        notes.push(scale[noteIndex]);
        
        // Strong, consistent velocity for driving rhythm
        let vel = 0.7 + this.rng() * 0.3;
        vel *= grooveAccent;
        velocity.push(vel);
        
        // Tight micro-timing for rolling precision
        const templateTiming = grooveTemplate.microTiming[stepPosition] || 0;
        let timeOffset = templateTiming * config.groove * 0.5; // Less variation for foundation
        
        if (config.humanization) {
          const humanTiming = (this.rng() - 0.5) * config.humanization * 1.5; // Subtle humanization
          timeOffset += humanTiming;
        }
        
        timing.push(timeOffset);
      }
    }
    
    return { 
      pattern: pattern.sort((a, b) => a - b),
      notes, 
      velocity: this.expandVelocityArray(velocity, 128),
      timing,
      accents: velocity
    };
  }

    // Generate atmospheric acid - textural accents over the lead foundation
  private generateAtmosphericAcid(
    musicalConfig: MusicalConfig,
    config: PatternConfig, 
    grooveTemplate: GrooveTemplate,
    leadPattern: GeneratedPattern
  ): GeneratedPattern {
    const scale = this.generateScale(musicalConfig.key, 'minor', musicalConfig.octave || 2);
    const pattern: number[] = [];
    const notes: string[] = [];
    const velocity: number[] = [];
    const timing: number[] = [];
    
    // Acid works as atmospheric texture, not main driver
    const totalSteps = 128;
    const leadSteps = new Set(leadPattern.pattern);
    
    for (let i = 0; i < totalSteps; i++) {
      const stepPosition = i % 16;
      
      // Sparser pattern that complements the lead foundation
      let chance = config.density * 0.4; // Much lower density
      
      // Accent specific moments for texture
      if (i % 8 === 2) chance += 0.2; // Add movement on off-beats
      if (i % 16 === 10) chance += 0.15; // Syncopated accents
      
      // Avoid competing with dense lead sections
      if (leadSteps.has(i)) {
        chance *= 0.3; // Reduce when lead is playing
      } else {
        chance *= 1.2; // Slight boost in lead gaps
      }
      
      // Groove template influence for texture
      const grooveAccent = grooveTemplate.accentPattern[stepPosition] || 0.6;
      chance *= grooveAccent;
      
      if (this.rng() < chance) {
        pattern.push(i);
        
        // TB-303 style acid note selection with chromatic movement
        if (this.rng() > 0.4) {
          // Scale notes for harmonic consistency
          notes.push(scale[Math.floor(this.rng() * scale.length)]);
        } else {
          // Chromatic passing tones for classic acid character
          const chromatic = this.generateChromaticNote(musicalConfig.key, musicalConfig.octave || 2);
          notes.push(chromatic);
        }
        
        // Moderate velocity for textural layer
        let vel = 0.5 + this.rng() * 0.3;
        vel *= grooveAccent;
        velocity.push(vel);
        
        // More micro-timing variation for acid character
        const templateTiming = grooveTemplate.microTiming[stepPosition] || 0;
        let timeOffset = templateTiming * config.groove;
        
        if (config.humanization) {
          const humanTiming = (this.rng() - 0.5) * config.humanization * 2;
          timeOffset += humanTiming;
        }
        
        timing.push(timeOffset);
      }
    }
    
    return {
      pattern: pattern.sort((a, b) => a - b),
      notes,
      velocity: this.expandVelocityArray(velocity, 128),
      timing,
      accents: velocity
    };
  }



  // Generate proper techno chord progressions for sustained leads
  private generateTechnoChord(scale: string[], musicalConfig: MusicalConfig): string[] {
    const chord: string[] = [];
    
    // Techno chords are often simple but atmospheric
    const rootIndex = Math.floor(this.rng() * scale.length);
    const root = scale[rootIndex];
    chord.push(root);
    
    // Add harmonic intervals common in techno
    if (this.rng() > 0.3) {
      // Add fifth
      const fifthIndex = (rootIndex + 2) % scale.length;
      chord.push(scale[fifthIndex]);
    }
    
    if (this.rng() > 0.5) {
      // Add octave for thickness
      chord.push(root); // Same note, will be layered
    }
    
    if (this.rng() > 0.7) {
      // Add seventh for color
      const seventhIndex = (rootIndex + 3) % scale.length;
      chord.push(scale[seventhIndex]);
    }
    
    return chord;
  }

  private generateChromaticNote(key: KeyType, octave: number): string {
    const keyIndex = NOTE_NAMES.indexOf(key);
    const chromaticOffset = Math.floor(this.rng() * 12);
    const noteIndex = (keyIndex + chromaticOffset) % 12;
    return `${NOTE_NAMES[noteIndex]}${octave}`;
  }

  private createSeededRNG(seed: number) {
    let s = seed;
    return () => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }

  // Generate authentic techno kick pattern (4/4 foundation)
  generateTechnoKickPattern(length: number, grooveTemplate: GrooveTemplate): GeneratedPattern {
    const pattern: number[] = [];
    const velocity: number[] = [];
    const timing: number[] = [];

    // Pure 4/4 kick pattern - every downbeat
    for (let i = 0; i < length; i++) {
      if (i % 4 === 0) { // Every 4th step = quarter note
        pattern.push(i * 4);
        
        const stepPosition = (i * 4) % 16;
        const grooveAccent = grooveTemplate.accentPattern[stepPosition] || 1;
        velocity.push(grooveAccent);
        
        const templateTiming = grooveTemplate.microTiming[stepPosition] || 0;
        timing.push(templateTiming);
      }
    }

    return {
      pattern,
      velocity: this.expandVelocityArray(velocity, 128),
      timing,
      accents: velocity
    };
  }

  // Generate dense 16th note hi-hat patterns (authentic techno style)
  generateDense16thPattern(config: PatternConfig, length: number, grooveTemplate: GrooveTemplate): GeneratedPattern {
    const pattern: number[] = [];
    const velocity: number[] = [];
    const timing: number[] = [];
    const { density, groove, humanization } = config;

    // Dense 16th note pattern
    for (let i = 0; i < length * 4; i++) { // 4x density for 16th notes
      const stepPosition = i % 16;
      
      // High probability for 16th notes, but with variations
      let chance = density;
      
      // Emphasize off-beats and syncopation
      if (i % 2 === 1) chance += 0.1; // Off-beats
      if (i % 8 === 6) chance += 0.2; // Syncopation
      
      if (this.rng() < chance) {
        pattern.push(i);
        
        const grooveAccent = grooveTemplate.accentPattern[stepPosition] || 0.8;
        let vel = grooveAccent;
        
        if (humanization > 0) {
          const humanVariation = (this.rng() - 0.5) * humanization * 0.3;
          vel = Math.max(0.2, Math.min(1, vel + humanVariation));
        }
        
        velocity.push(vel);
        
        const templateTiming = grooveTemplate.microTiming[stepPosition] || 0;
        let timeOffset = templateTiming * groove;
        
        if (humanization > 0) {
          const humanTiming = (this.rng() - 0.5) * humanization * 5;
          timeOffset += humanTiming;
        }
        
        timing.push(timeOffset);
      }
    }

    return {
      pattern: pattern.sort((a, b) => a - b),
      velocity: this.expandVelocityArray(velocity, 128),
      timing,
      accents: velocity
    };
  }

  // Generate powerful techno snare pattern (classic 2 and 4 emphasis)
  generateTechnoSnarePattern(length: number, grooveTemplate: GrooveTemplate): GeneratedPattern {
    const pattern: number[] = [];
    const velocity: number[] = [];
    const timing: number[] = [];

    for (let i = 0; i < length; i++) {
      // Classic techno snare on beats 2 and 4 (steps 4 and 12 of each bar)
      const barPosition = i % 8;
      if (barPosition === 2 || barPosition === 6) { // Beats 2 and 4
        pattern.push(i * 4);
        
        const stepPosition = (i * 4) % 16;
        const grooveAccent = grooveTemplate.accentPattern[stepPosition] || 1;
        velocity.push(grooveAccent);
        
        const templateTiming = grooveTemplate.microTiming[stepPosition] || 0;
        timing.push(templateTiming);
      }
    }

    return {
      pattern,
      velocity: this.expandVelocityArray(velocity, 128),
      timing,
      accents: velocity
    };
  }
}

// Utility functions for the Sound Lab
export function transposeTrack(track: TrackData, fromKey: KeyType, toKey: KeyType): TrackData {
  if (!track.notes) return track;
  
  const fromIndex = NOTE_NAMES.indexOf(fromKey);
  const toIndex = NOTE_NAMES.indexOf(toKey);
  const semitoneShift = (toIndex - fromIndex + 12) % 12;
  
  const transposedNotes = track.notes.map(noteStr => {
    const note = noteStr.slice(0, -1);
    const octave = parseInt(noteStr.slice(-1));
    const noteIndex = NOTE_NAMES.indexOf(note);
    const newNoteIndex = (noteIndex + semitoneShift) % 12;
    const newOctave = octave + Math.floor((noteIndex + semitoneShift) / 12);
    
    return `${NOTE_NAMES[newNoteIndex]}${newOctave}`;
  });
  
  return { ...track, notes: transposedNotes };
}

export function generateVariation(
  basePattern: number[], 
  variationAmount: number = 0.3
): number[] {
  const generator = new PatternGenerator();
  const newPattern = [...basePattern];
  
  // Remove some notes
  for (let i = newPattern.length - 1; i >= 0; i--) {
    if (Math.random() < variationAmount * 0.5) {
      newPattern.splice(i, 1);
    }
  }
  
  // Add some new notes
  for (let i = 0; i < 128; i += 4) {
    if (!newPattern.includes(i) && Math.random() < variationAmount * 0.3) {
      newPattern.push(i);
    }
  }
  
  return newPattern.sort((a, b) => a - b);
}

// Export preset configurations with proper techno densities
export const PRESET_CONFIGS = {
  minimal: { density: 0.6, groove: 0.2, complexity: 0.3, swing: 0.05, humanization: 0.1 },
  classic: { density: 0.8, groove: 0.4, complexity: 0.5, swing: 0.1, humanization: 0.2 },
  intense: { density: 0.9, groove: 0.3, complexity: 0.8, swing: 0.05, humanization: 0.1 },
  berlin_hard: { density: 0.95, groove: 0.1, complexity: 0.9, swing: 0.0, humanization: 0.05 }
} as const; 