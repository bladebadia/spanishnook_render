<template>
  <q-no-ssr>
    <q-page>
      <!-- Sección introductoria -->
      <div class="row q-my-xl flex flex-center">
        <div class="col-12 text-center content-width">
          <p class="titulo-responsivo" style="color: #77b308ed; margin-bottom: 1rem">
            {{ t('SobreSpanish.conoce') }}
          </p>
        </div>
        <!-- Descripción  -->
        <div class="col-12 items-center text-center" style="width: 70%">
          <p class="texto-responsivo q-pb-xl q-pb-xl">
            <strong>{{ t('SobreSpanish.intro') }}</strong>
          </p>
        </div>
        <!-- Video de presentación -->
        <div class="col-12 items-center text-center q-my-md video-responsive">
          <video controls style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)">
            <source src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/video/clases_espanol_video_subt.mp4" type="video/mp4" />
            Tu navegador no soporta el video.
          </video>
        </div>
        <div class="col-12 text-center q-mt-lg">
          <p class="subtitulo-responsivo text-primary q-px-xl">
            {{ t('SobreSpanish.tulug') }}
          </p>
        </div>

        <div class="col-12 text-justify q-my-md content-width">
          <p class="texto-responsivo">
            {{ t('SobreSpanish.aprender') }}
          </p>
          <div class="q-mb-md"></div>
          <p class="texto-responsivo">
            {{ t('SobreSpanish.enmedio') }}
          </p>
        </div>

        <div class="col-12 q-my-md content-width">
          <p class="subtitulo-responsivo text-primary text-center">
            {{ t('SobreSpanish.quien') }}
          </p>
        </div>
        <div class="col-12 q-my-md content-width">
          <p class="texto-responsivo">
            {{ t('SobreSpanish.soy') }}
          </p>
          <div class="q-mb-md"></div>
          <p class="texto-responsivo">
            {{ t('SobreSpanish.tras1') }}
            <br /><br />
            {{ t('SobreSpanish.tras2') }}
          </p>
        </div>
        <div class="q-mb-lg"></div>
        <!-- Filosofía -->
        <div class="col-12 items-center text-center">
          <p class="subtitulo-responsivo" style="color: #851319">
            {{ t('SobreSpanish.filosofía') }}
          </p>
        </div>
        <div class="col-12 text-center q-my-md content-width">
          <p class="texto-responsivo text-justify">{{ t('SobreSpanish.mipropuesta') }}</p>
        </div>
        <div class="col-12 items-center text-center q-my-md" style="width: 70%">
          <p class="subtitulo-responsivo" style="color: #851319">
            {{ t('SobreSpanish.loque') }}
          </p>
        </div>
        <div class="col-12 text-center q-my-md content-width">
          <ul class="texto-responsivo text-justify">
            <li>
              <strong>{{ t('SobreSpanish.cercaniaBold') }}</strong
              >: {{ t('SobreSpanish.cercania') }}
            </li>
            <li>
              <strong>{{ t('SobreSpanish.flexibilidadBold') }}</strong
              >: {{ t('SobreSpanish.flexibilidad') }}
            </li>
            <li>
              <strong>{{ t('SobreSpanish.confianzaBold') }}</strong
              >: {{ t('SobreSpanish.confianza') }}
            </li>
          </ul>
        </div>
        <div class="q-mb-xl"></div>
        <div class="col-12 text-center q-mt-xl content-width">
          <p class="texto-responsivo">{{ t('SobreSpanish.ojalá') }}</p>
          <div class="q-mb-md"></div>
          <div class="q-mb-md"></div>
          <p class="texto-responsivo">
            <strong>{{ t('SobreSpanish.espero') }}</strong>
          </p>
        </div>
        <div class="col-12 items-center text-center q-my-xl">
          <q-btn
            color="primary"
            :label="t('indexContactanos')"
            icon="email"
            @click="router.push('/contacto')"
          />
        </div>
      </div>
    </q-page>
  </q-no-ssr>
</template>

<script setup lang="ts">
import '../css/pages/EstilosGenerales.css';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'quasar';
import { useRouter } from 'vue-router';
const { t } = useI18n();
const router = useRouter();

useMeta(() => ({
  title: 'Sobre SpanishNook | Conoce quién hay detrás',
  meta: {
    description: {
      name: 'description',
      content:
        'Descubre la historia, filosofía y valores de SpanishNook. Conoce a la persona detrás del proyecto y cómo nació la idea de enseñar español online.',
    },
    keywords: {
      name: 'keywords',
      content:
        'sobre SpanishNook, quién hay detrás, historia SpanishNook, filosofía, valores, español online, profesor nativo',
    },
    ogTitle: {
      property: 'og:title',
      content: 'Sobre SpanishNook | Conoce quién hay detrás',
    },
    ogDescription: {
      property: 'og:description',
      content:
        'Conoce la historia y la filosofía de SpanishNook, el proyecto de clases de español online.',
    },
    ogImage: {
      property: 'og:image',
      content: 'https://spanishnook.com/img/Home/banner_1920.webp',
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

.content-width {
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 900px) {
  .content-width {
    width: 90%;
  }
}

@media (max-width: 600px) {
  .content-width {
    width: 100%;
  }
}

.video-responsive {
  max-width: 480px;
  margin: 0 auto;
}
@media (max-width: 600px) {
  .video-responsive {
    max-width: 100%;
  }
}
video {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
