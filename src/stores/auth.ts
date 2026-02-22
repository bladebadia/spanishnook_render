// src/stores/auth.ts
import { ref } from 'vue';
import type { User } from '@supabase/supabase-js';
import { supabase } from 'src/supabaseClient';

const user = ref<User | null>(null);

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

  return { user, logout };
}

// Inicializar sesión
supabase.auth
  .getSession()
  .then(({ data }) => {
    user.value = data.session?.user ?? null;
  })
  .catch((err) => {
    console.error('Error al obtener sesión:', err);
  });

// Escuchar cambios de sesión (login, logout, refresh)
supabase.auth.onAuthStateChange((_event, session) => {
  user.value = session?.user ?? null;
});
