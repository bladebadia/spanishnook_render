import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { supabase } from 'src/supabaseClient';

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
    // Verificar si la ruta requiere autenticación
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    if (requiresAuth) {
      // CRÍTICO: Esperamos a que Supabase lea la sesión del localStorage
      // Esto evita el problema de redirección al recargar la página (F5)
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // No hay sesión válida, redirigir a login
        next({ 
          path: '/Acceder', 
          query: { redirect: to.fullPath } 
        });
      } else {
        // Hay sesión válida, permitir acceso
        // El store auth ya se actualiza automáticamente con onAuthStateChange
        next();
      }
    } else {
      // Ruta pública, permitir acceso
      next();
    }
  });

  return Router;
});
