<template>
  <q-page class="ma-pagina">
    <!-- Cabecera corta: lo importante son los cuadernos -->
    <section class="sn-contenedor ma-cabecera">
      <h1 class="ma-h1">{{ t('MaterialesPage.titulo1') }}</h1>
      <p class="ma-entrada">{{ t('MaterialesPage.descripcion') }}</p>
      <p class="ma-claim">{{ t('MaterialesPage.claim') }}</p>
    </section>

    <!-- Catálogo -->
    <section class="sn-contenedor ma-catalogo">
      <div v-if="cargando" class="row justify-center q-pa-xl">
        <q-spinner-dots color="primary" size="3em" />
      </div>

      <div v-else-if="materiales.length === 0" class="ma-vacio">
        <q-icon name="inventory_2" size="48px" />
        <p>{{ t('MaterialesPage.proximamente') }}</p>
      </div>

      <div v-else class="ma-rejilla">
        <article
          v-for="mat in materiales"
          :key="mat.id"
          class="ma-tarjeta"
          tabindex="0"
          role="button"
          @click="abrirMaterial(mat)"
          @keydown.enter="abrirMaterial(mat)"
        >
          <div class="ma-tarjeta__portada">
            <img
              :src="mat.imagen_portada || '/img/Logo_rectangular_320.png'"
              :alt="locale === 'en-US' && mat.titulo_en ? mat.titulo_en : mat.titulo"
              loading="lazy"
            />
            <span class="ma-precio" :class="{ 'ma-precio--gratis': esGratis(mat) }">
              {{ esGratis(mat) ? t('MaterialesPage.gratis') : `${mat.precio} €` }}
            </span>
          </div>
          <div class="ma-tarjeta__cuerpo">
            <h2 class="ma-tarjeta__titulo">
              {{ locale === 'en-US' && mat.titulo_en ? mat.titulo_en : mat.titulo }}
            </h2>
            <p class="ma-tarjeta__texto">
              {{
                locale === 'en-US' && mat.descripcion_breve_en
                  ? mat.descripcion_breve_en
                  : mat.descripcion_breve
              }}
            </p>
            <span class="ma-tarjeta__ir">
              {{ t('MaterialesPage.verDetalles') }}
              <q-icon name="arrow_forward" size="18px" />
            </span>
          </div>
        </article>
      </div>
    </section>

    <!-- Qué hay en cada cuaderno -->
    <section class="ma-seccion">
      <div class="sn-contenedor ma-contenido">
        <div>
          <h2 class="ma-h2">{{ t('MaterialesPage.quehay') }}</h2>
          <p class="ma-parrafo">{{ t('MaterialesPage.descripcion2') }}</p>
        </div>
        <ul class="ma-checks">
          <li v-for="n in 5" :key="n">
            <q-icon :name="ICONOS_CONTENIDO[n - 1]" class="ma-checks__icono" />
            <span>
              <strong>{{ t(`MaterialesPage.contenido${n}bold`) }}</strong>
              {{ t(`MaterialesPage.contenido${n}`) }}
            </span>
          </li>
        </ul>
      </div>
    </section>

    <q-dialog v-model="modalVisible">
      <!-- 1. Tarjeta normal, sin clase column ni alturas raras -->
      <q-card style="max-width: 700px; width: 100%; border-radius: 12px; overflow: hidden">
        <!-- 2. Aquí está el truco: le decimos a esta sección que ocupe máximo el 70% de la pantalla (70vh). Si se pasa, hace scroll interno -->
        <q-card-section class="scroll q-pa-none" style="max-height: 70vh">
          <q-img
            :src="
              materialSeleccionado?.imagen_portada ||
              '/img/Logo_rectangular_320.png'
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
                {{
                  materialSeleccionado && esGratis(materialSeleccionado)
                    ? t('MaterialesPage.gratis')
                    : `${materialSeleccionado?.precio} €`
                }}
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
          <q-btn flat :label="t('MaterialesPage.cerrar')" color="grey-8" v-close-popup />

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
                ? t('MaterialesPage.descargarGratis')
                : t('MaterialesPage.descargarPdf')
            "
            unelevated
            @click="descargarPdf(materialSeleccionado)"
          />

          <q-btn
            v-else
            color="primary"
            icon="shopping_cart"
            :label="t('MaterialesPage.comprarPor', { precio: materialSeleccionado?.precio })"
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
import '../css/pages/EstilosGenerales.css';

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

