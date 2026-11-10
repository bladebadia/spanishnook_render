<template>
  <q-page class="so-pagina">
    <!-- 1. Presentación con el vídeo -->
    <section class="sn-contenedor so-cabecera">
      <div class="so-cabecera__texto">
        <h1 class="so-h1">{{ t('SobreSpanish.conoce') }}</h1>
        <p class="so-entrada">{{ t('SobreSpanish.intro') }}</p>
      </div>
      <div class="so-video">
        <video controls preload="metadata" playsinline>
          <source
            src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/video/clases_espanol_video_subt.mp4"
            type="video/mp4"
          />
          {{ t('SobreSpanish.navegadorNoSoportaVideo') }}
        </video>
      </div>
    </section>

    <!-- 2. Tu lugar -->
    <section class="so-seccion so-seccion--papel">
      <div class="sn-contenedor so-prosa">
        <h2 class="so-h2">{{ t('SobreSpanish.tulug') }}</h2>
        <p class="so-parrafo">{{ t('SobreSpanish.aprender') }}</p>
        <p class="so-parrafo">{{ t('SobreSpanish.enmedio') }}</p>
      </div>
    </section>

    <!-- 3. Quién soy -->
    <section class="so-seccion">
      <div class="sn-contenedor so-quien">
        <img
          class="so-quien__foto"
          src="/img/paula-perfil.webp"
          alt="Paula, SpanishNook"
          loading="lazy"
        />
        <div>
          <h2 class="so-h2">{{ t('SobreSpanish.quien') }}</h2>
          <p class="so-parrafo">{{ t('SobreSpanish.soy') }}</p>
          <p class="so-parrafo">{{ t('SobreSpanish.tras1') }}</p>
          <p class="so-parrafo">{{ t('SobreSpanish.tras2') }}</p>
        </div>
      </div>
    </section>

    <!-- 4. Filosofía y valores -->
    <section class="so-seccion so-seccion--papel">
      <div class="sn-contenedor">
        <div class="so-prosa">
          <h2 class="so-h2">{{ t('SobreSpanish.filosofía') }}</h2>
          <p class="so-parrafo">{{ t('SobreSpanish.mipropuesta') }}</p>
          <h3 class="so-h3">{{ t('SobreSpanish.loque') }}</h3>
        </div>
        <div class="so-valores">
          <article v-for="v in valores" :key="v.titulo" class="so-valor">
            <q-icon :name="v.icono" class="so-valor__icono" />
            <h4 class="so-valor__titulo">{{ v.titulo }}</h4>
            <p class="so-valor__texto">{{ v.texto }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 5. Cierre -->
    <section class="so-seccion">
      <div class="sn-contenedor so-prosa so-cierre">
        <p class="so-parrafo">{{ t('SobreSpanish.ojalá') }}</p>
        <p class="so-cierre__firma">{{ t('SobreSpanish.espero') }}</p>
        <div class="so-acciones">
          <q-btn
            color="primary"
            unelevated
            no-caps
            size="lg"
            class="so-boton"
            to="/Clases"
            :label="t('indexEncuentraTusClases')"
          />
          <q-btn
            outline
            color="primary"
            no-caps
            size="lg"
            class="so-boton"
            to="/Contacto"
            :label="t('indexContactanos')"
          />
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'quasar';

const { t } = useI18n();

const valores = computed(() => [
  { icono: 'favorite', titulo: t('SobreSpanish.cercaniaBold'), texto: t('SobreSpanish.cercania') },
  { icono: 'event_available', titulo: t('SobreSpanish.flexibilidadBold'), texto: t('SobreSpanish.flexibilidad') },
  { icono: 'verified', titulo: t('SobreSpanish.confianzaBold'), texto: t('SobreSpanish.confianza') },
]);

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
    ogTitle: { property: 'og:title', content: 'Sobre SpanishNook | Conoce quién hay detrás' },
    ogDescription: {
      property: 'og:description',
      content: 'Conoce la historia y la filosofía de SpanishNook, el proyecto de clases de español online.',
    },
    ogImage: {
      property: 'og:image',
      content: 'https://www.spanishnook.com/img/Logo_rectangular_320.png',
    },
    ogUrl: { property: 'og:url', content: 'https://www.spanishnook.com/SobreSpanish' },
    robots: { name: 'robots', content: 'index,follow' },
  },
}));
</script>

<style scoped>
.so-pagina {
  background: var(--sn-papel);
  color: var(--sn-tinta);
}
.so-h1 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h1);
  font-weight: 700;
  line-height: 1.1;
  color: var(--sn-burdeos);
  margin: 0 0 16px;
}
.so-h2 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h2);
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 20px;
}
.so-h3 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h3);
  font-weight: 700;
  color: var(--sn-burdeos);
  margin: 32px 0 0;
}
.so-entrada {
  font-size: var(--sn-t-entrada);
  line-height: 1.55;
  font-weight: 600;
  margin: 0;
}
.so-parrafo {
  font-size: var(--sn-t-cuerpo);
  line-height: 1.7;
  margin: 0 0 16px;
}
.so-prosa {
  max-width: 760px;
}
.so-seccion {
  padding-block: var(--sn-seccion);
}
.so-seccion--papel {
  background: var(--sn-burdeos-tenue);
}

/* 1. Presentación */
.so-cabecera {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  align-items: center;
  padding-block: clamp(32px, 6vw, 64px);
}
@media (min-width: 900px) {
  .so-cabecera {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 56px;
  }
}
.so-video video {
  display: block;
  width: 100%;
  max-height: 70vh;
  border-radius: var(--sn-r-tarjeta);
  box-shadow: var(--sn-sombra-alta);
  background: #000;
}

/* 3. Quién soy */
.so-quien {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  align-items: center;
}
.so-quien__foto {
  width: min(240px, 64vw);
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 50%;
  justify-self: center;
  box-shadow: var(--sn-sombra);
}
@media (min-width: 800px) {
  .so-quien {
    grid-template-columns: 260px 1fr;
    gap: 56px;
  }
}

/* 4. Valores */
.so-valores {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 24px;
}
@media (min-width: 800px) {
  .so-valores {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}
.so-valor {
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  padding: 22px;
  box-shadow: var(--sn-sombra);
}
.so-valor__icono {
  font-size: 26px;
  color: var(--sn-burdeos);
  background: var(--sn-burdeos-tenue);
  border-radius: 50%;
  padding: 10px;
}
.so-valor__titulo {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h4);
  font-weight: 700;
  margin: 14px 0 6px;
}
.so-valor__texto {
  margin: 0;
  line-height: 1.55;
  color: var(--sn-tinta-suave);
}

/* 5. Cierre */
.so-cierre {
  margin-inline: auto;
  text-align: center;
}
.so-cierre__firma {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  font-size: var(--sn-t-h4);
  color: var(--sn-burdeos);
  margin: 8px 0 0;
}
.so-acciones {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}
.so-boton {
  border-radius: var(--sn-r-boton);
  font-weight: 700;
  padding-inline: 22px;
}
</style>
