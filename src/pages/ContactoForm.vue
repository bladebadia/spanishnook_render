<template>
  <q-page class="co-pagina">
    <section class="sn-contenedor co-cabecera">
      <h1 class="co-h1">{{ t('ContactoPagina.titulo') }}</h1>
      <p class="co-entrada">{{ t('ContactoPagina.entrada') }}</p>
    </section>

    <section class="sn-contenedor co-rejilla">
      <!-- Formas de contacto -->
      <div class="co-vias">
        <a
          class="co-via co-via--whatsapp"
          href="https://wa.me/34694280178"
          target="_blank"
          rel="noopener"
        >
          <q-icon :name="mdiWhatsapp" class="co-via__icono" />
          <span>
            <span class="co-via__titulo">{{ t('ContactoPagina.whatsapp') }}</span>
            <span class="co-via__texto">{{ t('ContactoPagina.whatsappTexto') }}</span>
          </span>
          <q-icon name="arrow_forward" class="co-via__flecha" />
        </a>

        <a class="co-via" :href="`mailto:${EMAIL}`">
          <q-icon name="mail" class="co-via__icono" />
          <span>
            <span class="co-via__titulo">{{ t('Contacto.email') }}</span>
            <span class="co-via__texto">{{ EMAIL }}</span>
          </span>
        </a>

        <a class="co-via" href="tel:+34694280178">
          <q-icon name="call" class="co-via__icono" />
          <span>
            <span class="co-via__titulo">{{ t('Contacto.telefono') }}</span>
            <span class="co-via__texto">+34 694 280 178</span>
          </span>
        </a>

        <div class="co-redes">
          <p class="co-redes__titulo">{{ t('Contacto.redesSociales') }}</p>
          <div class="co-redes__fila">
            <a
              v-for="red in redes"
              :key="red.nombre"
              :href="red.url"
              target="_blank"
              rel="noopener"
              class="co-red"
              :aria-label="red.nombre"
            >
              <q-icon :name="red.icono" size="22px" />
              <span>{{ red.nombre }}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Formulario -->
      <div class="co-formulario">
        <h2 class="co-h2">{{ t('Contacto.formulario') }}</h2>
        <q-form class="co-campos" @submit="onSubmit">
          <q-input
            v-model="formData.nombre"
            outlined
            :label="t('Contacto.nombre')"
            :rules="[(val) => !!val || t('Contacto.errorNombre')]"
          />
          <q-input
            v-model="formData.email"
            outlined
            type="email"
            :label="t('Contacto.correoElectronico')"
            :rules="[
              (val) => !!val || t('Contacto.errorCorreoElectronico'),
              (val) => /.+@.+\..+/.test(val) || t('Contacto.errorCorreoElectronicoInvalido'),
            ]"
          />
          <q-input v-model="formData.asunto" outlined :label="t('ContactoPagina.asuntoOpcional')" />
          <q-input
            v-model="formData.mensaje"
            outlined
            type="textarea"
            autogrow
            input-style="min-height: 120px"
            :label="t('Contacto.mensaje')"
            :rules="[(val) => !!val || t('Contacto.errorMensaje')]"
          />

          <q-btn
            type="submit"
            color="primary"
            unelevated
            no-caps
            size="lg"
            class="co-boton"
            icon-right="send"
            :label="t('Contacto.enviar')"
            :loading="isSubmitting"
            :disable="isSubmitting"
          />

          <div v-if="enviadoConExito" class="co-estado co-estado--ok">
            <q-icon name="check_circle" size="20px" />
            {{ t('Contacto.exito') }}
          </div>
          <div v-if="errorEnvio" class="co-estado co-estado--error">
            <q-icon name="error" size="20px" />
            {{ t('Contacto.error') }}
          </div>
        </q-form>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'quasar';
import { mdiInstagram, mdiMusicNote, mdiWhatsapp, mdiYoutube } from '@quasar/extras/mdi-v6';
import { supabase } from 'src/supabaseClient';

const { t } = useI18n();

const EMAIL = 'info@spanishnook.com';

const redes = [
  { nombre: 'Instagram', url: 'https://instagram.com/spanishnook', icono: mdiInstagram },
  { nombre: 'TikTok', url: 'https://www.tiktok.com/@spanishnook1', icono: mdiMusicNote },
  { nombre: 'YouTube', url: 'https://www.youtube.com/@SpanishNook', icono: mdiYoutube },
];

