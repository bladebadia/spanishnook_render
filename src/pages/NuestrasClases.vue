<template>
  <q-page class="cl-pagina">
    <!-- 1. Cabecera y selector: las dos formas de aprender, con precio y botón -->
    <section class="sn-contenedor cl-cabecera">
      <h1 class="cl-h1">{{ t('NuestrasClases.nuestrasClases') }}</h1>
      <p class="cl-entrada">
        <strong>{{ t('NuestrasClases.textoNuestrasClasesbold') }}</strong>
        {{ t('NuestrasClases.textoNuestrasClases') }}
      </p>

      <div class="cl-selector">
        <a href="#individuales" class="cl-opcion" @click.prevent="irA('#individuales')">
          <q-icon name="person" class="cl-opcion__icono" />
          <span class="cl-opcion__titulo">{{ t('PaginaClases.individualesTitulo') }}</span>
          <span class="cl-opcion__linea">{{ t('PaginaClases.individualesLinea') }}</span>
          <span class="cl-opcion__precio">
            {{ t('PaginaClases.desdePorClase', { precio: euros(PRECIO_CONVERSACION) }) }}
          </span>
          <span class="cl-opcion__ir">
            {{ t('PaginaClases.verIndividuales') }}
            <q-icon name="arrow_downward" size="18px" />
          </span>
        </a>
        <a href="#grupos" class="cl-opcion" @click.prevent="irA('#grupos')">
          <q-icon name="groups" class="cl-opcion__icono" />
          <span class="cl-opcion__titulo">{{ t('PaginaClases.gruposTitulo') }}</span>
          <span class="cl-opcion__linea">{{ t('PaginaClases.gruposLinea') }}</span>
          <span class="cl-opcion__precio">{{ resumenGrupos }}</span>
          <span class="cl-opcion__ir">
            {{ t('PaginaClases.verGrupos') }}
            <q-icon name="arrow_downward" size="18px" />
          </span>
        </a>
      </div>
    </section>

    <!-- 2. Clases individuales -->
    <section id="individuales" class="cl-seccion">
      <div class="sn-contenedor">
        <div class="cl-intro">
          <q-img
            src="/img/web/clases-spanish-individuales.webp"
            class="cl-intro__img"
            :ratio="1"
            fit="cover"
            :alt="t('NuestrasClases.clasesIndividualesPersonalizadas')"
          />
          <div class="cl-intro__texto">
            <p class="cl-antetitulo">{{ t('NuestrasClases.Modalidades') }}</p>
            <h2 class="cl-h2">{{ t('NuestrasClases.nuestrasClasesIndividuales') }}</h2>
            <p class="cl-parrafo">
              <strong>{{ t('NuestrasClases.IntroIndividuales1Bold') }}</strong>
            </p>
            <p class="cl-parrafo">{{ t('NuestrasClases.IntroIndividuales2') }}</p>
          </div>
        </div>

        <div class="cl-modalidades">
          <article class="cl-modalidad sn-sello-conversacion">
            <q-img
              src="/img/web/modalidad-conversacion2.webp"
              class="cl-modalidad__img"
              fit="contain"
              alt=""
            />
            <div class="cl-modalidad__cuerpo">
              <div class="cl-modalidad__cabecera">
                <h3 class="cl-h3 sn-sello-texto">{{ t('NuestrasClases.Modalidad1') }}</h3>
                <span class="cl-chip">
                  {{ t('PaginaClases.porClase', { precio: euros(PRECIO_CONVERSACION) }) }}
                </span>
              </div>
              <p class="cl-parrafo">{{ t('NuestrasClases.TextoModalidad1') }}</p>
            </div>
          </article>
          <article class="cl-modalidad sn-sello-general">
            <q-img
              src="/img/web/modalidad-general2.webp"
              class="cl-modalidad__img"
              fit="contain"
              alt=""
            />
            <div class="cl-modalidad__cuerpo">
              <div class="cl-modalidad__cabecera">
                <h3 class="cl-h3 sn-sello-texto">{{ t('NuestrasClases.Modalidad2') }}</h3>
                <span class="cl-chip">
                  {{ t('PaginaClases.porClase', { precio: euros(PRECIO_GENERAL) }) }}
                </span>
              </div>
              <p class="cl-parrafo">{{ t('NuestrasClases.TextoModalidad2') }}</p>
            </div>
          </article>
        </div>

        <h3 class="cl-h3 cl-subtitulo">{{ t('PaginaClases.comoFuncionanIndividuales') }}</h3>
        <ul class="cl-checks">
          <li v-for="punto in puntosIndividuales" :key="punto.titulo">
            <q-icon name="check_circle" class="cl-checks__icono" />
            <span>
              <strong>{{ punto.titulo }}</strong>
              <template v-if="punto.texto">. {{ punto.texto }}</template>
            </span>
          </li>
        </ul>

        <div class="cl-acciones">
          <q-btn
            color="primary"
            unelevated
            no-caps
            size="lg"
            class="cl-boton"
            :label="t('PaginaClases.reservarClase')"
            to="/Reservas"
          />
        </div>

        <div class="cl-aviso sn-nota">
          <q-icon name="savings" class="cl-aviso__icono" />
          <div class="cl-aviso__texto">
            <p class="cl-aviso__titulo">{{ t('PaginaClases.packsTitulo') }}</p>
            <p class="cl-aviso__linea">{{ t('PaginaClases.packsTexto') }}</p>
          </div>
          <q-btn
            outline
            color="primary"
            no-caps
            class="cl-boton"
            :label="t('PaginaClases.verPacks')"
            to="/ComprarPacks"
          />
        </div>
      </div>
    </section>

    <!-- 3. Cursos en grupo: presentación, tipos y formatos, grupos abiertos y detalles -->
    <section id="grupos" class="cl-seccion cl-seccion--grupos">
      <div class="sn-contenedor">
        <div class="cl-intro cl-intro--invertida">
          <q-img
            src="/img/web/clases-spanish-conversacion-intro.webp"
            class="cl-intro__img"
            :ratio="1"
            fit="cover"
            :alt="t('PaginaClases.gruposTitulo')"
          />
          <div class="cl-intro__texto">
            <p class="cl-antetitulo">{{ t('PaginaClases.gruposTitulo') }}</p>
            <h2 class="cl-h2">{{ t('PaginaClases.gruposH2') }}</h2>
            <p class="cl-parrafo">
              <strong>{{ t('PaginaClases.gruposEntrada') }}</strong>
            </p>
            <p class="cl-parrafo">{{ t('PaginaClases.gruposTexto') }}</p>
          </div>
        </div>

        <div class="cl-claves">
          <div class="cl-claves__bloque">
            <p class="cl-antetitulo">{{ t('PaginaClases.queTipo') }}</p>
            <div class="cl-claves__fila">
              <div class="cl-clave sn-sello-conversacion">
                <q-icon name="forum" class="cl-clave__icono" />
                <div>
                  <p class="cl-clave__titulo">{{ t('PaginaClases.tipoConversacion') }}</p>
                  <p class="cl-clave__texto">{{ t('PaginaClases.tipoConversacionTexto') }}</p>
                </div>
              </div>
              <div class="cl-clave sn-sello-general">
                <q-icon name="menu_book" class="cl-clave__icono" />
                <div>
                  <p class="cl-clave__titulo">{{ t('PaginaClases.tipoGeneral') }}</p>
                  <p class="cl-clave__texto">{{ t('PaginaClases.tipoGeneralTexto') }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="cl-claves__bloque">
            <p class="cl-antetitulo">{{ t('PaginaClases.queFormato') }}</p>
            <div class="cl-claves__fila">
              <div class="cl-clave">
                <q-icon name="autorenew" class="cl-clave__icono" />
                <div>
                  <p class="cl-clave__titulo">{{ t('PaginaClases.formatoMensual') }}</p>
                  <p class="cl-clave__texto">{{ t('PaginaClases.formatoMensualTexto') }}</p>
                </div>
              </div>
              <div class="cl-clave">
                <q-icon name="event" class="cl-clave__icono" />
                <div>
                  <p class="cl-clave__titulo">{{ t('PaginaClases.formatoCerrado') }}</p>
                  <p class="cl-clave__texto">{{ t('PaginaClases.formatoCerradoTexto') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 class="cl-h3 cl-subtitulo">{{ t('PaginaClases.gruposAbiertos') }}</h3>
        <div v-if="cursosPromo.length" class="cl-cursos">
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
            :etiquetas="etiquetasCurso(curso)"
          />
        </div>
        <div v-else class="cl-aviso cl-aviso--vacio">
          <q-icon name="event_available" class="cl-aviso__icono" />
          <div class="cl-aviso__texto">
            <p class="cl-aviso__titulo">{{ t('PaginaClases.sinGrupos') }}</p>
            <p class="cl-aviso__linea">{{ t('PaginaClases.sinGruposTexto') }}</p>
          </div>
          <q-btn
            color="primary"
            unelevated
            no-caps
            class="cl-boton"
            :label="t('PaginaClases.avisame')"
            to="/Contacto"
          />
        </div>

        <div class="cl-detalles">
          <q-expansion-item
            :label="t('NuestrasClases.TextoNuestrosCursosGrupo1')"
            icon="schedule"
            class="cl-desplegable"
            header-class="cl-desplegable__cabecera"
          >
            <ul class="cl-checks cl-checks--una">
              <li v-for="punto in puntosGrupos" :key="punto.titulo">
                <q-icon name="check_circle" class="cl-checks__icono" />
                <span>
                  <strong>{{ punto.titulo }}</strong>
                  <template v-if="punto.texto">. {{ punto.texto }}</template>
                </span>
              </li>
            </ul>
          </q-expansion-item>
          <q-expansion-item
            :label="t('NuestrasClases.queLograras')"
            icon="emoji_events"
            class="cl-desplegable"
            header-class="cl-desplegable__cabecera"
          >
            <ul class="cl-checks cl-checks--una">
              <li v-for="logro in logrosGrupos" :key="logro">
                <q-icon name="check_circle" class="cl-checks__icono" />
                <span>{{ logro }}</span>
              </li>
            </ul>
          </q-expansion-item>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from 'vue';
import '../css/pages/EstilosGenerales.css';
import PromoCard from '../components/PromoCard.vue';
import { useI18n } from 'vue-i18n';
import { supabase } from 'src/supabaseClient';
import { useRoute } from 'vue-router';
import { scroll, useMeta } from 'quasar';
import { formatFechaCorta } from 'src/utils/zonaHoraria';
const route = useRoute();
const { getScrollTarget, setVerticalScrollPosition } = scroll;
const { t, locale } = useI18n();

// Precios de las clases sueltas (los fija el servidor en stripe-webhook; aquí solo se muestran)
const PRECIO_GENERAL = 32;
const PRECIO_CONVERSACION = 27;

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

function euros(cantidad: number): string {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(cantidad) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cantidad);
}

function scrollDirecto(hash: string, offset = 80) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const el = document.querySelector(hash) as HTMLElement | null;
  if (!el) return;
  const target = getScrollTarget(el);
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  setVerticalScrollPosition(target, top, 250);
}

// Botones del selector: baja a la sección y deja el ancla en la URL para compartirla
function irA(hash: string) {
  history.replaceState(history.state, '', hash);
  scrollDirecto(hash);
}

const puntosIndividuales = computed(() => [
  { titulo: t('NuestrasClases.ListaComoFuncionanInd1Bold'), texto: t('NuestrasClases.ListaComoFuncionanInd1') },
  { titulo: t('NuestrasClases.ListaComoFuncionanInd2Bold'), texto: t('NuestrasClases.ListaComoFuncionanInd2') },
  { titulo: t('NuestrasClases.ListaComoFuncionanInd3Bold'), texto: t('NuestrasClases.ListaComoFuncionanInd3') },
  { titulo: t('NuestrasClases.ListaComoFuncionanInd4Bold'), texto: t('NuestrasClases.ListaComoFuncionanInd4') },
  { titulo: t('NuestrasClases.ListaComoFuncionanInd5'), texto: '' },
]);

const puntosGrupos = computed(() =>
  [1, 2, 3, 4, 5].map((n) => ({
    titulo: t(`NuestrasClases.ListaComoFuncionanGrupos${n}Bold`),
    texto: t(`NuestrasClases.ListaComoFuncionanGrupos${n}`),
  })),
);

const logrosGrupos = computed(() =>
  [1, 2, 3, 4, 5, 6].map((n) => t(`NuestrasClases.Logro${n}Grupales`)),
);

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
    categoria: 'conversacion' | 'general';
  }>
