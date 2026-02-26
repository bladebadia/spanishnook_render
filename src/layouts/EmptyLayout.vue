<template>
  <q-layout view="lHh Lpr fff">
    <q-header elevated ref="headerRef">
      <q-bar>
        <q-space></q-space>

        <q-btn to="/AreaPersonal" v-show="user" flat class="text-white btn-nav-superior">
          {{ t('areaPersonal') }}
        </q-btn>

        <q-btn to="/Acceder" v-show="!user" flat class="text-white btn-nav-superior">
          {{ t('acceder') }}
        </q-btn>

        <q-btn v-show="user" flat class="text-white btn-nav-superior" @click="cerrarSesion">
          {{ t('cerrarSesion') }}
        </q-btn>

        <q-btn
          to="/CarritoCompra"
          v-show="user"
          class="text-white carro-btn"
          icon="shopping_cart"
          flat
        >
          <q-badge v-if="carritoCount > 0" color="red" floating rounded class="badge-notification">
            {{ carritoCount }}
          </q-badge>
        </q-btn>

        <div class="row items-center q-gutter-xs flag-switcher">
          <q-btn
            :class="locale === 'es-ES' ? 'flag-selected' : 'flag-unselected'"
            @click="changeLang('es-ES')"
            class="flag-btn flag-es"
          >
            <q-img
              src="https://flagcdn.com/w40/es.png"
              alt="Español"
              style="width: 24px; height: 16px"
            />
          </q-btn>
          <q-btn
            :class="locale === 'en-US' ? 'flag-selected' : 'flag-unselected'"
            @click="changeLang('en-US')"
            class="flag-btn flag-en"
          >
            <q-img
              src="https://flagcdn.com/w40/gb.png"
              alt="English"
              style="width: 24px; height: 16px; border-radius: 2px"
            />
          </q-btn>
        </div>
      </q-bar>

      <q-toolbar>
        <q-btn
          v-show="showMenuButton"
          flat
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          style="font-size: 1rem"
        />

        <div class="q-ma-none q-pa-none">
          <img round src="/img/Logotexto_500.png" alt="Logo Spanish nook" class="logo-responsivo" />
        </div>
        <div>
          <q-toolbar-title class="spanishnook-titl"> SpanishNook </q-toolbar-title>
        </div>

        <div class="nav-container" v-show="showDesktopNav">
          <q-btn
            flat
            :to="'/'"
            exact
            class="nave-btn"
            :class="{ 'nave-btn-active': activeButton === 'inicio' }"
          >
            {{ t('inicio') }}
          </q-btn>

          <q-btn
            flat
            :to="'/Clases'"
            class="nave-btn"
            :class="{ 'nave-btn-active': activeButton === 'clases' }"
            :label="t('clases')"
          />

          <q-btn
            flat
            :to="'/TestNivel'"
            exact
            class="nave-btn"
            :class="{ 'nave-btn-active': activeButton === 'testNivel' }"
          >
            {{ t('testNivel') }}
          </q-btn>

          <q-btn
            flat
            :to="'/sobreSpanish'"
            exact
            class="nave-btn"
            :class="{ 'nave-btn-active': activeButton === 'sobreSpanish' }"
          >
            {{ t('sobre') }}
          </q-btn>

          <q-btn
            flat
            :to="'/Contacto'"
            exact
            class="nave-btn"
            :class="{ 'nave-btn-active': activeButton === 'contacto' }"
          >
            {{ t('contacto') }}
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-banner
        v-if="showCookiesBanner"
        class="bg-primary text-white shadow-2 cookies-banner"
        style="
          position: fixed;
          left: 50%;
          bottom: 96px;
          transform: translateX(-50%);
          width: 70vw;
          max-width: 900px;
          z-index: 9999;
          font-size: 1.25rem;
          border-radius: 18px;
          padding: 24px 32px;
        "
        icon="cookie"
      >
        <div class="row items-center justify-between">
          <div style="line-height: 1.5">
            Este sitio web utiliza cookies propias y de terceros para mejorar la experiencia de
            usuario y analizar el tráfico. Si continúas navegando, consideramos que aceptas su uso.
            <q-btn
              flat
              dense
              color="white"
              label="Política de Cookies"
              to="/Cookies"
              class="q-ml-sm"
            />
          </div>
          <q-btn
            color="white"
            text-color="primary"
            label="Aceptar"
            @click="aceptarCookies"
            class="q-ml-md text-weight-bold"
            style="font-size: 1.1rem; padding: 8px 24px; border-radius: 8px"
          />
        </div>
      </q-banner>

      <router-view :min-height-style="pageMinHeight" />
    </q-page-container>

    <q-page-sticky position="bottom-right" :offset="[10, 10]">
      <q-btn
        class="whatsapp-sticky-btn enlarged-touch"
        round
        color="green-6"
        icon="mdi-whatsapp"
        size="xl"
        href="https://wa.me/34694280178"
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
      />
    </q-page-sticky>

    <q-footer class="bg-black text-white">
      <div class="footer-legal-bar">
        <div class="footer-legal-text">{{ t('footerDerechosReservados') }}</div>
        <div class="footer-legal-links">
          <router-link to="/Aviso" class="foot-link">{{ t('footerAvisoLegal') }}</router-link>
          <router-link to="/Privacidad" class="foot-link">{{ t('footerPrivacidad') }}</router-link>
          <router-link to="/Cookies" class="foot-link">{{ t('footerCookies') }}</router-link>
          <router-link to="/Condiciones" class="foot-link">{{
            t('footerCondiciones')
          }}</router-link>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from 'src/stores/auth';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from 'src/supabaseClient';
