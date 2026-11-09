import { Platform } from 'react-native';

/**
 * Serviço para seleção de foto da galeria/arquivos e captura de foto quadrada (1:1)
 * para o background do template estilo Strava da Sessão.
 */
export const midiaSessaoService = {
  /**
   * Abre o seletor de imagem (galeria/arquivos) e retorna a imagem em DataURL/URI.
   */
  selecionarImagemGaleria(usarCameraMobile = false): Promise<string | null> {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        if (usarCameraMobile) {
          input.setAttribute('capture', 'environment');
        }

        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) {
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            resolve(typeof reader.result === 'string' ? reader.result : null);
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        };

        input.oncancel = () => resolve(null);
        input.click();
      });
    }

    return Promise.resolve(null);
  },

  /**
   * Verifica se o navegador possui suporte a câmera ao vivo via MediaDevices (getUserMedia).
   */
  suportaCameraWebAoVivo(): boolean {
    return (
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      Boolean(navigator.mediaDevices?.getUserMedia)
    );
  },
};

