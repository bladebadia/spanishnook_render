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
          { label: `${t('adminMensajes.sinLeer')} (${sinLeer.length})`, value: 'sinLeer' },
          { label: `${t('adminMensajes.todos')} (${mensajes.length})`, value: 'todos' },
        ]"
      />
      <q-btn flat round icon="refresh" :aria-label="t('adminMensajes.recargar')" @click="cargar" />
    </div>

    <p class="adm-explica">{{ t('adminMensajes.explica') }}</p>

    <div v-if="cargando" class="adm-vacio"><q-spinner size="32px" color="primary" /></div>
    <div v-else-if="!visibles.length" class="adm-vacio">
      {{ filtro === 'sinLeer' ? t('adminMensajes.nadaSinLeer') : t('adminMensajes.ninguno') }}
    </div>

    <ul v-else class="adm-lista">
      <li
        v-for="m in visibles"
        :key="m.id"
        class="adm-item"
        :class="{ 'adm-item--nuevo': !m.leido }"
      >
        <div class="adm-item__cab">
          <strong class="adm-item__nombre">{{ m.nombre || t('adminMensajes.sinNombre') }}</strong>
          <a v-if="m.email" class="adm-item__dato adm-item__enlace" :href="`mailto:${m.email}`">
            {{ m.email }}
          </a>
          <span class="adm-item__dato">{{ fecha(m.created_at) }}</span>
          <q-badge v-if="!m.leido" color="primary" :label="t('adminMensajes.nuevo')" />
        </div>
        <p class="adm-item__texto">{{ m.mensaje }}</p>
        <div class="adm-item__acciones">
          <q-btn
            v-if="m.email"
            unelevated
            no-caps
            color="primary"
            icon="reply"
            :label="t('adminMensajes.responder')"
            :href="enlaceRespuesta(m)"
            @click="marcarLeido(m, true, false)"
          />
          <q-btn
            outline
            no-caps
            color="dark"
            :icon="m.leido ? 'mark_email_unread' : 'drafts'"
            :label="m.leido ? t('adminMensajes.marcarNoLeido') : t('adminMensajes.marcarLeido')"
            :loading="ocupado === m.id"
            @click="marcarLeido(m, !m.leido)"
          />
          <q-btn
            flat
            no-caps
            color="negative"
            icon="delete"
            :label="t('adminMensajes.borrar')"
            :disable="ocupado === m.id"
            @click="borrar(m)"
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

interface Mensaje {
  id: number;
  created_at: string;
  nombre: string | null;
  email: string | null;
  mensaje: string | null;
  leido: boolean | null;
}

const emit = defineEmits<{ sinLeer: [n: number] }>();
const $q = useQuasar();
const { t, locale } = useI18n();

const mensajes = ref<Mensaje[]>([]);
const cargando = ref(true);
const ocupado = ref<number | null>(null);
const filtro = ref<'sinLeer' | 'todos'>('sinLeer');

const sinLeer = computed(() => mensajes.value.filter((m) => !m.leido));
const visibles = computed(() => (filtro.value === 'sinLeer' ? sinLeer.value : mensajes.value));

const fecha = (iso: string) =>
  new Date(iso).toLocaleString(locale.value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  });

/** mailto con asunto y el mensaje original citado. */
function enlaceRespuesta(m: Mensaje): string {
  const asunto = t('adminMensajes.asuntoRespuesta');
  const cita = (m.mensaje ?? '')
    .split('\n')
    .map((l) => `> ${l}`)
    .join('\n');
  const cuerpo = `\n\n${t('adminMensajes.escribio', { nombre: m.nombre || '', fecha: fecha(m.created_at) })}\n${cita}`;
  return `mailto:${m.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}

async function cargar() {
  cargando.value = true;
  const { data, error } = await supabase
    .from('mensajes_contacto')
    .select('id, created_at, nombre, email, mensaje, leido')
    .order('created_at', { ascending: false });
  cargando.value = false;
  if (error) {
    $q.notify({ type: 'negative', message: t('adminMensajes.errorCargar') });
    return;
  }
  mensajes.value = (data ?? []) as Mensaje[];
  emit('sinLeer', sinLeer.value.length);
}

async function marcarLeido(m: Mensaje, leido: boolean, avisar = true) {
  if (!!m.leido === leido) return;
  ocupado.value = m.id;
  const { error } = await supabase.from('mensajes_contacto').update({ leido }).eq('id', m.id);
  ocupado.value = null;
  if (error) {
    if (avisar) $q.notify({ type: 'negative', message: t('adminMensajes.errorGuardar') });
    return;
  }
  m.leido = leido;
  emit('sinLeer', sinLeer.value.length);
}

function borrar(m: Mensaje) {
  $q.dialog({
    title: t('adminMensajes.borrarTitulo'),
    message: t('adminMensajes.borrarTexto', { nombre: m.nombre || t('adminMensajes.sinNombre') }),
    cancel: { label: t('adminMensajes.cancelar'), flat: true, noCaps: true },
    ok: { label: t('adminMensajes.borrar'), color: 'negative', unelevated: true, noCaps: true },
    persistent: true,
  }).onOk(() => {
    void (async () => {
      ocupado.value = m.id;
      const { error } = await supabase.from('mensajes_contacto').delete().eq('id', m.id);
      ocupado.value = null;
      if (error) {
        $q.notify({ type: 'negative', message: t('adminMensajes.errorGuardar') });
        return;
      }
      mensajes.value = mensajes.value.filter((x) => x.id !== m.id);
      emit('sinLeer', sinLeer.value.length);
    })();
  });
}

onMounted(cargar);
</script>

<style scoped src="./admin-listas.css"></style>
