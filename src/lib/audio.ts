
let audioContext: AudioContext | null = null;

/**
 * Returns the singleton AudioContext instance if it has been initialized.
 */
export function getAudioContext(): AudioContext | null {
  return audioContext;
}

/**
 * Creates and/or resumes the AudioContext singleton.
 * MUST be called from a user gesture event handler (click, touchstart).
 */
export async function unlockAudio() {
  if (!audioContext) {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
        console.log("AudioContext created successfully");
      }
    } catch (e) {
      console.error("Failed to create AudioContext:", e);
    }
  }
  
  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      console.log("AudioContext resumed successfully");
    } catch (e) {
      // Quietly fail as this might still be blocked if not called from a gesture
      // but the goal is to call this from such a gesture.
    }
  }
  
  return audioContext;
}
