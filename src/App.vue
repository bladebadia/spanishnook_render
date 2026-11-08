<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMeta } from 'quasar';
import { useI18n } from 'vue-i18n';
import MainLayout from 'layouts/MainLayout.vue';
import EmptyLayout from 'layouts/EmptyLayout.vue';

const SITIO = 'https://www.spanishnook.com';
const TITULO = 'SpanishNook | Clases de español online';
const DESCRIPCION =
  'Clases de español online con profesores nativos. Reserva clases particulares y grupales, aprende desde cualquier lugar con SpanishNook.';
const IMAGEN = `${SITIO}/img/Logo_rectangular_320.png`;

const route = useRoute();
const { locale } = useI18n();

// Mismo layout en servidor y en cliente.
// Antes el servidor pintaba siempre MainLayout y el navegador lo cambiaba al hidratar.
const layoutComponent = computed(() =>
  route.meta.layout === 'empty' ? EmptyLayout : MainLayout,
);

// URL canónica de la ruta actual, sin query ni barra final
const urlCanonica = computed(() => {
  const ruta = route.path.replace(/\/+$/, '');
  return `${SITIO}${ruta || '/'}`;
});

// Valores por defecto. Cada página puede sobrescribir cualquier clave con su propio useMeta.
useMeta(() => ({
  title: TITULO,
  meta: {
    description: { name: 'description', content: DESCRIPCION },
    robots: { name: 'robots', content: 'index,follow' },
    ogType: { property: 'og:type', content: 'website' },
    ogSiteName: { property: 'og:site_name', content: 'SpanishNook' },
    ogLocale: { property: 'og:locale', content: locale.value.replace('-', '_') },
    ogTitle: { property: 'og:title', content: TITULO },
    ogDescription: { property: 'og:description', content: DESCRIPCION },
    ogImage: { property: 'og:image', content: IMAGEN },
    ogUrl: { property: 'og:url', content: urlCanonica.value },
    twitterCard: { name: 'twitter:card', content: 'summary_large_image' },
    twitterTitle: { name: 'twitter:title', content: TITULO },
    twitterDescription: { name: 'twitter:description', content: DESCRIPCION },
    twitterImage: { name: 'twitter:image', content: IMAGEN },
  },
  link: {
    canonical: { rel: 'canonical', href: urlCanonica.value },
  },
}));
</script>
