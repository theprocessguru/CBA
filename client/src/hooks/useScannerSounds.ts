import { useCallback } from 'react';

// Audio context for playing sounds
const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

interface ScanSoundOptions {
  type: 'success' | 'warning' | 'error';
  volume?: number;
}

export function useScannerSounds() {
  
  const playBeep = useCallback((frequency: number, duration: number, volume: number = 0.3) => {
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  }, []);

  const playSuccessSound = useCallback(() => {
    // Two-tone success sound (ascending)
    playBeep(800, 0.15, 0.2);
    setTimeout(() => playBeep(1000, 0.15, 0.2), 100);
  }, [playBeep]);

  const playWarningSound = useCallback(() => {
    // Three-tone warning sound (descending then up)
    playBeep(600, 0.2, 0.25);
    setTimeout(() => playBeep(500, 0.2, 0.25), 150);
    setTimeout(() => playBeep(700, 0.3, 0.25), 350);
  }, [playBeep]);

  const playErrorSound = useCallback(() => {
    // Low buzz error sound
    playBeep(300, 0.5, 0.3);
  }, [playBeep]);

  const playScanSound = useCallback(({ type, volume }: ScanSoundOptions) => {
    switch (type) {
      case 'success':
        playSuccessSound();
        break;
      case 'warning':
        playWarningSound();
        break;
      case 'error':
        playErrorSound();
        break;
    }
  }, [playSuccessSound, playWarningSound, playErrorSound]);

  return {
    playScanSound,
    playSuccessSound,
    playWarningSound,
    playErrorSound
  };
}