>([]);

type CursoPromo = (typeof cursosPromo.value)[number];

// Etiquetas de la tarjeta: categoría (con el color de su sello) y formato de pago
const etiquetasCurso = (c: CursoPromo) => [
  c.categoria === 'general'
    ? { texto: t('PaginaClases.tipoGeneral'), clase: 'sn-sello-general' }
    : { texto: t('PaginaClases.tipoConversacion'), clase: 'sn-sello-conversacion' },
  c.tipoCurso === 'cerrado'
    ? { texto: t('PaginaClases.etiquetaPagoUnico') }
    : { texto: t('PaginaClases.etiquetaMensual') },
];

// Precio mensual más bajo de los grupos de suscripción con precio visible
const precioMinimoGrupos = computed(() => {
  const precios = cursosPromo.value
    .filter((c) => c.tipoCurso !== 'cerrado' && c.showPrice)
    .map((c) => Number(String(c.price).replace(',', '.')))
    .filter((p) => Number.isFinite(p) && p > 0);
  return precios.length ? euros(Math.min(...precios)) : '';
});

const resumenGrupos = computed(() => {
  if (precioMinimoGrupos.value) return t('PaginaClases.desdePorMes', { precio: precioMinimoGrupos.value });
  if (cursosPromo.value.length) return t('PaginaClases.gruposAbiertosN', { n: cursosPromo.value.length });
  return t('PaginaClases.proximosGrupos');
});

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
      fecha_inicio,
      fecha_fin,
      tipo_curso,
      categoria,
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

  cursosPromo.value = visibles.map((c) => ({
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
    // Todas las tarjetas llevan a la ficha del curso (allí se ve si hay plazas o lista de espera)
    buttonLink: `/ReservasCursos?id=${c.id}`,
    fechaInicio: c.fecha_inicio ?? '',
    tipoCurso: c.tipo_curso ?? 'suscripcion',
    precioTotalCentimos: c.precio_total_centimos ?? null,
    fechaFin: c.fecha_fin ?? '',
    categoria: c.categoria === 'general' ? 'general' : 'conversacion',
  }));
}

