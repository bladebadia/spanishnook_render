// src/stores/auth.ts
import { ref } from 'vue';
import type { User } from '@supabase/supabase-js';
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

// Solo ejecutar inicialización en el cliente
if (typeof window !== 'undefined') {
  // Inicializar sesión con retry en caso de lock conflict
  const initializeSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        // Si es un error de lock, ignorarlo silenciosamente
        if (error.message?.includes('LockManager')) {
          console.warn('Lock conflict detectado, ignorando...');
        } else {
          console.error('Error al obtener sesión:', error);
        }
      } else {
        user.value = data.session?.user ?? null;
      }
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
