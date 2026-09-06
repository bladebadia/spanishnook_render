import type { RouteRecordRaw } from 'vue-router';
import { supabase } from 'src/supabaseClient';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('pages/IndexPage.vue'),
    meta: { requiresAuth: false, layout: 'Main' },
  },
  {
    path: '/AreaPersonal',
    component: () => import('pages/AreaPersonal.vue'),
    meta: { requiresAuth: true, layout: 'empty', ssr: false },
  },
  {
    path: '/Administracion',
    component: () => import('pages/PanelAdministracion.vue'),
    beforeEnter: async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Si no hay sesión iniciada, a la página de login
        if (!session || !session.user) {
          return '/Acceder';
        }

        // Miramos directamente dentro de la sesión si tiene la chapa de admin
        const isAdmin = session.user.app_metadata?.is_admin === true;

        if (!isAdmin) {
          console.warn('Acceso denegado: el usuario no es admin.');
          return '/'; // Patada a la portada
        }

        // Si es admin, le dejamos pasar
        return true;
      } catch (error) {
        console.error('Error verificando rol admin en la ruta:', error);
        return '/Acceder';
      }
    },
    meta: { requiresAuth: true, layout: 'empty' },
  },
  {
    path: '/Contacto',
    component: () => import('pages/ContactoForm.vue'),
    meta: { requiresAuth: false, layout: 'empty' },
  },
  {
    path: '/SobreSpanish',
    component: () => import('pages/SobreSpanish.vue'),
    meta: { requiresAuth: false, layout: 'empty' },
  },
  {
    path: '/Acceder',
    component: () => import('pages/Acceder.vue'),
    meta: { requiresAuth: false, layout: 'empty' },
  },
  {
    path: '/RegistroCuenta',
    component: () => import('pages/RegistroCuenta.vue'),
    meta: { requiresAuth: false, layout: 'empty' },
  },
  {
    path: '/ComprarPacks',
    component: () => import('pages/ComprarPacks.vue'),
    meta: { requiresAuth: false, layout: 'empty' },
  },
  {
    path: '/AuthCallback',
    component: () => import('pages/AuthCallback.vue'),
    meta: { requiresAuth: false, layout: 'empty' },
  },
  {
    path: '/Cookies',
    component: () => import('pages/legalCookies.vue'),
    meta: { requiresAuth: false, layout: 'empty' },
  },
  {
    path: '/Privacidad',
    component: () => import('pages/legalPrivacidad.vue'),
    meta: { requiresAuth: false, layout: 'empty' },
  },
  {
    path: '/Aviso',
    component: () => import('pages/legalAviso.vue'),
    meta: { requiresAuth: false, layout: 'empty' },
  },
  {
    path: '/Condiciones',
    component: () => import('pages/legalCondicionesVenta.vue'),
    meta: { requiresAuth: false, layout: 'empty' },
  },
  {
    path: '/ResetPassword',
    component: () => import('pages/ResetPassword.vue'),
    meta: { requiresAuth: false, layout: 'empty' },
  },
  {
    path: '/CarritoCompra',
    component: () => import('pages/CarritoCompra.vue'),
    meta: { requiresAuth: false, layout: 'empty' },
  },
  {
    path: '/CheckEmail',
    component: () => import('pages/CheckEmail.vue'),
    meta: { layout: 'empty' },
  },
  {
    path: '/TestNivel',
    component: () => import('pages/TestNivel.vue'),
    meta: { layout: 'empty' },
  },
  {
    path: '/Reservas',
    component: () => import('pages/ReservasClases.vue'),
    meta: { layout: 'empty' },
  },
  {
    path: '/Clases',
    component: () => import('pages/NuestrasClases.vue'),
    meta: { layout: 'empty' },
  },
  {
    path: '/ReservasCursos',
    component: () => import('pages/ReservasCursos.vue'),
    meta: { layout: 'empty' },
  },
  {
    path: '/Materiales',
    component: () => import('pages/MaterialesPage.vue'),
    meta: { layout: 'empty' },
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { layout: 'empty' },
  },
];

export default routes;
