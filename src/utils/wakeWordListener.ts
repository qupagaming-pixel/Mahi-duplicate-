// "Hey Mahi" Continuous Wake Word Engine
// Enables voice activation by listening for "Hey Mahi", "Mahi", "Suno Mahi", "Hello Mahi"

export interface WakeWordListenerOptions {
  onWake: (detectedPhrase: string) => void;
  onError?: (error: string) => void;
  onStatusChange?: (isListening: boolean) => void;
}

// Pleasant wake chime synthesized with Web Audio API (Zero external assets needed)
export function playWakeChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First tone (pleasant cheerful chime)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Second tone (higher sparkle)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.12); // C6
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch (e) {
    console.warn('Audio chime error:', e);
  }
}

export class WakeWordListener {
  private recognition: any = null;
  private isRunning: boolean = false;
  private shouldRestart: boolean = false;
  private options: WakeWordListenerOptions;
  private restartTimeout: any = null;

  constructor(options: WakeWordListenerOptions) {
    this.options = options;
  }

  public static isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public start(): boolean {
    if (!WakeWordListener.isSupported()) {
      this.options.onError?.('Speech recognition is not supported in this browser.');
      return false;
    }

    if (this.isRunning) return true;

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'hi-IN'; // Works wonderfully with Hinglish & Hindi

      this.shouldRestart = true;
      this.isRunning = true;

      this.recognition.onstart = () => {
        this.options.onStatusChange?.(true);
      };

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();
          
          // Match variations of "Hey Mahi" / "Mahi"
          const isWakeMatch = (
            transcript.includes('hey mahi') ||
            transcript.includes('hay mahi') ||
            transcript.includes('he mahi') ||
            transcript.includes('aye mahi') ||
            transcript.includes('ai mahi') ||
            transcript.includes('suno mahi') ||
            transcript.includes('hello mahi') ||
            transcript.includes('hi mahi') ||
            transcript.includes('oye mahi') ||
            transcript.includes('mahi suno') ||
            transcript.includes('maahi') ||
            transcript.includes('mahiye') ||
            transcript === 'mahi' ||
            transcript.endsWith(' mahi') ||
            transcript.startsWith('mahi ')
          );

          if (isWakeMatch) {
            playWakeChime();
            try {
              if (navigator.vibrate) navigator.vibrate([60, 40, 80]);
            } catch {
              // ignore
            }
            this.options.onWake(transcript);
            break;
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('WakeWord recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.shouldRestart = false;
          this.isRunning = false;
          this.options.onError?.('Microphone permission blocked. Please allow mic to use "Hey Mahi".');
          this.options.onStatusChange?.(false);
        }
      };

      this.recognition.onend = () => {
        if (this.shouldRestart) {
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.shouldRestart) {
              try {
                this.recognition.start();
              } catch {
                // Ignore restart collision
              }
            }
          }, 350);
        } else {
          this.isRunning = false;
          this.options.onStatusChange?.(false);
        }
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.error('Failed to start WakeWordListener:', err);
      this.isRunning = false;
      this.options.onError?.(err?.message || 'Could not start Wake Word listener');
      this.options.onStatusChange?.(false);
      return false;
    }
  }

  public stop(): void {
    this.shouldRestart = false;
    this.isRunning = false;
    clearTimeout(this.restartTimeout);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
    this.options.onStatusChange?.(false);
  }

  public getActiveState(): boolean {
    return this.isRunning;
  }
}