onMounted(async () => {
  await cargarCursosPromo();
  if (route.hash) {
    await nextTick();
    scrollDirecto(route.hash);
  }
});
watch(
  () => route.hash,
  (h) => {
    if (h) scrollDirecto(h);
  },
);
</script>

<style scoped>
.cl-pagina {
  background: var(--sn-papel);
  color: var(--sn-tinta);
}

/* Tipografía */
.cl-h1 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h1);
  font-weight: 700;
  line-height: 1.1;
  color: var(--sn-burdeos);
  margin: 0 0 16px;
  text-align: center;
}
.cl-h2 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h2);
  font-weight: 700;
  line-height: 1.15;
  color: var(--sn-tinta);
  margin: 0 0 16px;
}
.cl-h3 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h3);
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}
.cl-antetitulo {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-peq);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sn-burdeos);
  margin: 0 0 8px;
}
.cl-entrada {
  font-size: var(--sn-t-entrada);
  line-height: 1.55;
  max-width: var(--sn-prosa);
  margin: 0 auto;
  text-align: center;
  color: var(--sn-tinta-suave);
}
.cl-entrada strong {
  color: var(--sn-tinta);
}
.cl-parrafo {
  font-size: var(--sn-t-cuerpo);
  line-height: 1.6;
  margin: 0 0 12px;
}
.cl-destacado {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  color: var(--sn-burdeos);
}
.cl-subtitulo {
  margin: 48px 0 20px;
  color: var(--sn-tinta);
}

