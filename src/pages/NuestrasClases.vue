<template>
  <q-page>
    <div class="row cabecera-row full-width q-mt-xl">
      <div class="col-12 align-self-center q-pa-md flex column items-center">
        <h1 class="titulo-responsivo text-primary q-mb-sm">
          {{ t('NuestrasClases.nuestrasClases') }}
        </h1>
        <br />
        <p
          class="texto-responsivo text-center text-weight-bold"
          style="max-width: 800px; margin: 0 auto; width: 100%"
        >
          {{ t('NuestrasClases.textoNuestrasClasesbold') }}
        </p>
        <p
          class="texto-responsivo text-left"
          style="max-width: 800px; margin: 0 auto; width: 100%"
        >
          {{ t('NuestrasClases.textoNuestrasClases') }}
        </p>
      </div>
    </div>
    <div
      class="full-width q-my-xl"
      style="scroll-margin-top: 120px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 20px; padding: 0 16px"
    >
      <q-img
        src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/render/image/public/imagenes/clases-spanish-conversacion-intro.png?width=700&format=webp"
        style="width: 350px; max-width: 100%; border-radius: 16px"
        :ratio="1"
        fit="cover"
      />

      <div
        class="banner-clases-grupales"
        style="width: 360px; max-width: 100%; margin: 0 !important; box-sizing: border-box !important;"
      >
        <p class="banner-clases-grupales__titulo subtitulo-responsivo text-center q-my-none">
          {{ t('NuestrasClases.clasesGrupalesConversacion') }}
        </p>
      </div>
    </div>

    <div class="row flex q-my-xs" style="width: 100%; gap: 32px">
      <div class="col-12 flex flex-center">
        <q-card class="tarjeta-formativos text-center shadow-2 bg-white text-dark">
          <div class="titulo-responsivo text-left-center">
            {{ t('NuestrasClases.nuestrasClasesConversacion') }}
          </div>
          <br />
          <div>
            <p class="texto-responsivo text-left text-weight-bold">
              {{ t('NuestrasClases.tePasaQue') }}
            </p>
            <br />
            <p class="texto-responsivo text-left text-weight-bold" style="color: #851319">
              {{ t('NuestrasClases.esteCursoEsParaTi') }}
            </p>
            <br />
            <p class="texto-responsivo text-left">
              {{ t('NuestrasClases.cadaSemanaNos') }}
            </p>
            <p class="texto-responsivo text-left">
              {{ t('NuestrasClases.aquiHablamos') }}
            </p>
            <p class="texto-responsivo text-left">
              {{ t('NuestrasClases.esUnPrograma') }}
            </p>
            <br />
            <p class="texto-responsivo text-left text-weight-bold" style="color: #851319">
              {{ t('NuestrasClases.uneteALa') }}
            </p>
          </div>

          <q-expansion-item
            :label="t('NuestrasClases.TextoNuestrosCursosGrupo1')"
            header-class="bg-primary text-white subtitulo-responsivo"
            class="q-my-xl"
          >
            <q-card>
              <q-card-section class="texto-responsivo text-left">
                <ul class="q-pl-md text-left">
                  <li>
                    <strong>{{ t('NuestrasClases.ListaComoFuncionanGrupos1Bold') }}</strong>
                    {{ t('NuestrasClases.ListaComoFuncionanGrupos1') }}
                  </li>
                  <li>
                    <strong>{{ t('NuestrasClases.ListaComoFuncionanGrupos2Bold') }}</strong>
                    {{ t('NuestrasClases.ListaComoFuncionanGrupos2') }}
                  </li>
                  <li>
                    <strong>{{ t('NuestrasClases.ListaComoFuncionanGrupos3Bold') }}</strong>
                    {{ t('NuestrasClases.ListaComoFuncionanGrupos3') }}
                  </li>
                  <li>
                    <strong>{{ t('NuestrasClases.ListaComoFuncionanGrupos4Bold') }}</strong>
                    {{ t('NuestrasClases.ListaComoFuncionanGrupos4') }}
                  </li>
                  <li>
                    <strong>{{ t('NuestrasClases.ListaComoFuncionanGrupos5Bold') }}</strong>
                    {{ t('NuestrasClases.ListaComoFuncionanGrupos5') }}
                  </li>
                </ul>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-expansion-item
            :label="t('NuestrasClases.queLograras')"
            header-class="bg-primary text-white subtitulo-responsivo"
            class="q-my-lg"
          >
            <q-card>
              <q-card-section class="texto-responsivo text-left">
                <ul class="q-pl-md">
                  <li>{{ t('NuestrasClases.Logro1Grupales') }}</li>
                  <li>{{ t('NuestrasClases.Logro2Grupales') }}</li>
                  <li>{{ t('NuestrasClases.Logro3Grupales') }}</li>
                  <li>{{ t('NuestrasClases.Logro4Grupales') }}</li>
                  <li>{{ t('NuestrasClases.Logro5Grupales') }}</li>
                  <li>{{ t('NuestrasClases.Logro6Grupales') }}</li>
                </ul>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-card>
      </div>
    </div>

    <div class="promocards-container">
      <PromoCard
        v-for="curso in cursosPromo"
        :key="curso.id"
        :image-src="curso.imagen_tarjeta"
        :title="curso.titulo_tarjeta"
        :description="curso.texto_tarjeta"
        :button-text="curso.boton_tarjeta"
        :show-promo="curso.showPromo"
        :promo-text="curso.promoText"
        :show-price="curso.showPrice"
        :price="curso.price"
        :original-price="curso.originalPrice"
        :button-link="curso.buttonLink"
        :fecha-inicio="curso.fechaInicio"
        :precio-total="precioTotalCurso(curso)"
        :fechas-curso="fechasCursoCerrado(curso)"
      />
    </div>

    <div
      class="full-width q-mt-sm q-mb-xl"
      style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 20px; padding: 0 16px"
    >
      <div
        class="banner-clases-grupales"
        style="width: 360px; max-width: 100%; margin: 0 !important; box-sizing: border-box !important;"
      >
        <p class="banner-clases-grupales__titulo subtitulo-responsivo text-center q-my-none">
          {{ t('NuestrasClases.clasesIndividualesPersonalizadas') }}
        </p>
      </div>

      <q-img
        src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/render/image/public/imagenes/clases-spanish-individuales.png?width=700&format=webp"
        style="width: 350px; max-width: 100%; border-radius: 16px"
        :ratio="1"
        fit="cover"
      />
    </div>

    <div class="row flex q-my-xs" style="width: 100%; gap: 32px">
      <div class="col-12 flex flex-center">
        <q-card class="tarjeta-formativos text-center shadow-2 bg-white text-dark">
          <q-card-section class="q-pt-lg">
            <div class="titulo-responsivo text-center">
              {{ t('NuestrasClases.nuestrasClasesIndividuales') }}
            </div>
            <br />
            <p class="texto-responsivo text-left q-mb-none">
              <strong>{{ t('NuestrasClases.IntroIndividuales1Bold') }}</strong>
              <br /><br />
              {{ t('NuestrasClases.IntroIndividuales2') }}
            </p>
          </q-card-section>
          <q-separator spaced />
          <q-card-section>
            <h2
              class="text-center q-mb-xl"
              style="color: #851319; font-size: 1.4rem; font-weight: 600"
            >
              {{ t('NuestrasClases.Modalidades') }}
            </h2>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="modalidad-card sn-sello-conversacion sn-sello-fondo">
                  <q-img
                    src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/render/image/public/imagenes/modalidad-conversacion2.png?width=600&format=webp"
                    style="width: 70%; max-width: 300px; border-radius: 16px"
                    fit="cover"
                  />
                  <div class="subtitulo-responsivo text-center q-my-xl">
                    {{ t('NuestrasClases.Modalidad1') }}
                  </div>
                  <p class="text-body1 text-left q-mt-lg text-grey-8" style="font-weight: bold">
                    {{ t('NuestrasClases.TextoModalidad1') }}
                  </p>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="modalidad-card sn-sello-general sn-sello-fondo">
                  <q-img
                    src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/render/image/public/imagenes/modalidad-general2.png?width=600&format=webp"
                    style="width: 70%; max-width: 300px; border-radius: 16px"
                    fit="cover"
                  />
                  <div class="subtitulo-responsivo text-center q-my-xl">
                    {{ t('NuestrasClases.Modalidad2') }}
                  </div>
                  <p class="text-body1 text-left q-mt-lg text-grey-8" style="font-weight: bold">
                    {{ t('NuestrasClases.TextoModalidad2') }}
                  </p>
                </div>
              </div>
            </div>

            <div class="q-mt-xs flex flex-center">
              <q-btn
                color="primary"
                class="oval-btn oval-btn-lg text-weight-bold"
                unelevated
                size="lg"
                :label="t('NuestrasClases.botonReservaUnica')"
                no-caps
                to="/Reservas"
              />
            </div>
          </q-card-section>
          <q-separator spaced />
          <q-card-section>
            <div class="subtitulo-responsivo text-left q-mb-md">
              {{ t('NuestrasClases.TextoComoFuncionanIndividuales') }}
            </div>
            <br />
            <ul class="texto-responsivo text-left q-pl-md lista-funcionamiento">
              <li>
                <strong>{{ t('NuestrasClases.ListaComoFuncionanInd1Bold') }}</strong>
                {{ t('NuestrasClases.ListaComoFuncionanInd1') }}
              </li>
              <li>
                <strong>{{ t('NuestrasClases.ListaComoFuncionanInd2Bold') }}</strong>
                {{ t('NuestrasClases.ListaComoFuncionanInd2') }}
              </li>
              <li>
                <strong>{{ t('NuestrasClases.ListaComoFuncionanInd3Bold') }}</strong>
                {{ t('NuestrasClases.ListaComoFuncionanInd3') }}
              </li>
              <li>
                <strong>{{ t('NuestrasClases.ListaComoFuncionanInd4Bold') }}</strong>
                {{ t('NuestrasClases.ListaComoFuncionanInd4') }}
              </li>
              <li>
                <strong>{{ t('NuestrasClases.ListaComoFuncionanInd5') }}</strong>
              </li>
            </ul>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="row justify-center q-my-xl">
      <div class="col-12 col-md-6">
        <PromoCard
          image-src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/render/image/public/imagenes/CTA_reserva.png?width=600&format=webp"
          :title="t('NuestrasClases.nuestrosPacks')"
          :description="t('NuestrasClases.ahorra')"
          :button-text="t('NuestrasClases.comprarPacks')"
          description-class="description-small-bold"
          :show-promo="false"
          :promo-text="t('NuestrasClases.promoPromoPacks')"
          :show-price="false"
          to="/ComprarPacks"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import '../css/pages/EstilosGenerales.css';
