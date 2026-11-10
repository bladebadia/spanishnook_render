<template>
  <q-page class="q-pa-lg">
    <div class="pk-cabecera">
      <h1 class="pk-h1">{{ t('comprarPacks.packsCreditos') }}</h1>
      <p class="pk-entrada">{{ t('comprarPacks.compraClases') }}</p>
    </div>

    <div class="row justify-center q-mb-lg">
      <q-tabs
        v-model="tab"
        dense
        align="justify"
        narrow-indicator
        indicator-color="transparent"
        class="text-grey-8"
      >
        <q-tab
          name="normal"
          :label="t('comprarPacks.clasesGenerales')"
          icon="school"
          :class="tab === 'normal' ? 'sn-sello-general sn-sello-texto' : ''"
        />
        <q-tab
          name="conversacion"
          :label="t('comprarPacks.clasesConversacion')"
          icon="forum"
          :class="tab === 'conversacion' ? 'sn-sello-conversacion sn-sello-texto' : ''"
        />
      </q-tabs>
    </div>

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <q-tab-panel name="normal">
        <div class="row q-col-gutter-lg justify-center">
          <div class="col-12 col-md-4" v-for="pack in packsNormales" :key="pack.id">
            <q-card class="card-pack column">
              <div
                class="pack-header sn-sello-general sn-sello-banda q-pa-md text-center"
              >
                <div class="text-h5 text-weight-bold">{{ pack.nombre }}</div>
                <div class="text-subtitle2">{{ pack.creditosTexto }}</div>
              </div>

              <q-card-section
                class="col q-pa-lg text-center column justify-center relative-position"
              >
                <span v-if="pack.ahorro" class="cp-ahorro">{{ pack.ahorro }}</span>

                <div
                  v-if="pack.precioOriginal"
                  class="text-grey-5 text-strike q-mt-md"
                  style="font-size: 1.2rem"
                >
                  {{ pack.precioOriginal }}€
                </div>

                <div class="text-h3 text-weight-bolder q-mb-sm sn-sello-general sn-sello-texto">
                  {{ pack.precio }}€
                </div>

                <div class="text-caption q-mb-md text-weight-bold sale-text">
                  {{ pack.saleATexto }}
                </div>

                <div class="text-caption q-mb-md text-weight-bold">
                  {{ pack.descripcion }}
                </div>
              </q-card-section>

              <q-card-section>
                <q-btn
                  :label="t('comprarPacks.comprar')"
                  class="full-width"
                  size="lg"
                  :loading="loading === pack.id"
                  @click="comprarPack(pack)"
                  icon="shopping_cart"
                  no-wrap
                  unelevated
                  color="primary"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="conversacion">
        <div class="row q-col-gutter-lg justify-center">
          <div class="col-12 col-md-4" v-for="pack in packsConversacion" :key="pack.id">
            <q-card class="card-pack column">
              <div
                class="pack-header sn-sello-conversacion sn-sello-banda q-pa-md text-center"
              >
                <div class="text-h5 text-weight-bold">{{ pack.nombre }}</div>
                <div class="text-subtitle2">{{ pack.creditosTexto }}</div>
              </div>

              <q-card-section
                class="col q-pa-lg text-center column justify-center relative-position"
              >
                <span v-if="pack.ahorro" class="cp-ahorro">{{ pack.ahorro }}</span>

                <div
                  v-if="pack.precioOriginal"
                  class="text-grey-5 text-strike q-mt-md"
                  style="font-size: 1.2rem"
                >
                  {{ pack.precioOriginal }}€
                </div>

                <div class="text-h3 text-weight-bolder q-mb-sm sn-sello-conversacion sn-sello-texto">
                  {{ pack.precio }}€
                </div>

                <div class="text-caption q-mb-md text-weight-bold sale-text">
                  {{ pack.saleATexto }}
                </div>

                <div class="text-caption q-mb-md text-weight-bold">
                  {{ pack.descripcion }}
                </div>
              </q-card-section>

              <q-card-section>
                <q-btn
                  :label="t('comprarPacks.comprar')"
                  class="full-width"
                  size="lg"
                  :loading="loading === pack.id"
                  @click="comprarPack(pack)"
                  icon="shopping_cart"
                  no-wrap
                  unelevated
                  color="primary"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Cómo funcionan los packs -->
    <section class="pk-pasos">
      <h2 class="pk-h2">{{ t('PacksPagina.comoFuncionan') }}</h2>
      <ol class="pk-pasos__lista">
        <li v-for="(paso, i) in pasosPacks" :key="i" class="pk-paso">
          <span class="pk-paso__num">{{ i + 1 }}</span>
          <q-icon :name="paso.icono" class="pk-paso__icono" />
          <p class="pk-paso__texto">{{ paso.texto }}</p>
        </li>
      </ol>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { supabase } from 'src/supabaseClient';
