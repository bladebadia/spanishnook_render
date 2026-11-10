<template>
  <q-page :style-fn="customStyleFn" class="ini-pagina">
    <!-- 1. Cabecera: banner, titular, texto de bienvenida y "Crea tu espacio" -->
    <q-img
      class="sn-hero-banner"
      fit="cover"
      position="50% 25%"
      loading="eager"
      fetchpriority="high"
      no-spinner
      alt="Spanish at your pace, in your place"
      src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/banner_1920.webp"
    />

    <section class="sn-contenedor ini-cabecera">
      <h1 class="ini-h1">{{ t('indexeUnLugarDonde') }}</h1>
      <p class="ini-entrada ini-entrada--larga">{{ t('indexAprenderEspañolPuede') }}</p>
      <q-btn
        color="primary"
        unelevated
        no-caps
        size="lg"
        class="ini-boton q-mt-lg"
        :label="t('indexCreaTuEspacio')"
        @click="handleCreaTuEspacio"
      />
    </section>

    <!-- 2. Descubre nuestras clases (ilustración de la sillita) y qué encontrarás -->
    <section class="ini-seccion ini-seccion--pegada">
      <div class="sn-contenedor ini-descubre">
        <article class="ini-descubre__tarjeta">
          <img
            class="ini-descubre__img"
            src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/render/image/public/imagenes/inicio_principal_OK.png?width=800&format=webp"
            alt=""
            loading="lazy"
          />
          <h2 class="ini-h3 ini-descubre__titulo">{{ t('indexDescubreNuestrasClases') }}</h2>
          <p class="ini-parrafo">{{ t('indexDescubreNuestrasClasesTexto') }}</p>
          <q-btn
            color="primary"
            unelevated
            no-caps
            class="ini-boton"
            to="/Clases"
            :label="t('indexEncuentraTusClases')"
          />
        </article>
        <div>
          <h2 class="ini-h2">{{ t('indexQueEncontraras') }}</h2>
          <ul class="ini-ventajas">
            <li v-for="v in ventajas" :key="v.texto">
              <q-icon :name="v.icono" class="ini-ventajas__icono" />
              <span>{{ v.texto }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 3. Diferentes caminos: individuales, grupos y packs -->
    <section class="ini-seccion ini-seccion--papel">
      <div class="sn-contenedor">
        <h2 class="ini-h2 ini-h2--centro">{{ t('indexDiferentesCaminos') }}</h2>
        <div class="ini-ofertas">
          <router-link
            v-for="oferta in ofertas"
            :key="oferta.titulo"
            :to="oferta.to"
            class="ini-oferta"
            :class="oferta.sello"
          >
            <div class="ini-oferta__img">
              <img :src="oferta.imagen" :alt="oferta.titulo" loading="lazy" />
            </div>
            <div class="ini-oferta__cuerpo">
              <h3 class="ini-h3">{{ oferta.titulo }}</h3>
              <p class="ini-oferta__texto">{{ oferta.texto }}</p>
              <p class="ini-oferta__precio">{{ oferta.precio }}</p>
              <span class="ini-oferta__ir">
                {{ oferta.boton }}
                <q-icon name="arrow_forward" size="18px" />
              </span>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 4. Opiniones -->
    <section class="ini-seccion">
      <div class="sn-contenedor">
        <p class="ini-antetitulo ini-antetitulo--centro">{{ t('indexOpinionesVerificadas') }}</p>
        <h2 class="ini-h2 ini-h2--centro">{{ t('indexConoceExperiencias') }}</h2>

        <div class="carousel-container">
          <div v-if="cargandoOpiniones" class="ini-opiniones-cargando" aria-hidden="true" />
          <div
            v-else-if="todasLasOpiniones.length === 0"
            class="text-center q-pa-xl text-grey-7"
          >
            {{ t('indexSeElPrimeroEnOpinar') }}
          </div>
          <q-carousel
            v-else
            v-model="currentSlide"
            transition-prev="slide-right"
            transition-next="slide-left"
            swipeable
            animated
            infinite
            control-color="primary"
            :autoplay="6000"
            :arrows="$q.screen.gt.sm"
            height="300px"
            class="opinions-carousel bg-transparent"
          >
            <q-carousel-slide
              v-for="(opinion, index) in todasLasOpiniones"
              :key="index"
              :name="index"
              class="q-pa-none"
            >
              <div class="row justify-center full-height items-center">
                <div class="col-12 col-sm-10 col-md-8 col-lg-7">
                  <OpinioneVerificadas
                    :opinion="opinion"
                    :show-avatar="false"
                    class="single-opinion-card"
                  />
                </div>
              </div>
            </q-carousel-slide>
          </q-carousel>

          <div v-if="todasLasOpiniones.length > 1" class="carousel-indicators q-mt-md">
            <q-btn
              v-for="(opinion, index) in todasLasOpiniones"
              :key="index"
              round
              dense
              size="sm"
              :color="currentSlide === index ? 'primary' : 'grey-5'"
              class="q-mx-xs"
              :aria-label="`${opinion.name} - ${opinion.country}`"
              @click="currentSlide = index"
            />
          </div>

          <div class="text-center q-mt-lg">
            <q-btn outline color="primary" no-caps class="ini-boton" @click="handleDarOpinion">
              {{ t('indexDanosTuOpinion') }}
            </q-btn>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Test de nivel -->
    <section class="degradado-fondo">
      <div class="sn-bloque-test">
        <h2 class="sn-bloque-test__titulo">{{ t('indexDescubreTuPunto') }}</h2>
        <p class="sn-bloque-test__texto">{{ t('indexEnSolo') }}</p>
        <q-btn
          color="white"
          text-color="primary"
          to="/TestNivel"
          class="ini-boton q-mt-lg"
          unelevated
          no-caps
          :label="t('indexHacerTest')"
        />
      </div>
    </section>

    <!-- 6. Materiales -->
    <section v-if="cuadernosCarrusel.length > 0" class="ini-seccion">
      <div class="sn-contenedor">
        <h2 class="ini-h2 ini-h2--centro">{{ t('indexMateriales') }}</h2>
        <p class="ini-entrada ini-entrada--centro">{{ t('indexMateriales1') }}</p>
      </div>
      <div class="row justify-center q-mt-md">
        <q-carousel
          v-model="slideCuadernos"
          transition-prev="slide-right"
          transition-next="slide-left"
          swipeable
          animated
          infinite
          control-color="primary"
          :arrows="cuadernosCarrusel.length > 1"
          height="450px"
          class="bg-transparent col-12 col-md-8 col-lg-6"
        >
          <q-carousel-slide
            v-for="(cuaderno, index) in cuadernosCarrusel"
            :key="cuaderno.id"
            :name="index"
            class="column flex-center q-px-xl"
          >
            <q-card class="carta-contenido">
              <q-img :src="cuaderno.imagen_portada || '/img/Logo_rectangular_320.png'" height="200px">
                <div
                  class="ini-material__precio"
                  :class="{ 'ini-material__precio--gratis': !cuaderno.precio }"
                >
                  {{ cuaderno.precio ? `${cuaderno.precio} €` : t('MaterialesPage.gratis') }}
                </div>
              </q-img>
              <q-card-section class="col-grow text-center q-pa-md flex column justify-center">
                <div class="text-h6 text-weight-bold q-mb-sm" style="line-height: 1.2">
                  {{ locale === 'en-US' && cuaderno.titulo_en ? cuaderno.titulo_en : cuaderno.titulo }}
                </div>
                <div class="text-body2 text-grey-8 ellipsis-3-lines">
                  {{
                    locale === 'en-US' && cuaderno.descripcion_breve_en
                      ? cuaderno.descripcion_breve_en
                      : cuaderno.descripcion_breve
                  }}
                </div>
              </q-card-section>
              <q-card-actions align="center" class="q-pa-md q-pt-none">
                <q-btn
                  color="primary"
                  rounded
                  unelevated
                  no-caps
                  :label="t('MaterialesPage.verCatalogo')"
                  class="full-width text-weight-bold"
                  to="/Materiales"
                />
              </q-card-actions>
            </q-card>
          </q-carousel-slide>
        </q-carousel>
      </div>
    </section>

    <!-- 7. Quién hay detrás -->
    <section class="ini-seccion ini-seccion--papel">
      <div class="sn-contenedor ini-quien">
        <img
          class="ini-quien__foto"
          src="/img/paula-perfil-inicio.webp"
          alt="Paula, SpanishNook"
          loading="lazy"
        />
        <div>
          <h2 class="ini-h2">{{ t('indexQuienHayDetras') }}</h2>
          <p class="ini-parrafo">{{ t('indexDetrasDeSpanishnook1') }}</p>
          <p class="ini-parrafo">{{ t('indexDetrasDeSpanishnook2') }}</p>
          <p class="ini-parrafo"><strong>{{ t('indexDetrasDeSpanishnook3') }}</strong></p>
          <q-btn
            outline
            color="primary"
            no-caps
            class="ini-boton q-mt-sm"
            to="/SobreSpanish"
            :label="t('indexMasSobreSpanishnook')"
          />
        </div>
      </div>
    </section>

    <!-- 8. Preguntas frecuentes -->
    <section class="ini-seccion">
      <div class="sn-contenedor ini-faq">
        <h2 class="ini-h2 ini-h2--centro">{{ t('indexPreguntasFrecuentes') }}</h2>
        <div class="ini-faq__lista">
          <q-expansion-item
            v-for="p in preguntas"
            :key="p.pregunta"
            :label="t(p.pregunta)"
            header-class="ini-faq__pregunta"
          >
            <p class="ini-faq__respuesta">{{ t(p.respuesta) }}</p>
          </q-expansion-item>
        </div>
      </div>
    </section>

    <!-- 9. Contacto -->
    <section class="ini-seccion ini-seccion--papel">
      <div class="sn-contenedor ini-contacto">
        <h2 class="ini-h2 ini-h2--centro">{{ t('indexAunTienesDudas') }}</h2>
        <p class="ini-entrada">{{ t('indexEstamosAlOtroLado') }}</p>
        <q-btn
          color="primary"
          unelevated
          no-caps
          size="lg"
          class="ini-boton q-mt-lg"
          to="/Contacto"
          :label="t('indexContactanos')"
        />
      </div>
    </section>

    <q-dialog v-model="showLoginDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ t('indexRegistroRequerido') }}</div>
        </q-card-section>

        <q-card-section>
          <p>{{ t('indexDebesEstarRegistrado') }}</p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('indexCancelar')" color="grey" v-close-popup />
          <q-btn unelevated :label="t('indexRegistrarse')" color="primary" @click="irARegistro" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showOpinionDialog" persistent>
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ t('indexComparteTuExperiencia') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="enviarOpinion" class="q-gutter-md">
            <div>
              <label class="text-weight-medium">{{ t('indexCalificacion') }}</label>
              <q-rating
                v-model="nuevaOpinion.rating"
                size="2em"
                :max="5"
                color="yellow-8"
                icon="star_border"
                icon-selected="star"
                icon-half="star_half"
              />
            </div>

            <q-input
              v-model="nuevaOpinion.name"
              :label="t('indexNombre')"
              outlined
              :rules="[(val: string) => !!val || t('indexCampoRequerido')]"
            />

            <q-input
              v-model="nuevaOpinion.country"
              :label="t('indexPais')"
              outlined
              :rules="[(val: string) => !!val || t('indexCampoRequerido')]"
            />

            <q-input
              v-model="nuevaOpinion.comment"
              type="textarea"
              :label="t('indexTuComentario')"
              outlined
              rows="5"
              counter
              maxlength="500"
              :rules="[
                (val: string) => !!val || t('indexCampoRequerido'),
                (val: string) => val.length >= 20 || t('indexComentarioMinimo'),
              ]"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="t('indexCancelar')"
            color="grey"
            v-close-popup
            :disable="enviandoOpinion"
          />
          <q-btn
            unelevated
            :label="t('indexEnviar')"
            color="primary"
            @click="enviarOpinion"
            :loading="enviandoOpinion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuth } from '../stores/auth';