/* 1. Cabecera y selector */
.cl-cabecera {
  padding-top: clamp(32px, 6vw, 64px);
  padding-bottom: clamp(32px, 6vw, 56px);
}
.cl-selector {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 32px;
}
@media (min-width: 700px) {
  .cl-selector {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}
.cl-opcion {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 24px;
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  box-shadow: var(--sn-sombra);
  color: var(--sn-tinta);
  text-decoration: none;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}
.cl-opcion:hover {
  box-shadow: var(--sn-sombra-alta);
  border-color: var(--sn-burdeos);
  transform: translateY(-2px);
}
.cl-opcion__icono {
  font-size: 32px;
  color: var(--sn-burdeos);
  background: var(--sn-burdeos-tenue);
  border-radius: 50%;
  padding: 10px;
  margin-bottom: 6px;
}
.cl-opcion__titulo {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h3);
  font-weight: 700;
}
.cl-opcion__linea {
  color: var(--sn-tinta-suave);
  line-height: 1.5;
}
.cl-opcion__precio {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h4);
  font-weight: 700;
  color: var(--sn-burdeos);
  margin-top: 6px;
}
.cl-opcion__ir {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: auto;
  padding-top: 12px;
  font-weight: 700;
  color: var(--sn-burdeos);
}

/* Secciones */
.cl-seccion {
  padding-block: var(--sn-seccion);
  border-top: 1px solid var(--sn-borde);
  scroll-margin-top: 80px;
}
.cl-seccion--grupos {
  background: var(--sn-burdeos-tenue);
}

