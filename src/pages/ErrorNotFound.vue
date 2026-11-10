<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity: 0.4">{{ t('flecos.ups') }}</div>

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
