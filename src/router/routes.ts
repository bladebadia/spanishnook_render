import type { RouteRecordRaw } from 'vue-router';
import { useAuth } from 'src/stores/auth';
import { supabase } from 'src/supabaseClient';
import { jwtDecode } from 'jwt-decode';

interface SupabaseJwtPayload {
  app_metadata?: {
    is_admin?: boolean;
  };
  [key: string]: unknown;
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('pages/IndexPage.vue'),
    meta: { requiresAuth: false, layout: 'Main' },
  },
  {
    path: '/AreaPersonal',
    component: () => import('pages/AreaPersonal.vue'),
    beforeEnter: () => {
      const { user } = useAuth();
      if (!user.value) {
        return '/Acceder';
      }
    },
    meta: { requiresAuth: true, layout: 'empty' },
  },
  {
    path: '/Administracion',
    component: () => import('pages/PanelAdministracion.vue'),
    beforeEnter: async () => {
      const { user } = useAuth();
      if (!user.value) {
        return '/Acceder';
      }
      
      // Verificar si el usuario tiene el rol de admin en app_metadata
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) {
          return '/Acceder';
        }
        
        const payload = jwtDecode<SupabaseJwtPayload>(token);
        const isAdmin = Boolean(payload.app_metadata?.is_admin);
        
        if (!isAdmin) {
          return '/'; // Redirigir a home si no es admin
        }
      } catch (error) {
        console.error('Error verificando rol admin:', error);
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
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { layout: 'empty' },
  },
];

export default routes;