const formData = ref({ nombre: '', email: '', asunto: '', mensaje: '' });
const isSubmitting = ref(false);
const enviadoConExito = ref(false);
const errorEnvio = ref(false);

const onSubmit = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  errorEnvio.value = false;
  enviadoConExito.value = false;

  try {
    // mensajes_contacto no tiene columna de asunto: se guarda al principio del mensaje
    const asunto = formData.value.asunto.trim();
    const mensaje = asunto
      ? `${t('Contacto.asunto')}: ${asunto}\n\n${formData.value.mensaje}`
      : formData.value.mensaje;

    const { error } = await supabase.from('mensajes_contacto').insert([
      { nombre: formData.value.nombre, email: formData.value.email, mensaje },
    ]);
    if (error) throw error;

    enviadoConExito.value = true;
    formData.value = { nombre: '', email: '', asunto: '', mensaje: '' };
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
    ogTitle: { property: 'og:title', content: 'Contacto | SpanishNook' },
    ogDescription: {
      property: 'og:description',
      content:
        '¿Tienes dudas o quieres más información sobre nuestras clases de español? Contáctanos aquí.',
    },
    ogImage: {
      property: 'og:image',
      content: 'https://www.spanishnook.com/img/Logo_rectangular_320.png',
    },
    ogUrl: { property: 'og:url', content: 'https://www.spanishnook.com/Contacto' },
    robots: { name: 'robots', content: 'index,follow' },
  },
}));
</script>

<style scoped>
.co-pagina {
  background: var(--sn-papel);
  color: var(--sn-tinta);
  padding-bottom: var(--sn-seccion);
}
.co-cabecera {
  padding-block: clamp(32px, 6vw, 56px) 24px;
  text-align: center;
}
.co-h1 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h1);
  font-weight: 700;
  line-height: 1.1;
  color: var(--sn-burdeos);
  margin: 0 0 12px;
}
.co-entrada {
  font-size: var(--sn-t-entrada);
  line-height: 1.55;
  color: var(--sn-tinta-suave);
  max-width: 56ch;
  margin: 0 auto;
}
.co-h2 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h3);
  font-weight: 700;
  margin: 0 0 20px;
}

.co-rejilla {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
}
@media (min-width: 900px) {
  .co-rejilla {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    gap: 40px;
  }
}

/* Formas de contacto */
.co-vias {
  display: grid;
  gap: 12px;
}
.co-via {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  color: var(--sn-tinta);
  text-decoration: none;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}
.co-via:hover {
  border-color: var(--sn-burdeos);
  box-shadow: var(--sn-sombra);
}
.co-via > span {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.co-via__icono {
  flex: none;
  font-size: 24px;
  color: var(--sn-burdeos);
  background: var(--sn-burdeos-tenue);
  border-radius: 50%;
  padding: 10px;
}
.co-via__titulo {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
}
.co-via__texto {
  color: var(--sn-tinta-suave);
  overflow-wrap: anywhere;
}
.co-via__flecha {
  margin-left: auto;
  font-size: 20px;
}
.co-via--whatsapp {
  background: #e9f6ec;
  border-color: #b9e2c3;
}
.co-via--whatsapp .co-via__icono {
  color: #fff;
  background: #25a244;
}
.co-via--whatsapp:hover {
  border-color: #25a244;
}

.co-redes {
  padding: 16px 18px;
}
.co-redes__titulo {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  margin: 0 0 10px;
}
.co-redes__fila {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.co-red {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-boton);
  background: var(--sn-hoja);
  color: var(--sn-burdeos);
  font-weight: 700;
  text-decoration: none;
}
.co-red:hover {
  border-color: var(--sn-burdeos);
}

/* Formulario */
.co-formulario {
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  box-shadow: var(--sn-sombra);
  padding: clamp(20px, 4vw, 32px);
}
.co-campos {
  display: grid;
  gap: 4px;
}
.co-boton {
  justify-self: start;
  border-radius: var(--sn-r-boton);
  font-weight: 700;
  padding-inline: 24px;
  margin-top: 8px;
}
.co-estado {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-weight: 600;
}
.co-estado--ok {
  color: var(--sn-oliva);
}
.co-estado--error {
  color: var(--q-negative);
}
</style>
