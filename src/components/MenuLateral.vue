<template>
  <div class="ml">
    <!-- Cabecera de marca -->
    <router-link to="/" class="ml-cabecera">
      <img src="/img/logo-correo.png" alt="" class="ml-cabecera__logo" width="56" height="56" />
      <span>
        <span class="ml-cabecera__nombre">SpanishNook</span>
        <span class="ml-cabecera__lema">{{ t('Menu.lema') }}</span>
      </span>
    </router-link>

    <!-- Navegación -->
    <nav class="ml-nav" :aria-label="t('Menu.navegacion')">
      <router-link
        v-for="enlace in enlaces"
        :key="enlace.to"
        :to="enlace.to"
        class="ml-enlace"
        :class="{ 'ml-enlace--activo': esActivo(enlace.to) }"
      >
        <q-icon :name="enlace.icono" class="ml-enlace__icono" />
        <span>{{ enlace.texto }}</span>
      </router-link>
    </nav>

    <div class="ml-reservar">
      <q-btn
        color="primary"
        unelevated
        no-caps
        class="full-width"
        icon="event"
        to="/Reservas"
        :label="t('PaginaClases.reservarClase')"
      />
    </div>

    <!-- Contacto rápido y redes -->
    <div class="ml-pie">
      <a class="ml-whatsapp" href="https://wa.me/34694280178" target="_blank" rel="noopener">
        <q-icon :name="mdiWhatsapp" size="22px" />
        <span>{{ t('Menu.escribenos') }}</span>
      </a>
      <div class="ml-redes">
        <a
          v-for="red in redes"
          :key="red.nombre"
          :href="red.url"
          target="_blank"
          rel="noopener"
          class="ml-red"
          :aria-label="red.nombre"
        >
          <q-icon :name="red.icono" size="20px" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/** Menú lateral de móvil (los dos layouts). El QDrawer se cierra solo al cambiar de ruta. */
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { mdiInstagram, mdiMusicNote, mdiWhatsapp, mdiYoutube } from '@quasar/extras/mdi-v6';

const { t } = useI18n();
const route = useRoute();

const enlaces = computed(() => [
  { to: '/', icono: 'home', texto: t('inicio') },
  { to: '/Clases', icono: 'school', texto: t('clases') },
  { to: '/TestNivel', icono: 'quiz', texto: t('testNivel') },
  { to: '/Materiales', icono: 'menu_book', texto: t('cuadernos') },
  { to: '/SobreSpanish', icono: 'face', texto: t('sobre') },
  { to: '/Contacto', icono: 'mail', texto: t('contacto') },
]);

const redes = [
  { nombre: 'Instagram', url: 'https://instagram.com/spanishnook', icono: mdiInstagram },
  { nombre: 'TikTok', url: 'https://www.tiktok.com/@spanishnook1', icono: mdiMusicNote },
  { nombre: 'YouTube', url: 'https://www.youtube.com/@SpanishNook', icono: mdiYoutube },
];

const esActivo = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to));
</script>

<style scoped>
.ml {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: var(--sn-papel);
  color: var(--sn-tinta);
}

.ml-cabecera {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px 20px;
  background: var(--sn-burdeos);
  color: #fff;
  text-decoration: none;
}
.ml-cabecera > span {
  display: flex;
  flex-direction: column;
}
.ml-cabecera__logo {
  flex: none;
  border-radius: 50%;
  background: #fff;
}
.ml-cabecera__nombre {
  font-family: var(--sn-fuente-titulos);
  font-size: 1.25rem;
  font-weight: 700;
}
.ml-cabecera__lema {
  font-size: var(--sn-t-peq);
  line-height: 1.35;
  opacity: 0.9;
}

.ml-nav {
  display: grid;
  gap: 4px;
  padding: 16px 12px 8px;
}
.ml-enlace {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 48px;
  padding: 0 14px;
  border-radius: 12px;
  color: var(--sn-tinta);
  font-weight: 600;
  font-size: 1.05rem;
  text-decoration: none;
}
.ml-enlace:hover {
  background: var(--sn-burdeos-tenue);
}
.ml-enlace__icono {
  font-size: 22px;
  color: var(--sn-tinta-suave);
}
.ml-enlace--activo {
  background: var(--sn-burdeos-tenue);
  color: var(--sn-burdeos);
  font-weight: 700;
}
.ml-enlace--activo .ml-enlace__icono {
  color: var(--sn-burdeos);
}

.ml-reservar {
  padding: 8px 24px 16px;
}

.ml-pie {
  margin-top: auto;
  padding: 16px 20px 24px;
  border-top: 1px solid var(--sn-borde);
  display: grid;
  gap: 14px;
}
.ml-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #1e7f37;
  font-weight: 700;
  text-decoration: none;
}
.ml-redes {
  display: flex;
  gap: 10px;
}
.ml-red {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--sn-borde);
  background: var(--sn-hoja);
  color: var(--sn-burdeos);
}
.ml-red:hover {
  border-color: var(--sn-burdeos);
}
</style>
