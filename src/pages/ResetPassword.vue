<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-none shadow-2 my-card" bordered style="width: 100%; max-width: 450px">
      <q-card-section class="q-pt-xl q-pb-md text-center">
        <div class="text-h5 text-primary text-weight-bold">{{ t('flecos.restablecer') }}</div>
        <div class="text-caption text-grey-7">{{ t('flecos.introducir') }}</div>
      </q-card-section>

      <q-card-section class="q-px-lg">
        <form @submit.prevent="resetPassword" class="q-gutter-md">
          <q-input
            v-model="nuevaPassword"
            :label="t('flecos.nueva')"
            :type="mostrarPassword ? 'text' : 'password'"
            outlined
            dense
            @update:model-value="serverPasswordError = ''"
            :error="(passwordError && mostrarErrores) || !!serverPasswordError"
            :hide-bottom-space="(!passwordError || !mostrarErrores) && !serverPasswordError"
            :error-message="obtenerMensajeErrorPassword"
          >
            <template v-slot:prepend>
              <q-icon name="lock_reset" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="mostrarPassword = !mostrarPassword"
                color="grey-7"
              />
            </template>
          </q-input>

          <q-input
            v-model="confirmarPassword"
            :label="t('flecos.confirmarNueva')"
            type="password"
            outlined
            dense
            :error="confirmarError && mostrarErrores"
            :error-message="confirmarError && mostrarErrores ? 'Las contraseñas no coinciden' : ''"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
          </q-input>

          <q-banner
            v-if="errorMessage"
            dense
            rounded
            class="bg-red-1 text-negative q-mt-md border-red"
          >
            <template v-slot:avatar>
              <q-icon name="error" color="negative" />
            </template>
            {{ errorMessage }}
          </q-banner>

          <div
            v-if="success"
            class="text-center q-pa-md bg-green-1 text-positive rounded-borders q-mt-md"
          >
            <q-icon name="check_circle" size="sm" />
            <div class="text-weight-bold q-mt-xs">{{ t('flecos.contraseña') }}</div>
            <div class="text-caption">{{ t('flecos.redirigiendoInicio') }}</div>
          </div>

          <div class="q-mt-lg q-mb-md">
            <q-btn
              :label="t('flecos.guardar')"
              color="primary"
              type="submit"
              :loading="loading"
              unelevated
              size="lg"
              class="full-width shadow-1"
              :disable="!nuevaPassword || !confirmarPassword || success"
            />
          </div>
        </form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { supabase } from 'src/supabaseClient';

const router = useRouter();
const { t } = useI18n();
const nuevaPassword = ref('');
const confirmarPassword = ref('');
const mostrarPassword = ref(false);
const loading = ref(false);

// Errores
const errorMessage = ref(''); // Error genérico
const serverPasswordError = ref(''); // Error específico del input
const success = ref(false);
const mostrarErrores = ref(false);

// 🔥 REGLA DE VALIDACIÓN CORREGIDA (Igual que Registro: 6 chars, número, vocal)
// (?=.*\d) -> Al menos un dígito
// (?=.*[aeiouAEIOU]) -> Al menos una vocal
// .{6,} -> Longitud mínima de 6
const passwordRegex = /^(?=.*[aeiouAEIOU])(?=.*\d).{6,}$/;

const passwordValida = computed(() => passwordRegex.test(nuevaPassword.value));
const passwordError = computed(() => !passwordValida.value);
const confirmarError = computed(() => confirmarPassword.value !== nuevaPassword.value);

const obtenerMensajeErrorPassword = computed(() => {
  if (passwordError.value && mostrarErrores.value) {
    // 🔥 MENSAJE COHERENTE CON EL REGISTRO
    return 'Mínimo 6 caracteres, un número y una vocal.';
  }
  if (serverPasswordError.value) {
    return serverPasswordError.value;
  }
  return '';
});

const resetPassword = async () => {
  mostrarErrores.value = true;
  errorMessage.value = '';
  serverPasswordError.value = '';

  if (!passwordValida.value || confirmarPassword.value !== nuevaPassword.value) {
    return;
  }

  loading.value = true;

  try {
    const { error } = await supabase.auth.updateUser({
      password: nuevaPassword.value,
    });

    if (error) throw error;

    success.value = true;
    setTimeout(() => {
      void router.push('/Acceder');
    }, 2500);
  } catch (error: unknown) {
    console.error('Error reset:', error);
    let msg = 'Error al restablecer la contraseña';

    if (error instanceof Error) msg = error.message;
    else if (typeof error === 'object' && error !== null && 'message' in error) {
      msg = (error as { message: string }).message;
    }

    // Gestionar error de "misma contraseña" de forma elegante
    if (msg.toLowerCase().includes('different from the old')) {
      serverPasswordError.value = 'La nueva contraseña no puede ser igual a la anterior.';
    } else {
      errorMessage.value = msg;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.my-card {
  border-radius: 16px;
}
.border-red {
  border: 1px solid #ef9a9a;
}
</style>
