<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <div class="nf-codigo">404</div>

      <h1 class="nf-titulo">{{ t('flecos.ups') }}</h1>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="primary"
        unelevated
        to="/"
        :label="t('flecos.volver')"
        no-caps
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSSRContext } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMeta } from 'quasar';

const { t } = useI18n();

// Devuelve un 404 real: antes respondía 200 y Google lo trataba como página duplicada
if (process.env.SERVER) {
  const ssrContext = useSSRContext<{ res?: { statusCode: number } }>();
  if (ssrContext?.res) ssrContext.res.statusCode = 404;
}

useMeta(() => ({
  title: `${t('flecos.paginaNoEncontrada')} | SpanishNook`,
  meta: { robots: { name: 'robots', content: 'noindex, follow' } },
}));
</script>

<style scoped>
/* Antes 30vh fijo: en móvil el "404" era más ancho que la pantalla */
.nf-codigo {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  font-size: min(30vh, 40vw);
  line-height: 1;
}
.nf-titulo {
  font-size: var(--sn-t-h2);
  margin: 16px 0 0;
  opacity: 0.75;
  color: #fff;
}
</style>
