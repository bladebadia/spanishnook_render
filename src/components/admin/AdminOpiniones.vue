<template>
  <div class="adm">
    <div class="adm-cabecera">
      <q-btn-toggle
        v-model="filtro"
        no-caps
        unelevated
        toggle-color="primary"
        color="white"
        text-color="dark"
        class="adm-filtro"
        :options="[
          {
            label: `${t('adminOpiniones.pendientes')} (${pendientes.length})`,
            value: 'pendientes',
          },
          {
            label: `${t('adminOpiniones.publicadas')} (${publicadas.length})`,
            value: 'publicadas',
          },
        ]"
      />
      <q-btn flat round icon="refresh" :aria-label="t('adminOpiniones.recargar')" @click="cargar" />
    </div>

    <p class="adm-explica">{{ t('adminOpiniones.explica') }}</p>

    <div v-if="cargando" class="adm-vacio"><q-spinner size="32px" color="primary" /></div>
    <div v-else-if="!visibles.length" class="adm-vacio">
      {{
        filtro === 'pendientes'
          ? t('adminOpiniones.sinPendientes')
          : t('adminOpiniones.sinPublicadas')
      }}
    </div>

    <ul v-else class="adm-lista">
      <li v-for="o in visibles" :key="o.id" class="adm-item">
        <div class="adm-item__cab">
          <strong class="adm-item__nombre">{{ o.nombre || t('adminOpiniones.sinNombre') }}</strong>
          <span v-if="o.pais" class="adm-item__dato">{{ o.pais }}</span>
          <span class="adm-item__dato">{{ fecha(o.created_at) }}</span>
          <q-rating
            :model-value="Number(o.rating) || 0"
            readonly
            size="18px"
            color="amber-8"
            icon="star_border"
            icon-selected="star"
            class="adm-item__estrellas"
          />
        </div>
        <p class="adm-item__texto">{{ o.comentario }}</p>
        <div class="adm-item__acciones">
          <q-btn
            v-if="!o.verified"
            unelevated
            no-caps
            color="positive"
            icon="check"
            :label="t('adminOpiniones.publicar')"
            :loading="ocupado === o.id"
            @click="cambiarPublicada(o, true)"
          />
          <q-btn
            v-else
            outline
            no-caps
            color="dark"
            icon="visibility_off"
            :label="t('adminOpiniones.ocultar')"
            :loading="ocupado === o.id"
            @click="cambiarPublicada(o, false)"
          />
          <q-btn
            flat
            no-caps
            color="negative"
            icon="delete"
            :label="t('adminOpiniones.borrar')"
            :disable="ocupado === o.id"
            @click="borrar(o)"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { supabase } from 'src/supabaseClient';

interface Opinion {
  id: number;
  created_at: string;
  nombre: string | null;
  comentario: string | null;
  rating: number | null;
  verified: boolean | null;
  pais: string | null;
}

const emit = defineEmits<{ pendientes: [n: number] }>();
const $q = useQuasar();
const { t, locale } = useI18n();

const opiniones = ref<Opinion[]>([]);
const cargando = ref(true);
const ocupado = ref<number | null>(null);
const filtro = ref<'pendientes' | 'publicadas'>('pendientes');

const pendientes = computed(() => opiniones.value.filter((o) => !o.verified));
const publicadas = computed(() => opiniones.value.filter((o) => o.verified));
const visibles = computed(() =>
  filtro.value === 'pendientes' ? pendientes.value : publicadas.value,
);

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

async function cargar() {
  cargando.value = true;
  const { data, error } = await supabase
    .from('opiniones_verificadas')
    // Sin "email": la columna no es legible para authenticated (20261110150000) y pedirla
    // hace fallar toda la consulta
    .select('id, created_at, nombre, comentario, rating, verified, pais')
    .order('created_at', { ascending: false });
  cargando.value = false;
  if (error) {
    $q.notify({ type: 'negative', message: t('adminOpiniones.errorCargar') });
    return;
  }
  opiniones.value = (data ?? []) as Opinion[];
  emit('pendientes', pendientes.value.length);
}

async function cambiarPublicada(o: Opinion, publicar: boolean) {
  ocupado.value = o.id;
  const { error } = await supabase
    .from('opiniones_verificadas')
    .update({ verified: publicar })
    .eq('id', o.id);
  ocupado.value = null;
  if (error) {
    $q.notify({ type: 'negative', message: t('adminOpiniones.errorGuardar') });
    return;
  }
  o.verified = publicar;
  emit('pendientes', pendientes.value.length);
  $q.notify({
    type: 'positive',
    message: publicar ? t('adminOpiniones.publicada') : t('adminOpiniones.oculta'),
  });
}

function borrar(o: Opinion) {
  $q.dialog({
    title: t('adminOpiniones.borrarTitulo'),
    message: t('adminOpiniones.borrarTexto', { nombre: o.nombre || t('adminOpiniones.sinNombre') }),
    cancel: { label: t('adminOpiniones.cancelar'), flat: true, noCaps: true },
    ok: { label: t('adminOpiniones.borrar'), color: 'negative', unelevated: true, noCaps: true },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      ocupado.value = o.id;
      const { error } = await supabase.from('opiniones_verificadas').delete().eq('id', o.id);
      ocupado.value = null;
      if (error) {
        $q.notify({ type: 'negative', message: t('adminOpiniones.errorGuardar') });
        return;
      }
      opiniones.value = opiniones.value.filter((x) => x.id !== o.id);
      emit('pendientes', pendientes.value.length);
    })();
  });
}

onMounted(cargar);
</script>

<style scoped src="./admin-listas.css"></style>
