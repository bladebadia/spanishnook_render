<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-none shadow-2 my-card" bordered style="width: 100%; max-width: 750px">
      <q-stepper
        v-model="step"
        ref="stepper"
        color="primary"
        animated
        flat
        class="no-shadow rounded-borders"
        header-class="text-weight-bold"
      >
        <q-step :name="1" :title="t('registro.cuenta')" icon="lock" :done="step > 1">
          <div class="text-h5 text-center q-mb-md text-primary text-weight-bold">
            Crea tu cuenta / Create account
          </div>
          <p class="text-center text-grey-7 q-mb-lg">
            Empezamos por lo básico / Let's start with the basics
          </p>

          <q-form @submit="siguientePaso" class="q-gutter-md q-px-md-lg">
            <q-input
              v-model="form.email"
              label="Email *"
              type="email"
              outlined
              dense
              class="q-mb-md"
              :rules="[
                (val) => !!val || t('registro.requerido'),
                (val) => /.+@.+\..+/.test(val) || t('registro.Email'),
              ]"
            >
              <template v-slot:prepend><q-icon name="email" color="primary" /></template>
            </q-input>

            <q-input
              v-model="form.password"
              label="Contraseña / Password *"
              :type="mostrarPass ? 'text' : 'password'"
              outlined
              dense
              :rules="[
                (val) => (val && val.length > 5) || t('registro.errorMinCaracteres'),
                (val) => /\d/.test(val) || t('registro.errorAlMenosUnNumero'),
                (val) => /[aeiouAEIOU]/.test(val) || t('registro.errorAlMenosUnaVocal'),
              ]"
            >
              <template v-slot:prepend><q-icon name="lock" color="primary" /></template>
              <template v-slot:append>
                <q-icon
                  :name="mostrarPass ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="mostrarPass = !mostrarPass"
                />
              </template>
            </q-input>

            <q-input
              v-model="form.confirmPassword"
              label="Repetir Contraseña / Confirm Password *"
              :type="mostrarConfirmPass ? 'text' : 'password'"
              outlined
              dense
              :rules="[
                (val) => !!val || t('registro.requerido'),
                (val) => val === form.password || t('registro.contraseñas'),
              ]"
            >
              <template v-slot:prepend><q-icon name="lock_clock" color="primary" /></template>
              <template v-slot:append>
                <q-icon
                  :name="mostrarConfirmPass ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="mostrarConfirmPass = !mostrarConfirmPass"
                />
              </template>
            </q-input>

            <q-checkbox
              v-model="aceptoPrivacidad"
              :label="t('registroCuenta.aceptar')"
              dense
              class="q-mt-sm"
            />

            <div class="row justify-end q-mt-xl">
              <q-btn
                label="Siguiente / Next"
                type="submit"
                color="primary"
                unelevated
                size="md"
                class="q-px-xl"
                :disable="!aceptoPrivacidad"
                :loading="validandoEmail"
                icon-right="arrow_forward"
              />
            </div>
          </q-form>

          <div class="texto-responsivo2 text-center q-mt-lg">
            <router-link to="/Acceder" class="text-primary link-sin-subrayar">{{
              t('registroCuenta.yatienescuenta')
            }}</router-link>
          </div>
        </q-step>

        <q-step :name="2" :title="t('registro.sobreTi')" icon="person" :done="step > 2">
          <div class="text-h5 text-center q-mb-sm text-primary text-weight-bold">
            Cuéntanos sobre ti
          </div>
          <div class="text-caption text-center text-grey-7 q-mb-xl">
            Tell us a bit about yourself
          </div>

          <q-form @submit="siguientePaso" class="q-gutter-md q-px-md-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nombre"
                  label="Nombre / Name *"
                  outlined
                  dense
                  :rules="[(val) => !!val || t('registro.requerido')]"
                >
                  <template v-slot:prepend><q-icon name="badge" color="primary" /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.apellido1" label="Apellido / Last Name " outlined dense>
                  <template v-slot:prepend><q-icon name="badge" /></template>
                </q-input>
              </div>
            </div>

            <q-select
              v-model="form.idiomaNativo"
              :options="idiomasComunes"
              label="Lengua Materna / Native Language *"
              outlined
              dense
              use-input
              input-debounce="0"
              new-value-mode="add-unique"
              class="q-mt-md"
              :rules="[(val) => !!val || t('registro.requerido')]"
            >
              <template v-slot:prepend><q-icon name="language" color="primary" /></template>
            </q-select>

            <div class="row justify-between q-mt-xl">
              <q-btn label="Atrás / Back" flat color="grey-8" @click="step = 1" icon="arrow_back" />
              <q-btn
                label="Siguiente / Next"
                type="submit"
                color="primary"
                unelevated
                class="q-px-xl"
                icon-right="arrow_forward"
              />
            </div>
          </q-form>
        </q-step>

        <q-step :name="3" :title="t('registro.tuEspanol')" icon="school">
          <q-form @submit="registrarUsuario" class="q-px-sm-md">
            <q-card flat bordered class="bg-grey-1 q-mb-lg border-left-primary">
              <q-card-section class="row items-center no-wrap">
                <q-icon name="sentiment_satisfied_alt" color="primary" size="md" class="q-mr-md" />
                <div>
                  <div class="text-subtitle1 text-primary text-weight-bold">
                    Antes de tu primera clase... / Before we start...
                  </div>
                  <div class="text-caption text-grey-9" style="line-height: 1.4">
                    Queremos conocerte un poco más para ofrecerte la mejor experiencia. No es un
                    examen, solo responde de forma honesto/a 😊<br />
                    <i class="text-grey-7"
                      >We’d like to get to know you a little better so we can offer you the best
                      experience. It's not a test, just answer honestly.</i
                    >
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <div class="q-mb-xl">
              <div class="text-subtitle1 q-mb-sm flex items-center text-weight-bold">
                <q-icon name="equalizer" color="primary" class="q-mr-sm" size="sm" /> 1. ¿Qué nivel
                crees que tienes de Español? / What's your current Spanish level?
              </div>
              <q-btn-toggle
                v-model="form.nivelEstimado"
                spread
                no-caps
                rounded
                unelevated
                toggle-color="primary"
                color="grey-3"
                text-color="grey-9"
                :options="[
                  { label: 'Principiante / Beginner', value: 'Principiante' },
                  { label: 'Intermedio / Intermediate', value: 'Intermedio' },
                  { label: 'Avanzado / Advanced', value: 'Avanzado' },
                ]"
                class="q-mt-sm nursing-toggle"
              />
            </div>

            <div class="q-mb-xl">
              <div class="text-subtitle1 q-mb-sm flex items-center text-weight-bold">
                <q-icon name="history_edu" color="primary" class="q-mr-sm" size="sm" /> 2. ¿Has
                estudiado español antes? / Have you studied Spanish before?
              </div>
              <div class="q-gutter-md q-ml-none">
                <q-radio
                  v-model="form.haEstudiadoAntes"
                  :val="true"
                  label="Sí / Yes"
                  color="primary"
                  keep-color
                />
                <q-radio
                  v-model="form.haEstudiadoAntes"
                  :val="false"
                  label="No, nunca / No, never"
                  color="primary"
                  keep-color
                />
              </div>

              <q-slide-transition>
                <div v-if="form.haEstudiadoAntes" class="q-mt-md">
                  <q-input
                    v-model="form.detallesEstudio"
                    label="¿Dónde y cuánto tiempo? / Where and for how long?"
                    outlined
                    dense
                    bg-color="white"
                  >
                    <template v-slot:prepend><q-icon name="edit_note" /></template>
                  </q-input>
                </div>
              </q-slide-transition>
            </div>

            <div class="q-mb-xl">
              <div class="text-subtitle1 q-mb-sm flex items-center text-weight-bold">
                <q-icon name="interests" color="primary" class="q-mr-sm" size="sm" /> 3. ¿Qué te
                interesa aprender? / What are your areas of interest?
                <span class="text-caption text-grey-6 q-ml-sm"
                  >(Selecciona todas las que apliquen / Select all that apply)</span
                >
              </div>

              <div class="row q-col-gutter-sm q-mt-sm">
                <div class="col-12 col-sm-6" v-for="tag in tagsIntereses" :key="tag.val">
                  <q-checkbox
                    v-model="form.intereses"
                    :val="tag.val"
                    :label="tag.label"
                    dense
                    color="secondary"
                    class="full-width q-pa-sm bg-grey-1 rounded-borders"
                    style="border: 1px solid #e0e0e0"
                  />
                </div>
              </div>
            </div>

            <div class="q-mb-lg">
              <div class="text-subtitle1 q-mb-sm flex items-center text-weight-bold">
                <q-icon name="flag" color="primary" class="q-mr-sm" size="sm" /> 4. Tus objetivos /
                Your goals
              </div>
              <q-input
                v-model="form.usoEspanol"
                label="¿Para qué quieres usar el español? (Viajes, trabajo...)"
                hint="In real life, what do you want to use Spanish for?"
                outlined
                dense
                type="textarea"
                rows="3"
                bg-color="white"
              />
            </div>

            <q-separator class="q-my-lg" />

            <div class="row justify-between items-center q-mt-lg">
              <q-btn label="Atrás" flat color="grey-8" @click="step = 2" icon="arrow_back" />
              <div class="text-center q-mx-md hidden"></div>
              <q-btn
                label="Finalizar Registro / Finish"
                type="submit"
                color="positive"
                size="lg"
                icon-right="check_circle"
                :loading="cargando"
                unelevated
                class="q-px-xl shadow-2"
              />
            </div>
          </q-form>
        </q-step>
      </q-stepper>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/supabaseClient';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAnalytics } from 'src/composables/useAnalytics';