import { useQuasar } from 'quasar';

const { user } = useAuth();
const { locale, t } = useI18n();
const router = useRouter();
const { logout } = useAuth();
const headerRef = ref<HTMLElement | null>(null);

// Quasar solo en cliente
const $q = typeof window !== 'undefined' ? useQuasar() : undefined;

// Estado para controlar elementos condicionales
const showMenuButton = ref(false);
const showDesktopNav = ref(false);
const headerHeight = ref(50); // Altura por defecto para servidor

// Banner de cookies
const showCookiesBanner = ref(false);
function aceptarCookies() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cookies_accepted', 'true');
  }
  showCookiesBanner.value = false;
}

// Contador del carrito
const carritoCount = ref(0);

const cargarCarrito = () => {
  let carritoGuardado = null;
  if (typeof window !== 'undefined') {
    carritoGuardado = localStorage.getItem('carritoReservas');
  }
  if (carritoGuardado) {
    const carrito = JSON.parse(carritoGuardado);
    carritoCount.value = carrito.length;
  } else {
    carritoCount.value = 0;
  }
};

const setupCarritoListener = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === 'carritoReservas') {
        cargarCarrito();
      }
    });
  }
};

const temporizadorCarrito = ref<number | null>(null);

const iniciarTemporizadorCarrito = () => {
  if (typeof window !== 'undefined') {
    temporizadorCarrito.value = window.setInterval(() => {
      cargarCarrito();
    }, 1000); // Verificar cada segundo
  }
};

const activeButton = ref('');
const route = useRoute();

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/') activeButton.value = 'inicio';
    else if (
      newPath === '/ClasesIndividuales' ||
      newPath === '/ClasesGrupales' ||
      newPath === '/Clases'
    )
      activeButton.value = 'clases';
    else if (newPath === '/TestNivel') activeButton.value = 'test';
    else if (newPath === '/sobreSpanish') activeButton.value = 'sobre';
    else if (newPath === '/Contacto') activeButton.value = 'contacto';
    else activeButton.value = '';
  },
  { immediate: true },
);

const pageMinHeight = computed(() => {
  if (typeof window === 'undefined') {
    return 'calc(100vh - 50px)'; // Valor para servidor
  }
  return `calc(100vh - ${headerHeight.value}px)`;
});

onMounted(() => {
  if (typeof window !== 'undefined') {
    // Inicializar variables seguras en cliente
    showMenuButton.value = $q?.screen.lt.md || false;
    showDesktopNav.value = $q?.screen.gt.sm || false;

    const header = document.querySelector('.q-header');
    if (header) {
      headerHeight.value = (header as HTMLElement).offsetHeight;
    }

    showCookiesBanner.value = localStorage.getItem('cookies_accepted') !== 'true';

    carritoCount.value = 0;
    cargarCarrito();
    setupCarritoListener();
    iniciarTemporizadorCarrito();

    const updateScreenState = () => {
      if ($q) {
        showMenuButton.value = $q.screen.lt.md;
        showDesktopNav.value = $q.screen.gt.sm;
      }
    };

    window.addEventListener('resize', updateScreenState);

    onUnmounted(() => {
      window.removeEventListener('resize', updateScreenState);
    });
  }
});

