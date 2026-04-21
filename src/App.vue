<template>
  <!-- Mostrar loader mientras se inicializa la autenticación (solo en cliente) -->
  <div v-if="showLoader" class="auth-loading-screen">
    <div class="loader-content">
      <q-spinner-gears color="primary" size="80px" />
      <div class="loader-text">Cargando...</div>
    </div>
  </div>
  
  <!-- Mostrar app normal una vez inicializada -->
  <component v-else :is="layoutComponent">
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
import { useAuth } from 'src/stores/auth';

const { isInitialized: isAuthInitialized } = useAuth();

// Solo mostrar loader en cliente y mientras no esté inicializado
const showLoader = computed(() => {
  // En SSR, nunca mostrar loader
  if (typeof window === 'undefined') return false;
  // En cliente, mostrar solo si no está inicializado
  return !isAuthInitialized.value;
});

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

<style scoped>
.auth-loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  z-index: 9999;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loader-text {
  font-size: 1.2rem;
  color: #851319;
  font-weight: 500;
}
</style>
