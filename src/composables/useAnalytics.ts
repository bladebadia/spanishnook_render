// src/composables/useAnalytics.ts
import { event } from 'vue-gtag-next';

export function useAnalytics() {
  /**
   * Trackear evento personalizado de GA4
   */
  const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;

    event(eventName, parameters);
  };

  /**
   * Eventos específicos de SpanishNook
   */
  const analytics = {
    // Clases
    claseReservada: (tipo: 'individual' | 'grupal', fecha: string, hora: string) => {
      trackEvent('clase_reservada', {
        tipo_clase: tipo,
        fecha_clase: fecha,
        hora_clase: hora,
      });
    },

    // Compras
    compraIniciada: (monto: number) => {
      trackEvent('begin_checkout', {
        currency: 'EUR',
        value: monto,
      });
    },

    compraCompletada: (monto: number, transactionId: string) => {
      trackEvent('purchase', {
        transaction_id: transactionId,
        currency: 'EUR',
        value: monto,
      });
    },

    // Registro/Auth
    registroIniciado: () => {
      trackEvent('sign_up_started');
    },

    registroCompletado: (metodo: string) => {
      trackEvent('sign_up', {
        method: metodo,
      });
    },

    login: (metodo: string) => {
      trackEvent('login', {
        method: metodo,
      });
    },

    // Navegación
    vistaSeccion: (seccion: string) => {
      trackEvent('view_section', {
        section_name: seccion,
      });
    },

    // Conversiones
    contactoFormulario: (origen: string) => {
      trackEvent('contact_form_submit', {
        form_location: origen,
      });
    },

    // Engagement
    videoReproducido: (videoId: string) => {
      trackEvent('video_play', {
        video_id: videoId,
      });
    },
  };

  return {
    trackEvent,
    ...analytics,
  };
}