const $q = useQuasar();
const router = useRouter();
const { t } = useI18n();
const { registroIniciado, registroCompletado } = useAnalytics();

const step = ref(1);
const cargando = ref(false); // Para el registro final
const validandoEmail = ref(false); // 🔥 NUEVO: Para el botón de "Siguiente" en paso 1
const mostrarPass = ref(false);
const mostrarConfirmPass = ref(false);
const aceptoPrivacidad = ref(false);

const form = ref({
  // Paso 1
  email: '',
  password: '',
  confirmPassword: '',
  // Paso 2
  nombre: '',
  apellido1: '',
  idiomaNativo: 'English',
  // Paso 3
  nivelEstimado: 'Principiante',
  haEstudiadoAntes: false,
  detallesEstudio: '',
  intereses: [] as string[],
  usoEspanol: '',
});

const idiomasComunes = ['English', 'Français', 'Deutsch', 'Italiano', 'Português', 'Otro/Another'];

const tagsIntereses = [
  { label: 'Conversación / Conversation', val: 'Conversación' },
  { label: 'Gramática / Grammar', val: 'Gramática' },
  { label: 'Trabajo / Business', val: 'Trabajo' },
  { label: 'Viajes / Travel', val: 'Viajes' },
  { label: 'Cultura / Culture', val: 'Cultura' },
  { label: 'Exámenes / Exams', val: 'Exámenes' },
];