import { supabase } from '../supabaseClient';
import { useMeta } from 'quasar';

// Importar los estilos CSS
import '../css/pages/IndexPage.css';
import '../css/pages/EstilosGenerales.css';
import OpinioneVerificadas from '../components/OpinioneVerificadas.vue';
// Calculamos el estilo de forma consistente
const customStyleFn = () => {
  // Ignoramos el offset que Quasar calcula y usamos nuestro valor fijo
  return {
    minHeight: 'calc(100vh - 100px)',
  };
};
type Opinion = {
  name: string;
  country: string;
  rating: number;
  comment: string;
  verified: boolean;
  date: string;
};

type SupabaseOpinion = {
  nombre: string | null;
  pais: string | null;
  rating: number | null;
  comentario: string | null;
  verified: boolean | null;
  created_at: string | null;
};

useMeta(() => ({
  title: 'Clases de español online | SpanishNook',
  meta: {
    description: {
      name: 'description',
      content: 'Mejora tu español con clases en vivo, individuales y grupales.',
    },
    keywords: {
      name: 'keywords',
      content:
        'español online, clases de español, profesores nativos, clases grupales, clases individuales, aprender español, SpanishNook',
    },
    ogTitle: {
      property: 'og:title',
      content: 'Clases de español online | SpanishNook',
    },
    ogDescription: {
      property: 'og:description',
      content: 'Clases de español online con profesores nativos.',
    },
    ogImage: {
      property: 'og:image',
      content: 'https://www.spanishnook.com/img/Logo_rectangular_320.png',
    },
    ogUrl: {
      property: 'og:url',
      content: 'https://www.spanishnook.com/',
    },
    ogType: {
      property: 'og:type',
      content: 'website',
    },
    robots: {
      name: 'robots',
      content: 'index,follow',
    },
  },
}));