/* Tipos y formatos de los cursos en grupo */
.cl-claves {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-top: 40px;
}
@media (min-width: 900px) {
  .cl-claves {
    grid-template-columns: 1fr 1fr;
  }
}
.cl-claves__fila {
  display: grid;
  gap: 12px;
}
.cl-clave {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px 18px;
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-left: 5px solid var(--sn-sello, var(--sn-burdeos));
  border-radius: var(--sn-r-tarjeta);
}
.cl-clave__icono {
  flex: none;
  font-size: 26px;
  color: var(--sn-sello, var(--sn-burdeos));
  margin-top: 2px;
}
.cl-clave__titulo {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  font-size: var(--sn-t-h4);
  margin: 0 0 4px;
  color: var(--sn-sello, var(--sn-tinta));
}
.cl-clave__texto {
  margin: 0;
  line-height: 1.5;
  color: var(--sn-tinta-suave);
}

/* Imagen + texto de cada sección */
.cl-intro {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: center;
}
.cl-intro__img {
  width: 100%;
  max-width: 360px;
  justify-self: center;
  border-radius: var(--sn-r-tarjeta);
  box-shadow: var(--sn-sombra);
}
@media (min-width: 900px) {
  .cl-intro {
    grid-template-columns: 360px 1fr;
    gap: 48px;
  }
  .cl-intro--invertida {
    grid-template-columns: 1fr 360px;
  }
  .cl-intro--invertida .cl-intro__img {
    order: 2;
  }
}

/* Modalidades 1:1 */
.cl-modalidades {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-top: 40px;
}
@media (min-width: 700px) {
  .cl-modalidades {
    grid-template-columns: 1fr 1fr;
  }
}
.cl-modalidad {
  display: flex;
  flex-direction: column;
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-top: 6px solid var(--sn-sello);
  border-radius: var(--sn-r-tarjeta);
  overflow: hidden;
  box-shadow: var(--sn-sombra);
}
.cl-modalidad__img {
  height: 180px;
  background: var(--sn-sello-tenue);
}
.cl-modalidad__cuerpo {
  padding: 20px 22px 8px;
}
.cl-modalidad__cabecera {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  margin-bottom: 12px;
}
.cl-chip {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--sn-r-boton);
  background: var(--sn-sello-tenue);
  color: var(--sn-sello);
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  white-space: nowrap;
}

/* Listas con checks */
.cl-checks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px 32px;
}
@media (min-width: 700px) {
  .cl-checks {
    grid-template-columns: 1fr 1fr;
  }
}
.cl-checks--una {
  grid-template-columns: 1fr !important;
  padding: 8px 20px 20px;
}
.cl-checks li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  line-height: 1.5;
}
.cl-checks__icono {
  flex: none;
  font-size: 20px;
  margin-top: 2px;
  color: var(--sn-oliva);
}

/* Botones y acciones */
.cl-acciones {
  display: flex;
  justify-content: center;
  margin: 40px 0 32px;
}
.cl-boton {
  border-radius: var(--sn-r-boton);
  font-weight: 700;
  padding-inline: 20px;
}

/* Avisos (packs, sin grupos abiertos) */
.cl-aviso {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 20px;
  padding: 20px 24px;
}
.cl-aviso--vacio {
  background: var(--sn-hoja);
  border: 1px dashed var(--sn-sello);
  border-radius: var(--sn-r-tarjeta);
}
.cl-aviso__icono {
  font-size: 36px;
  color: var(--sn-burdeos);
}
.cl-aviso__texto {
  flex: 1 1 240px;
}
.cl-aviso__titulo {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  font-size: var(--sn-t-h4);
  margin: 0 0 4px;
}
.cl-aviso__linea {
  margin: 0;
  color: var(--sn-tinta-suave);
  line-height: 1.5;
}

/* Grupos abiertos */
.cl-cursos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 24px;
  align-items: stretch;
}
.cl-cursos :deep(.q-card) {
  height: 100%;
}

/* Desplegables de detalles */
.cl-detalles {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 40px;
}
@media (min-width: 900px) {
  .cl-detalles {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}
.cl-desplegable {
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  overflow: hidden;
}
.cl-desplegable :deep(.cl-desplegable__cabecera) {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  font-size: var(--sn-t-h4);
  color: var(--sn-tinta);
  min-height: 60px;
}
.cl-desplegable :deep(.q-item__section--avatar .q-icon) {
  color: var(--sn-burdeos);
}
.cl-desplegable :deep(.q-expansion-item__toggle-icon) {
  color: var(--sn-tinta-suave) !important;
  font-size: 1.6rem !important;
}
</style>