onUnmounted(() => {
  if (temporizadorCarrito.value !== null) {
    clearInterval(temporizadorCarrito.value);
  }
});

function changeLang(val: string) {
  locale.value = val;
}

const linksList = computed((): EssentialLinkProps[] => [
  { title: t('inicio'), icon: 'home', link: '/' },
  { title: t('testNivel'), icon: 'code', link: '/TestNivel' },
  { title: t('clases'), icon: 'record_voice_over', link: '/Clases' },
  { title: t('sobre'), icon: 'rss_feed', link: '/SobreSpanish' },
  { title: t('contacto'), icon: 'rss_feed', link: '/Contacto' },
]);

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const cerrarSesion = async (): Promise<void> => {
  try {
    await supabase.auth.signOut({ scope: 'global' });
    await logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('carritoReservas');
      carritoCount.value = 0;
      await router.replace('/').catch(() => {});
    }
  } catch (e) {
    console.error('Error al cerrar sesión:', e);
  }
};

defineExpose({ $q, t });
</script>

<style lang="scss" scoped>
/* ESTILOS EXACTOS DEL MAINLAYOUT CON SCOPED PARA QUE NO SE PISEN EN PRODUCCIÓN */

.btn-nav-superior {
  font-size: 0.8rem !important;
  font-weight: 300 !important;
  text-decoration: underline;
  margin-right: 5%;

  @media (min-width: 1024px) {
    font-size: 1rem !important;
  }
}

.carro-btn {
  padding: 2px;
  .q-icon {
    font-size: 2rem !important;
  }

  @media (min-width: 300px) {
    padding: 2px;
    .q-icon {
      font-size: 1.5rem !important;
    }
  }

  @media (min-width: 1920px) {
    .q-icon {
      font-size: 2rem !important;
    }
  }
}

.badge-notification {
  font-size: 8px;
  padding: 1px 3px;
  min-width: 14px;
  height: 14px;
  top: -3px;
  right: -3px;

  @media (min-width: 300px) {
    font-size: 9px;
    padding: 2px 4px;
    min-width: 16px;
    height: 16px;
    top: -4px;
    right: -4px;
  }

  @media (min-width: 1024px) {
    font-size: 10px;
    padding: 2px 5px;
    min-width: 18px;
    height: 18px;
    top: -5px;
    right: -5px;
  }
}

.logo-responsivo {
  height: auto;
  margin: 0;
  padding: 0;
  display: inline-block;
  width: 50px;

  @media (min-width: 600px) and (max-width: 1023px) {
    width: 55px;
  }

  @media (min-width: 1024px) {
    width: 60px;
  }

  @media (min-width: 1920px) {
    width: 60px;
  }
}

.spanishnook-titl {
  font-weight: bold !important;
  margin-left: 8px;
  margin-right: auto;
  font-size: 1.2rem !important;

  @media (min-width: 600px) and (max-width: 1023px) {
    font-size: 1.3rem !important;
  }

  @media (min-width: 1024px) and (max-width: 1439px) {
    font-size: 1rem !important;
  }
}

.nave-btn {
  font-weight: 500 !important;
  color: white !important;
  padding: 8px 16px !important;
  transition: all 0.8s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
    transform: scale(1.1);
  }

  @media (min-width: 600px) and (max-width: 1023px) {
    font-size: 0.8rem !important;
  }

  @media (min-width: 1024px) {
    font-size: 1rem !important;
  }

  @media (min-width: 1440px) {
    font-size: 1rem !important;
  }
}

.q-btn.nave-btn.nave-btn-active {
  font-weight: 800 !important;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 2px;
    background-color: white;
    border-radius: 1px;
  }
}

.nav-container {
  display: flex !important;
  align-items: center !important;
  margin-left: 2%;
  width: 100% !important;
  gap: 3rem !important;
  padding: 0 3rem !important;
}