const currentSlide = ref(0);

// "Crea tu espacio": al área personal si hay sesión, si no a registrarse
const handleCreaTuEspacio = () => {
  void router.push(user.value ? '/AreaPersonal' : '/RegistroCuenta');
};

// Precio más bajo de una clase suelta (conversación). Lo fija el servidor; aquí solo se muestra.
const PRECIO_DESDE = 27;
const IMG = 'https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/render/image/public/imagenes';

const ofertas = computed(() => [
  {
    titulo: t('indexClasesPrivadas'),
    texto: t('Inicio.ofertaIndividualesTexto'),
    precio: t('PaginaClases.desdePorClase', { precio: `${PRECIO_DESDE} €` }),
    boton: t('Inicio.ofertaIndividualesBoton'),
    to: { path: '/Clases', hash: '#individuales' },
    imagen: `${IMG}/clases-spanish-inicio-individuales.png?width=600&format=webp`,
    sello: 'sn-sello-general',
  },
  {
    titulo: t('PaginaClases.gruposTitulo'),
    texto: t('Inicio.ofertaGruposTexto'),
    precio: t('Inicio.ofertaGruposPrecio'),
    boton: t('Inicio.ofertaGruposBoton'),
    to: { path: '/Clases', hash: '#grupos' },
    imagen: `${IMG}/clases-spanish-inicio-conversacion.png?width=600&format=webp`,
    sello: 'sn-sello-conversacion',
  },
  {
    titulo: t('PaginaClases.packsTitulo'),
    texto: t('Inicio.ofertaPacksTexto'),
    precio: t('Inicio.ofertaPacksPrecio'),
    boton: t('PaginaClases.verPacks'),
    to: '/ComprarPacks',
    imagen: `${IMG}/CTA_reserva.png?width=600&format=webp`,
    sello: '',
  },
]);

