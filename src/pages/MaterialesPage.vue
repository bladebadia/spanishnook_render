<template>
  <q-page class="q-pa-md">
    <div class="row cabecera-row full-width q-mt-xl">
      <div class="col-12 align-self-center q-pa-md flex column items-center">
        <div class="text-center q-mb-xl q-mt-md">
          <h1 class="text-h3 text-primary q-mb-sm">
            {{ $t('MaterialesPage.titulo1') }}
          </h1>
          <br />
          <br />
          <p class="texto-responsivo text-justify text-weight-bold">
            {{ $t('MaterialesPage.descripcion') }}
          </p>
          <br />
          <p class="texto-responsivo text-justify">{{ $t('MaterialesPage.descripcion2') }}</p>
          <br />
          <p class="texto-responsivo text-center text-primary text-weight-bold">
            {{ $t('MaterialesPage.claim') }}
          </p>
          <br />
          <br />
          <br />
          <br />
          <p class="subtitulo-responsivo text-center text-weight-bold">
            {{ $t('MaterialesPage.quehay') }}
          </p>

          <q-card class="q-mt-sm">
            <q-card-section class="texto-responsivo text-justify">
              <ul class="q-pl-md text-justify">
                <li>
                  <strong>{{ $t('MaterialesPage.contenido1bold') }}</strong>
                  {{ $t('MaterialesPage.contenido1') }}
                </li>
                <li>
                  <strong>{{ $t('MaterialesPage.contenido2bold') }}</strong>
                  {{ $t('MaterialesPage.contenido2') }}
                </li>
                <li>
                  <strong>{{ $t('MaterialesPage.contenido3bold') }}</strong>
                  {{ $t('MaterialesPage.contenido3') }}
                </li>
                <li>
                  <strong>{{ $t('MaterialesPage.contenido4bold') }}</strong>
                  {{ $t('MaterialesPage.contenido4') }}
                </li>
                <li>
                  <strong>{{ $t('MaterialesPage.contenido5bold') }}</strong>
                  {{ $t('MaterialesPage.contenido5') }}
                </li>
              </ul>
            </q-card-section>
          </q-card>
        </div>

        <!-- Pantalla de carga -->
        <div v-if="cargando" class="row justify-center q-pa-xl">
          <q-spinner-dots color="primary" size="3em" />
        </div>

        <!-- Mensaje si no hay nada visible -->
        <q-card
          v-else-if="materiales.length === 0"
          flat
          bordered
          class="q-pa-xl text-center bg-grey-1"
        >
          <q-icon name="inventory_2" size="64px" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">Próximamente nuevos materiales...</div>
        </q-card>

        <!-- Catálogo de materiales -->
        <div
          v-else
          class="row q-col-gutter-xl full-width justify-center"
          style="max-width: 1200px; margin: 0 auto"
        >
          <div class="col-12 col-sm-6 col-md-4" v-for="mat in materiales" :key="mat.id">
            <q-card
              class="carta-contenido shadow-4 cursor-pointer"
              style="
                width: 100%;
                max-width: 320px;
                min-width: 280px;
                margin: 0 auto;
                height: 100%;
                display: flex;
                flex-direction: column;
              "
              @click="abrirMaterial(mat)"
            >
              <q-img
                :src="mat.imagen_portada || 'https://via.placeholder.com/300x200?text=Sin+Portada'"
                height="200px"
              >
                <div
                  class="badge-hs bg-positive text-white text-weight-bold shadow-3"
                  v-if="mat.precio === 0 || !mat.precio"
                >
                  GRATIS
                </div>
                <div class="badge-hs bg-negative text-white text-weight-bold shadow-3" v-else>
                  {{ mat.precio }} €
                </div>
              </q-img>

              <q-card-section class="col-grow text-center q-pa-md flex column justify-center">
                <div class="text-h6 text-weight-bold q-mb-sm" style="line-height: 1.2">
                  {{ locale === 'en-US' && mat.titulo_en ? mat.titulo_en : mat.titulo }}
                </div>
                <div class="text-body2 text-grey-8 ellipsis-3-lines">
                  {{
                    locale === 'en-US' && mat.descripcion_breve_en
                      ? mat.descripcion_breve_en
                      : mat.descripcion_breve
                  }}
                </div>
              </q-card-section>

              <q-card-actions align="center" class="q-pa-md q-pt-none">
                <q-btn
                  color="primary"
                  rounded
                  unelevated
                  label="VER DETALLES"
                  class="full-width text-weight-bold"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="modalVisible">
      <!-- 1. Tarjeta normal, sin clase column ni alturas raras -->
      <q-card style="max-width: 700px; width: 100%; border-radius: 12px; overflow: hidden">
        <!-- 2. Aquí está el truco: le decimos a esta sección que ocupe máximo el 70% de la pantalla (70vh). Si se pasa, hace scroll interno -->
        <q-card-section class="scroll q-pa-none" style="max-height: 70vh">
          <q-img
            :src="
              materialSeleccionado?.imagen_portada ||
              'https://via.placeholder.com/700x300?text=Sin+Portada'
            "
            height="280px"
          />
          <div class="q-pa-lg">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h5 text-weight-bold text-primary">
                {{
                  locale === 'en-US' && materialSeleccionado?.titulo_en
                    ? materialSeleccionado?.titulo_en
                    : materialSeleccionado?.titulo
                }}
              </div>
              <q-chip color="primary" text-color="white" size="lg" class="text-weight-bold">
                {{ materialSeleccionado?.precio }}€
              </q-chip>
            </div>

            <!-- VÍDEO DE YOUTUBE INCRUSTADO (Solo sale si hay enlace) -->
            <div v-if="materialSeleccionado?.youtube_url" class="q-my-md">
              <q-video
                :src="getYoutubeEmbedUrl(materialSeleccionado.youtube_url)"
                style="height: 300px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)"
              />
            </div>

            <div
              class="text-body1 text-grey-9 q-mt-md"
              style="white-space: pre-line; line-height: 1.6"
            >
              {{
                locale === 'en-US'
                  ? materialSeleccionado?.descripcion_larga_en ||
                    materialSeleccionado?.descripcion_breve_en ||
                    materialSeleccionado?.descripcion_larga ||
                    materialSeleccionado?.descripcion_breve
                  : materialSeleccionado?.descripcion_larga ||
                    materialSeleccionado?.descripcion_breve
              }}
            </div>
          </div>
        </q-card-section>

        <!-- 3. Los botones ahora están a salvo fuera del área de scroll -->
        <q-separator />
        <q-card-actions align="right" class="q-pa-md bg-grey-2">
          <q-btn flat label="Cerrar" color="grey-8" v-close-popup />

          <q-btn
            v-if="
              yaLoTieneComprado(materialSeleccionado?.id) ||
              materialSeleccionado?.precio === 0 ||
              !materialSeleccionado?.precio
            "
            color="positive"
            icon="download"
            :label="
              materialSeleccionado?.precio === 0 || !materialSeleccionado?.precio
                ? 'Descargar Gratis'
                : 'Descargar PDF'
            "
            unelevated
            @click="descargarPdf(materialSeleccionado)"
          />

          <q-btn
            v-else
            color="primary"
            icon="shopping_cart"
            :label="`Comprar por ${materialSeleccionado?.precio}€`"
            unelevated
            :loading="procesandoPago"
            @click="comprarConStripe(materialSeleccionado)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from 'src/supabaseClient';
