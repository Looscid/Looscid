import React, { useState, useEffect, useRef } from 'react';
import { Ic } from './Icons.jsx';

/**
 * DreamOS DAW Component
 * Fully standalone Web Audio API synthesizer for Grand Piano, Synth Lead, 808 Bass, and Drums.
 * Optimized for screen readers and braille displays with ARIA regions and status updates.
 */

const INSTRUMENTS = {
  PIANO: 'Grand Piano',
  SYNTH: 'Synth Lead',
  BASS: '808 Bass',
  DRUMS: 'Drums'
};

const AUDIO_CONFIG = {
  [INSTRUMENTS.PIANO]: { type: 'triangle', decay: 0.8, filter: 1200 },
  [INSTRUMENTS.SYNTH]: { type: 'sawtooth', decay: 0.4, filter: 2500 },
  [INSTRUMENTS.BASS]:  { type: 'sine', decay: 1.2, filter: 400, drive: 2 },
  [INSTRUMENTS.DRUMS]: { type: 'noise', decay: 0.1, filter: 8000 }
};

export function DAW({ onClose }) {
  const [activeInst, setActiveInst] = useState(INSTRUMENTS.PIANO);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [status, setStatus] = useState('Ready');
  
  const audioCtxRef = useRef(null);
  const loopRef = useRef(null);
  const dialogRef = useRef(null);

  // Focus trap: land on dialog when opened
  useEffect(() => {
    if (dialogRef.current) dialogRef.current.focus();
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playNote = (inst, freq = 440) => {
    initAudio();
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const config = AUDIO_CONFIG[inst];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    if (inst === INSTRUMENTS.DRUMS) {
      // Simple Noise for Drums
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      noise.start();
      noise.stop(now + 0.1);
      return;
    }

    osc.type = config.type;
    osc.frequency.setValueAtTime(freq, now);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(config.filter, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + config.decay);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + config.decay);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      clearInterval(loopRef.current);
      setIsPlaying(false);
      setStatus('Stopped');
    } else {
      initAudio();
      setIsPlaying(true);
      setStatus(`Playing ${activeInst} at ${tempo} BPM`);
      let beat = 0;
      loopRef.current = setInterval(() => {
        const freq = activeInst === INSTRUMENTS.BASS ? 55 : activeInst === INSTRUMENTS.PIANO ? 440 : 880;
        playNote(activeInst, freq * (beat % 4 === 0 ? 1.2 : 1));
        beat++;
      }, (60 / tempo) * 500); // 8th notes
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="ov" 
      onClick={handleBackdropClick} 
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="msh"
        role="dialog"
        aria-modal="true"
        aria-label="Web Audio DAW Preview,"
        tabIndex="-1"
        style={{ outline: 'none', padding: '20px' }}
      >
        <div className="mhd" aria-hidden="true" />
        
        <header style={{ marginBottom: '24px' }}>
          <h2 className="mtt" style={{ fontSize: '24px' }}>Audio Engine Preview</h2>
          <p className="msb">Standalone Web Audio API Synthesizer</p>
        </header>

        {/* Accessibility Status Region */}
        <div 
          role="status" 
          aria-live="polite" 
          className="sr-hint"
        >
          {status}
        </div>

        <section style={{ marginBottom: '24px' }}>
          <h3 className="slbl" id="inst-label">Select Instrument</h3>
          <div 
            role="radiogroup" 
            aria-labelledby="inst-label"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}
          >
            {Object.values(INSTRUMENTS).map(inst => (
              <button
                key={inst}
                className={`btn ${activeInst === inst ? 'bp' : 'bgb'}`}
                onClick={() => {
                  setActiveInst(inst);
                  setStatus(`Selected ${inst}`);
                  playNote(inst);
                }}
                role="radio"
                aria-checked={activeInst === inst}
                aria-label={`${inst} instrument,`}
                style={{ width: '100%' }}
              >
                {inst}
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h3 className="slbl">Transport Controls</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
            <button
              className="btn bp"
              onClick={togglePlayback}
              aria-label={isPlaying ? 'Stop playback,' : 'Start playback,'}
              style={{ flex: 1, height: '54px' }}
            >
              {isPlaying ? <Ic.Pause /> : <Ic.Play />}
              <span>{isPlaying ? 'Stop' : 'Play Preview'}</span>
            </button>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <label htmlFor="tempo-range" className="slbl" style={{ display: 'block', padding: '0 0 8px' }}>
              Tempo: {tempo} BPM
            </label>
            <input
              id="tempo-range"
              type="range"
              min="60"
              max="200"
              value={tempo}
              onChange={(e) => setTempo(e.target.value)}
              className="inp"
              style={{ padding: '0' }}
              aria-valuemin="60"
              aria-valuemax="200"
              aria-valuenow={tempo}
            />
          </div>
        </section>

        <footer style={{ marginTop: '32px', borderTop: '1px solid var(--bd)', paddingTop: '16px' }}>
          <button
            className="btn bgb"
            onClick={onClose}
            style={{ width: '100%', color: 'var(--rd)' }}
            aria-label="Close DAW preview,"
          >
            Close Dialog
          </button>
        </footer>

        {/* Screen Reader Hint for Braille displays */}
        <div className="sr-hint">
          Use the arrow keys or touch to navigate the instrument grid and transport controls. 
          Status updates are announced when changing instruments or toggling playback.
        </div>
      </div>
    </div>
  );
}
