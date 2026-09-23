# 📊 Google Analytics 4 - Guía de Uso

## 📋 Proceso Realizado (Estado Actual)

Documento del trabajo de analítica y SEO completado en SpanishNook.

### 1. Google Analytics 4 (GA4)

- ✅ Instalado `vue-gtag-next` para GA4
- ✅ Boot file `src/boot/analytics.ts` con inicialización SSR-safe
- ✅ Composable `src/composables/useAnalytics.ts` con eventos de negocio
- ✅ Measurement ID: `G-RCCWDHKLK9`
- ✅ Tracking automático de pageviews (Vue Router)
- ✅ Habilitado solo en producción (`process.env.NODE_ENV === 'production'`)
- ✅ IPs anonimizadas (GDPR)

**Eventos implementados:**
- `sign_up_started` / `sign_up` — RegistroCuenta.vue
- `login` — Acceder.vue
- `clase_reservada` — CarritoCompra.vue
- `begin_checkout` — CarritoCompra.vue (redirección a Stripe)

### 2. SEO Técnico

- ✅ `public/robots.txt` — permite rastreo, bloquea páginas privadas (login, admin, carrito)
- ✅ `public/sitemap.xml` — 13 URLs públicas con prioridades
- ✅ Schema.org JSON-LD — `EducationalOrganization` + `WebSite` (en `index.html`)
- ✅ Meta tags únicos (title, description, keywords, Open Graph) en **13 páginas**
- ✅ Eliminadas URLs de Supabase/onrender de los meta tags

### 3. Dominio Canónico

- ✅ Dominio canónico: `https://www.spanishnook.com`
- ✅ El servidor redirige `spanishnook.com` → `www.spanishnook.com` (301)
- ✅ Todos los archivos SEO usan `www` consistentemente

### 4. Google Search Console

- ✅ Verificación por meta tag en `index.html`
- ✅ Sitemap enviado y correcto
- ⏳ Vinculación con GA4 (para ver keywords en Analytics)
- ⏳ Indexación en curso (Google tarda días/semanas)

### 5. Próximos Pasos

1. ⏳ Vincular Search Console ↔ GA4 (Admin → Vinculaciones)
2. ⏳ Solicitar indexación de páginas clave (Inspección de URL)
3. 📊 **En unas semanas:** generar informes y evaluar si merece la pena publicidad (Google Ads)

---

## 🔑 Keywords Recomendadas para SpanishNook

Keywords objetivo para posicionar y para futuras campañas de publicidad. Organizadas por intención de búsqueda.

### Aprender español (intención general)
- aprender español online
- aprender español gratis
- cómo aprender español rápido
- mejores páginas para aprender español

### Clases (intención transaccional)
- clases de español online
- clases particulares de español
- clases de español para extranjeros
- clases de conversación en español

### Profesor / tutor (intención de contratación)
- profesor nativo de español
- tutor de español online
- profesores de español particulares
- clases 1 a 1 español

### Curso (intención formativa)
- curso de español online
- curso de español para principiantes
- curso intensivo de español
- curso español A1 A2 B1 B2 C1

### Conversación (intención práctica)
- practicar conversación en español
- hablar español con fluidez
- intercambio de idiomas español
- mejora tu español hablado

### Nivel / test (intención de evaluación)
- test de nivel de español
- qué nivel de español tengo
- examen de nivel español online
- prueba de español A1 C1

### Precio / packs (intención de compra)
- cuánto cuesta una clase de español
- precio clases de español online
- packs de clases de español
- clases de español baratas

### Long-tail (menos volumen, más conversión)
- clases de español online con profesor nativo
- clases de conversación en grupo reducido
- aprender español desde cero online
- preparación DELE online

### Herramientas gratuitas para investigar keywords
- **Google Autocompletar** — sugerencias al escribir en Google
- **"La gente también pregunta"** — caja de preguntas en resultados
- **Google Keyword Planner** — volumen mensual (ads.google.com/keywordplanner)
- **AnswerThePublic** — preguntas y comparaciones (answerthepublic.com)

---

## 🚀 Configuración Inicial

### 1. Crear cuenta de Google Analytics 4

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Crea una cuenta nueva o usa una existente
3. Crea una propiedad GA4 (no Universal Analytics)
4. Configura un "Data Stream" para Web
5. Copia el **Measurement ID** (formato: `G-XXXXXXXXXX`)

### 2. Configurar el Measurement ID

Edita el archivo `.env` en la raíz del proyecto:

```bash
GA_MEASUREMENT_ID=G-TU_ID_AQUI
```

**IMPORTANTE:** 
- El archivo `.env` está en `.gitignore` y NO se sube a git
- Para producción, configura la variable de entorno en Render.com

### 3. Configurar en Render.com (Producción)

1. Ve a tu servicio en Render.com
2. Settings → Environment
3. Agrega la variable:
   - **Key:** `GA_MEASUREMENT_ID`
   - **Value:** `G-TU_ID_AQUI`
