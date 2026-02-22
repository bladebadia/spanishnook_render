<template>
  <q-page>
    <!-- Banner principal OK-->
    <div>
      <q-img
        fit="cover"
        position="center"
        src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/banner_1920.webp"
      >
      </q-img>
    </div>
    <!-- Sección introductoria OK-->
    <div class="items-center text-center q-my-xl">
      <p class="titulo-responsivo font-weight: 700" style="color: #851319">
        {{ t('indexeUnLugarDonde') }}
      </p>

      <p class="texto-responsivo text-justify" style="margin-left: 13%; margin-right: 13%">
        {{ t('indexAprenderEspañolPuede') }}
      </p>
      <q-btn class="oval-btn" no-caps items-center color="primary" unelevated to="/Clases">
        {{ t('indexCreaTuEspacio') }}
      </q-btn>
    </div>
    <!--Tarjeta descubre nuestras clases y lista OK-->
    <div v-intersect="onPromoIntersect" class="row justify-center q-my-xl">
      <transition enter-active-class="animated fadeInUpBig slower ">
        <div v-if="showPromoCard" class="row align-center">
          <div class="col-12 col-md-6 items-center flex flex-center column">
            <q-card
              class=""
              style="
                width: 80%;
                min-height: 420px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              "
            >
              <img
                src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/inicio_principal_OK.png"
                fit="cover"
                style="
                  width: 50%;
                  height: auto;
                  max-height: 300px;
                  display: block;
                  margin: 20px auto;
                "
              />
              <q-card-section class="subtitulo-responsivo text-center">{{
                t('indexDescubreNuestrasClases')
              }}</q-card-section>
              <q-card-section class="texto-responsivo text-justify">
                {{ t('indexDescubreNuestrasClasesTexto') }}
              </q-card-section>
              <q-card-actions class="flex justify-center">
                <q-btn color="primary" to="/Clases" unelevated class="text-weight-bold">
                  {{ t('indexEncuentraTusClases') }}
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
          <div class="col-12 col-md-6 q-pa-md">
            <p class="subtitulo-responsivo text-center">{{ t('indexQueEncontraras') }}</p>
            <ul class="lista-check" style="font-size: 1.2rem">
              <li class="q-py-xs">{{ t('indexclasesEnVivo') }}</li>
              <li class="q-py-xs">{{ t('indexdiferentesModalidades') }}</li>
              <li class="q-py-xs">{{ t('indexseguimientoContinuo') }}</li>
              <li class="q-py-xs">{{ t('indexClasesAdaptadas') }}</li>
              <li class="q-py-xs">{{ t('indexMaterialesExclusivos') }}</li>
              <li class="q-py-xs">{{ t('indexAmbienteRelajado') }}</li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
    <!-- Tarjetas de promoción de clases OK -->
    <div v-intersect="onPromoIntersect1" class="q-my-xs row justify-center bg-grey-2">
      <transition enter-active-class="animated fadeInUpBig slower ">
        <div v-if="showPromoCard1" class="row" enter-active-class="animated fadeInUpBig slower ">
          <div class="col-12 items-center flex flex-center column q-my-md q-mb-md-xl">
            <p class="titulo-responsivo2 text-center q-mb-md" text-color="#851319">
              {{ t('indexDiferentesCaminos') }}
            </p>

            <p class="texto-responsivo text-center text-bold" style="color: #525553">
              {{ t('indexAprendeEnDirecto') }}
            </p>
          </div>
          <q-separator class="q-my-xl" />

          <div class="col-12 promocards-container">
            <!-- Componente 1: Clases Privadas -->
            <PromoCard
              :image-src="'https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/clases-spanish-inicio-individuales.png'"
              :title="t('indexClasesPrivadas')"
              :description="t('indexAvanzaEnTu')"
              :button-text="t('indexQuieroMiClase')"
              :to="{ path: '/Clases', hash: '#clases-individuales' }"
            />
            <!-- Componente 2: Clases Grupales 
              <PromoCard
                :image-src="'https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/clases-spanish-inicio-grupo.png'"
                :title="t('indexClasesGrupales')"
                :description="t('indexAprendeEspañol')"
                :button-text="t('indexAprenderEnGrupo')"
                :to="{ path: '/Clases', hash: '#clases-conversacion' }"
              />   -->
            <!-- Componente 3: Clases de Conversación -->
            <PromoCard
              :image-src="'https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/clases-spanish-inicio-conversacion.png'"
              :title="t('indexClasesDeConversacion')"
              :description="t('indexMejoraTuConfianza')"
              :button-text="t('indexUneteALaLista')"
              :to="{ path: '/Clases', hash: '#clases-conversacion' }"
            />
          </div>
        </div>
      </transition>
    </div>
    <!-- Banner promocional test nivel que aparece al hacer scroll OK-->
    <div
      v-intersect="onPromoIntersect2"
      class="q-mt-xl q-mb-xl row degradado-fondo"
      style="min-height: 300px; width: 100%"
    >
      <transition enter-active-class="animated fadeInUpBig slower ">
        <div
          v-if="showPromoCard2"
          class="row"
          style="width: 100%; position: relative"
          enter-active-class="animated fadeInUpBig slower "
        >
          <div class="col-12 q-pa-none q-pa-md-lg" style="position: absolute; top: 15%">
            <p class="titulo-responsivo1" style="color: #fff">
              <strong>{{ t('indexDescubreTuPunto') }}</strong>
            </p>
            <p class="texto-responsivo" style="color: #fffdf8; margin-left: 1.45%; padding-left: 0">
              {{ t('indexEnSolo') }}
            </p>
            <q-btn color="black" to="/TestNivel" class="oval-btn q-mx-lg" unelevated>{{
              t('indexHacerTest')
            }}</q-btn>
          </div>
        </div>
      </transition>
    </div>
    <!-- Tarjeta sobre quién hay detrás de Spanishnook OK-->
    <div v-intersect="onPromoIntersect4" class="q-mt-xl q-mb-xl row flex flex-center">
      <transition enter-active-class="animated fadeInUpBig slower ">
        <div
          v-if="showPromoCard4"
          class="row justify-center"
          enter-active-class="animated fadeInUpBig slower "
        >
          <q-card class="items-center tarjeta-quien">
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img
                    src="https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/clases-spanish-sobre-perfil.png"
                  />
                </q-avatar>
              </q-item-section>
              <q-item-label class="titulo-responsivo1 q-pa-md q-ma-md-lg text-bold">
                {{ t('indexQuienHayDetras') }}
              </q-item-label>
            </q-item>
            <q-separator />
            <q-item class="flex flex-justify q-pa-md">
              <q-item-label class="text-justify" style="width: 100%; font-size: 1rem">
                {{ t('indexDetrasDeSpanishnook1') }}
                <br /><br />
                {{ t('indexDetrasDeSpanishnook2') }}
                <br /><br />
                <strong>{{ t('indexDetrasDeSpanishnook3') }}</strong>
              </q-item-label>
            </q-item>
            <q-card-actions class="flex flex-center">
              <q-btn
                color="primary"
                to="/SobreSpanish"
                size="lg"
                unelevated
                class="text-weight-bold"
                style="font-size: 1rem"
              >
                {{ t('indexMasSobreSpanishnook') }}
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </transition>
    </div>
    <!-- Sección de Opiniones Verificadas - CARRUSEL -->
    <div v-intersect="onOpinionesIntersect" class="opiniones-section bg-grey-1">
      <transition enter-active-class="animated fadeInUpBig slower">
        <div v-if="showOpiniones" class="q-py-xl q-px-md">
          <div class="text-center q-mb-xl">
            <p class="subtitulo-responsivo" style="color: #851319">
              {{ t('indexOpinionesVerificadas') }}
            </p>
            <p class="texto-responsivo">
              {{ t('indexConoceExperiencias') }}
            </p>
          </div>

          <!-- Carrusel de Opiniones -->
          <div class="carousel-container">
            <template v-if="todasLasOpiniones.length === 0">
              <div class="row justify-center full-height items-center">
                <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 text-center q-pa-xl">
                  <div class="texto-responsivo text-grey-7">
                    {{ t('indexSeElPrimeroEnOpinar', 'Sé el primero en dejar tu reseña') }}
                  </div>
                </div>
              </div>
            </template>
            <q-carousel
              v-else
              v-model="currentSlide"
              transition-prev="slide-right"
              transition-next="slide-left"
              swipeable
              animated
              control-color="primary"
              :autoplay="5000"
              arrows
              height="300px"
              class="opinions-carousel"
            >
              <!-- Slides del carrusel - mostrar 1 -->
              <q-carousel-slide
                v-for="(opinion, index) in todasLasOpiniones"
                :key="index"
                :name="index"
                class="q-pa-none"
              >
                <div class="row justify-center full-height items-center">
                  <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                    <OpinioneVerificadas
                      :opinion="opinion"
                      :show-avatar="false"
                      class="single-opinion-card"
                    />
                  </div>
                </div>
              </q-carousel-slide>

              <!-- Controles personalizados -->
              <template v-slot:control>
                <q-carousel-control
                  position="bottom-right"
                  :offset="[18, 18]"
                  class="text-white rounded-borders"
                  style="background: rgba(0, 0, 0, 0.3); padding: 4px 8px"
                >
                  <q-icon name="star" size="sm" class="q-mr-xs" />
                  {{ currentSlide + 1 }} / {{ todasLasOpiniones.length }}
                </q-carousel-control>
              </template>

              <!-- Flechas personalizadas -->
              <!-- Eliminado cierre/apertura incorrecto de <q-no-ssr> -->
              <template v-slot:navigation-icon="{ active, btnProps, onClick }">
                <q-btn
                  v-if="btnProps.icon === 'chevron_left'"
                  :class="{ 'text-primary': active }"
                  color="white"
                  text-color="primary"
                  :icon="btnProps.icon"
                  size="lg"
                  round
                  dense
                  :disable="btnProps.disable"
                  @click="onClick"
                  class="carousel-arrow carousel-arrow-right"
                />
              </template>
            </q-carousel>

            <!-- Indicadores de slide personalizados -->
            <div class="carousel-indicators q-mt-md">
              <q-btn
                v-for="(opinion, index) in todasLasOpiniones"
                :key="index"
                :class="{ active: currentSlide === index }"
                @click="currentSlide = index"
                round
                dense
                size="sm"
                :color="currentSlide === index ? 'primary' : 'grey-5'"
                class="q-mx-xs"
              >
                <q-tooltip :delay="500" class="bg-primary">
                  {{ opinion.name }} - {{ opinion.country }}
                </q-tooltip>
              </q-btn>
            </div>

            <!-- Botón para dar opinión -->
            <div class="text-center q-mt-xl">
              <q-btn outline color="primary" size="lg" @click="handleDarOpinion" class="oval-btn">
                {{ t('indexDanosTuOpinion') }}
              </q-btn>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <!-- Sección de FAQs -->
    <div class="faqs-section">
      <p class="subtitulo-responsivo" style="margin-bottom: 40px">
        {{ t('indexPreguntasFrecuentes') }}
      </p>
      <q-expansion-item class="q-mb-md" expand-separator>
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="help" color="primary" text-color="white" class="faqs-icon" />
          </q-item-section>
          <p class="subtitulo2-responsivo q-pt-xs">{{ t('indexComoFuncionanClases') }}</p>
        </template>
        <div class="texto2-responsivo text-justify q-px-xl q-mx-md">
          {{ t('indexTodasClasesEnVivo') }}
        </div>
      </q-expansion-item>

      <q-expansion-item class="q-mb-md" expand-separator>
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="help" color="primary" text-color="white" class="faqs-icon" />
          </q-item-section>
          <p class="subtitulo2-responsivo q-pt-xs">{{ t('indexQueNecesitoParaEmpezar') }}</p>
        </template>
        <div class="texto2-responsivo text-justify q-px-xl q-mx-md">
          {{ t('indexSoloNecesito') }}
        </div>
      </q-expansion-item>

      <q-expansion-item class="q-mb-md" expand-separator>
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="help" color="primary" text-color="white" class="faqs-icon" />
          </q-item-section>
          <p class="subtitulo2-responsivo q-pt-xs">{{ t('indexPuedoCambiarDeModalidad') }}</p>
        </template>
        <div class="texto2-responsivo text-justify q-px-xl q-mx-md">
          {{ t('indexClaroQueremos') }}
        </div>
      </q-expansion-item>

      <q-expansion-item class="q-mb-md" expand-separator>
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="help" color="primary" text-color="white" class="faqs-icon" />
          </q-item-section>
          <p class="subtitulo2-responsivo q-pt-xs">{{ t('indexQueNivelDeEspañol') }}</p>
        </template>
        <div class="texto2-responsivo text-justify q-px-xl q-mx-md">
          {{ t('indexNoNecesitoNingun') }}
        </div>
      </q-expansion-item>

      <q-expansion-item class="q-mb-md" expand-separator>
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="help" color="primary" text-color="white" />
          </q-item-section>
          <p class="subtitulo2-responsivo q-pt-xs">{{ t('indexQuePasaSiNoPuedoAsistir') }}</p>
        </template>
        <div class="texto2-responsivo text-justify q-px-xl q-mx-md">
          {{ t('indexDependeraDeLaModalidad') }}
        </div>
      </q-expansion-item>
    </div>

    <!-- Sección de Contacto -->
    <div class="q-my-xl contacto-section flex flex-center column items-center">
      <p class="titulo-responsivo" style="color: #851319">{{ t('indexAunTienesDudas') }}</p>
      <p class="texto-responsivo">
        {{ t('indexEstamosAlOtroLado') }}
      </p>
      <q-btn color="primary" size="lg" unelevated to="/Contacto" class="oval-btn" no-caps>
        {{ t('indexContactanos') }}
      </q-btn>
    </div>
    <div class="q-my-xl"></div>

    <!-- Diálogo para no autenticados -->
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

    <!-- Diálogo para dar opinión (usuarios autenticados) -->
    <q-dialog v-model="showOpinionDialog" persistent>
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ t('indexComparteTuExperiencia') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="enviarOpinion" class="q-gutter-md">
            <!-- Calificación -->
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

            <!-- En el formulario, después de Calificación, antes de País -->
            <q-input
              v-model="nuevaOpinion.name"
              :label="t('indexNombre')"
              outlined
              :rules="[(val: string) => !!val || t('indexCampoRequerido')]"
            />

            <!-- País -->
            <q-input
              v-model="nuevaOpinion.country"
              :label="t('indexPais')"
              outlined
              :rules="[(val: string) => !!val || t('indexCampoRequerido')]"
            />

            <!-- Comentario -->
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
    <!-- cierre eliminado: </q-no-ssr> -->
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuth } from '../stores/auth';
import { supabase } from '../supabaseClient';
import { useMeta } from 'quasar';

