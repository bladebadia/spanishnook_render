// src/boot/analytics.ts
import { boot } from 'quasar/wrappers';

export default boot(({ app, router }) => {
  // Solo inicializar en cliente y si existe el ID de medición
  if (typeof window === 'undefined') return;

  const measurementId = process.env.GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('GA_MEASUREMENT_ID no configurado en variables de entorno');
    return;
  }

  const cargarAnalytics = () => {
    // Carga diferida: no incluye vue-gtag-next en el bundle principal
    void import('vue-gtag-next')
      .then(({ default: VueGtag }) => {
        app.use(VueGtag, {
          property: {
            id: measurementId,
          },
          router,
          config: {
            // Configuración de GA4
            send_page_view: true, // Enviar pageviews automáticamente
            anonymize_ip: true, // Anonimizar IPs (GDPR)
          },
          // Habilitar solo en producción para evitar contaminar datos con desarrollo
          enabled: process.env.NODE_ENV === 'production',
        });

        console.log('✅ Google Analytics 4 inicializado:', measurementId);
      })
      .catch((err) => {
        console.error('Error cargando Google Analytics:', err);
      });
  };

  // Cargar Analytics cuando el navegador esté ocioso (o tras 3s como máximo)
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(cargarAnalytics, { timeout: 3000 });
  } else {
    setTimeout(cargarAnalytics, 2000);
  }
});