.q-btn-dropdown.nav-btn.router-link-active .q-btn__content {
  text-decoration: underline !important;
  text-underline-offset: 4px !important;
}

.q-btn-dropdown {
  .q-btn__content {
    flex-direction: row !important;
    justify-content: space-between;
    min-width: 100px;
  }

  .q-icon {
    font-size: 1.2em;
    margin-left: 4px;
  }
}

.img-responsiv {
  width: 100%;
  height: auto;
  max-width: 150px;
  max-height: 150px;
}

.footer-link {
  color: white !important;
  font-weight: bold;
  text-decoration: none !important;
  display: inline-block;

  &:hover {
    transform: translateX(8px);
  }
}

.footer-bar {
  min-height: 48px;
  font-size: 1.1rem;
  margin-top: 16px;
}

.footer-legal-bar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #000;
  color: white;
  width: 100%;
  box-sizing: border-box;
}

.footer-legal-text {
  margin: 0;
  flex-shrink: 0;
  font-size: 0.9rem;
  text-align: center;
  width: 100%;
}

.footer-legal-links {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  width: 100%;
}

@media (min-width: 1025px) {
  .footer-legal-bar {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
  }

  .footer-legal-text {
    text-align: left;
    width: auto;
  }

  .footer-legal-links {
    gap: 80px;
    justify-content: flex-end;
    width: auto;
  }
}

.whatsapp-sticky-btn {
  .enlarged-touch {
    min-width: 72px;
    min-height: 72px;
    padding: 12px !important;
    box-sizing: content-box;
  }
}

.flag-selected {
  background-color: rgba(255, 255, 255, 0.2);
  border: 2px solid #fff;
}

.flag-unselected {
  opacity: 0.7;
  border: 2px solid transparent;

  &:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.carrito {
  position: relative;
}

.flags-container {
  gap: 4px;

  @media (min-width: 600px) {
    gap: 8px;
  }

  @media (min-width: 1024px) {
    gap: 12px;
  }
}

.flag-btn {
  margin: 0 2px;

  @media (max-width: 599px) {
    margin: 0 4px;
    padding: 2px;
  }

  @media (min-width: 600px) and (max-width: 1023px) {
    margin: 0 8px;
    padding: 4px;
  }

  @media (min-width: 1024px) {
    margin: 0 12px;
    padding: 6px;
  }

  @media (min-width: 1920px) {
    margin: 0 16px;
    padding: 8px;
  }
}

.flag-es {
  @media (max-width: 599px) {
    margin-left: 8px;
  }

  @media (min-width: 600px) {
    margin-left: 16px;
  }

  @media (min-width: 1024px) {
    margin-left: 24px;
  }
}

.flag-en {
  @media (max-width: 599px) {
    margin-right: 8px;
  }

  @media (min-width: 600px) {
    margin-right: 16px;
  }

  @media (min-width: 1024px) {
    margin-right: 24px;
  }
}

.flag-switcher {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;

  @media (max-width: 599px) {
    gap: 4px;

    .flag-btn {
      padding: 4px 6px;
      min-width: auto;
    }
  }
}

.footer-titulo {
  font-weight: bold !important;
  font-size: 1rem !important;

  @media (max-width: 599px) {
    font-size: 1rem !important;
    margin-top: 20px;
  }

  @media (min-width: 600px) and (max-width: 1023px) {
    font-size: 1rem !important;
  }

  @media (min-width: 1024px) {
    font-size: 1rem !important;
  }
}

.footer-links-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 32px;
  width: 100%;
  max-width: 300px;

  @media (max-width: 599px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 32px;
    width: 100%;
    max-width: 300px;

    .footer-link {
      font-size: 0.9rem !important;
      padding: 4px 8px;
    }
  }
}

.foot-link {
  color: white !important;
  font-weight: bold;
  text-decoration: none !important;
  display: inline-block;
  transition: all 0.3s ease;
  border-radius: 4px;
  font-size: 0.8rem !important;
  padding: 0px 0px;
  margin: 0px 0;

  &:hover {
    transform: translateX(8px);
  }

  @media (max-width: 599px) {
    font-size: 0.8rem !important;
    &:hover {
      transform: scale(1.05);
    }
  }
}
</style>