import { useQuasar, useMeta } from 'quasar';
import { useAuth } from 'src/stores/auth';
import { useI18n } from 'vue-i18n'; // <-- IMPORTAMOS EL IDIOMA

const $q = useQuasar();
const { user } = useAuth();
const { locale, t } = useI18n();
// `t` se utiliza desde la plantilla; evitamos la regla de "no-unused-vars" referenciándola aquí
void t;

useMeta(() => ({
  title: 'Materiales de Español | SpanishNook',
  meta: {
    description: {
      name: 'description',
      content:
        'Materiales y recursos para aprender español online. Ejercicios, gramática, vocabulario y actividades prácticas de SpanishNook.',
    },
    keywords: {
      name: 'keywords',
      content:
        'materiales español, recursos aprender español, ejercicios español, gramática español, vocabulario español, actividades español, SpanishNook',
    },
    ogTitle: {
      property: 'og:title',
      content: 'Materiales de Español | SpanishNook',
    },
    ogDescription: {
      property: 'og:description',
      content:
        'Materiales y recursos para aprender español online: ejercicios, gramática y vocabulario.',
    },
    ogImage: {
      property: 'og:image',
      content: 'https://www.spanishnook.com/img/Logo_rectangular_320.png',
    },
    ogUrl: {
      property: 'og:url',
      content: 'https://www.spanishnook.com/Materiales',
    },
    robots: {
      name: 'robots',
      content: 'index,follow',
    },
  },
}));

