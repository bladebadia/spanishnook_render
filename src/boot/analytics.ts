// src/boot/analytics.ts
import { boot } from 'quasar/wrappers';
import VueGtag from 'vue-gtag-next';

export default boot(({ app, router }) => {
  // Solo inicializar en cliente y si existe el ID de medición
  if (typeof window === 'undefined') return;

  const measurementId = process.env.GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('GA_MEASUREMENT_ID no configurado en variables de entorno');
    return;
  }

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
    // Habilitar solo en producción por defecto
    enabled: process.env.NODE_ENV === 'production',
  });

  console.log('✅ Google Analytics 4 inicializado:', measurementId);
});