// Iconos de la lista "¿Qué hay en cada cuaderno?" (contenido1 a contenido5)
const ICONOS_CONTENIDO = ['translate', 'headphones', 'edit_note', 'spellcheck', 'fact_check'];

const esGratis = (mat: Material) => !mat.precio || Number(mat.precio) === 0;
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
    $q.notify({ type: 'negative', message: t('MaterialesPage.errorCatalogo') });
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
    $q.notify({ type: 'warning', message: t('MaterialesPage.loginDescargar') });
    return;
  }
  if (!mat?.archivo_pdf) {
    $q.notify({ type: 'warning', message: t('MaterialesPage.sinPdf') });
    return;
  }

  // Generamos un enlace seguro y único que caduca en 60 segundos
  const { data, error } = await supabase.storage
    .from('pdfs_materiales')
    .createSignedUrl(mat.archivo_pdf, 60);

  if (error) {
    console.error('Error al generar el enlace seguro:', error);
    $q.notify({ type: 'negative', message: t('MaterialesPage.errorDescarga') });
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
    $q.notify({ type: 'warning', message: t('MaterialesPage.loginComprar') });
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
    $q.notify({ type: 'negative', message: t('MaterialesPage.errorPasarela') });
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
.ma-pagina {
  background: var(--sn-papel);
  color: var(--sn-tinta);
}
.ma-cabecera {
  padding-block: clamp(32px, 6vw, 56px) 24px;
  text-align: center;
}
.ma-h1 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h1);
  font-weight: 700;
  line-height: 1.1;
  color: var(--sn-burdeos);
  margin: 0 0 16px;
}
.ma-entrada {
  font-size: var(--sn-t-entrada);
  line-height: 1.55;
  max-width: 60ch;
  margin: 0 auto;
  color: var(--sn-tinta-suave);
}
.ma-claim {
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  color: var(--sn-burdeos);
  margin: 16px 0 0;
}
.ma-h2 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h2);
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 16px;
}
.ma-parrafo {
  font-size: var(--sn-t-cuerpo);
  line-height: 1.6;
  color: var(--sn-tinta-suave);
  margin: 0;
}

/* Catálogo */
.ma-catalogo {
  padding-bottom: var(--sn-seccion);
}
.ma-rejilla {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  gap: 24px;
}
.ma-tarjeta {
  display: flex;
  flex-direction: column;
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  overflow: hidden;
  box-shadow: var(--sn-sombra);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.ma-tarjeta:hover {
  transform: translateY(-3px);
  box-shadow: var(--sn-sombra-alta);
}
.ma-tarjeta__portada {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--sn-burdeos-tenue);
}
.ma-tarjeta__portada img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ma-precio {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: var(--sn-r-boton);
  background: var(--sn-burdeos);
  color: #fff;
  font-family: var(--sn-fuente-titulos);
  font-weight: 700;
  box-shadow: var(--sn-sombra);
}
.ma-precio--gratis {
  background: var(--sn-oliva);
}
.ma-tarjeta__cuerpo {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 18px 20px 20px;
}
.ma-tarjeta__titulo {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h4);
  font-weight: 700;
  line-height: 1.25;
  margin: 0 0 8px;
}
.ma-tarjeta__texto {
  color: var(--sn-tinta-suave);
  line-height: 1.5;
  margin: 0 0 14px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ma-tarjeta__ir {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: auto;
  font-weight: 700;
  color: var(--sn-burdeos);
}
.ma-vacio {
  text-align: center;
  padding: 40px 16px;
  border: 1px dashed var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  color: var(--sn-tinta-suave);
}

/* Qué hay en cada cuaderno */
.ma-seccion {
  padding-block: var(--sn-seccion);
  background: var(--sn-burdeos-tenue);
}
.ma-contenido {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 900px) {
  .ma-contenido {
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    gap: 48px;
  }
}
.ma-checks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 14px;
}
.ma-checks li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  line-height: 1.5;
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  padding: 14px 16px;
}
.ma-checks__icono {
  flex: none;
  font-size: 22px;
  color: var(--sn-burdeos);
  margin-top: 1px;
}
</style>
