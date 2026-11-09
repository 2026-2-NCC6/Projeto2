import { Vibration } from 'react-native';

/**
 * Serviço responsável por emitir sinais sonoros (beeps/chimes) no início e no fim do intervalo de descanso.
 * Utiliza a Web Audio API (AudioContext) no navegador e vibração complementar em dispositivos móveis.
 */
class SoundService {
  private audioCtx: any = null;

  private getAudioContext(): any {
    if (typeof window === 'undefined') return null;
    const AudioContextClass =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!this.audioCtx) {
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private emitirNota(
    frequenciaHz: number,
    inicioOffsetSeg: number,
    duracaoSeg: number,
    tipoOnda: 'sine' | 'triangle' = 'sine'
  ) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = tipoOnda;
      osc.frequency.setValueAtTime(
        frequenciaHz,
        ctx.currentTime + inicioOffsetSeg
      );

      gain.gain.setValueAtTime(0.001, ctx.currentTime + inicioOffsetSeg);
      gain.gain.exponentialRampToValueAtTime(
        0.28,
        ctx.currentTime + inicioOffsetSeg + 0.02
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + inicioOffsetSeg + duracaoSeg
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + inicioOffsetSeg);
      osc.stop(ctx.currentTime + inicioOffsetSeg + duracaoSeg);
    } catch {
      // Ignora caso o navegador bloqueie áudio sem interação prévia
    }
  }

  /**
   * Sinal sonoro emitido no INÍCIO do descanso (dois tons suaves descendentes: Sol5 -> Mi5)
   */
  public tocarInicioDescanso() {
    this.emitirNota(784, 0, 0.16, 'sine');
    this.emitirNota(587.33, 0.18, 0.28, 'sine');

    try {
      Vibration.vibrate(150);
    } catch {
      // Ignora em ambientes sem motor de vibração
    }
  }

  /**
   * Sinal sonoro emitido no FIM do descanso (três beeps ascendentes enérgicos: Dó5 -> Mi5 -> Lá5)
   */
  public tocarFimDescanso() {
    this.emitirNota(523.25, 0, 0.14, 'triangle');
    this.emitirNota(659.25, 0.16, 0.14, 'triangle');
    this.emitirNota(880, 0.32, 0.32, 'triangle');

    try {
      Vibration.vibrate([0, 180, 100, 250]);
    } catch {
      // Ignora em ambientes sem motor de vibração
    }
  }
}

export const soundService = new SoundService();

