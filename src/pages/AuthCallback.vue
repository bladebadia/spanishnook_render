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
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../supabaseClient';
import { useI18n } from 'vue-i18n';
import { destinoSeguro } from 'src/utils/acceso';

const loading = ref(true);
const error = ref('');
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

onMounted(async () => {
  const { error: authError } = await supabase.auth.getSession();
  if (authError) {
    error.value = t('authCallback.errorEnlace', { mensaje: authError.message });
    loading.value = false;
    return;
  }
  // Vuelve a la página que pidió el login (?redirect=), o al área personal
  const destino = destinoSeguro(route.query.redirect);
  setTimeout(() => {
    loading.value = false;
    void router.replace(destino);
  }, 1500);
});
</script>
