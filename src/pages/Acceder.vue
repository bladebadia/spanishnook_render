<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-none shadow-2 my-card" bordered style="width: 100%; max-width: 450px">
      <q-card-section class="q-pt-xl q-pb-md text-center">
        <div class="text-h5 text-primary text-weight-bold">
          {{ t('accederForm.entrar') || 'Iniciar Sesión' }}
        </div>
        <div class="text-caption text-grey-7">Bienvenido de nuevo / Welcome back</div>
      </q-card-section>

      <q-card-section class="q-px-lg">
        <form @submit.prevent="login" class="q-gutter-md">
          <q-input
            v-model="email"
            :label="t('accederForm.correoElectronico')"
            type="email"
            outlined
            dense
            :error="credencialesError"
            :hide-bottom-space="true"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            :label="t('accederForm.contrasena')"
            :type="passwordVisible ? 'text' : 'password'"
            outlined
            dense
            :error="credencialesError"
            :error-message="credencialesError ? t('accederForm.credencialesIncorrectas') : ''"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="passwordVisible ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="togglePasswordVisibility"
                color="grey-7"
              />
            </template>
          </q-input>

          <div class="row justify-end">
            <a
              href="#"
              @click.prevent="olvidarPassword"
              class="text-caption text-grey-8 link-hover"
            >
              {{ t('accederForm.olvidarContrasena') }}
            </a>
          </div>

          <div class="q-mt-lg">
            <q-btn
              :label="t('accederForm.entrar')"
              color="primary"
              type="submit"
              :loading="loading"
              unelevated
              size="lg"
              class="full-width shadow-1"
              icon-right="login"
            />
          </div>
        </form>
      </q-card-section>

      <q-card-section class="text-center q-pb-xl q-pt-md">
        <div class="text-body2 text-grey-8">
          {{ t('accederForm.aunNoTienes') }} <br />
          <router-link to="/RegistroCuenta" class="text-primary text-weight-bold link-sin-subrayar">
            {{ t('accederForm.registrateAqui') }}
          </router-link>
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="mostrarDialogoRecuperacion" persistent>
      <q-card style="width: 400px; max-width: 90vw" class="rounded-borders">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ t('accederForm.recuperarContrasena') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <p class="text-body2 text-grey-8 q-mb-md">
            {{ t('accederForm.introduceTuCorreo') }}
          </p>
          <q-input
            outlined
            v-model="emailRecuperacion"
            :label="t('accederForm.correoElectronico')"
            type="email"
            dense
            :error="!!errorRecuperacion"
            :error-message="errorRecuperacion"
          >
            <template v-slot:prepend><q-icon name="mail" /></template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat :label="t('cancelar')" color="grey-8" v-close-popup />
          <q-btn
            :label="t('accederForm.enviar')"
            color="primary"
            unelevated
            @click="enviarLinkRecuperacion"
            :loading="loadingRecuperacion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="mostrarDialogoConfirmacion">
      <q-card style="width: 400px; max-width: 90vw" class="rounded-borders">
        <q-card-section class="column items-center q-pb-none">
          <q-avatar
            icon="mark_email_read"
            color="positive"
            text-color="white"
            size="lg"
            class="q-mb-sm"
          />
          <div class="text-h6">{{ t('accederForm.correoEnviado') }}</div>
        </q-card-section>

        <q-card-section class="text-center">
          <p>
            {{ t('accederForm.seHaEnviado') }} <br /><strong>{{ emailRecuperacion }}</strong>
          </p>
          <p class="text-caption text-grey">
            {{ t('accederForm.revisaBandeja') }}
          </p>
        </q-card-section>

        <q-card-actions align="center" class="q-pb-md">
          <q-btn :label="t('accederForm.aceptar')" color="primary" unelevated v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabaseClient';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'UserAcceder' });

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const credencialesError = ref(false);
const passwordVisible = ref(false);
const { t } = useI18n();

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

// Variables para recuperación
const mostrarDialogoRecuperacion = ref(false);
const mostrarDialogoConfirmacion = ref(false);
const emailRecuperacion = ref('');
const loadingRecuperacion = ref(false);
const errorRecuperacion = ref('');

const olvidarPassword = () => {
  emailRecuperacion.value = email.value;
  mostrarDialogoRecuperacion.value = true;
  errorRecuperacion.value = '';
};

const enviarLinkRecuperacion = async () => {
  if (!emailRecuperacion.value) {
    errorRecuperacion.value = 'Por favor, introduce tu correo electrónico';
    return;
  }

  loadingRecuperacion.value = true;
  errorRecuperacion.value = '';

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperacion.value, {
      redirectTo: `${window.location.origin}/ResetPassword`,
    });

    if (error) throw error;

    mostrarDialogoRecuperacion.value = false;
    mostrarDialogoConfirmacion.value = true;
  } catch (error: unknown) {
    // 🔥 CORREGIDO: unknown para evitar warnings
    console.error('Error enviando email:', error);
    if (error instanceof Error) {
      errorRecuperacion.value = error.message;
    } else {
      errorRecuperacion.value = 'Error al enviar el email';
    }
  } finally {
    loadingRecuperacion.value = false;
  }
};

async function login() {
  loading.value = true;
  credencialesError.value = false;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      credencialesError.value = true;
      console.error('Error login:', error.message);
      return;
    }

    // 🔥 CAMBIO: Redirigir a AreaPersonal que es el dashboard
    await router.push('/AreaPersonal');
  } catch (error) {
    console.error('Error inesperado:', error);
    credencialesError.value = true;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.my-card {
  border-radius: 16px; /* Borde redondeado igual que registro */
}

.link-sin-subrayar {
  text-decoration: none;
}
.link-sin-subrayar:hover,
.link-hover:hover {
  text-decoration: underline;
}
.rounded-borders {
  border-radius: 12px;
}
</style>