const preguntas = [
  { pregunta: 'indexComoFuncionanClases', respuesta: 'indexTodasClasesEnVivo' },
  { pregunta: 'indexQueNecesitoParaEmpezar', respuesta: 'indexSoloNecesito' },
  { pregunta: 'indexPuedoCambiarDeModalidad', respuesta: 'indexClaroQueremos' },
  { pregunta: 'indexQueNivelDeEspañol', respuesta: 'indexNoNecesitoNingun' },
  { pregunta: 'indexQuePasaSiNoPuedoAsistir', respuesta: 'indexDependeraDeLaModalidad' },
];

const ventajas = computed(() => [
  { icono: 'videocam', texto: t('indexclasesEnVivo') },
  { icono: 'tune', texto: t('indexdiferentesModalidades') },
  { icono: 'insights', texto: t('indexseguimientoContinuo') },
  { icono: 'favorite', texto: t('indexClasesAdaptadas') },
  { icono: 'menu_book', texto: t('indexMaterialesExclusivos') },
  { icono: 'local_cafe', texto: t('indexAmbienteRelajado') },
]);
const { t, locale } = useI18n();
const router = useRouter();
const $q = useQuasar();
const { user } = useAuth();

// 1. Añadimos el inglés a la plantilla
interface CuadernoCarrusel {
  id: number;
  titulo: string;
  titulo_en?: string;
  descripcion_breve: string;
  descripcion_breve_en?: string;
  imagen_portada: string;
  precio: number;
}

