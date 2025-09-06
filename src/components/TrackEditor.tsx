"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

interface TrackEditorProps {
  isOpen: boolean;
  onClose: () => void;
  trackName: string;
  trackType: "drum" | "melodic";
  pattern: number[];
  notes?: string[];
  muted?: boolean;
  volume?: number;
  onSave: (pattern: number[], notes?: string[], volume?: number) => void;
  onToggleMute?: () => void;
  currentStep?: number;
  isPlaying?: boolean;
}

export default function TrackEditor({
  isOpen,
  onClose,
  trackName,
  trackType,
  pattern: initialPattern,
  notes: initialNotes,
  muted = false,
  volume = -10,
  onSave,
  onToggleMute,
  currentStep = 0,
  isPlaying = false,
}: TrackEditorProps) {
  const [pattern, setPattern] = useState<number[]>(initialPattern);
  const [selectedNote, setSelectedNote] = useState<string>("C3");
  const [noteData, setNoteData] = useState<{ [key: number]: string }>({});
  const [trackVolume, setTrackVolume] = useState<number>(volume);
  
  // Initialize noteData from notes array
  useEffect(() => {
    if (initialNotes && initialPattern) {
      const newNoteData: { [key: number]: string } = {};
      initialPattern.forEach((step, index) => {
        if (initialNotes[index]) {
          newNoteData[step] = initialNotes[index];
        }
      });
      setNoteData(newNoteData);
    }
  }, [initialNotes, initialPattern]);
  
  useEffect(() => {
    setPattern(initialPattern);
  }, [initialPattern]);

  useEffect(() => {
    setTrackVolume(volume);
  }, [volume]);

  const handleSave = () => {
    if (trackType === "melodic") {
      // Create notes array that matches the pattern array
      const notes = pattern.map(step => noteData[step] || "C3");
      onSave(pattern, notes, trackVolume);
    } else {
      onSave(pattern, undefined, trackVolume);
    }
    onClose();
  };

  const toggleStep = (step: number) => {
    const newPattern = [...pattern];
    const index = newPattern.indexOf(step);
    if (index > -1) {
      newPattern.splice(index, 1);
    } else {
      newPattern.push(step);
      if (trackType === "melodic") {
        setNoteData({ ...noteData, [step]: selectedNote });
      }
    }
    setPattern(newPattern.sort((a, b) => a - b));
  };

  const pianoKeys = [
    { note: "C4", color: "white" },
    { note: "B3", color: "white" },
    { note: "A#3", color: "black" },
    { note: "A3", color: "white" },
    { note: "G#3", color: "black" },
    { note: "G3", color: "white" },
    { note: "F#3", color: "black" },
    { note: "F3", color: "white" },
    { note: "E3", color: "white" },
    { note: "D#3", color: "black" },
    { note: "D3", color: "white" },
    { note: "C#3", color: "black" },
    { note: "C3", color: "white" },
    { note: "B2", color: "white" },
    { note: "A#2", color: "black" },
    { note: "A2", color: "white" },
    { note: "G#2", color: "black" },
    { note: "G2", color: "white" },
    { note: "F#2", color: "black" },
    { note: "F2", color: "white" },
    { note: "E2", color: "white" },
    { note: "D#2", color: "black" },
    { note: "D2", color: "white" },
    { note: "C#2", color: "black" },
    { note: "C2", color: "white" },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          isOpen ? "opacity-75" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl transition-transform duration-500 transform ${
          isOpen ? "translate-y-0" : "translate-y-full"
        } max-h-[85vh] overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white capitalize">
              Edit {trackName}
            </h2>
            {onToggleMute && (
              <button
                onClick={onToggleMute}
                className={`p-2 rounded-lg transition-colors ${
                  muted || trackVolume <= -50
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
                title={(muted || trackVolume <= -50) ? "Unmute track" : "Mute track"}
              >
                {(muted || trackVolume <= -50) ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
              </button>
            )}
            
            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <FaVolumeUp size={14} className="text-gray-400" />
              <input
                type="range"
                min="-50"
                max="0"
                step="1"
                value={trackVolume}
                onChange={(e) => setTrackVolume(Number(e.target.value))}
                className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((trackVolume + 50) / 50) * 100}%, #374151 ${((trackVolume + 50) / 50) * 100}%, #374151 100%)`
                }}
              />
              <span className="text-xs text-gray-400 w-8 text-center">
                {trackVolume}dB
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(85vh - 80px)" }}>
          {trackType === "drum" ? (
            <DrumSequencer
              pattern={pattern}
              onToggleStep={toggleStep}
              currentStep={currentStep}
              isPlaying={isPlaying}
            />
          ) : (
            <div className="flex flex-col lg:flex-row gap-4">
              <PianoKeyboard
                selectedNote={selectedNote}
                onSelectNote={setSelectedNote}
                pianoKeys={pianoKeys}
              />
              <PianoRoll
                pattern={pattern}
                noteData={noteData}
                selectedNote={selectedNote}
                onToggleStep={toggleStep}
                currentStep={currentStep}
                isPlaying={isPlaying}
                pianoKeys={pianoKeys}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Drum Sequencer Component
function DrumSequencer({
  pattern,
  onToggleStep,
  currentStep,
  isPlaying,
}: {
  pattern: number[];
  onToggleStep: (step: number) => void;
  currentStep: number;
  isPlaying: boolean;
}) {
  const bars = 8; // 8 bars
  const stepsPerBar = 4; // 4 steps per bar
  const totalSteps = bars * stepsPerBar;

  return (
    <div className="space-y-2">
      {/* Bar numbers */}
      <div className="grid grid-cols-8 gap-1 mb-2">
        {Array.from({ length: bars }, (_, i) => (
          <div key={i} className="text-center text-xs text-gray-500">
            Bar {i + 1}
          </div>
        ))}
      </div>

      {/* Step grid */}
      <div className="grid grid-cols-8 gap-1">
        {Array.from({ length: totalSteps }, (_, i) => {
          const isActive = pattern.includes(i * 4); // Convert to 128 step scale
          const isCurrent = Math.floor(currentStep / 4) === i && isPlaying;
          const barIndex = Math.floor(i / stepsPerBar);
          
          return (
            <button
              key={i}
              onClick={() => onToggleStep(i * 4)}
              className={`
                h-12 rounded-lg transition-all duration-100 border-2
                ${isActive 
                  ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-600/30" 
                  : "bg-gray-800 border-gray-700 hover:border-gray-600"
                }
                ${isCurrent ? "ring-2 ring-white animate-pulse" : ""}
                ${barIndex % 2 === 0 ? "" : "opacity-90"}
              `}
            >
              <div className="text-xs text-gray-400">{i + 1}</div>
            </button>
          );
        })}
      </div>

    </div>
  );
}

// Piano Keyboard Component
function PianoKeyboard({
  selectedNote,
  onSelectNote,
  pianoKeys,
}: {
  selectedNote: string;
  onSelectNote: (note: string) => void;
  pianoKeys: { note: string; color: string }[];
}) {
  return (
    <div className="flex flex-col w-20 lg:w-32 bg-gray-800 rounded-lg p-2 max-h-[60vh] overflow-y-auto">
      <div className="text-xs text-gray-400 mb-2 text-center">Keys</div>
      {pianoKeys.map(({ note, color }) => (
        <button
          key={note}
          onClick={() => onSelectNote(note)}
          className={`
            h-8 mb-1 rounded transition-all text-xs
            ${color === "white" 
              ? selectedNote === note
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              : selectedNote === note
                ? "bg-blue-700 text-white"
                : "bg-gray-900 text-gray-400 hover:bg-gray-800"
            }
          `}
        >
          {note}
        </button>
      ))}
    </div>
  );
}

// Piano Roll Component
function PianoRoll({
  pattern,
  noteData,
  selectedNote,
  onToggleStep,
  currentStep,
  isPlaying,
  pianoKeys,
}: {
  pattern: number[];
  noteData: { [key: number]: string };
  selectedNote: string;
  onToggleStep: (step: number) => void;
  currentStep: number;
  isPlaying: boolean;
  pianoKeys: { note: string; color: string }[];
}) {
  const bars = 8;
  const stepsPerBar = 4;
  const totalSteps = bars * stepsPerBar;

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Timeline header */}
        <div className="grid grid-cols-32 gap-px mb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="text-center text-xs text-gray-500">
              {(i % 4) + 1}
            </div>
          ))}
        </div>

        {/* Piano roll grid */}
        <div className="space-y-px bg-gray-900 p-2 rounded-lg max-h-[50vh] overflow-y-auto">
          {pianoKeys.map(({ note }) => (
            <div key={note} className="grid grid-cols-32 gap-px h-6">
              {Array.from({ length: totalSteps }, (_, i) => {
                const stepIndex = i * 4;
                const isActive = pattern.includes(stepIndex) && noteData[stepIndex] === note;
                const isCurrent = Math.floor(currentStep / 4) === i && isPlaying;

                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (selectedNote === note) {
                        onToggleStep(stepIndex);
                      }
                    }}
                    className={`
                      rounded transition-all duration-100
                      ${isActive
                        ? "bg-blue-600 shadow-md"
                        : note === selectedNote
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-800 hover:bg-gray-750"
                      }
                      ${isCurrent ? "ring-1 ring-white" : ""}
                    `}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}