// 🔥 FUNCIÓN MODIFICADA: AHORA ES ASÍNCRONA Y COMPRUEBA EL EMAIL
const siguientePaso = async () => {
  // --- VALIDACIÓN PASO 1 ---
  if (step.value === 1) {
    // 1. Validaciones locales básicas
    if (
      !form.value.email ||
      !form.value.password ||
      form.value.password !== form.value.confirmPassword ||
      !aceptoPrivacidad.value
    ) {
      $q.notify({
        type: 'warning',
        message: t('registro.camposIncorrectos'),
      });
      return;
    }

    // 2. Validación de servidor (¿Existe el email?)
    validandoEmail.value = true;
    try {
      const { data: existe, error } = await supabase.rpc('check_email_exists', {
        email_check: form.value.email,
      });

      if (error) throw error;

      if (existe) {
        $q.notify({
          type: 'negative',
          message: t('registro.emailYaRegistrado'),
          icon: 'login',
        });
        // Opcional: router.push('/Acceder');
        return; // ⛔️ ALTO: No pasamos al paso 2
      }
    } catch (err) {
      console.error(err);
      // Si falla la red, dejamos pasar o avisamos? Mejor avisar.
      $q.notify({ type: 'warning', message: t('registro.errorConexion') });
      return;
    } finally {
      validandoEmail.value = false;
    }
  }

  // --- VALIDACIÓN PASO 2 ---
  if (step.value === 2) {
    if (!form.value.nombre || !form.value.idiomaNativo) {
      $q.notify({ type: 'warning', message: t('registro.camposObligatorios') });
      return;
    }
  }

  // Si todo está OK, avanzamos
  // Track inicio de registro
  registroIniciado();
  step.value++;
};

const registrarUsuario = async () => {
  cargando.value = true;
  try {
    // 🔥 ENVIAMOS TODO EN UN SOLO PAQUETE
    // El Trigger de la base de datos se encargará de guardarlo en 'datos_usuarios'
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.password,
      options: {
        // Aquí metemos todos los datos para que el Trigger los lea
        data: {
          nombre: form.value.nombre,
          apellido1: form.value.apellido1, // Puede ir vacío si es opcional
          idiomaNativo: form.value.idiomaNativo,
          nivelEstimado: form.value.nivelEstimado,
          haEstudiadoAntes: form.value.haEstudiadoAntes,
          detallesEstudio: form.value.detallesEstudio,
          intereses: form.value.intereses,
          usoEspanol: form.value.usoEspanol,
        },
      },
    });

    if (authError) throw authError;

    // Ya no comprobamos !authData.user para lanzar error, porque con confirmación
    // de email a veces la sesión viene nula pero el usuario se creó.

    // Track registro completado
    registroCompletado('email');

    // Si hay usuario pero no sesión, es que requiere confirmación
    if (authData.user && !authData.session) {
      $q.notify({
        type: 'info',
        message: t('registro.revisaMail'),
        icon: 'mark_email_unread',
        timeout: 8000,
        position: 'top',
      });
      await router.push('/CheckEmail'); // Página que dice "Revisa tu correo"
    }
    // Si hay sesión, entró directo (por si desactivas la confirmación en el futuro)
    else if (authData.session) {
      $q.notify({
        type: 'positive',
        message: t('registro.bienvenido'),
        position: 'top',
      });
      await router.push('/AreaPersonal');
    }
  } catch (error: unknown) {
    let msg = t('registro.errorInesperado');
    if (error instanceof Error) {
      msg = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      msg = (error as { message: string }).message;
    }

    // Traducir error común
    if (msg.includes('already registered')) msg = t('registro.emailYaRegistrado');

    $q.notify({ type: 'negative', message: msg });
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.my-card {
  border-radius: 16px;
}
.link-sin-subrayar {
  text-decoration: none;
  font-weight: 600;
}
.link-sin-subrayar:hover {
  text-decoration: underline;
}
.border-left-primary {
  border-left: 4px solid var(--q-primary) !important;
}
/* Estilo para los checkboxes que parecen tarjetas */
.q-checkbox:hover {
  background-color: #f5f5f5;
}
</style>