const cuadernosCarrusel = ref<CuadernoCarrusel[]>([]);
const slideCuadernos = ref(0);

const fetchCuadernosInicio = async () => {
  try {
    const { data, error } = await supabase
      .from('materiales_didacticos')
      // 2. Pedimos las columnas _en a Supabase
      .select(
        'id, titulo, titulo_en, descripcion_breve, descripcion_breve_en, imagen_portada, precio',
      )
      .eq('visible', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;
    if (data) {
      cuadernosCarrusel.value = data as unknown as CuadernoCarrusel[];
    }
  } catch (error) {
    console.error('Error al cargar los cuadernos para el inicio:', error);
  }
};

const defaultAvatar =
  'https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/render/image/public/imagenes/Logotexto_circ.png?width=160&height=160&resize=cover&format=webp';

// Estados para los diálogos
const showLoginDialog = ref(false);
const showOpinionDialog = ref(false);
const enviandoOpinion = ref(false);

// Formulario de nueva opinión
const nuevaOpinion = ref({
  rating: 5,
  name: '',
  country: '',
  comment: '',
});

// Función para manejar el clic en "Danos tu opinión"
const handleDarOpinion = () => {
  if (user.value) {
    // Usuario autenticado: mostrar formulario
    showOpinionDialog.value = true;
  } else {
    // Usuario no autenticado: mostrar diálogo de registro
    showLoginDialog.value = true;
  }
};

// Redirigir a registro
const irARegistro = () => {
  showLoginDialog.value = false;
  if (typeof window !== 'undefined') {
    void router.push('/RegistroCuenta');
  }
};

// Enviar opinión a Supabase
const enviarOpinion = async () => {
  if (!nuevaOpinion.value.comment || !nuevaOpinion.value.country || !nuevaOpinion.value.name) {
    if (typeof window !== 'undefined') {
      $q.notify({
        type: 'warning',
        message: t('indexCompletaTodosLosCampos'),
        position: 'top',
      });
    }
    return;
  }

  enviandoOpinion.value = true;

  try {
    // Intentar update primero
    const { data: existingOpinion, error: fetchOpinionError } = await supabase
      .from('opiniones_verificadas')
      .select('id')
      .eq('user_id', user.value?.id)
      .maybeSingle();

    if (fetchOpinionError) throw fetchOpinionError;

    let error;

    if (existingOpinion) {
      // Update
      const { error: updateError } = await supabase
        .from('opiniones_verificadas')
        .update({
          nombre: nuevaOpinion.value.name,
          rating: nuevaOpinion.value.rating,
          pais: nuevaOpinion.value.country,
          comentario: nuevaOpinion.value.comment,
          created_at: new Date().toISOString(),
          // Al editarla vuelve a quedar pendiente de aprobación (lo exige la política de la BD)
          verified: false,
        })
        .eq('id', existingOpinion.id);

      error = updateError;
    } else {
      // Insert
      const { error: insertError } = await supabase.from('opiniones_verificadas').insert({
        user_id: user.value?.id,
        nombre: nuevaOpinion.value.name,
        email: user.value?.email,
        rating: nuevaOpinion.value.rating,
        pais: nuevaOpinion.value.country,
        comentario: nuevaOpinion.value.comment,
        verified: false,
        created_at: new Date().toISOString(),
      });

      error = insertError;
    }

    if (error) throw error;

    if (typeof window !== 'undefined') {
      $q.notify({
        type: 'positive',
        message: t('indexOpinionEnviada'),
        position: 'top',
      });
    }

    nuevaOpinion.value = {
      rating: 5,
      name: '',
      country: '',
      comment: '',
    };
    showOpinionDialog.value = false;
  } catch (error) {
    console.error('Error al enviar opinión:', error);
    if (typeof window !== 'undefined') {
      $q.notify({
        type: 'negative',
        message: t('indexErrorEnviarOpinion'),
        position: 'top',
      });
    }
  } finally {
    enviandoOpinion.value = false;
  }
};

const todasLasOpiniones = ref<Opinion[]>([]);
const cargandoOpiniones = ref(true);

const fetchOpiniones = async () => {
  try {
    const { data, error } = await supabase
      .from('opiniones_verificadas')
      .select('nombre, pais, rating, comentario, verified, created_at')
      .eq('verified', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) {
      todasLasOpiniones.value = [];
      return;
    }

    todasLasOpiniones.value = (data as SupabaseOpinion[])
      .filter((row): row is SupabaseOpinion => Boolean(row))
      .map((row: SupabaseOpinion) => ({
        name: row.nombre ?? t('indexAnonimo'),
        country: row.pais ?? '—',
        avatar: defaultAvatar,
        rating: row.rating ?? 0,
        comment: row.comentario ?? '',
        verified: Boolean(row.verified),
        date: row.created_at ?? new Date().toISOString(),
        course: 'Spanishnook',
      }));
  } catch (error) {
    console.error('Error al obtener opiniones:', error);
    if (typeof window !== 'undefined') {
      $q.notify({
        type: 'negative',
        message: t('indexErrorEnviarOpinion'),
        position: 'top',
      });
    }
  }
};

// Opiniones y cuadernos se cargan solo en el navegador. Antes el servidor los traía y el
// cliente arrancaba con las listas vacías: el HTML no coincidía (error de hidratación).
onMounted(async () => {
  await Promise.all([fetchOpiniones(), fetchCuadernosInicio()]);
  cargandoOpiniones.value = false;
});

</script>

<style scoped>
/* Hueco del carrusel mientras cargan las opiniones (mismo alto: sin saltos) */
.ini-opiniones-cargando {
  height: 300px;
}
.ini-pagina {
  background: var(--sn-papel);
  color: var(--sn-tinta);
}

/* Tipografía */
.ini-h1 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h1);
  font-weight: 700;
  line-height: 1.1;
  color: var(--sn-burdeos);
  margin: 0 auto 16px;
  max-width: 20ch;
  text-align: center;
}
.ini-h2 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h2);
  font-weight: 700;
  line-height: 1.15;
  color: var(--sn-tinta);
  margin: 0 0 24px;
}
.ini-h2--centro {
  text-align: center;
}
.ini-h3 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h3);
  font-weight: 700;
  margin: 0 0 6px;
  color: var(--sn-tinta);
}
.ini-antetitulo {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-peq);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sn-burdeos);
  margin: 0 0 8px;
}
.ini-antetitulo--centro {
  text-align: center;
}
.ini-entrada {
  font-size: var(--sn-t-entrada);
  line-height: 1.55;
  color: var(--sn-tinta-suave);
  max-width: 56ch;
  margin: 0 auto;
  text-align: center;
}
.ini-parrafo {
  font-size: var(--sn-t-cuerpo);
  line-height: 1.6;
  margin: 0 0 12px;
}

