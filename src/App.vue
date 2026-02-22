<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import MainLayout from 'layouts/MainLayout.vue';
import EmptyLayout from 'layouts/EmptyLayout.vue';
import { useRoute } from 'vue-router';
import { computed, type Ref } from 'vue';
import { useMeta } from 'quasar';
import type { Component } from 'vue';

let layoutComponent: Ref<Component>;
try {
  if (typeof window !== 'undefined') {
    const route = useRoute();
    layoutComponent = computed(() => (route.meta.layout === 'empty' ? EmptyLayout : MainLayout));

    useMeta(() => ({
      title: 'SpanishNook | Clases de español online',
      meta: {
        description: {
          name: 'description',
          content:
            'Clases de español online con profesores nativos. Reserva clases particulares y grupales, aprende desde cualquier lugar con SpanishNook.',
        },
        keywords: {
          name: 'keywords',
          content:
            'español online, clases de español, profesores nativos, clases grupales, clases individuales, aprender español, SpanishNook',
        },
        ogTitle: {
          property: 'og:title',
          content: 'SpanishNook | Clases de español online',
        },
        ogDescription: {
          property: 'og:description',
          content:
            'Reserva clases particulares y grupales de español online. Aprende con profesores nativos y grupos reducidos.',
        },
        ogImage: {
          property: 'og:image',
          content: '/img/Logo_rectangular_320.png',
        },
        robots: {
          name: 'robots',
          content: 'index,follow',
        },
      },
    }));
  } else {
    // SSR: fallback seguro
    layoutComponent = computed(() => MainLayout);
  }
} catch (e: unknown) {
  // Mostrar el error en consola y en el navegador si es posible
  console.error('Error en setup de App.vue:', e);
  if (typeof window !== 'undefined') {
    let errorMsg = '';
    function hasStack(err: unknown): err is { stack: string } {
      return (
        typeof err === 'object' &&
        err !== null &&
        'stack' in err &&
        typeof (err as { stack: unknown }).stack === 'string'
      );
    }
    if (hasStack(e)) {
      errorMsg = e.stack;
    } else {
      errorMsg = String(e);
    }
    document.body.innerHTML = '<pre style="color:red;white-space:pre-wrap;">' + errorMsg + '</pre>';
  }
}
</script>
