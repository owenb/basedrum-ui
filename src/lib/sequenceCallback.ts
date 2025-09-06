import * as Tone from "tone";
import { SongData } from "./songData";

export function createSequenceCallback(
  synthsRef: any,
  muteStatesRef: any,
  songDataRef: React.MutableRefObject<SongData>,
  setCurrentStep: (step: number) => void,
  setBeatIntensity: (intensity: number) => void
) {
  return (time: number, step: number) => {
    // Update step counter for visualization
    Tone.Draw.schedule(() => {
      setCurrentStep(step);
    }, time);

    // Beat detection for particle effects
    let beatHit = false;
    const currentSong = songDataRef.current;

    if (!synthsRef.current) return;
    const synths = synthsRef.current;

    // KICK
    if (!muteStatesRef.current.kick && currentSong.tracks.kick && currentSong.tracks.kick.volume > -50) {
      const track = currentSong.tracks.kick;
      if (track.pattern.includes(step)) {
        const velocity = track.velocity?.[step] || 1.0;
        synths.kick?.triggerAttackRelease("C1", "8n", time, velocity);
        beatHit = true;
      } else if (track.ghostNotes?.includes(step)) {
        synths.kick?.triggerAttackRelease("C1", "16n", time, 0.3);
      }
    }

    // HIHAT 909
    if (!muteStatesRef.current.hihat909 && currentSong.tracks.hihat909 && currentSong.tracks.hihat909.volume > -50) {
      const track = currentSong.tracks.hihat909;
      if (track.pattern.includes(step)) {
        const velocity = track.velocity?.[step] || 0.8;
        synths.hihat909Env?.triggerAttackRelease("16n", time, velocity);
      }
    }

    // OPEN HIHAT
    if (!muteStatesRef.current.hihat && currentSong.tracks.hihat && currentSong.tracks.hihat.volume > -50) {
      const track = currentSong.tracks.hihat;
      if (track.pattern.includes(step)) {
        const velocity = track.velocity?.[step] || 0.5;
        synths.hihat?.triggerAttackRelease("8n", time, velocity);
      }
    }

    // SNARE
    if (!muteStatesRef.current.snare && currentSong.tracks.snare && currentSong.tracks.snare.volume > -50) {
      const track = currentSong.tracks.snare;
      if (track.pattern.includes(step)) {
        const velocity = track.velocity?.[step] || 0.9;
        synths.snare?.triggerAttackRelease("8n", time, velocity);
        beatHit = true;
      }
    }

    // BASS
    if (!muteStatesRef.current.bass && currentSong.tracks.bass && currentSong.tracks.bass.volume > -50) {
      const track = currentSong.tracks.bass;
      const patternIndex = track.pattern.indexOf(step);
      if (patternIndex !== -1) {
        const note = track.notes?.[patternIndex] || "A1";
        const velocity = track.velocity?.[step] || 0.9;
        synths.bass?.triggerAttackRelease(note, "4n", time, velocity);
      }
    }

    // LEAD
    if (!muteStatesRef.current.lead && currentSong.tracks.lead && currentSong.tracks.lead.volume > -50) {
      const track = currentSong.tracks.lead;
      const patternIndex = track.pattern.indexOf(step);
      if (patternIndex !== -1) {
        const note = track.notes?.[patternIndex] || "A3";
        const velocity = track.velocity?.[step] || 0.6;
        synths.lead?.triggerAttackRelease(note, "8n", time, velocity);
      }
    }

    // RUMBLE
    if (!muteStatesRef.current.rumble && currentSong.tracks.rumble && currentSong.tracks.rumble.volume > -50) {
      const track = currentSong.tracks.rumble;
      if (track.pattern.includes(step)) {
        const velocity = track.velocity?.[step] || 0.4;
        synths.rumbleEnv?.triggerAttackRelease("2n", time, velocity);
      }
    }

    // RIDE
    if (!muteStatesRef.current.ride && currentSong.tracks.ride && currentSong.tracks.ride.volume > -50) {
      const track = currentSong.tracks.ride;
      if (track.pattern.includes(step)) {
        const velocity = track.velocity?.[step] || 0.6;
        synths.ride?.triggerAttackRelease("16n", time, velocity);
      }
    }

    // CLAP
    if (!muteStatesRef.current.clap && currentSong.tracks.clap && currentSong.tracks.clap.volume > -50) {
      const track = currentSong.tracks.clap;
      if (track.pattern.includes(step)) {
        const velocity = track.velocity?.[step] || 0.7;
        synths.clap?.triggerAttackRelease("16n", time + 0.015, velocity);
      }
    }

    // ACID
    if (!muteStatesRef.current.acid && currentSong.tracks.acid && currentSong.tracks.acid.volume > -50) {
      const track = currentSong.tracks.acid;
      const patternIndex = track.pattern.indexOf(step);
      if (patternIndex !== -1) {
        const note = track.notes?.[patternIndex] || "A2";
        const velocity = track.velocity?.[step] || 0.8;
        synths.acid?.triggerAttackRelease(note, "8n", time, velocity);
      }
    }

    // Update beat intensity for particle effects
    if (beatHit) {
      Tone.Draw.schedule(() => {
        setBeatIntensity(1);
        // Decay the intensity over time
        setTimeout(() => setBeatIntensity(0.7), 50);
        setTimeout(() => setBeatIntensity(0.4), 100);
        setTimeout(() => setBeatIntensity(0.1), 150);
        setTimeout(() => setBeatIntensity(0), 200);
      }, time);
    }
  };
}