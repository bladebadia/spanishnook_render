<template>
  <q-no-ssr>
    <q-page class="row items-center justify-evenly">
      <!-- Imagen cabecera Titulo texto  -->
      <div class="row cabecera-row">
        <div class="col-12 col-md-6">
          <q-img
            class="cabecera-img"
            fit="cover"
            position="center"
            src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/clases-spanish-baner.png"
          />
        </div>

        <div class="col-12 col-md-6 text-center align-self-center q-pa-md">
          <h2 class="text-h4 text-primary text-weight-bold q-mb-md">
            {{ t('NuestrasClases.nuestrasClases') }}
          </h2>
          <p class="texto-responsivo text-justify">
            {{ t('NuestrasClases.textoNuestrasClases') }}
          </p>
        </div>
      </div>

      <!-- Botones de Clases de conversación y Clases Individuales -->
      <div class="row q-pa-md q-my-md justify-evenly botones-clases">
        <q-btn
          class="oval-btn"
          items-center
          color="primary"
          unelevated
          style="font-weight: 800"
          @click="scrollToSection('clases-conversacion')"
        >
          {{ t('NuestrasClases.botonClasesConversacion') }}
        </q-btn>

        <q-btn
          class="oval-btn"
          items-center
          color="primary"
          unelevated
          style="font-weight: 800"
          @click="scrollToSection('clases-individuales')"
        >
          {{ t('NuestrasClases.botonClasesIndividuales') }}
        </q-btn>
      </div>

      <!-- Animación: imagen que entra desde la izquierda y queda a la derecha -->
      <div class="row full-width q-mb-lg q-mb-xl">
        <div class="col-12">
          <div v-intersect="onImgIntersect" class="animacion-banner">
            <div v-if="showAnimatedImg" class="anim-group anim-group-col text-center">
              <img
                src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/test-nivel-spanish-cta.png"
                alt="Animación"
                class="anim-img"
              />
              <q-btn
                class="oval-btn"
                color="grey-7"
                size="md"
                unelevated
                to="/TestNivel"
                :label="t('NuestrasClases.testDeNivel')"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Sección clases grupales: Imagen izquierda + Banner derecho -->
      <div
        id="clases-conversacion"
        class="row full-width q-my-xl items-center"
        style="gap: 32px; scroll-margin-top: 120px"
      >
        <!-- Imagen izquierda -->
        <div class="col-12 col-md-5 flex justify-center">
          <q-img
            src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/clases-spanish-conversacion-intro.png"
            style="width: 100%; max-width: 300px; border-radius: 16px"
            fit="cover"
          />
        </div>

        <!-- Banner rojo derecho -->
        <div class="col-12 col-md-6 flex justify-center">
          <div class="banner-clases-grupales">
            <h2 class="banner-clases-grupales__titulo titulo-responsivo text-center">
              {{ t('NuestrasClases.clasesGrupalesConversacion') }}
            </h2>
          </div>
        </div>
      </div>

      <!-- div de servicio clases de conversación -->
      <div class="row flex q-my-xl" style="width: 100%; gap: 32px">
        <div class="col-12 flex flex-center">
          <q-card class="tarjeta-formativos text-center shadow-2 bg-white text-dark">
            <div class="titulo-responsivo text-justify-center">
              {{ t('NuestrasClases.nuestrasClasesConversacion') }}
            </div>
            <br />
            <div>
              <p class="texto-responsivo text-justify text-weight-bold">
                {{ t('NuestrasClases.tePasaQue') }}
              </p>
              <br />
              <p class="texto-responsivo text-justify text-weight-bold" style="color: #851319">
                {{ t('NuestrasClases.esteCursoEsParaTi') }}
              </p>
              <br />
              <p class="texto-responsivo text-justify">
                {{ t('NuestrasClases.cadaSemanaNos') }}
              </p>
              <p class="texto-responsivo text-justify">
                {{ t('NuestrasClases.aquiHablamos') }}
              </p>
              <p class="texto-responsivo text-justify">
                {{ t('NuestrasClases.esUnPrograma') }}
              </p>
              <br />
              <p class="texto-responsivo text-justify text-weight-bold" style="color: #851319">
                {{ t('NuestrasClases.uneteALa') }}
              </p>
            </div>

            <q-expansion-item
              :label="t('NuestrasClases.TextoNuestrosCursosGrupo1')"
              header-class="bg-primary text-white subtitulo-responsivo"
              class="q-my-xl"
            >
              <q-card>
                <q-card-section class="texto-responsivo text-justify">
                  <ul class="q-pl-md text-justify">
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
                <q-card-section class="texto-responsivo text-justify">
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

      <!-- Cursos desde Supabase -->
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
        />
      </div>

      <!--Seccion clases individuales-->
      <div id="clases-individuales" class="row full-width q-my-xl items-center">
        <!-- Banner rojo izquierdo -->
        <div class="col-12 col-md-6 flex justify-center banner-individuales-col">
          <div class="banner-clases-grupales banner-individuales">
            <p class="banner-clases-grupales__titulo titulo-responsivo text-center">
              {{ t('NuestrasClases.clasesIndividualesPersonalizadas') }}
            </p>
          </div>
        </div>

        <!-- Imagen derecha -->
        <div class="col-12 col-md-5 flex justify-center">
          <q-img
            src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/clases-spanish-individuales.png"
            style="width: 100%; max-width: 400px; border-radius: 16px"
            fit="cover"
          />
        </div>
      </div>

      <!-- div de servicio clases individuales -->
      <div class="row flex q-my-xs" style="width: 100%; gap: 32px">
        <div class="col-12 flex flex-center">
          <q-card class="tarjeta-formativos text-center shadow-2 bg-white text-dark">
            <q-card-section class="q-pt-lg">
              <div class="titulo-responsivo text-center">
                {{ t('NuestrasClases.nuestrasClasesIndividuales') }}
              </div>
              <br />
              <p class="texto-responsivo text-justify q-mb-none">
                <strong>{{ t('NuestrasClases.IntroIndividuales1Bold') }}</strong>
                <br /><br />
                {{ t('NuestrasClases.IntroIndividuales2') }}
              </p>
            </q-card-section>
            <q-separator spaced />
            <q-card-section>
              <h2
                class="text-center q-mb-md"
                style="color: #851319; font-size: 1.4rem; font-weight: 600"
              >
                {{ t('NuestrasClases.Modalidades') }}
              </h2>
              <br />
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="modalidad-card bg-yellow-2">
                    <q-img
                      src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/modalidad-conversacion2.png"
                      style="width: 70%; max-width: 300px; border-radius: 16px"
                      fit="cover"
                    />
                    <div class="subtitulo-responsivo text-center q-my-xl">
                      {{ t('NuestrasClases.Modalidad1') }}
                    </div>
                    <p
                      class="text-body1 text-justify q-mt-lg text-grey-8"
                      style="font-weight: bold"
                    >
                      {{ t('NuestrasClases.TextoModalidad1') }}
                    </p>
                    <div class="q-mt-md flex flex-center">
                      <q-btn
                        color="primary"
                        class="oval-btn oval-btn-md"
                        unelevated
                        size="md"
                        :label="t('NuestrasClases.botonClasesA2')"
                        no-caps
                        to="/Reservas"
                      />
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="modalidad-card bg-yellow-2">
                    <q-img
                      src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/modalidad-general2.png"
                      style="width: 70%; max-width: 300px; border-radius: 16px"
                      fit="cover"
                    />
                    <div class="subtitulo-responsivo text-center">
                      {{ t('NuestrasClases.Modalidad2') }}
                    </div>
                    <p
                      class="text-body1 text-justify q-mt-lg text-grey-8"
                      style="font-weight: bold"
                    >
                      {{ t('NuestrasClases.TextoModalidad2') }}
                    </p>
                    <div class="flex flex-center">
                      <q-btn
                        color="primary"
                        class="oval-btn oval-btn-md"
                        unelevated
                        size="md"
                        :label="t('NuestrasClases.botonClasesA1')"
                        no-caps
                        to="/Reservas"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
            <q-separator spaced />
            <q-card-section>
              <div class="subtitulo-responsivo text-left q-mb-md">
                {{ t('NuestrasClases.TextoComoFuncionanIndividuales') }}
              </div>
              <br />
              <ul class="texto-responsivo text-justify q-pl-md lista-funcionamiento">
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
      <!-- tarjeta promo-->
      <!-- PromoCard para Comprar Packs al final de la página -->
      <div class="row justify-center q-my-xl">
        <div class="col-12 col-md-6">
          <PromoCard
            image-src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/CTA_reserva.png"
            :title="t('NuestrasClases.nuestrosPacks')"
            :description="t('NuestrasClases.ahorra')"
            :button-text="t('NuestrasClases.comprarPacks')"
            description-class="description-small-bold"
            :show-promo="false"
            :promo-text="t('NuestrasClases.promoPromoPacks', '¡Más créditos, más ahorro!')"
            :show-price="false"
            to="/ComprarPacks"
          />
        </div>
      </div>
    </q-page>
  </q-no-ssr>
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
import '../css/pages/NuestrasClases.css';
const route = useRoute();
const { getScrollTarget, setVerticalScrollPosition } = scroll;
const { t } = useI18n();

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
      content: '/img/Logo_rectangular_320.png',
    },
    robots: {
      name: 'robots',
      content: 'index,follow',
    },
  },
}));