// Importar los estilos CSS
import '../css/pages/IndexPage.css';
import '../css/pages/EstilosGenerales.css';
import PromoCard from '../components/PromoCard.vue';
import OpinioneVerificadas from '../components/OpinioneVerificadas.vue';

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
      content: 'SpanishNook',
    },
    ogDescription: {
      property: 'og:description',
      content: 'Clases de español online con profesores nativos.',
    },
    ogImage: {
      property: 'og:image',
      content:
        'https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/Logotexto_circ.png',
    },
    robots: {
      name: 'robots',
      content: 'index,follow',
    },
  },
}));

const showPromoCard = ref(false);
const showPromoCard1 = ref(false);
const showPromoCard2 = ref(false);
const showOpiniones = ref(false);
const showPromoCard4 = ref(false);
const currentSlide = ref(0);
const { t } = useI18n();
const router = useRouter();
const $q = useQuasar();
const { user } = useAuth();

const defaultAvatar =
  'https://zleqsdfpjepdangitcxv.supabase.co/storage/v1/object/public/imagenes/Logotexto_circ.png';

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

import { onServerPrefetch } from 'vue';
const todasLasOpiniones = ref<Opinion[]>([]);

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
        name: row.nombre ?? 'Anónimo',
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

if (process.env.CLIENT) {
  onMounted(() => {
    void fetchOpiniones();
  });
} else {
  onServerPrefetch(async () => {
    await fetchOpiniones();
  });
}

function onPromoIntersect(entry: IntersectionObserverEntry): boolean {
  if (entry.isIntersecting) {
    showPromoCard.value = true;
  }
  return true;
}

function onPromoIntersect1(entry: IntersectionObserverEntry): boolean {
  if (entry.isIntersecting) {
    showPromoCard1.value = true;
  }
  return true;
}

function onPromoIntersect2(entry: IntersectionObserverEntry): boolean {
  if (entry.isIntersecting) {
    showPromoCard2.value = true;
  }
  return true;
}

function onPromoIntersect4(entry: IntersectionObserverEntry): boolean {
  if (entry.isIntersecting) {
    showPromoCard4.value = true;
  }
  return true;
}

function onOpinionesIntersect(entry: IntersectionObserverEntry): boolean {
  if (entry.isIntersecting) {
    showOpiniones.value = true;
  }
  return true;
}
</script>

<style></style>