/* Botones */
.ini-boton {
  border-radius: var(--sn-r-boton);
  font-weight: 700;
  padding-inline: 22px;
}

/* 1. Cabecera */
.ini-cabecera {
  padding-block: clamp(32px, 6vw, 64px);
  text-align: center;
}
.ini-entrada--larga {
  max-width: 68ch;
  text-align: left;
  color: var(--sn-tinta);
}
@media (min-width: 700px) {
  .ini-entrada--larga {
    text-align: center;
  }
}

/* 2. Descubre nuestras clases */
.ini-descubre {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: center;
}
@media (min-width: 900px) {
  .ini-descubre {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    gap: 56px;
  }
}
/* Sin borde ni sombra: la ilustración ya es el marco */
.ini-descubre__tarjeta {
  text-align: center;
}
.ini-descubre__img {
  width: min(260px, 70%);
  height: auto;
  display: block;
  margin: 0 auto 16px;
}
.ini-descubre__titulo {
  color: var(--sn-burdeos);
  margin-bottom: 12px;
}
.ini-descubre__tarjeta .ini-parrafo {
  text-align: left;
  margin-bottom: 20px;
}

/* Secciones */
.ini-seccion {
  padding-block: var(--sn-seccion);
}
/* Mismo fondo que la cabecera: sin el hueco de arriba */
.ini-seccion--pegada {
  padding-top: 8px;
}
.ini-seccion--papel {
  background: var(--sn-burdeos-tenue);
}

