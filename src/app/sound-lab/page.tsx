'use client';

import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { InstrumentFactory, createEffectsChain, InstrumentSet } from '../../components/InstrumentFactory';
import { 
  PatternGenerator, 
  PRESET_CONFIGS, 
  KEYS, 
  SCALES,
  GROOVE_TEMPLATES,
  PatternConfig,
  MusicalConfig,
  KeyType,
  ScaleType,
  GrooveTemplate,
  transposeTrack 
} from '../../lib/patternGenerator';
import { TrackData } from '../../lib/songData';
import Link from 'next/link';

interface InstrumentControlProps {
  name: string;
  onPlay: () => void;
  isPlaying: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

function InstrumentControl({ name, onPlay, isPlaying, volume, onVolumeChange }: InstrumentControlProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 capitalize">{name}</h3>
      
      <div className="space-y-4">
        <button
          onClick={onPlay}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isPlaying ? '🔴 Stop' : '▶️ Play'}
        </button>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Volume: {Math.round(volume)}dB
          </label>
          <input
            type="range"
            min={-40}
            max={0}
            step={1}
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

export default function SoundLab() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [playingStates, setPlayingStates] = useState<Record<string, boolean>>({});
  const [volumes, setVolumes] = useState<Record<string, number>>({
    kick: -6,
    hihat: -18,
    hihat909: -15,
    bass: -8,
    lead: -12,
    snare: -8,
    rumble: -20,
    ride: -14,
    clap: -10,
    acid: -10,
  });

  // Pattern generation state
  const [isPatternMode, setIsPatternMode] = useState(false);
  const [currentKey, setCurrentKey] = useState<KeyType>('A');
  const [currentScale, setCurrentScale] = useState<ScaleType>('minor_pentatonic');
  const [patternConfig, setPatternConfig] = useState<PatternConfig>(PRESET_CONFIGS.classic);
  const [currentGroove, setCurrentGroove] = useState<string>('berlin_machine');
  const [generatedTracks, setGeneratedTracks] = useState<Partial<Record<string, TrackData>>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(140);

  // Instrument variant state
  const [acidVariant, setAcidVariant] = useState<'classic' | 'deep' | 'screamer' | 'liquid'>('classic');
  const [leadVariant, setLeadVariant] = useState<'classic' | 'stab' | 'pluck' | 'pad'>('classic');

  const instrumentsRef = useRef<InstrumentSet | null>(null);
  const factoryRef = useRef<InstrumentFactory | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const playbackRefs = useRef<Record<string, any>>({});
  const sequenceRef = useRef<Tone.Sequence | null>(null);
  const currentStepRef = useRef(0);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await Tone.start();
        console.log('Tone.js started');

        const { filter, reverb } = await createEffectsChain();
        filterRef.current = filter;
        reverbRef.current = reverb;

        const factory = new InstrumentFactory(filter, reverb);
        factoryRef.current = factory;

        const instruments = await factory.createAllInstruments();
        instrumentsRef.current = instruments;

        setIsInitialized(true);
        console.log('Sound lab initialized');
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initializeAudio();