import { useAuth } from 'src/stores/auth';
import { useQuasar, useMeta } from 'quasar';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { user } = useAuth();
const $q = useQuasar();

const pasosPacks = computed(() => [
  { icono: 'shopping_bag', texto: t('PacksPagina.paso1') },
  { icono: 'account_balance_wallet', texto: t('PacksPagina.paso2') },
  { icono: 'event_available', texto: t('PacksPagina.paso3') },
]);

useMeta(() => ({
  title: 'Comprar Packs de Clases | SpanishNook',
  meta: {
    description: {
      name: 'description',
      content:
        'Compra packs de clases de español online con créditos. Ahorra en clases particulares y de conversación con profesores nativos en SpanishNook.',
    },
    keywords: {
      name: 'keywords',
      content:
        'comprar clases español, packs de clases español, créditos clases español, bonos clases conversación, precios clases español, SpanishNook',
    },
    ogTitle: {
      property: 'og:title',
      content: 'Comprar Packs de Clases | SpanishNook',
    },
    ogDescription: {
      property: 'og:description',
      content:
        'Compra packs de clases de español online y ahorra en tus clases particulares y de conversación.',
    },
    ogImage: {
      property: 'og:image',
      content: 'https://www.spanishnook.com/img/Logo_rectangular_320.png',
    },
    ogUrl: {
      property: 'og:url',
      content: 'https://www.spanishnook.com/ComprarPacks',
    },
    robots: {
      name: 'robots',
      content: 'index,follow',
    },
  },
}));

const tab = ref('normal');
const loading = ref<string | null>(null);

interface PackCreditos {
  id: string;
  nombre: string;
  creditos: number;
  creditosTexto: string;
  precio: number;
  precioOriginal?: number;
  descripcion: string;
  ahorro?: string;
  saleATexto: string;
  tipo: 'normal' | 'conversacion';
}

const packsNormales = computed<PackCreditos[]>(() => [
  {
    id: 'price_1T5z33PqNYrMmXl35sDcDBn1',
    nombre: t('comprarPacks.pack5Gen'),
    creditos: 5,
    creditosTexto: t('comprarPacks.creditos1'),
    precio: 148,
    precioOriginal: 160,
    descripcion: t('comprarPacks.idealGen'),
    ahorro: t('comprarPacks.ahorras1gen'),
    saleATexto: t('comprarPacks.saleA1'),
    tipo: 'normal',
  },
  {
    id: 'price_1T5z2ZPqNYrMmXl3PJsL4MLR',
    nombre: t('comprarPacks.pack10Gen'),
    creditos: 10,
    creditosTexto: t('comprarPacks.creditos2'),
    precio: 272,
    precioOriginal: 320,
    descripcion: t('comprarPacks.ideal2Gen'),
    ahorro: t('comprarPacks.ahorras2gen'),
    saleATexto: t('comprarPacks.saleA2'),
    tipo: 'normal',
  },
]);