/* 2. Ofertas */
.ini-ofertas {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 800px) {
  .ini-ofertas {
    grid-template-columns: repeat(3, 1fr);
  }
}
.ini-oferta {
  display: flex;
  flex-direction: column;
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-top: 6px solid var(--sn-sello, var(--sn-burdeos));
  border-radius: var(--sn-r-tarjeta);
  overflow: hidden;
  box-shadow: var(--sn-sombra);
  color: inherit;
  text-decoration: none;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.ini-oferta:hover {
  box-shadow: var(--sn-sombra-alta);
  transform: translateY(-2px);
}
.ini-oferta__img {
  background: var(--sn-sello-tenue, var(--sn-papel));
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ini-oferta__img img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.ini-oferta__cuerpo {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px 22px 22px;
}
.ini-oferta__texto {
  margin: 0 0 12px;
  line-height: 1.5;
  color: var(--sn-tinta-suave);
}
.ini-oferta__precio {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  font-size: var(--sn-t-h4);
  color: var(--sn-sello, var(--sn-burdeos));
  margin: 0 0 12px;
}
.ini-oferta__ir {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: auto;
  font-weight: 700;
  color: var(--sn-burdeos);
}

/* 3. Ventajas */
.ini-ventajas {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px 32px;
  max-width: 900px;
  margin-inline: auto;
}
@media (min-width: 700px) {
  .ini-ventajas {
    grid-template-columns: 1fr 1fr;
  }
}
.ini-ventajas li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  line-height: 1.5;
}
.ini-ventajas__icono {
  flex: none;
  font-size: 22px;
  color: var(--sn-burdeos);
  background: var(--sn-burdeos-tenue);
  border-radius: 50%;
  padding: 8px;
}

/* 7. Quién hay detrás */
.ini-quien {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: center;
}
.ini-quien__foto {
  width: min(240px, 64vw);
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 50%;
  justify-self: center;
  box-shadow: var(--sn-sombra);
}
@media (min-width: 800px) {
  .ini-quien {
    grid-template-columns: 240px 1fr;
    gap: 48px;
  }
}

/* 6. Materiales: hoja con el estilo común de q-card */
.carta-contenido {
  width: 100%;
  max-width: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
/* Precio: etiqueta discreta en tinta; gratis en verde */
.ini-material__precio {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: var(--sn-r-boton);
  background: var(--sn-hoja);
  color: var(--sn-tinta);
  font-weight: 800;
  font-size: var(--sn-t-peq);
}
.ini-material__precio--gratis {
  color: var(--sn-oliva);
}

/* 8. Preguntas frecuentes: lista con líneas, sin iconos */
.ini-faq {
  max-width: 820px;
}
.ini-faq__lista {
  border-top: 1px solid var(--sn-borde);
}
.ini-faq__lista > .q-expansion-item {
  border-bottom: 1px solid var(--sn-borde);
}
.ini-faq :deep(.ini-faq__pregunta) {
  padding: 18px 4px;
  font-family: var(--sn-fuente-titulos);
  font-weight: 600;
  font-size: var(--sn-t-h4);
  line-height: 1.35;
  color: var(--sn-tinta);
}
.ini-faq__respuesta {
  margin: 0;
  padding: 0 4px 20px;
  max-width: var(--sn-prosa);
  line-height: 1.6;
  color: var(--sn-tinta-suave);
}

/* 9. Contacto */
.ini-contacto {
  text-align: center;
}
</style>
