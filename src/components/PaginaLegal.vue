<template>
  <article class="sn-legal" :lang="esIngles ? 'en' : 'es'">
    <h1 class="titulo-responsivo">{{ texto.titulo }}</h1>
    <p v-if="texto.actualizado" class="legal-fecha">{{ texto.actualizado }}</p>
    <p v-if="esIngles && legalActual.avisoTraduccion" class="legal-aviso">
      {{ legalActual.avisoTraduccion }}
    </p>
    <p v-for="(p, i) in texto.intro ?? []" :key="'intro' + i">{{ p }}</p>

    <section v-for="(s, i) in texto.secciones" :key="i">
      <component :is="s.subtitulo ? 'h3' : 'h2'" :class="s.subtitulo ? 'legal-h3' : 'legal-h2'">
        {{ s.titulo }}
      </component>
      <p v-for="(p, j) in s.parrafos ?? []" :key="'p' + j">
        <template v-for="(trozo, k) in trozos(p)" :key="k">
          <strong v-if="trozo.negrita">{{ trozo.texto }}</strong>
          <template v-else>{{ trozo.texto }}</template>
        </template>
      </p>
      <ul v-if="s.lista?.length">
        <li v-for="(item, j) in s.lista" :key="'l' + j">
          <template v-for="(trozo, k) in trozos(item)" :key="k">
            <strong v-if="trozo.negrita">{{ trozo.texto }}</strong>
            <template v-else>{{ trozo.texto }}</template>
          </template>
        </li>
      </ul>
      <p v-for="(p, j) in s.despues ?? []" :key="'d' + j">
        <template v-for="(trozo, k) in trozos(p)" :key="k">
          <strong v-if="trozo.negrita">{{ trozo.texto }}</strong>
          <template v-else>{{ trozo.texto }}</template>
        </template>
      </p>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMeta } from 'quasar';
import { useI18n } from 'vue-i18n';
import legalEn, { type TextosLegales } from 'src/i18n/en-US/legal';
import legalEs from 'src/i18n/es-ES/legal';

const props = defineProps<{ pagina: 'aviso' | 'privacidad' | 'cookies' | 'condiciones' }>();

const { locale } = useI18n();
const esIngles = computed(() => locale.value.startsWith('en'));
const legalActual = computed<TextosLegales>(() => (esIngles.value ? legalEn : legalEs));
const texto = computed(() => legalActual.value[props.pagina]);

/** "**negrita**" → trozos con o sin negrita (sin v-html). */
function trozos(cadena: string): { texto: string; negrita: boolean }[] {
  return cadena
    .split('**')
    .map((t, i) => ({ texto: t, negrita: i % 2 === 1 }))
    .filter((t) => t.texto !== '');
}

useMeta(() => ({
  title: texto.value.metaTitulo,
  meta: {
    description: { name: 'description', content: texto.value.metaDescripcion },
    robots: { name: 'robots', content: 'index,follow' },
  },
}));
</script>

<style scoped>
.legal-fecha {
  color: var(--sn-tinta-suave) !important;
  font-size: var(--sn-t-peq) !important;
  margin-top: -16px !important;
}
.legal-aviso {
  background: var(--sn-nota, #fff4c7);
  border: 1px solid var(--sn-nota-borde, #ecd98c);
  border-radius: 12px;
  padding: 12px 16px;
}
.legal-h2 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h3, 1.5rem);
  font-weight: 700;
  line-height: 1.25;
  color: var(--sn-burdeos);
  margin: 40px 0 12px;
  text-wrap: balance;
}
.legal-h3 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h4, 1.2rem);
  font-weight: 700;
  line-height: 1.3;
  color: var(--sn-burdeos);
  margin: 32px 0 10px;
  text-wrap: balance;
}
</style>