const showAnimatedImg = ref(false);

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
  }>
>([]);

let animacionMostrada = false;

function onImgIntersect(entry: IntersectionObserverEntry) {
  if (entry.isIntersecting && !animacionMostrada) {
    showAnimatedImg.value = false;
    setTimeout(() => {
      showAnimatedImg.value = true;
      animacionMostrada = true;
    }, 10);
  }
  // No ocultar la animación ni el bocadillo al salir del viewport
  return true;
}

// Animación de conteo ascendente para los números

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
      fecha_inicio
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
        // FIX: usar backticks correctamente para interpolar el id
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
      boton_tarjeta: c.boton_tarjeta ?? 'Reservar',
      showPromo: c.mostrar_promo ?? false,
      promoText: c.texto_promo ?? '¡Prueba tu clase gratis!',
      showPrice: c.mostrar_precio ?? false,
      price: c.precio_curso ?? '',
      originalPrice: c.precio_original ?? '',
      buttonLink,
      fechaInicio: c.fecha_inicio ?? '',
    };
  });
}

//Función para scroll suave a sección
function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
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
.botones-clases {
  width: 100%;
  gap: 100px;
  flex-wrap: nowrap;
  justify-content: center;

  @media (min-width: 1024px) {
    max-width: 500px;
    margin: 0 auto;
    gap: 250px;
  }

  @media (max-width: 599px) {
    gap: 8px;
  }
}

.botones-clases .q-btn {
  flex: 0 0 auto;
  min-width: 0;
  padding: 10px 18px;

  @media (max-width: 767px) {
    flex: 1 1 0;
    padding: 10px 12px;
  }
}

.modalidad-card {
  background: #fffbe6;
  border-radius: 12px;
  padding: 16px;
  height: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
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
@media (max-width: 600px) {
  .banner-individuales-col {
    margin-left: 0 !important;
    margin-right: 0 !important;
    max-width: 100vw !important;
    width: 100vw !important;
    overflow-x: hidden;
  }
  .banner-individuales {
    max-width: 100vw !important;
    width: 100vw !important;
    box-sizing: border-box;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  .cabecera-row {
    width: 100vw !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    overflow-x: hidden;
  }
  .cabecera-img {
    width: 100vw !important;
    min-width: 0 !important;
    max-width: 100vw !important;
    height: auto !important;
    display: block;
  }
}
.oval-btn-lg {
  min-width: 220px;
  padding-left: 32px;
  padding-right: 32px;
}
</style>