import PromoCard from '../components/PromoCard.vue';
import { useI18n } from 'vue-i18n';
import '../css/pages/ClasesGrupales.css';
import { supabase } from 'src/supabaseClient';
import { useRoute } from 'vue-router';
import { scroll, useMeta } from 'quasar';
import { formatFechaCorta } from 'src/utils/zonaHoraria';
import '../css/pages/NuestrasClases.css';
const route = useRoute();
const { getScrollTarget, setVerticalScrollPosition } = scroll;
const { t, locale } = useI18n();

useMeta(() => ({
  title: 'Nuestras Clases | SpanishNook',
  meta: {
    description: {
      name: 'description',
      content:
        'Clases particulares y grupales de español online. Reserva tu clase, aprende con profesores nativos y grupos reducidos en SpanishNook.',
    },
    keywords: {
      name: 'keywords',
      content:
        'clases particulares español online, clases grupales español, clases conversación, profesor nativo español, grupos reducidos, clases 1 a 1, SpanishNook',
    },
    ogTitle: {
      property: 'og:title',
      content: 'Nuestras Clases | SpanishNook',
    },
    ogDescription: {
      property: 'og:description',
      content:
        'Reserva clases particulares y grupales de español online. Aprende con profesores nativos y grupos reducidos.',
    },
    ogImage: {
      property: 'og:image',
      content: 'https://www.spanishnook.com/img/Logo_rectangular_320.png',
    },
    ogUrl: {
      property: 'og:url',
      content: 'https://www.spanishnook.com/Clases',
    },
    robots: {
      name: 'robots',
      content: 'index,follow',
    },
  },
}));

