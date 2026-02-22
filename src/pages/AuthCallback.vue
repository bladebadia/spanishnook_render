<template>
  <q-page class="q-pa-md column items-center justify-center">
    <q-spinner v-if="loading" color="primary" size="50px" />
    <div v-else>
      <div v-if="error" class="text-negative">{{ error }}</div>
      <div v-else class="text-positive">{{ t('authCallback.autenticacion') }}</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabaseClient';
import { useI18n } from 'vue-i18n';

const loading = ref(true);
const error = ref('');
const router = useRouter();
const { t } = useI18n();

onMounted(async () => {
  const { error: authError } = await supabase.auth.getSession();
  if (authError) {
    error.value = 'Error al procesar el enlace de autenticación: ' + authError.message;
    loading.value = false;
    return;
  }
  // Redirige al usuario a la página principal o dashboard

  setTimeout(() => {
    loading.value = false;
    void router.push('/AreaPersonal');
  }, 1500);
});
</script>