    return () => {
      // Cleanup
      if (instrumentsRef.current) {
        Object.values(instrumentsRef.current).forEach((synth: any) => {
          if (synth && typeof synth.dispose === 'function') {
            synth.dispose();
          }
        });
      }
    };
  }, []);

  const stopAllPlayback = () => {
    Object.values(playbackRefs.current).forEach((ref) => {
      if (ref) {
        clearInterval(ref);
      }
    });
    playbackRefs.current = {};
    setPlayingStates({});
  };

  const playInstrument = (instrumentName: string) => {
    if (!instrumentsRef.current || !isInitialized) return;

    const isCurrentlyPlaying = playingStates[instrumentName];
    
    if (isCurrentlyPlaying) {
      // Stop playback
      if (playbackRefs.current[instrumentName]) {
        clearInterval(playbackRefs.current[instrumentName]);
        delete playbackRefs.current[instrumentName];
      }
      setPlayingStates(prev => ({ ...prev, [instrumentName]: false }));
      return;
    }

    // Start playback
    setPlayingStates(prev => ({ ...prev, [instrumentName]: true }));

    const playNote = () => {
      const instruments = instrumentsRef.current!;
      const volume = Tone.dbToGain(volumes[instrumentName]);

      switch (instrumentName) {
        case 'kick':
          instruments.kick?.triggerAttackRelease("C1", "8n", undefined, volume);
          break;
        case 'hihat':
          instruments.hihat?.triggerAttackRelease("8n", undefined, volume);
          break;
        case 'hihat909':
          instruments.hihat909Env?.triggerAttackRelease("16n", undefined, volume);
          break;
        case 'bass':
          instruments.bass?.triggerAttackRelease("A1", "4n", undefined, volume);
          break;
        case 'lead':
          // Lead is the rolling foundation - test with punchy rhythmic note
          instruments.lead?.triggerAttackRelease("A3", "8n", undefined, volume); // Lower octave, rhythmic
          break;
        case 'snare':
          instruments.snare?.triggerAttackRelease("8n", undefined, volume);
          break;
        case 'rumble':
          instruments.rumbleEnv?.triggerAttackRelease("2n", undefined, volume);
          break;
        case 'ride':
          instruments.ride?.triggerAttackRelease("16n", undefined, volume);
          break;
        case 'clap':
          instruments.clap?.triggerAttackRelease("16n", undefined, volume);
          break;
        case 'acid':
          instruments.acid?.triggerAttackRelease("A2", "8n", undefined, volume);
          break;
      }
    };

    // Play immediately
    playNote();

    // Set up repeating playback
    const interval = setInterval(playNote, 500); // Play every 500ms
    playbackRefs.current[instrumentName] = interval;
  };

  const updateVolume = (instrumentName: string, volume: number) => {
    setVolumes(prev => ({ ...prev, [instrumentName]: volume }));
  };

  // Hot-swap instruments without losing pattern or effects
  const switchAcidVariant = async (newVariant: 'classic' | 'deep' | 'screamer' | 'liquid') => {
    if (!factoryRef.current || !instrumentsRef.current) return;
    
    // Create new acid variant
    const newAcid = factoryRef.current.createAcidVariant(newVariant);
    
    // Replace in instrument set
    instrumentsRef.current.acid = newAcid;
    setAcidVariant(newVariant);
  };

  const switchLeadVariant = async (newVariant: 'classic' | 'stab' | 'pluck' | 'pad') => {
    if (!factoryRef.current || !instrumentsRef.current) return;
    
    // Create new lead variant
    const newLead = factoryRef.current.createLeadVariant(newVariant);
    
    // Replace in instrument set
    instrumentsRef.current.lead = newLead;
    setLeadVariant(newVariant);
  };

  // Generate new patterns
  const generatePatterns = () => {
    const generator = new PatternGenerator();
    const musicalConfig: MusicalConfig = {
      key: currentKey,
      scale: currentScale,
      octave: 2
    };
    
    const grooveTemplate = GROOVE_TEMPLATES[currentGroove];
    const newTracks = generator.generateConsistentTrack(patternConfig, musicalConfig, grooveTemplate);
    setGeneratedTracks(newTracks);
  };

  // Transpose patterns to new key
  const changeKey = (newKey: KeyType) => {
    if (Object.keys(generatedTracks).length > 0) {
      const transposedTracks: Partial<Record<string, TrackData>> = {};
      
      Object.entries(generatedTracks).forEach(([trackName, track]) => {
        if (track) {
          transposedTracks[trackName] = transposeTrack(track, currentKey, newKey);
        }
      });
      
      setGeneratedTracks(transposedTracks);
    }
    setCurrentKey(newKey);
  };

  // Play generated patterns as a sequence
  const playPatterns = async () => {
    if (!instrumentsRef.current || Object.keys(generatedTracks).length === 0) return;

    if (isPlaying) {
      // Stop playback
      if (sequenceRef.current) {
        sequenceRef.current.stop();
        Tone.Transport.stop();
      }
      // Release any hanging lead notes
      if (instrumentsRef.current?.lead) {
        instrumentsRef.current.lead.triggerRelease();
      }
      setIsPlaying(false);
      return;
    }

    // Start playback
    await Tone.start();
    Tone.Transport.bpm.value = tempo;

    // Create sequence callback
    const sequenceCallback = (time: number, step: number) => {
      currentStepRef.current = step;
      const instruments = instrumentsRef.current!;

      // Get the current groove template for micro-timing
      const grooveTemplate = GROOVE_TEMPLATES[currentGroove];
      const stepPosition = step % 16;
      
      // Play each track according to its pattern
      Object.entries(generatedTracks).forEach(([trackName, track]) => {
        if (!track || !track.pattern) return;
        
        const volume = Tone.dbToGain(volumes[trackName] || -10);
        
        if (track.pattern.includes(step)) {
          const patternIndex = track.pattern.indexOf(step);
          let velocity = track.velocity?.[step] || 0.7;
          const note = track.notes?.[patternIndex];
          
          // Apply groove template velocity accent
          const grooveAccent = grooveTemplate.accentPattern[stepPosition] || 1;
          velocity *= grooveAccent;
          
          // Calculate micro-timing offset
          let timeOffset = 0;
          
          // Apply swing timing
          const isOffbeat = step % 2 === 1;
          if (patternConfig.swing && isOffbeat) {
            timeOffset += (patternConfig.swing * 0.015); // Convert to seconds
          }
          
          // Apply groove template micro-timing
          const templateTiming = grooveTemplate.microTiming[stepPosition] || 0;
          timeOffset += (templateTiming * patternConfig.groove * 0.001); // Convert ms to seconds
          
          // Apply humanization
          if (patternConfig.humanization) {
            const humanTiming = (Math.random() - 0.5) * patternConfig.humanization * 0.01;
            timeOffset += humanTiming;
            
            // Humanize velocity too
            const humanVelocity = (Math.random() - 0.5) * patternConfig.humanization * 0.2;
            velocity = Math.max(0.1, Math.min(1, velocity + humanVelocity));
          }
          
          const finalTime = time + timeOffset;
          
          switch (trackName) {
            case 'kick':
              instruments.kick?.triggerAttackRelease("C1", "8n", finalTime, velocity * volume);
              break;
            case 'hihat909':
              instruments.hihat909Env?.triggerAttackRelease("16n", finalTime, velocity * volume);
              break;
            case 'snare':
              instruments.snare?.triggerAttackRelease("8n", finalTime, velocity * volume);
              break;
            case 'bass':
              if (note) instruments.bass?.triggerAttackRelease(note, "4n", finalTime, velocity * volume);
              break;
                                                    case 'lead':
                      // Lead is the main melodic hook - medium length notes
                      if (note) {
                        instruments.lead?.triggerAttackRelease(note, "8n", finalTime, velocity * volume); // 8th note duration
                      }
                      break;
                    case 'acid':
                      // Acid is TB-303 style plucks - short sharp notes
                      if (note) instruments.acid?.triggerAttackRelease(note, "32n", finalTime, velocity * volume); // Very short for pluck
                      break;
          }
        }
        
        // Play ghost notes for kick with groove
        if (trackName === 'kick' && track.ghostNotes?.includes(step)) {
          const ghostVelocity = 0.3 * (grooveTemplate.accentPattern[stepPosition] || 0.5);
          instruments.kick?.triggerAttackRelease("C1", "16n", time, ghostVelocity * volume);
        }
      });
    };

    // Create and start sequence - dynamic length based on generated tracks
    const maxSteps = Math.max(...Object.values(generatedTracks).map(track => 
      track?.pattern ? Math.max(...track.pattern) + 1 : 0
    ));
    const sequenceLength = Math.max(128, maxSteps); // At least 128 steps, but extend if needed
    
    const sequence = new Tone.Sequence(
      sequenceCallback,
      Array.from({ length: sequenceLength }, (_, i) => i),
      "16n"
    );

    sequence.loop = true;
    sequenceRef.current = sequence;
    
    sequence.start(0);
    Tone.Transport.start();
    setIsPlaying(true);
  };

  const instrumentNames = [
    'kick', 'hihat', 'hihat909', 'bass', 'lead', 
    'snare', 'rumble', 'ride', 'clap', 'acid'
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">🔬 Sound Lab</h1>
          <div className="space-x-4">
            <button
              onClick={() => setIsPatternMode(!isPatternMode)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                isPatternMode 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isPatternMode ? '🎵 Pattern Mode' : '🔧 Individual Mode'}
            </button>
            <button
              onClick={stopAllPlayback}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
            >
              ⏹️ Stop All
            </button>
            <Link 
              href="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold inline-block"
            >
              🎛️ Main Sequencer
            </Link>
          </div>
        </div>

        {!isInitialized ? (
          <div className="text-center py-20">
            <div className="text-2xl mb-4">🎵 Initializing Audio...</div>
            <div className="text-gray-400">Setting up instruments and effects...</div>
          </div>
        ) : (
          <>
            <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-2">🎯 Sound Lab Instructions</h2>
              <p className="text-gray-300">
                {isPatternMode 
                  ? 'Generate authentic techno tracks with proper structure: intro, buildup, peak, and breakdown. Creates simple hypnotic patterns that gradually introduce instruments for maximum dance floor impact.'
                  : 'Test each instrument individually to find the perfect sound. Click "Play" to hear each instrument on repeat, adjust volume levels, and experiment with different combinations.'
                }
              </p>
            </div>

            {isPatternMode && (
              <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">🎼 Pattern Generator</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {/* Key Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Key</label>
                    <select
                      value={currentKey}
                      onChange={(e) => changeKey(e.target.value as KeyType)}
                      className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      {KEYS.map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>

                  {/* Scale Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Scale</label>
                    <select
                      value={currentScale}
                      onChange={(e) => setCurrentScale(e.target.value as ScaleType)}
                      className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      {Object.keys(SCALES).map(scale => (
                        <option key={scale} value={scale}>
                          {scale.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tempo Control */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tempo: {tempo} BPM
                    </label>
                    <input
                      type="range"
                      min={120}
                      max={160}
                      step={1}
                      value={tempo}
                      onChange={(e) => {
                        const newTempo = Number(e.target.value);
                        setTempo(newTempo);
                        if (isPlaying) {
                          Tone.Transport.bpm.value = newTempo;
                        }
                      }}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Preset Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
                    <select
                      value={(() => {
                        const matchedPreset = Object.keys(PRESET_CONFIGS).find(key => 
                          JSON.stringify(PRESET_CONFIGS[key as keyof typeof PRESET_CONFIGS]) === JSON.stringify(patternConfig)
                        );
                        return matchedPreset || 'custom';
                      })()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value !== 'custom' && value in PRESET_CONFIGS) {
                          setPatternConfig(PRESET_CONFIGS[value as keyof typeof PRESET_CONFIGS]);
                        }
                      }}
                      className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      {Object.keys(PRESET_CONFIGS).map(preset => (
                        <option key={preset} value={preset}>
                          {preset.charAt(0).toUpperCase() + preset.slice(1)}
                        </option>
                      ))}
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                {/* Groove Template Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Groove Template</label>
                  <select
                    value={currentGroove}
                    onChange={(e) => setCurrentGroove(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                  >
                    {Object.entries(GROOVE_TEMPLATES).map(([key, template]) => (
                      <option key={key} value={key}>
                        {template.name} - {template.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pattern Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Density: {Math.round(patternConfig.density * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={patternConfig.density}
                      onChange={(e) => setPatternConfig(prev => ({ ...prev, density: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Groove: {Math.round(patternConfig.groove * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={patternConfig.groove}
                      onChange={(e) => setPatternConfig(prev => ({ ...prev, groove: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Swing: {Math.round((patternConfig.swing || 0) * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={patternConfig.swing || 0}
                      onChange={(e) => setPatternConfig(prev => ({ ...prev, swing: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Humanization: {Math.round((patternConfig.humanization || 0) * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={patternConfig.humanization || 0}
                      onChange={(e) => setPatternConfig(prev => ({ ...prev, humanization: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Complexity: {Math.round(patternConfig.complexity * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={patternConfig.complexity}
                      onChange={(e) => setPatternConfig(prev => ({ ...prev, complexity: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Instrument Variant Selectors */}
                <div className="border-t border-gray-600 pt-6">
                  <h4 className="text-lg font-semibold text-white mb-4">🎛️ Instrument Variants</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        🧪 Acid Sound: {acidVariant}
                      </label>
                      <select
                        value={acidVariant}
                        onChange={(e) => switchAcidVariant(e.target.value as any)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                      >
                        <option value="classic">Classic TB-303</option>
                        <option value="deep">Deep & Warm</option>
                        <option value="screamer">High-Res Screamer</option>
                        <option value="liquid">Liquid Smooth</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">
                        {acidVariant === 'classic' && 'Standard acid sound with balanced filter sweeps'}
                        {acidVariant === 'deep' && 'Lower, warmer, slower filter movement'}
                        {acidVariant === 'screamer' && 'High resonance, fast filter sweeps'}
                        {acidVariant === 'liquid' && 'Smooth square wave, gentle modulation'}
                      </p>
                      <button
                        onClick={() => {
                          if (instrumentsRef.current?.acid) {
                            const volume = Tone.dbToGain(volumes.acid);
                            instrumentsRef.current.acid.triggerAttackRelease("A2", "8n", undefined, volume);
                          }
                        }}
                        className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                      >
                        🎵 Test Acid
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        🎹 Lead Sound: {leadVariant}
                      </label>
                      <select
                        value={leadVariant}
                        onChange={(e) => switchLeadVariant(e.target.value as any)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                      >
                        <option value="classic">Classic Square</option>
                        <option value="stab">Sharp Stab</option>
                        <option value="pluck">Pluck Triangle</option>
                        <option value="pad">Ambient Pad</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">
                        {leadVariant === 'classic' && 'Rolling square wave foundation with moderate drive'}
                        {leadVariant === 'stab' && 'Punchy sawtooth rolling patterns with edge'}
                        {leadVariant === 'pluck' && 'Percussive triangle rolling foundation'}
                        {leadVariant === 'pad' && 'Smooth rolling patterns with gentle attack'}
                      </p>
                      <button
                        onClick={() => {
                          if (instrumentsRef.current?.lead) {
                            const volume = Tone.dbToGain(volumes.lead);
                            // Test as rolling rhythmic foundation
                            instrumentsRef.current.lead.triggerAttackRelease("A3", "8n", undefined, volume);
                          }
                        }}
                        className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                      >
                        🎹 Test Lead Foundation
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={generatePatterns}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                  >
                    🎲 Generate Patterns
                  </button>
                  <button
                    onClick={playPatterns}
                    disabled={Object.keys(generatedTracks).length === 0}
                    className={`px-6 py-3 rounded-lg font-semibold ${
                      Object.keys(generatedTracks).length === 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : isPlaying
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isPlaying ? '⏹️ Stop Pattern' : '▶️ Play Pattern'}
                  </button>
                </div>

                {/* Generated Pattern Info */}
                {Object.keys(generatedTracks).length > 0 && (
                  <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Generated Tracks:</h3>
                    <div className="text-sm text-gray-300">
                      {Object.entries(generatedTracks).map(([trackName, track]) => (
                        <div key={trackName} className="mb-1">
                          <span className="font-medium capitalize">{trackName}:</span> {track?.pattern?.length || 0} steps
                          {track?.notes && `, Notes: ${track.notes.slice(0, 3).join(', ')}${track.notes.length > 3 ? '...' : ''}`}
                        </div>
                      ))}
                    </div>
                    
                    {/* Track Structure Info */}
                    <div className="mt-3 p-3 bg-blue-900/30 rounded border border-blue-600/30">
                      <h4 className="text-sm font-semibold text-blue-300 mb-1">🎧 Track Structure:</h4>
                      <div className="text-xs text-blue-200">
                        <div className="mb-1">📍 <strong>Intro (0-2 bars):</strong> Just kick drum - quick foundation</div>
                        <div className="mb-1">📈 <strong>Buildup 1 (2-8 bars):</strong> + Snare & Hi-hat groove</div>
                        <div className="mb-1">🔥 <strong>Buildup 2 (8-16 bars):</strong> + Clap & Bass foundation</div>
                        <div className="mb-1">🎹 <strong>Buildup 3 (16-24 bars):</strong> + Lead pads (sustained)</div>
                        <div className="mb-1">💥 <strong>Peak (24-32 bars):</strong> + Acid plucks (rhythmic)</div>
                        <div className="mt-1 text-blue-300">
                          ✨ Separated lead & acid to avoid muddy layering - lead sustains, acid plucks
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {instrumentNames.map((name) => (
                <InstrumentControl
                  key={name}
                  name={name}
                  onPlay={() => playInstrument(name)}
                  isPlaying={playingStates[name] || false}
                  volume={volumes[name]}
                  onVolumeChange={(volume) => updateVolume(name, volume)}
                />
              ))}
            </div>

            <div className="mt-12 p-6 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">🎚️ Global Effects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter Cutoff
                  </label>
                  <input
                    type="range"
                    min={100}
                    max={20000}
                    step={100}
                    defaultValue={20000}
                    onChange={(e) => {
                      if (filterRef.current) {
                        filterRef.current.frequency.value = Number(e.target.value);
                      }
                    }}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reverb Amount
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    defaultValue={0}
                    onChange={(e) => {
                      if (reverbRef.current) {
                        reverbRef.current.wet.value = Number(e.target.value);
                      }
                    }}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 