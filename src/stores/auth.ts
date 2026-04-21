// src/stores/auth.ts
import { ref } from 'vue';
import type { User } from '@supabase/supabase-js';
import { supabase } from 'src/supabaseClient';

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
  // Inicializar sesión
  supabase.auth
    .getSession()
    .then(({ data }) => {
      user.value = data.session?.user ?? null;
      isInitialized.value = true;
    })
    .catch((err) => {
      console.error('Error al obtener sesión:', err);
      isInitialized.value = true; // Marcar como inicializado incluso con error
    });

  // Escuchar cambios de sesión (login, logout, refresh)
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null;
    if (!isInitialized.value) {
      isInitialized.value = true;
    }
  });
}