4. Guarda y redeploy

---

## 📈 Uso en tu Código

### Tracking Automático

El tracking de pageviews se hace **automáticamente** gracias a la integración con Vue Router.

### Tracking de Eventos Personalizados

Usa el composable `useAnalytics()`:

```typescript
import { useAnalytics } from 'src/composables/useAnalytics';

const { claseReservada, compraCompletada, registroCompletado } = useAnalytics();

// Ejemplo: Trackear reserva de clase
function reservarClase() {
  // ... tu lógica de reserva
  claseReservada('individual', '2026-04-25', '10:00');
}

// Ejemplo: Trackear compra completada
function onPagoExitoso(transactionId: string, total: number) {
  compraCompletada(total, transactionId);
}

// Ejemplo: Trackear registro
function onRegistroExitoso() {
  registroCompletado('email');
}
```

### Eventos Disponibles

```typescript
const analytics = useAnalytics();

// Clases
analytics.claseReservada('individual' | 'grupal', fecha, hora);

// Compras
analytics.compraIniciada(monto);
analytics.compraCompletada(monto, transactionId);

// Registro/Login
analytics.registroIniciado();
analytics.registroCompletado('email' | 'google');
analytics.login('email' | 'google');

// Navegación
analytics.vistaSeccion('nombre_seccion');

// Conversiones
analytics.contactoFormulario('footer' | 'header' | 'pagina_contacto');

// Engagement
analytics.videoReproducido('video_id');

// Evento personalizado
analytics.trackEvent('nombre_evento', {
  parametro1: 'valor1',
  parametro2: 123,
});
```

---

## 🧪 Testing

### Modo desarrollo

Por defecto, GA4 está **deshabilitado en desarrollo**. Para habilitarlo durante testing:

Edita `src/boot/analytics.ts`:

```typescript
enabled: true, // En vez de process.env.NODE_ENV === 'production'
```

### Verificar que funciona

1. Abre tu sitio en el navegador
2. Abre Google Analytics → Reports → Realtime
3. Navega por tu sitio
4. Deberías ver tu visita en tiempo real

### Debug en consola

Abre la consola del navegador y verás:
```
✅ Google Analytics 4 inicializado: G-XXXXXXXXXX
```

---

## 📊 Métricas Recomendadas para SpanishNook

### Conversiones Importantes (Goals)

Configura estos eventos como conversiones en GA4:

1. **clase_reservada** - Usuario reserva una clase
2. **purchase** - Usuario completa pago
3. **sign_up** - Usuario completa registro
4. **contact_form_submit** - Usuario envía formulario de contacto

### Configurar Conversiones

1. En GA4, ve a **Admin → Events**
2. Marca los eventos importantes como "Conversions"
3. Esto te permitirá ver embudos de conversión

### Informes Útiles

- **Realtime** - Usuarios activos ahora
- **Acquisition** - De dónde vienen los usuarios
- **Engagement → Events** - Qué acciones realizan
- **Monetization → Ecommerce purchases** - Compras completadas
- **Retention** - Usuarios que regresan

---

## 🔒 Privacidad (GDPR)

La configuración actual incluye:

- ✅ `anonymize_ip: true` - IPs anonimizadas
- ⚠️ Para cumplimiento completo GDPR, considera agregar un banner de cookies

### Cookie Banner Recomendado

Si tu audiencia es principalmente europea:

```bash
npm install vue-cookieconsent-component
```

O usa un servicio como:
- [Cookiebot](https://www.cookiebot.com/)
- [OneTrust](https://www.onetrust.com/)

---

## 🎯 Próximos Pasos

1. ✅ Configurar `GA_MEASUREMENT_ID` en `.env`
2. ✅ Agregar tracking de eventos en páginas clave:
   - Página de reservas → `claseReservada()`
   - Checkout de Stripe → `compraCompletada()`
   - Formulario de registro → `registroCompletado()`
3. ✅ Configurar variable en Render.com
4. ✅ Verificar en Google Analytics Realtime
5. 📊 Configurar conversiones en GA4
6. 📈 Crear dashboards personalizados

---

## ❓ Troubleshooting

### No veo datos en Google Analytics

1. Verifica que `GA_MEASUREMENT_ID` esté configurado correctamente
2. Revisa la consola del navegador por errores
3. Asegúrate de que no tienes bloqueadores de ads/tracking
4. Los datos pueden tardar 24-48h en aparecer en informes (pero Realtime es instantáneo)

### El tracking no funciona en desarrollo

Es normal, está deshabilitado por defecto. Cambia `enabled: true` temporalmente.

### Error "GA_MEASUREMENT_ID no configurado"

El archivo `.env` no existe o está vacío. Créalo con:
```bash
GA_MEASUREMENT_ID=G-TU_ID_AQUI
```

---

## 📚 Recursos

- [Documentación GA4](https://support.google.com/analytics/answer/9304153)
- [vue-gtag-next Docs](https://matteo-gabriele.gitbook.io/vue-gtag/)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
