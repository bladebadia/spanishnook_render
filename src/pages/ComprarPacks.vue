<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="text-center q-mb-xl">
      <h4 class="text-weight-bold q-mb-sm">
        {{ t('comprarPacks.packsCreditos') }}
      </h4>
      <p class="text-subtitle1">
        {{ t('comprarPacks.compraClases') }}
      </p>
    </div>

    <div class="row justify-center q-mb-lg">
      <q-tabs
        v-model="tab"
        dense
        align="justify"
        narrow-indicator
        indicator-color="transparent"
        class="text-grey-5"
      >
        <q-tab
          name="normal"
          :label="t('comprarPacks.clasesGenerales')"
          icon="school"
          :style="tab === 'normal' ? 'color: #469fcf; font-weight: 900' : ''"
        />
        <q-tab
          name="conversacion"
          :label="t('comprarPacks.clasesConversacion')"
          icon="forum"
          :style="tab === 'conversacion' ? 'color: #a479bcff; font-weight: 900' : ''"
        />
      </q-tabs>
    </div>

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <q-tab-panel name="normal">
        <div class="row q-col-gutter-lg justify-center">
          <div class="col-12 col-md-4" v-for="pack in packsNormales" :key="pack.id">
            <q-card class="card-pack column">
              <div
                class="pack-header text-white q-pa-md text-center"
                style="background-color: #60aad8"
              >
                <div class="text-h5 text-weight-bold">{{ pack.nombre }}</div>
                <div class="text-subtitle2">{{ pack.creditosTexto }}</div>
              </div>

              <q-card-section
                class="col q-pa-lg text-center column justify-center relative-position"
              >
                <q-badge
                  v-if="pack.ahorro"
                  color="red"
                  floating
                  rounded
                  style="
                    top: 10px;
                    right: 10px;
                    font-size: 0.8rem;
                    font-weight: bold;
                    transform: rotate(5deg);
                  "
                >
                  {{ pack.ahorro }}
                </q-badge>

                <div
                  v-if="pack.precioOriginal"
                  class="text-grey-5 text-strike q-mt-md"
                  style="font-size: 1.2rem"
                >
                  {{ pack.precioOriginal }}€
                </div>

                <div class="text-h3 text-weight-bolder q-mb-sm" style="color: #469fcf">
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
                  class="full-width shadow-2"
                  size="lg"
                  :loading="loading === pack.id"
                  @click="comprarPack(pack)"
                  icon="shopping_cart"
                  unelevated
                  text-color="white"
                  style="background-color: #60aad8"
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
                class="pack-header text-white q-pa-md text-center"
                style="background-color: #b897cbff"
              >
                <div class="text-h5 text-weight-bold">{{ pack.nombre }}</div>
                <div class="text-subtitle2">{{ pack.creditosTexto }}</div>
              </div>

              <q-card-section
                class="col q-pa-lg text-center column justify-center relative-position"
              >
                <q-badge
                  v-if="pack.ahorro"
                  color="red"
                  floating
                  rounded
                  style="
                    top: 10px;
                    right: 10px;
                    font-size: 0.8rem;
                    font-weight: bold;
                    transform: rotate(5deg);
                  "
                >
                  {{ pack.ahorro }}
                </q-badge>

                <div
                  v-if="pack.precioOriginal"
                  class="text-grey-5 text-strike q-mt-md"
                  style="font-size: 1.2rem"
                >
                  {{ pack.precioOriginal }}€
                </div>

                <div class="text-h3 text-weight-bolder q-mb-sm" style="color: #a479bcff">
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
                  class="full-width shadow-2"
                  size="lg"
                  :loading="loading === pack.id"
                  @click="comprarPack(pack)"
                  icon="shopping_cart"
                  unelevated
                  text-color="white"
                  style="background-color: #b897cbff"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { supabase } from 'src/supabaseClient';
import { useAuth } from 'src/stores/auth';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { user } = useAuth();
const $q = useQuasar();

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

    if (!response.ok) throw new Error(data.error || 'Error de conexión');
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error: unknown) {
    console.error(error);
    let mensaje = 'Error desconocido';
    if (error instanceof Error) mensaje = error.message;
    $q.notify({ type: 'negative', message: mensaje });
  } finally {
    loading.value = null;
  }
};
</script>

<style scoped>
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