function scrollDirecto(hash: string, offset = 80) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const el = document.querySelector(hash) as HTMLElement | null;
  if (!el) return;
  const target = getScrollTarget(el);
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  setVerticalScrollPosition(target, top, 0); // 0ms = instantáneo
}

const cursosPromo = ref<
  Array<{
    id: number;
    imagen_tarjeta: string;
    titulo_tarjeta: string;
    texto_tarjeta: string;
    boton_tarjeta: string;
    showPromo: boolean;
    promoText: string;
    showPrice: boolean;
    price: string;
    originalPrice: string;
    buttonLink: string;
    fechaInicio: string;
    tipoCurso: string;
    precioTotalCentimos: number | null;
    fechaFin: string;
  }>
>([]);

type CursoPromo = (typeof cursosPromo.value)[number];

// Cursos de fechas cerradas: precio total y fechas en vez del precio mensual
const precioTotalCurso = (c: CursoPromo): string => {
  if (c.tipoCurso !== 'cerrado' || c.precioTotalCentimos == null) return '';
  const decimales = c.precioTotalCentimos % 100 === 0 ? 0 : 2;
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'EUR',
    // '120 €' para importes redondos, '119,50 €' con céntimos
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(c.precioTotalCentimos / 100);
};

const fechasCursoCerrado = (c: CursoPromo): string => {
  if (c.tipoCurso !== 'cerrado' || !c.fechaInicio) return '';
  const inicio = formatFechaCorta(c.fechaInicio, locale.value);
  return c.fechaFin ? `${inicio} – ${formatFechaCorta(c.fechaFin, locale.value)}` : inicio;
};

