<template>
  <div v-if="LOGIN_GOOGLE_ACTIVO" class="bg">
    <button type="button" class="bg-boton" :disabled="cargando" @click="entrarConGoogle">
      <svg class="bg-logo" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.9 6.1C12.5 13.5 17.8 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z" />
        <path fill="#FBBC05" d="M10.6 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.8l7.9-6.1z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.2 0-11.5-4-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
      </svg>
      <span>{{ t('BotonGoogle.continuar') }}</span>
    </button>
    <div class="bg-separador"><span>{{ t('BotonGoogle.o') }}</span></div>
  </div>
</template>

<script setup lang="ts">
/** "Continuar con Google". Se muestra solo si LOGIN_GOOGLE_ACTIVO (src/utils/acceso.ts). */
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { supabase } from 'src/supabaseClient';
import { LOGIN_GOOGLE_ACTIVO, destinoSeguro } from 'src/utils/acceso';

const props = defineProps<{ redirect?: string | undefined }>();

const { t } = useI18n();
const $q = useQuasar();
const cargando = ref(false);

async function entrarConGoogle() {
  cargando.value = true;
  const destino = destinoSeguro(props.redirect);
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/AuthCallback?redirect=${encodeURIComponent(destino)}`,
    },
  });
  if (error) {
    console.error('Error con Google:', error);
    $q.notify({ type: 'negative', message: t('BotonGoogle.error') });
    cargando.value = false;
  }
}
</script>

<style scoped>
.bg-boton {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 46px;
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-boton);
  background: var(--sn-hoja);
  color: var(--sn-tinta);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.bg-boton:hover {
  border-color: var(--sn-tinta-suave);
}
.bg-boton:disabled {
  opacity: 0.6;
  cursor: default;
}
.bg-logo {
  width: 20px;
  height: 20px;
}
.bg-separador {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0 4px;
  color: var(--sn-tinta-suave);
  font-size: var(--sn-t-peq);
}
.bg-separador::before,
.bg-separador::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--sn-borde);
}
</style>
