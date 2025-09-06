"use client";

import { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import dynamic from "next/dynamic";
import { 
  DEFAULT_SONG, 
  SongData, 
  TrackData,
  isStepActive,
  getStepNote,
  toggleStep,
  setStepNote,
  exportSongAsJSON,
  importSongFromJSON
} from "@/lib/songData";
import { createSequenceCallback } from "@/lib/sequenceCallback";

const ParticleBackground = dynamic(
  () => import("@/components/ParticleBackground"),
  { ssr: false }
);

const TrackEditor = dynamic(
  () => import("@/components/TrackEditor"),
  { ssr: false }
);
import { 
  FaVolumeUp,          // Kick
  FaBolt,              // 909 (electric/sharp) 
  FaCircle,            // Hat
  FaMusic,             // Bass
  FaKeyboard,          // Lead
  FaCircle as FaCircle2, // Snare  
  FaVolumeUp as FaVolumeUp2, // Rumble
  FaCompactDisc,       // Ride
  FaHandPaper,         // Clap
  FaWaveSquare         // Acid
} from "react-icons/fa";

interface GaugeProps {
  value: number;
  onChange: (value: number) => void;
  position: "left" | "right";
}

function CircularGauge({ value, onChange, position }: GaugeProps) {
  const handleGaugeInteraction = (event: any, targetElement?: HTMLElement) => {
    const target = targetElement || event.currentTarget;
    if (!target || !target.getBoundingClientRect) return;

    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX =
      event.clientX || (event.touches && event.touches[0].clientX);
    const clientY =
      event.clientY || (event.touches && event.touches[0].clientY);

    const x = clientX - centerX;
    const y = clientY - centerY;

    // Calculate angle in radians, then convert to degrees
    let angle = Math.atan2(y, x) * (180 / Math.PI);

    // Normalize angle to 0-360 range
    angle = (angle + 360) % 360;

    // Simple quarter circle mapping - start from bottom and go up in the visible quarter
    let gaugeValue;

    if (position === "left") {
      // Left gauge: Horizontal mirror of right gauge
      // When right uses 180°-270°, left should use 270°-360°
      if (angle >= 270 && angle <= 360) {
        gaugeValue = (360 - angle) / 90;  // 360° → 0%, 270° → 100% (reversed because mirrored)
      } else if (angle >= 0 && angle <= 90) {
        gaugeValue = (90 - angle) / 90;  // 0° → 100%, 90° → 0% (reversed because mirrored)
      } else {
        gaugeValue = 0;
      }
    } else {
      // Right gauge: top-left quarter (180° to 270°)
      // Map 180° to 0% and 270° to 100% (inverted to match visual expectation)
      if (angle >= 180 && angle <= 270) {
        gaugeValue = (angle - 180) / 90;
      } else {
        gaugeValue = 0;
      }
    }

    console.log(
      `${position} click angle: ${angle.toFixed(1)}°, Gauge value: ${(
        gaugeValue * 100
      ).toFixed(1)}%`
    );
    onChange(gaugeValue);
  };

  const handleMouseDown = (event: any) => {
    console.log(`${position} gauge mousedown triggered`);
    const targetElement = event.currentTarget;
    handleGaugeInteraction(event, targetElement);

    const handleMouseMove = (e: any) => {
      console.log(`${position} gauge mousemove triggered`);
      handleGaugeInteraction(e, targetElement);
    };
    const handleMouseUp = () => {
      console.log(`${position} gauge mouseup triggered`);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (event: any) => {
    event.preventDefault();
    const targetElement = event.currentTarget;
    handleGaugeInteraction(event, targetElement);

    const handleTouchMove = (e: any) => {
      e.preventDefault();
      handleGaugeInteraction(e, targetElement);
    };
    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  const positionClasses =
    position === "left"
      ? "bottom-0 left-0 translate-x-[-50%] translate-y-[50%]"
      : "bottom-0 right-0 translate-x-[50%] translate-y-[50%]";

  // SVG circle parameters
  const size = 288; // 72 * 4 (w-72 = 288px)
  const center = size / 2;
  const radius = 108; // Distance from center to middle of the thick ring
  const strokeWidth = 48; // 24 * 2 (border-24 equivalent)
  const circumference = 2 * Math.PI * radius;
  const quarterCircumference = circumference / 4; // Only quarter of the circle

  // Calculate rotation for the active gauge
  const rotation = value * 360;

  return (
    <>
      {/* Gauge Container */}
      <div className={`absolute w-72 h-72 transform ${positionClasses}`}>
        {/* SVG Gauge */}
        <svg
          width={size}
          height={size}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Ghost ring - always visible full circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#4b5563"
            strokeWidth={strokeWidth}
            opacity="0.8"
            filter="drop-shadow(0 0 8px rgba(75, 85, 99, 0.5))"
          />

          {/* Active gauge ring - only quarter circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            strokeDasharray={`${quarterCircumference} ${circumference}`}
            strokeDashoffset={
              position === "left" 
                ? quarterCircumference * (1 - value)  // Left: exact same as right
                : quarterCircumference * (1 - value)  // Right: keep current direction
            }
            strokeLinecap="round"
            transform={
              position === "left"
                ? `rotate(180 ${center} ${center}) scale(-1, 1) translate(-${size}, 0)`  // Left: mirror horizontally
                : `rotate(180 ${center} ${center})`  // Right: bottom-left quarter  
            }
            style={{
              transition: "stroke-dashoffset 0.1s ease-out",
            }}
          />
        </svg>

        {/* Transparent interaction overlay */}
        <div
          className="absolute inset-0 w-full h-full cursor-pointer bg-transparent z-20"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        ></div>
      </div>
    </>
  );
}

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [leftGauge, setLeftGauge] = useState(0); // Filter cutoff
  const [rightGauge, setRightGauge] = useState(0); // Reverb/delay
  const [kickMuted, setKickMuted] = useState(false);
  const [hihat909Muted, setHihat909Muted] = useState(false);
  const [hihatMuted, setHihatMuted] = useState(false);
  const [bassMuted, setBassMuted] = useState(false);
  const [leadMuted, setLeadMuted] = useState(false);
  const [snareMuted, setSnareMuted] = useState(false);
  const [rumbleMuted, setRumbleMuted] = useState(false);
  const [rideMuted, setRideMuted] = useState(false);
  const [clapMuted, setClapMuted] = useState(false);
  const [acidMuted, setAcidMuted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showLabel, setShowLabel] = useState<string | null>(null);
  const [beatIntensity, setBeatIntensity] = useState(0);
  const [editingTrack, setEditingTrack] = useState<string | null>(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [loadJsonText, setLoadJsonText] = useState("");
  const [songData, setSongData] = useState<SongData>(DEFAULT_SONG);
  const songDataRef = useRef<SongData>(songData);
  const synthsRef = useRef<any>(null);
  const sequenceRef = useRef<any>(null);
  const filterRef = useRef<any>(null);
  const reverbRef = useRef<any>(null);
  // Keep songDataRef updated
  useEffect(() => {
    songDataRef.current = songData;
  }, [songData]);

  const muteStatesRef = useRef({
    kick: false,
    hihat909: false,
    hihat: false,
    bass: false,
    lead: false,
    snare: false,
    rumble: false,
    ride: false,
    clap: false,
    acid: false,
  });
  const stepCallbackRef = useRef<any>(null);

  useEffect(() => {
    const initializeAudio = async () => {
      // Create effects chain - START COMPLETELY NEUTRAL
      const filter = new Tone.Filter({
        frequency: 20000, // Essentially bypassed (no filtering)
        type: "lowpass",
        rolloff: -24,
      });

      const reverb = new Tone.Reverb({
        decay: 1.5,
        wet: 0.0, // Completely dry (no reverb)
      });

      await reverb.ready;

      // Connect effects chain: instruments -> filter -> reverb -> destination
      filter.connect(reverb);
      reverb.toDestination();

      const kick = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
      }).connect(filter);

      // Open hi-hat with metallic character
      const hihat = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: {
          attack: 0.002,
          decay: 0.03,
          sustain: 0.2,
          release: 0.15, // Longer for open hat
        },
      });

      // Add high-pass filter for metallic sound
      const hihatFilter = new Tone.Filter({
        frequency: 5000,
        type: "highpass",
        rolloff: -12,
      });

      hihat.connect(hihatFilter);
      hihatFilter.connect(filter);

      // Authentic TR-909 hi-hat using multiple oscillators + noise
      const hihat909Osc1 = new Tone.Oscillator(320, "square");
      const hihat909Osc2 = new Tone.Oscillator(800, "square");
      const hihat909Osc3 = new Tone.Oscillator(540, "square");
      const hihat909Noise = new Tone.Noise("white");

      // 909 envelope - sharp attack, quick decay
      const hihat909Env = new Tone.AmplitudeEnvelope({
        attack: 0.001,
        decay: 0.05,
        sustain: 0,
        release: 0.01,
      });

      // Mix the oscillators and noise - MUCH LOUDER
      const hihat909Mixer = new Tone.Gain(2.0);

      // High-pass filter for metallic character
      const hihat909Filter = new Tone.Filter({
        frequency: 7000,
        type: "highpass",
        rolloff: -24,
      });

      // Connect everything
      hihat909Osc1.connect(hihat909Mixer);
      hihat909Osc2.connect(hihat909Mixer);
      hihat909Osc3.connect(hihat909Mixer);
      hihat909Noise.connect(hihat909Mixer);

      hihat909Mixer.connect(hihat909Env);
      hihat909Env.connect(hihat909Filter);
      hihat909Filter.connect(filter);

      // Start the oscillators and noise
      hihat909Osc1.start();
      hihat909Osc2.start();
      hihat909Osc3.start();
      hihat909Noise.start();

      const bass = new Tone.Synth({
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.4 },
      }).connect(filter);

      const lead = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.7 },
      }).connect(filter);

      // Snare drum - classic 808/909 style with noise and tone
      const snare = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: {
          attack: 0.001,
          decay: 0.2,
          sustain: 0.0,
          release: 0.1,
        },
      });

      // Add a filter for snare character
      const snareFilter = new Tone.Filter({
        frequency: 2000,
        type: "bandpass",
        Q: 2,
      });

      snare.connect(snareFilter);
      snareFilter.connect(filter);

      // RUMBLE BASS - Rule 4: Deep sub-bass foundation
      const rumble = new Tone.Oscillator({
        frequency: "E0", // Super low sub-bass
        type: "sine",
      });

      const rumbleEnv = new Tone.AmplitudeEnvelope({
        attack: 0.05,
        decay: 0.1,
        sustain: 0.8,
        release: 2,
      });

      const rumbleFilter = new Tone.Filter({
        frequency: 100,
        type: "lowpass",
        rolloff: -24,
      });

      rumble.connect(rumbleEnv);
      rumbleEnv.connect(rumbleFilter);
      rumbleFilter.connect(filter);

      // RIDE CYMBAL - Subtle high-frequency rhythm (calmed down)
      const ride = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: {
          attack: 0.002, // Slightly softer attack
          decay: 0.2, // Shorter decay for less presence
          sustain: 0.05, // Much less sustain
          release: 0.15, // Shorter release
        },
      });

      const rideFilter = new Tone.Filter({
        frequency: 4000, // Higher cutoff to make it less aggressive
        type: "highpass",
        rolloff: -12,
      });

      ride.connect(rideFilter);
      rideFilter.connect(filter);

      // CLAP - For syncopation and groove
      const clap = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: {
          attack: 0.005,
          decay: 0.03,
          sustain: 0,
          release: 0.01,
        },
      });

      const clapFilter = new Tone.Filter({
        frequency: 1500,
        type: "bandpass",
        Q: 1,
      });

      const clapReverb = new Tone.Reverb({
        decay: 0.5,
        wet: 0.2,
      });

      await clapReverb.ready;
      clap.connect(clapFilter);
      clapFilter.connect(clapReverb);
      clapReverb.connect(filter);

      // ACID LINE - Classic 303-style acid synth
      const acid = new Tone.MonoSynth({
        oscillator: {
          type: "sawtooth",
        },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.3,
          release: 0.2,
        },
        filterEnvelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.4,
          release: 0.2,
          baseFrequency: 200,
          octaves: 3,
        },
        filter: {
          Q: 6,
          type: "lowpass",
          rolloff: -24,
        },
      }).connect(filter);

      rumble.start(); // Start the oscillator

      synthsRef.current = {
        kick,
        hihat,
        bass,
        lead,
        snare,
        rumble,
        rumbleEnv,
        ride,
        clap,
        acid,
        hihat909Env,
        hihat909Osc1,
        hihat909Osc2,
        hihat909Osc3,
        hihat909Noise,
      };
      filterRef.current = filter;
      reverbRef.current = reverb;

      // Create sequence with dynamic callback
      const sequenceCallback = createSequenceCallback(
        synthsRef,
        muteStatesRef,
        songDataRef,
        setCurrentStep,
        setBeatIntensity
      );

      const sequence = new Tone.Sequence(
        sequenceCallback,
        Array.from({ length: 128 }, (_, i) => i),
        "16n"
      );

      sequence.loop = true; // Ensure the sequence loops
      sequenceRef.current = sequence;
      setIsLoaded(true);
    };

    initializeAudio();

    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
      }
      if (synthsRef.current) {
        Object.values(synthsRef.current).forEach((synth: any) => {
          if (synth && synth.dispose) synth.dispose();
        });
        if (synthsRef.current.rumble) {
          synthsRef.current.rumble.stop();
        }
        // Stop 909 components
        if (synthsRef.current.hihat909Osc1)
          synthsRef.current.hihat909Osc1.stop();
        if (synthsRef.current.hihat909Osc2)
          synthsRef.current.hihat909Osc2.stop();
        if (synthsRef.current.hihat909Osc3)
          synthsRef.current.hihat909Osc3.stop();
        if (synthsRef.current.hihat909Noise)
          synthsRef.current.hihat909Noise.stop();
      }
    };
  }, []);

  // Handle FILTER changes (left gauge) - 0% = clean, 100% = filtered
  const handleFilterChange = (value: number) => {
    setLeftGauge(value);
    if (filterRef.current) {
      // Map 0-1 to 20000Hz-350Hz (0 = no processing, 1 = heavy filter)
      const frequency = 20000 - value * 19650;
      filterRef.current.frequency.rampTo(frequency, 0.1);
      console.log(
        `Filter: ${value === 0 ? "OFF" : frequency.toFixed(0) + "Hz"}`
      );
    }
  };

  // Handle REVERB changes (right gauge) - 0% = dry, 100% = wet
  const handleReverbChange = (value: number) => {
    setRightGauge(value);
    if (reverbRef.current) {
      // Map 0-1 to 0-0.5 wet amount (0 = no processing, 1 = prominent reverb)
      const wetAmount = value * 0.5;
      reverbRef.current.wet.rampTo(wetAmount, 0.1);
      console.log(
        `Reverb: ${value === 0 ? "OFF" : (wetAmount * 100).toFixed(0) + "%"}`
      );
    }
  };

  // Track edit functions  
  const handleTrackEdit = (trackName: string) => {
    setEditingTrack(trackName);
  };

  const handleSavePattern = (trackName: string, pattern: number[], notes?: string[]) => {
    setSongData(prev => {
      const newSong = { ...prev };
      newSong.tracks[trackName] = {
        ...newSong.tracks[trackName],
        pattern: pattern,
        notes: notes || newSong.tracks[trackName].notes
      };
      return newSong;
    });
    console.log(`Saved pattern for ${trackName}:`, pattern, notes);
  };

  // Mute toggle functions
  const toggleKick = () => {
    handleTrackEdit("kick");
  };

  const toggleHihat909 = () => {
    handleTrackEdit("hihat909");
  };

  const toggleBass = () => {
    handleTrackEdit("bass");
  };

  const toggleHihat = () => {
    handleTrackEdit("hihat");
  };

  const toggleLead = () => {
    handleTrackEdit("lead");
  };

  const toggleSnare = () => {
    handleTrackEdit("snare");
  };

  const toggleRumble = () => {
    handleTrackEdit("rumble");
  };

  const toggleRide = () => {
    handleTrackEdit("ride");
  };

  const toggleClap = () => {
    handleTrackEdit("clap");
  };

  const toggleAcid = () => {
    handleTrackEdit("acid");
  };

  const handlePlay = async () => {
    if (!isLoaded || !sequenceRef.current) return;

    if (Tone.Transport.state !== "started") {
      await Tone.start();
      Tone.Transport.bpm.value = 128;
    }

    if (isPlaying) {
      // Pause - stop transport but keep sequence position
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      // Resume/Start - continue from current position
      Tone.Transport.start();
      if (sequenceRef.current.state !== "started") {
        sequenceRef.current.start(0);
      }
      setIsPlaying(true);
      setHasStarted(true);
    }
  };

  const handleSaveSong = () => {
    const jsonData = exportSongAsJSON(songData);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songData.metadata.title}.basedrum`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadSong = () => {
    try {
      const newSongData = importSongFromJSON(loadJsonText);
      setSongData(newSongData);
      setLoadJsonText("");
      setShowLoadModal(false);
    } catch (error) {
      let errorMessage = "Invalid song data. Please check your JSON and try again.";
      
      if (error instanceof Error) {
        // Check if it's a Zod validation error
        if (error.message.includes('Expected')) {
          errorMessage = `Validation error: ${error.message}`;
        } else {
          errorMessage = `JSON parsing error: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground beatIntensity={beatIntensity} isPlaying={isPlaying} />
      
      {/* Save/Load Buttons */}
      <div className="absolute top-4 left-4 flex gap-2 z-30">
        <button
          onClick={handleSaveSong}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Save
        </button>
        <button
          onClick={() => setShowLoadModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Load
        </button>
      </div>
      
      {/* Left gauge - Filter Cutoff */}
      <CircularGauge
        value={leftGauge}
        onChange={handleFilterChange}
        position="left"
      />

      {/* Right gauge - Reverb/Delay */}
      <CircularGauge
        value={rightGauge}
        onChange={handleReverbChange}
        position="right"
      />

      {/* Track Control Buttons - Row 1 */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
        {/* Kick Control */}
        <button
          onClick={toggleKick}
          className={`
            p-3 rounded transition-all duration-200 border-0
            ${
              songData.tracks.kick?.muted
                ? "text-gray-500"
                : "text-blue-500"
            }
          `}
          style={{
            backgroundColor: 'transparent',
            color: songData.tracks.kick?.muted ? '#6b7280' : 'rgb(0, 0, 255)'
          }}
        >
          <FaVolumeUp size={20} />
        </button>

        {/* 909 Hi-hat Control */}
        <button
          onClick={toggleHihat909}
          className={`
            p-3 rounded transition-all duration-200 border-0
            ${
              songData.tracks.hihat909?.muted
                ? "text-gray-500"
                : "text-blue-500"
            }
          `}
          style={{
            backgroundColor: 'transparent',
            color: songData.tracks.hihat909?.muted ? '#6b7280' : 'rgb(0, 0, 255)'
          }}
        >
          <FaBolt size={20} />
        </button>

        {/* Open Hi-hat Control */}
        <button
          onClick={toggleHihat}
          className={`
            p-3 rounded transition-all duration-200 border-0
            ${
              songData.tracks.hihat?.muted
                ? "text-gray-500"
                : "text-blue-500"
            }
          `}
          style={{
            backgroundColor: 'transparent',
            color: songData.tracks.hihat?.muted ? '#6b7280' : 'rgb(0, 0, 255)'
          }}
        >
          <FaCircle size={20} />
        </button>

        {/* Bass Control */}
        <button
          onClick={toggleBass}
          className={`
            p-3 rounded transition-all duration-200 border-0
            ${
              songData.tracks.bass?.muted
                ? "text-gray-500"
                : "text-blue-500"
            }
          `}
          style={{
            backgroundColor: 'transparent',
            color: songData.tracks.bass?.muted ? '#6b7280' : 'rgb(0, 0, 255)'
          }}
        >
          <FaMusic size={20} />
        </button>

        {/* Lead Control */}
        <button
          onClick={toggleLead}
          className={`
            p-3 rounded transition-all duration-200 border-0
            ${
              songData.tracks.lead?.muted
                ? "text-gray-500"
                : "text-blue-500"
            }
          `}
          style={{
            backgroundColor: 'transparent',
            color: songData.tracks.lead?.muted ? '#6b7280' : 'rgb(0, 0, 255)'
          }}
        >
          <FaKeyboard size={20} />
        </button>

        {/* Snare Control */}
        <button
          onClick={toggleSnare}
          className={`
            p-3 rounded transition-all duration-200 border-0
            ${
              songData.tracks.snare?.muted
                ? "text-gray-500"
                : "text-blue-500"
            }
          `}
          style={{
            backgroundColor: 'transparent',
            color: songData.tracks.snare?.muted ? '#6b7280' : 'rgb(0, 0, 255)'
          }}
        >
          <FaCircle2 size={20} />
        </button>
      </div>

      {/* Track Control Buttons - Row 2 */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
        {/* Rumble Control */}
        <button
          onClick={toggleRumble}
          className={`
            p-3 rounded transition-all duration-200 border-0
            ${
              songData.tracks.rumble?.muted
                ? "text-gray-500"
                : "text-blue-500"
            }
          `}
          style={{
            backgroundColor: 'transparent',
            color: songData.tracks.rumble?.muted ? '#6b7280' : 'rgb(0, 0, 255)'
          }}
        >
          <FaVolumeUp2 size={20} />
        </button>

        {/* Ride Control */}
        <button
          onClick={toggleRide}
          className={`
            p-3 rounded transition-all duration-200 border-0
            ${
              songData.tracks.ride?.muted
                ? "text-gray-500"
                : "text-blue-500"
            }
          `}
          style={{
            backgroundColor: 'transparent',
            color: songData.tracks.ride?.muted ? '#6b7280' : 'rgb(0, 0, 255)'
          }}
        >
          <FaCompactDisc size={20} />
        </button>

        {/* Clap Control */}
        <button
          onClick={toggleClap}
          className={`
            p-3 rounded transition-all duration-200 border-0
            ${
              songData.tracks.clap?.muted
                ? "text-gray-500"
                : "text-blue-500"
            }
          `}
          style={{
            backgroundColor: 'transparent',
            color: songData.tracks.clap?.muted ? '#6b7280' : 'rgb(0, 0, 255)'
          }}
        >
          <FaHandPaper size={20} />
        </button>

        {/* Acid Control */}
        <button
          onClick={toggleAcid}
          className={`
            p-3 rounded transition-all duration-200 border-0
            ${
              songData.tracks.acid?.muted
                ? "text-gray-500"
                : "text-blue-500"
            }
          `}
          style={{
            backgroundColor: 'transparent',
            color: songData.tracks.acid?.muted ? '#6b7280' : 'rgb(0, 0, 255)'
          }}
        >
          <FaWaveSquare size={20} />
        </button>
      </div>

      {/* Track Label Display */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 h-6 flex items-center justify-center z-30">
        {showLabel && (
          <div 
            className="text-xs font-bold text-gray-300 transition-opacity duration-300"
            style={{
              opacity: showLabel ? 1 : 0
            }}
          >
            {showLabel}
          </div>
        )}
      </div>

      {/* Loop Visualization */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="relative cursor-pointer pointer-events-auto"
          onClick={handlePlay}
        >
          {/* Progress Circle */}
          <svg width="200" height="200" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(59, 130, 246, 0.2)"
              strokeWidth="4"
            />
            {/* Progress arc */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - currentStep / 128)}`}
              style={{
                transition: isPlaying
                  ? "stroke-dashoffset 0.05s linear"
                  : "none",
              }}
            />
          </svg>

          {/* Center content - bar indicator when playing, pause icon when paused */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
            {isPlaying ? (
              <>
                <div className="text-lg font-bold">
                  {Math.floor(currentStep / 4) + 1}/32
                </div>
                <div className="text-xs opacity-70">BARS</div>
              </>
            ) : hasStarted ? (
              <div className="flex items-center justify-center">
                {/* Pause icon - two vertical bars */}
                <svg width="40" height="40" viewBox="0 0 40 40" fill="white">
                  <rect x="10" y="8" width="6" height="24" rx="1" />
                  <rect x="24" y="8" width="6" height="24" rx="1" />
                </svg>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Play button - only show initially, hide after first start */}
      {!hasStarted && (
        <button
          onClick={handlePlay}
          disabled={!isLoaded}
          className="flex items-center justify-center z-10 cursor-pointer"
        >
          {!isLoaded ? (
            <div className="text-white opacity-50">Loading...</div>
          ) : (
            <svg width="80" height="80" viewBox="0 0 80 80" fill="white">
              <polygon points="24,16 24,64 64,40" />
            </svg>
          )}
        </button>
      )}
      
      {/* Track Editor Modal */}
      {editingTrack && songData.tracks[editingTrack] && (
        <TrackEditor
          isOpen={!!editingTrack}
          onClose={() => setEditingTrack(null)}
          trackName={editingTrack}
          trackType={
            ["bass", "lead", "acid"].includes(editingTrack) ? "melodic" : "drum"
          }
          pattern={songData.tracks[editingTrack].pattern || []}
          notes={songData.tracks[editingTrack].notes}
          muted={songData.tracks[editingTrack].muted}
          onSave={(pattern, notes) => {
            handleSavePattern(editingTrack, pattern, notes);
            setEditingTrack(null);
          }}
          onToggleMute={() => {
            setSongData(prev => ({
              ...prev,
              tracks: {
                ...prev.tracks,
                [editingTrack]: {
                  ...prev.tracks[editingTrack],
                  muted: !prev.tracks[editingTrack].muted
                }
              }
            }));
            // Update the mute state in the ref for real-time audio
            if (muteStatesRef.current) {
              muteStatesRef.current[editingTrack as keyof typeof muteStatesRef.current] = !songData.tracks[editingTrack].muted;
            }
          }}
          currentStep={currentStep}
          isPlaying={isPlaying}
        />
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-75"
            onClick={() => setShowLoadModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Load Song</h2>
              <button
                onClick={() => setShowLoadModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Paste JSON data:
                </label>
                <textarea
                  value={loadJsonText}
                  onChange={(e) => setLoadJsonText(e.target.value)}
                  className="w-full h-64 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Paste your BaseDrum JSON data here..."
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLoadModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLoadSong}
                  disabled={!loadJsonText.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Load
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
