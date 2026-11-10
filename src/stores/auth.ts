// src/stores/auth.ts
import { ref } from 'vue';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from 'src/supabaseClient';
import { guardarIdiomaEnCuenta, idiomaActualCliente } from 'src/utils/idioma';

const user = ref<User | null>(null);
// En servidor SSR, marcar como inicializado para evitar problemas
// En cliente, comienza en false hasta que se verifique la sesión
const isInitialized = ref(typeof window === 'undefined');

export function useAuth() {
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      user.value = null;
      return true;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  return { user, logout, isInitialized };
}

/**
 * Sesión actual tolerante a AbortError.
 * Con dos pestañas abiertas, supabase-js puede "robar" el bloqueo de la sesión a la otra y
 * getSession() lanza AbortError. Sin capturarlo, el router no arrancaba y la página quedaba en
 * blanco. Se reintenta; si sigue fallando, devuelve `undefined` (desconocida, no "sin sesión").
 */
export async function obtenerSesion(): Promise<Session | null | undefined> {
  for (let intento = 0; intento < 3; intento++) {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error) return data.session;
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) throw err;
    }
    await new Promise((r) => setTimeout(r, 300 * (intento + 1)));
  }
  return undefined;
}

// Solo ejecutar inicialización en el cliente
if (typeof window !== 'undefined') {
  // Inicializar sesión con retry en caso de lock conflict
  const initializeSession = async () => {
    try {
      const sesion = await obtenerSesion();
      // undefined: no se pudo leer; onAuthStateChange la rellenará
      if (sesion !== undefined) user.value = sesion?.user ?? null;
    } catch (err) {
      console.error('Error al obtener sesión:', err);
    } finally {
      // Siempre marcar como inicializado para no bloquear la UI
      isInitialized.value = true;
    }
  };

  // Ejecutar inicialización
  void initializeSession();

  // Escuchar cambios de sesión (login, logout, refresh)
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user ?? null;
    // Cuentas sin idioma guardado (login con Google, registros antiguos): se toma el de la web.
    // Fuera del callback: supabase-js se bloquea si se llama a auth dentro de él.
    if (event === 'SIGNED_IN' && session?.user && !session.user.user_metadata?.idioma) {
      setTimeout(() => void guardarIdiomaEnCuenta(idiomaActualCliente()), 0);
    }
    if (!isInitialized.value) {
      isInitialized.value = true;
    }
  });
}
