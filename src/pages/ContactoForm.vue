<template>
  <q-no-ssr>
    <q-page class="q-pa-lg">
      <p
        class="texto-responsivo text-primary text-bold text-center q-mb-md"
        style="margin-bottom: 30px"
      >
        📬 {{ t('Contacto.rellena') }}
      </p>
      <q-card flat bordered class="q-pa-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Columna de datos de contacto -->
            <div class="col-12 col-md-6">
              <div class="q-pa-md">
                <p class="text-primary titulo-responsivo" style="margin-bottom: 24px">
                  {{ t('Contacto.datosContacto') }}
                </p>
                <p class="text-body1">
                  <strong>{{ t('Contacto.telefono') }}:</strong> +34 694 280 178
                </p>
                <p class="text-body1">
                  <strong>{{ t('Contacto.email') }}:</strong> contacto@spanishnook.com
                </p>
                <p class="text-body1">
                  <strong>{{ t('Contacto.redesSociales') }}:</strong>
                </p>
                <ul>
                  <li>
                    <a
                      href="https://www.youtube.com/@SpanishNook"
                      target="_blank"
                      class="text-primary"
                    >
                      YouTube
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.tiktok.com/@spanishnook1?_r=1&_t=ZN-91QVahgEyBP"
                      target="_blank"
                      class="text-primary"
                    >
                      TikTok
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://instagram.com/spanishnook"
                      target="_blank"
                      class="text-primary"
                    >
                      Instagram
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Columna del formulario -->
            <div class="col-12 col-md-6">
              <q-form @submit="onSubmit" class="q-gutter-md formulario-con-relieve">
                <div class="text-center">
                  <p class="text-primary titulo-responsivo1">{{ t('Contacto.formulario') }}</p>
                </div>
                <!-- Campo de Nombre -->
                <q-input
                  filled
                  v-model="formData.nombre"
                  :label="t('Contacto.nombre')"
                  :hint="t('Contacto.hintNombre')"
                  :rules="[(val) => !!val || t('Contacto.errorNombre')]"
                />

                <!-- Campo de Correo Electrónico -->
                <q-input
                  filled
                  v-model="formData.email"
                  :label="t('Contacto.correoElectronico')"
                  type="email"
                  :hint="t('Contacto.hintCorreo')"
                  :rules="[
                    (val) => !!val || t('Contacto.errorCorreoElectronico'),
                    (val) => /.+@.+\..+/.test(val) || t('Contacto.errorCorreoElectronicoInvalido'),
                  ]"
                />

                <!-- Campo de Asunto -->
                <q-input
                  filled
                  v-model="formData.asunto"
                  :label="t('Contacto.asunto')"
                  :hint="t('Contacto.hintAsunto')"
                  :rules="[(val) => !!val || t('Contacto.errorAsunto')]"
                />

                <!-- Campo de Mensaje -->
                <q-input
                  filled
                  v-model="formData.mensaje"
                  :label="t('Contacto.mensaje')"
                  type="textarea"
                  autogrow
                  :hint="t('Contacto.hintMensaje')"
                  :rules="[(val) => !!val || t('Contacto.errorMensaje')]"
                />

                <!-- Botón de Enviar -->
                <div class="text-center q-mt-md text-bold">
                  <q-btn
                    :label="t('Contacto.enviar')"
                    color="primary"
                    type="submit"
                    :disable="isSubmitting"
                    :loading="isSubmitting"
                    no-caps
                    class="text-weight-bold"
                  />
                </div>

                <!-- Mensajes de estado -->
                <div v-if="enviadoConExito" class="q-mt-md text-positive text-center">
                  <q-icon name="check_circle" />
                  {{ t('Contacto.exito') }}
                </div>
                <div v-if="errorEnvio" class="q-mt-md text-negative text-center">
                  <q-icon name="error" />
                  {{ t('Contacto.error') }}
                </div>
              </q-form>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-page>
  </q-no-ssr>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { supabase } from 'src/supabaseClient';
import '../css/pages/EstilosGenerales.css';
import { useMeta } from 'quasar';

const { t } = useI18n();

// Datos del formulario
const formData = ref({
  nombre: '',
  email: '',
  asunto: '',
  mensaje: '',
});

// Estado de envío
const isSubmitting = ref(false);
const enviadoConExito = ref(false);
const errorEnvio = ref(false);

// Función para manejar el envío del formulario
const onSubmit = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  errorEnvio.value = false;
  enviadoConExito.value = false;

  try {
    const { error } = await supabase.from('mensajes_contacto').insert([
      {
        nombre: formData.value.nombre,
        email: formData.value.email,
        mensaje: formData.value.mensaje,
      },
    ]);

    if (error) {
      throw error;
    }

    // Éxito
    enviadoConExito.value = true;
    // Reiniciar el formulario
    formData.value = {
      nombre: '',
      email: '',
      asunto: '',
      mensaje: '',
    };
  } catch (err) {
    console.error('Error al enviar el mensaje:', err);
    errorEnvio.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

useMeta(() => ({
  title: 'Contacto | SpanishNook',
  meta: {
    description: {
      name: 'description',
      content:
        'Formulario de contacto para consultas, dudas y sugerencias sobre clases de español online en SpanishNook.',
    },
    keywords: {
      name: 'keywords',
      content:
        'contacto, clases de español, consultas, dudas, SpanishNook, profesores nativos, español online',
    },
    ogTitle: {
      property: 'og:title',
      content: 'Contacto | SpanishNook',
    },
    ogDescription: {
      property: 'og:description',
      content:
        '¿Tienes dudas o quieres más información sobre nuestras clases de español? Contáctanos aquí.',
    },
    ogImage: {
      property: 'og:image',
      content:
        'https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/Logotexto_circ.png',
    },
    robots: {
      name: 'robots',
      content: 'index,follow',
    },
  },
}));
</script>

<style scoped>
.text-center {
  text-align: center;
}

/* Estilo para el formulario */
.formulario-con-relieve {
  border: 2px solid var(--q-primary); /* Marco del color primario */
  border-radius: 8px; /* Bordes redondeados */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Relieve */
  padding: 16px; /* Espaciado interno */
  background-color: #fff; /* Fondo blanco */
}
</style>