async function cargarCursosPromo(): Promise<void> {
  const { data, error } = await supabase
    .from('cursos_grupales')
    .select(
      `
      id,
      imagen_tarjeta,
      titulo_tarjeta,
      texto_tarjeta,
      boton_tarjeta,
      estado_curso,
      visibilidad,
      mostrar_promo,
      texto_promo,
      mostrar_precio,
      precio_curso,
      precio_original,
      usuarios,
      max_estudiantes,
      fecha_inicio,
      fecha_fin,
      tipo_curso,
      precio_total_centimos
    `,
    )
    .eq('visibilidad', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error cargando cursos:', error);
    return;
  }

  // Filtrar además por estados activos
  const visibles = (data ?? []).filter((c) =>
    ['Activo', 'Completo', 'Lista de espera'].includes(c.estado_curso ?? 'Activo'),
  );

  cursosPromo.value = visibles.map((c) => {
    const numUsuarios = Array.isArray(c.usuarios) ? c.usuarios.length : 0;
    const maxEstudiantes = c.max_estudiantes || 0;
    const estadoCurso = c.estado_curso || 'Activo';

    let buttonLink = '';

    if (estadoCurso === 'Completo' || estadoCurso === 'Lista de espera') {
      buttonLink = `/ReservasCursos?id=${c.id}`;
    } else if (estadoCurso === 'Activo') {
      if (numUsuarios >= maxEstudiantes) {
        buttonLink = `/ReservasCursos?id=${c.id}`;
      } else {
        buttonLink = `/ReservasCursos?id=${c.id}`;
      }
    } else {
      buttonLink = `/ReservasCursos?id=${c.id}`;
    }

    return {
      id: c.id,
      imagen_tarjeta: (c.imagen_tarjeta ?? '').replace(/^['"]|['"]$/g, '').trim(),
      titulo_tarjeta: c.titulo_tarjeta ?? '',
      texto_tarjeta: c.texto_tarjeta ?? '',
      boton_tarjeta: c.boton_tarjeta ?? t('NuestrasClases.reservar'),
      showPromo: c.mostrar_promo ?? false,
      promoText: c.texto_promo ?? t('NuestrasClases.pruebaTuClaseGratis'),
      showPrice: c.mostrar_precio ?? false,
      price: c.precio_curso ?? '',
      originalPrice: c.precio_original ?? '',
      buttonLink,
      fechaInicio: c.fecha_inicio ?? '',
      tipoCurso: c.tipo_curso ?? 'suscripcion',
      precioTotalCentimos: c.precio_total_centimos ?? null,
      fechaFin: c.fecha_fin ?? '',
    };
  });
}

onMounted(async () => {
  await cargarCursosPromo();
  if (route.hash) {
    await nextTick();
    if (route.hash) {
      await nextTick();
      scrollDirecto(route.hash);
    }
  }
});
watch(
  () => route.hash,
  (h) => {
    if (h) scrollDirecto(h);
  },
);
</script>

<style>
.modalidad-card {
  border-radius: var(--sn-r-tarjeta);
  padding: 24px 20px;
  height: 100%;
  text-align: center;
}

.lista-funcionamiento {
  line-height: 1.6;
}

.lista-funcionamiento li + li {
  margin-top: 6px;
}

.anim-group-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Eliminados los anchos 100vw forzados: desbordaban la página y pegaban el texto a los bordes */

.oval-btn-lg {
  min-width: 220px;
  padding-left: 32px;
  padding-right: 32px;
}

/* Párrafos principales un poco más grandes y responsive */
.hero-text {
  font-size: 1rem;
  line-height: 1.5;
}

@media (min-width: 768px) {
  .hero-text {
    font-size: 1.15rem;
  }
}

@media (min-width: 1200px) {
  .hero-text {
    font-size: 1.25rem;
  }
}
</style>
