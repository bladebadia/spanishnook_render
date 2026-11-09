import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { watch } from 'vue';
import routes from './routes';
import { obtenerSesion, useAuth } from 'src/stores/auth';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    routes,
    scrollBehavior(to, _from, savedPosition) {
      if (savedPosition) return savedPosition;
      if (to.hash) {
        // Scroll directo (sin animación) con offset del header
        return new Promise((resolve) => {
          requestAnimationFrame(() => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const el = document.querySelector(to.hash) as HTMLElement | null;
            if (!el) return resolve({ left: 0, top: 0 });
            const top = el.getBoundingClientRect().top + window.scrollY - 80;
            resolve({ left: 0, top, behavior: 'auto' });
          });
        });
      }
      return { left: 0, top: 0 };
    },
    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // GUARDIA GLOBAL DE AUTENTICACIÓN
  // Espera a que Supabase restaure la sesión desde localStorage antes de decidir
  Router.beforeEach(async (to, _from, next) => {
    // Solo en cliente, esperar a la inicialización
    if (typeof window !== 'undefined') {
      const { isInitialized } = useAuth();

      // PASO 1: Esperar a que el auth store termine de inicializarse
      // Esto previene el "flash" de la página de login
      if (!isInitialized.value) {
        // Esperar hasta que isInitialized sea true
        await new Promise<void>((resolve) => {
          const stop = watch(
            isInitialized,
            (initialized) => {
              if (initialized) {
                stop();
                resolve();
              }
            },
            { immediate: true }
          );
        });
      }
    }

    // PASO 2: Verificar si la ruta requiere autenticación
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    if (requiresAuth) {
      // Verificar la sesión actual; si no se puede leer (AbortError), vale la ya conocida
      const sesion = await obtenerSesion();
      const conSesion = sesion === undefined ? !!useAuth().user.value : !!sesion;

      if (!conSesion) {
        // No hay sesión válida, redirigir a login
        next({
          path: '/Acceder',
          query: { redirect: to.fullPath },
        });
      } else {
        // Hay sesión válida, permitir acceso
        next();
      }
    } else {
      // Ruta pública, permitir acceso
      next();
    }
  });

  // VERSIÓN NUEVA DESPLEGADA
  // Tras un despliegue, una pestaña abierta conserva el index.js viejo y pide fragmentos
  // (PanelAdministracion-xxxx.js...) que ya no existen: 404 y la página no carga.
  // Se recarga una vez en la ruta de destino para coger la versión nueva.
  if (typeof window !== 'undefined') {
    window.addEventListener('vite:preloadError', (event) => {
      event.preventDefault();
      recargarPorVersionNueva(window.location.href);
    });
    Router.onError((error: unknown, to) => {
      const mensaje = error instanceof Error ? error.message : String(error);
      if (/dynamically imported module|Importing a module script failed|error loading dynamically/i.test(mensaje)) {
        recargarPorVersionNueva(to.fullPath);
      }
    });
  }

  return Router;
});

const CLAVE_RECARGA = 'sn_recarga_version';
const MARGEN_RECARGA_MS = 10_000;

/** Recarga la página como mucho una vez cada 10 s (evita bucles si el fallo es otro). */
function recargarPorVersionNueva(destino: string) {
  try {
    const ultima = Number(sessionStorage.getItem(CLAVE_RECARGA) ?? 0);
    if (Date.now() - ultima < MARGEN_RECARGA_MS) return;
    sessionStorage.setItem(CLAVE_RECARGA, String(Date.now()));
  } catch {
    // Sin sessionStorage: recargar igualmente (una sola vez por carga de página)
  }
  window.location.assign(destino);
}