const packsConversacion = computed<PackCreditos[]>(() => [
  {
    id: 'price_1T5z23PqNYrMmXl3PVDgH9Nv',
    nombre: t('comprarPacks.pack5Conv'),
    creditos: 5,
    creditosTexto: t('comprarPacks.creditos1'),
    precio: 125,
    precioOriginal: 135,
    descripcion: t('comprarPacks.idealConv'),
    ahorro: t('comprarPacks.ahorras1conv'),
    saleATexto: t('comprarPacks.saleA3'),
    tipo: 'conversacion',
  },
  {
    id: 'price_1T5z1OPqNYrMmXl3fI17X5C8',
    nombre: t('comprarPacks.pack10Conv'),
    creditos: 10,
    creditosTexto: t('comprarPacks.creditos2'),
    precio: 230,
    precioOriginal: 270,
    descripcion: t('comprarPacks.ideal2Conv'),
    ahorro: t('comprarPacks.ahorras2conv'),
    saleATexto: t('comprarPacks.saleA4'),
    tipo: 'conversacion',
  },
]);

const comprarPack = async (pack: PackCreditos) => {
  if (!user.value) {
    $q.notify({ type: 'warning', message: t('comprarPacks.loginRequired') });
    return;
  }

  loading.value = pack.id;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      'https://zleqsdfpjepdangitcxv.supabase.co/functions/v1/create-bono-checkout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          priceId: pack.id,
          userId: user.value.id,
          userEmail: user.value.email,
          packCreditos: pack.creditos,
          packTipo: pack.tipo,
          successUrl: window.location.origin + '/AreaPersonal',
          cancelUrl: window.location.origin + '/ComprarPacks',
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || t('comprarPacks.errorConexion'));
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error: unknown) {
    console.error(error);
    let mensaje = t('errorDesconocido');
    if (error instanceof Error) mensaje = error.message;
    $q.notify({ type: 'negative', message: mensaje });
  } finally {
    loading.value = null;
  }
};
</script>

<style scoped>
/* Ahorro: nota adhesiva discreta, sin el rojo girado */
.cp-ahorro {
  position: absolute;
  top: 14px;
  right: 16px;
  padding: 3px 10px;
  border-radius: var(--sn-r-boton);
  background: var(--sn-nota);
  border: 1px solid var(--sn-nota-borde);
  color: var(--sn-tinta);
  font-size: var(--sn-t-peq);
  font-weight: 800;
}
/* Cabecera y "cómo funcionan" con el sistema de diseño */
.pk-cabecera {
  text-align: center;
  padding-block: clamp(16px, 4vw, 32px) 24px;
}
.pk-h1 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h1);
  font-weight: 700;
  line-height: 1.1;
  color: var(--sn-burdeos);
  margin: 0 0 10px;
}
.pk-entrada {
  font-size: var(--sn-t-entrada);
  color: var(--sn-tinta-suave);
  max-width: 56ch;
  margin: 0 auto;
}
.pk-h2 {
  font-family: var(--sn-fuente-titulos);
  font-size: var(--sn-t-h3);
  font-weight: 700;
  text-align: center;
  margin: 0 0 20px;
}
.pk-pasos {
  max-width: var(--sn-ancho);
  margin: 40px auto 0;
}
.pk-pasos__lista {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 800px) {
  .pk-pasos__lista {
    grid-template-columns: repeat(3, 1fr);
  }
}
.pk-paso {
  position: relative;
  background: var(--sn-hoja);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-r-tarjeta);
  padding: 22px 20px 20px;
  text-align: center;
}
.pk-paso__num {
  position: absolute;
  top: 12px;
  left: 14px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--sn-burdeos);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.pk-paso__icono {
  font-size: 30px;
  color: var(--sn-burdeos);
  margin-bottom: 8px;
}
.pk-paso__texto {
  margin: 0;
  line-height: 1.5;
}

/* El precio es lo primero que se busca: grande y en el color del sello */
.card-pack .text-h3 {
  font-size: clamp(2.25rem, 1.75rem + 2vw, 3rem);
  line-height: 1.1;
}
.card-pack {
  border-radius: 16px;
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  height: 100%;
}
.card-pack:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}
.text-strike {
  text-decoration: line-through;
}

.sale-text {
  font-size: 0.95rem;
}
</style>