// Añadimos las columnas _en a la interfaz
interface Material {
  id: number;
  titulo: string;
  titulo_en?: string;
  descripcion_breve: string;
  descripcion_breve_en?: string;
  descripcion_larga: string;
  descripcion_larga_en?: string;
  precio: number;
  imagen_portada?: string;
  archivo_pdf?: string;
  visible: boolean;
  youtube_url?: string;
}

const materiales = ref<Material[]>([]);
const misCompras = ref<number[]>([]);
const cargando = ref(true);

// Variables del Modal
const modalVisible = ref(false);
const materialSeleccionado = ref<Material | null>(null);
const procesandoPago = ref(false);

const getYoutubeEmbedUrl = (url?: string) => {
  if (!url) return '';
  // Expresión regular limpia para complacer a ESLint
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  // Condición segura para TypeScript
  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return '';
};

const cargarCatalogo = async () => {
  cargando.value = true;
  try {
    const { data, error } = await supabase
      .from('materiales_didacticos')
      .select('*')
      .eq('visible', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    materiales.value = data || [];
  } catch (error) {
    console.error('Error cargando materiales:', error);
    $q.notify({ type: 'negative', message: 'No se pudo cargar el catálogo.' });
  } finally {
    cargando.value = false;
  }
};

const cargarMisCompras = async () => {
  if (!user.value?.id) return;
  try {
    const { data, error } = await supabase
      .from('compras_materiales')
      .select('material_id')
      .eq('user_id', user.value.id);

    if (!error && data) {
      misCompras.value = data.map((c) => c.material_id);
    }
  } catch (err) {
    console.error('Error cargando compras:', err);
  }
};

const abrirMaterial = (material: Material) => {
  materialSeleccionado.value = material;
  modalVisible.value = true;
};

const yaLoTieneComprado = (id?: number) => {
  if (!id) return false;
  return misCompras.value.includes(id);
};

const descargarPdf = async (mat: Material | null) => {
  if (!user.value) {
    $q.notify({ type: 'warning', message: 'Debes iniciar sesión para descargar este material.' });
    return;
  }
  if (!mat?.archivo_pdf) {
    $q.notify({ type: 'warning', message: 'Este material no tiene PDF adjunto.' });
    return;
  }

  // Generamos un enlace seguro y único que caduca en 60 segundos
  const { data, error } = await supabase.storage
    .from('pdfs_materiales')
    .createSignedUrl(mat.archivo_pdf, 60);

  if (error) {
    console.error('Error al generar el enlace seguro:', error);
    $q.notify({ type: 'negative', message: 'Error al autorizar la descarga.' });
    return;
  }

  if (data?.signedUrl) {
    window.open(data.signedUrl, '_blank');
  }
};

const comprarConStripe = async (mat: Material | null) => {
  // 1. El freno para que TypeScript se calle
  if (!mat) return;

  if (!user.value) {
    $q.notify({ type: 'warning', message: 'Debes iniciar sesión para comprar.' });
    return;
  }

  procesandoPago.value = true;
  try {
    const { data, error } = await supabase.functions.invoke('checkout-material', {
      body: {
        materialId: mat.id,
        titulo: mat.titulo,
        precio: mat.precio,
        returnUrl: `${window.location.origin}/Materiales?pago=completado`,
        userId: user.value.id,
      },
    });

    if (error) throw error;

    if (data?.url) {
      window.location.href = data.url;
    } else {
      throw new Error('No se recibió la URL de pago');
    }
  } catch (error) {
    console.error('Fallo en Stripe:', error);
    $q.notify({ type: 'negative', message: 'Error conectando con la pasarela de pago.' });
  } finally {
    procesandoPago.value = false;
  }
};

onMounted(() => {
  void cargarCatalogo();
  void cargarMisCompras();
});
</script>

<style scoped>
.material-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.material-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

/* Etiqueta roja en la esquina */
.badge-hs {
  position: absolute;
  top: 10px;
  right: -10px;
  padding: 6px 16px;
  border-radius: 20px;
  transform: rotate(5deg);
  border: 2px solid white;
  z-index: 2;
}
</style>
