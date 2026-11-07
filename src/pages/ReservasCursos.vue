<template>
  <q-page class="q-pa-lg reservas-page">
    <div v-if="cargando" class="flex flex-center q-my-xl">
      <q-spinner size="48px" color="primary" />
    </div>

    <div v-else-if="!curso">
      <q-card flat bordered class="q-pa-xl text-center">
        <q-icon name="error_outline" size="64px" color="grey-5" />
        <div class="text-h6 q-mt-md">{{ t('reservasCursos.cursoNo') }}</div>
        <q-btn
          color="primary"
          class="q-mt-md"
          :to="rutaClases"
          :label="t('reservasCursos.volverCursos')"
        />
      </q-card>
    </div>

    <div v-else class="row q-col-gutter-lg">
      <div v-if="pagoOk" class="col-12">
        <q-banner class="bg-green-1 text-green-9 rounded-borders" role="status">
          <template v-slot:avatar><q-icon name="check_circle" color="positive" /></template>
          {{ t('reservasCursos.pagoRecibido') }}
          <div v-if="pagoPendiente" class="text-caption q-mt-xs">
            {{ t('reservasCursos.pagoProcesando') }}
          </div>
        </q-banner>
      </div>

      <div class="col-12 col-md-7">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h5 text-weight-bold" style="color: #851319">
              {{ curso.nombre_curso }}
            </div>
            <div class="text-subtitle2 text-grey-7 q-mt-xs row items-center no-wrap">
              {{ t('reservasCursos.estado') }}
              <q-chip size="md" :color="colorEstado" text-color="white" dense>
                {{ textoEstado }}
              </q-chip>
              <span class="text-caption text-grey-8 q-ml-auto">
                <q-icon name="group" class="q-mr-xs" />
                {{ t('reservasCursos.plazas') }}
                <strong>{{ ocupacionActual }} / {{ curso.max_estudiantes || '∞' }}</strong>
              </span>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-body2 q-mb-sm">
              {{ t('reservasCursos.sinDescripcion') }}
            </div>

            <div v-if="esCerrado" class="sn-nota q-pa-md q-mt-md">
              <div class="text-subtitle2 text-weight-bold text-primary">
                <q-icon name="event_available" class="q-mr-xs" />
                {{ t('reservasCursos.fechasCerradas') }}
              </div>
              <div class="text-body2 q-mt-xs">
                {{ fechasTexto }}
              </div>
              <div class="text-caption text-grey-8 q-mt-xs">
                <span v-if="sesionesCurso.length > 0">
                  {{ t('reservasCursos.numSesiones', sesionesCurso.length) }} ·
                </span>
                {{ t('reservasCursos.duracionSesion', { min: duracionCurso }) }}
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col-12 col-md-6">
                <q-list dense bordered class="rounded-borders full-height">
                  <q-item-label header>{{ t('reservasCursos.dias') }}</q-item-label>
                  <q-item v-for="d in curso.dias_semana" :key="d">
                    <q-item-section avatar><q-icon name="event" color="primary" /></q-item-section>
                    <q-item-section>{{ traducirDia(d) }}</q-item-section>
                  </q-item>
                </q-list>
              </div>

              <div class="col-12 col-md-6">
                <q-list dense bordered class="rounded-borders full-height">
                  <q-item-label header>
                    {{ t('reservasCursos.horario') }} <strong>{{ zonaHorariaUsuario }}</strong>
                  </q-item-label>

                  <template v-if="curso.horarios_curso && curso.horarios_curso.length > 0">
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="schedule" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <div class="text-weight-bold">
                          {{ convertirHorarioLocal(curso.horarios_curso[0]) }}
                        </div>
                        <div class="text-caption text-grey">
                          ({{ t('reservasCursos.horaMadrid') }}: {{ curso.horarios_curso[0] }})
                        </div>
                      </q-item-section>
                    </q-item>
                  </template>

                  <q-item v-else>
                    <q-item-section avatar><q-icon name="schedule" color="grey" /></q-item-section>
                    <q-item-section class="text-grey">{{
                      t('reservasCursos.porDefinir')
                    }}</q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h6 text-weight-bold" style="color: #851319">
              {{ esCursoActivo ? t('reservasCursos.inscripcion') : t('reservasCursos.reservaTu') }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="text-center">
            <div v-if="esCerrado && estaInscrito">
              <div class="text-h5 text-positive q-my-md text-weight-bold">
                {{ t('reservasCursos.yaInscrito') }}
              </div>
              <q-banner dense class="bg-green-1 text-green-9 q-pa-md rounded-borders q-mb-md">
                <template v-slot:avatar><q-icon name="check_circle" color="positive" /></template>
                {{ t('reservasCursos.yaInscritoTexto') }}
              </q-banner>
              <q-btn
                color="primary"
                :label="t('reservasCursos.irArea')"
                to="/AreaPersonal"
                class="full-width oval-btn"
                icon="account_circle"
                unelevated
              />
            </div>

            <div v-else-if="esCerrado && cursoTerminado">
              <q-icon name="event_busy" size="48px" color="grey-6" class="q-my-sm" />
              <div class="text-body1 text-grey-8 q-mb-md">
                {{ t('reservasCursos.cursoTerminado') }}
              </div>
              <q-btn
                outline
                color="primary"
                class="oval-btn"
                :to="rutaClases"
                :label="t('reservasCursos.volverCursos')"
              />
            </div>

            <div v-else-if="esCerrado && esCursoActivo && !cursoLleno">
              <div class="text-caption text-grey-8 q-mt-sm">
                {{ t('reservasCursos.precioTotal') }}
              </div>
              <div class="text-h4 text-weight-bold text-primary q-mb-xs">
                {{ precioTotalTexto }}
              </div>
              <div class="text-caption text-grey-8">{{ t('reservasCursos.pagoUnico') }}</div>
              <div class="text-body2 q-mt-md">
                <q-icon name="event" color="primary" class="q-mr-xs" />
                {{ fechasTexto }}
              </div>
              <div v-if="plazasLibres !== null" class="text-body2 text-weight-medium q-mt-xs">
                <q-icon name="group" color="primary" class="q-mr-xs" />
                {{ t('reservasCursos.plazasLibres', plazasLibres) }}
              </div>

              <q-btn
                color="primary"
                size="lg"
                icon="credit_card"
                no-wrap
                class="oval-btn q-mt-lg"
                unelevated
                :label="
                  autenticado
                    ? t('reservasCursos.inscribirme')
                    : t('reservasCursos.iniciarSesionInscribirte')
                "
                :loading="procesandoInscripcion"
                @click="inscribirse"
              />
              <div class="text-caption q-mt-sm text-grey">{{ t('reservasCursos.pago') }}</div>
            </div>

            <div v-else-if="estaSuscrito">
              <div class="text-h5 text-positive q-my-md text-weight-bold">
                {{ t('reservasCursos.yaEres') }}
              </div>
              <q-banner dense class="bg-green-1 text-green-9 q-pa-md rounded-borders q-mb-md">
                <template v-slot:avatar><q-icon name="check_circle" color="positive" /></template>
                {{ t('reservasCursos.ahoraTienes') }}
              </q-banner>
              <q-btn
                color="primary"
                :label="t('reservasCursos.irArea')"
                to="/AreaPersonal"
                class="full-width"
                icon="account_circle"
              />
            </div>

            <div v-else-if="esCursoActivo && !cursoLleno">
              <div class="text-h4 text-weight-bold q-my-md" style="color: #851319">
                {{ curso.precio_curso
                }}<span class="text-caption">{{ t('reservasCursos.mes') }}</span>
              </div>

              <div v-if="autenticado">
                <q-btn
                  color="primary"
                  size="lg"
                  icon="credit_card"
                  :label="t('reservasCursos.suscribirte')"
                  :loading="procesando"
                  @click="iniciarSuscripcion"
                  class="q-px-xl"
                />
                <div class="text-caption q-mt-sm text-grey">{{ t('reservasCursos.pago') }}</div>
              </div>
              <div v-else>
                <q-btn
                  outline
                  color="primary"
                  class="full-width"
                  :to="rutaLogin"
                  :label="t('reservasCursos.iniciarSesion')"
                />
              </div>
            </div>

            <div v-else>
              <div
                v-if="cursoLleno && esCursoActivo"
                class="text-body2 text-negative q-mb-md text-weight-bold"
              >
                ⚠️ {{ t('reservasCursos.cursoCompleto') }}
              </div>
              <div v-else class="text-body2 text-grey-8 q-mb-md">
                {{ t('reservasCursos.elCurso') }}
              </div>

              <div v-if="autenticado">
                <div v-if="!yaEnListaEspera">
                  <p>{{ t('reservasCursos.apuntate') }}</p>
                  <q-btn
                    color="primary"
                    icon="event_available"
                    :disable="!aceptaCondiciones"
                    :loading="reservando"
                    :label="t('reservasCursos.unirme')"
                    @click="confirmarReservaAutenticado"
                    class="q-px-xl q-mb-md"
                  />
                  <br />
                  <q-checkbox
                    v-model="aceptaCondiciones"
                    :label="t('reservasCursos.acepto')"
                    dense
                    size="sm"
                  />
                </div>
                <q-banner v-else dense class="bg-orange-1 text-orange-9 q-mt-md rounded-borders">
                  <template v-slot:avatar><q-icon name="watch_later" /></template>
                  {{ t('reservasCursos.yaEstas') }}
                </q-banner>
              </div>

              <div v-else>
                <div v-if="!yaEnListaEspera" class="full-width">
                  <q-input
                    v-model="formGuest.nombre"
                    :label="t('reservasCursos.tuNombre')"
                    dense
                    filled
                    class="q-mb-sm"
                  />
                  <q-input
                    v-model="formGuest.email"
                    :label="t('reservasCursos.tuEmail')"
                    dense
                    filled
                    class="q-mb-sm"
                  />
                  <q-btn
                    color="primary"
                    :disable="!formGuestValido || reservando"
                    :loading="reservando"
                    :label="t('reservasCursos.avisadme')"
                    @click="confirmarReservaGuest"
                    class="q-mt-sm full-width"
                  />
                  <q-checkbox
                    v-model="aceptaCondicionesGuest"
                    :label="t('reservasCursos.aceptarTerminos')"
                    class="q-mt-md"
                    dense
                    size="sm"
                  />
                </div>
                <q-banner v-else dense class="bg-orange-1 text-orange-9 q-mt-sm">
                  {{ t('reservasCursos.tuEmailYa') }}
                </q-banner>
                <q-btn
                  flat
                  color="primary"
                  class="q-mt-md"
                  :label="t('reservasCursos.iniciar')"
                  :to="rutaLogin"
                  size="sm"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="dialogConfirm" persistent>
      <q-card>
        <q-card-section>{{ t('reservasCursos.unirse') }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('reservasCursos.no')" v-close-popup />
          <q-btn color="primary" :label="t('reservasCursos.si')" @click="reservarAutenticado" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogGuestConfirm" persistent>
      <q-card>
        <q-card-section>{{
          t('reservasCursos.confirmarEmail', { email: formGuest.email })
        }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('reservasCursos.no')" v-close-popup />
          <q-btn color="primary" :label="t('reservasCursos.si')" @click="reservarGuest" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar, useMeta } from 'quasar';
import { supabase } from 'src/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useSuscripciones } from 'src/composables/useSuscripciones';
import { useI18n } from 'vue-i18n';
import {
  fechasDelCurso,
  formatFechaCalendario,
  hoyMadridISO,
  proximaFechaDiaSemana,
  rangoHoraLocal,
  zonaUsuario,
} from 'src/utils/zonaHoraria';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const { procesando, handleSubscribe } = useSuscripciones();
const { locale, t } = useI18n();

useMeta(() => ({
  title: 'Cursos Grupales de Español | SpanishNook',
  meta: {
    description: {
      name: 'description',
      content:
        'Reserva cursos grupales de español online en grupos reducidos de máximo 6 personas. Aprende con profesores nativos en SpanishNook.',
    },
    keywords: {
      name: 'keywords',
      content:
        'cursos grupales español online, clases en grupo español, grupos reducidos español, curso español A1 A2 B1 B2 C1, SpanishNook',
    },
    ogTitle: {
      property: 'og:title',
      content: 'Cursos Grupales de Español | SpanishNook',
    },
    ogDescription: {
      property: 'og:description',
      content:
        'Cursos grupales de español online en grupos reducidos de máximo 6 personas con profesores nativos.',
    },
    ogImage: {
      property: 'og:image',
      content: 'https://www.spanishnook.com/img/Logo_rectangular_320.png',
    },
    ogUrl: {
      property: 'og:url',
      content: 'https://www.spanishnook.com/ReservasCursos',
    },
    robots: {
      name: 'robots',
      content: 'index,follow',
    },
  },
}));

// Se rellena en cliente: en el servidor (UTC) provocaba un desajuste al hidratar
const zonaHorariaUsuario = ref('');

interface Curso {
  id: number;
  nombre_curso: string;
  estado_curso: string;
  max_estudiantes?: number;
  dias_semana: string[];
  horarios_curso: string[];
  lista_espera: (string | number)[];
  stripe_price_id?: string;
  precio_curso?: string | number;
  tipo_curso?: 'suscripcion' | 'cerrado';
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  precio_total_centimos?: number | null;
  duracion_minutos?: number | null;
}

const curso = ref<Curso | null>(null);
const cargando = ref(true);
const reservando = ref(false);
const user = ref<User | null>(null);
const ocupacionActual = ref(0);

const autenticado = computed(() => !!user.value);
const rutaClases = '/NuestrasClases';
const rutaLogin = '/Acceder';
const esCursoActivo = computed(() => curso.value?.estado_curso === 'Activo');

// --- CURSO DE FECHAS CERRADAS (pago único) ---
const esCerrado = computed(() => curso.value?.tipo_curso === 'cerrado');
const duracionCurso = computed(() => curso.value?.duracion_minutos || 90);
const cursoTerminado = computed(
  () => esCerrado.value && !!curso.value?.fecha_fin && curso.value.fecha_fin < hoyMadridISO(),
);
const sesionesCurso = computed(() =>
  esCerrado.value
    ? fechasDelCurso(
        curso.value?.fecha_inicio ?? '',
        curso.value?.fecha_fin ?? '',
        curso.value?.dias_semana ?? [],
      )
    : [],
);
const fechaInicioTexto = computed(() =>
  curso.value?.fecha_inicio ? formatFechaCalendario(curso.value.fecha_inicio, locale.value) : '',
);
const fechaFinTexto = computed(() =>
  curso.value?.fecha_fin ? formatFechaCalendario(curso.value.fecha_fin, locale.value) : '',
);
const fechasTexto = computed(() =>
  t('reservasCursos.desdeHasta', { inicio: fechaInicioTexto.value, fin: fechaFinTexto.value }),
);
const precioTotalTexto = computed(() => {
  const centimos = curso.value?.precio_total_centimos;
  if (centimos == null) return '';
  return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'EUR' }).format(
    centimos / 100,
  );
});
const plazasLibres = computed<number | null>(() => {
  const max = curso.value?.max_estudiantes;
  if (!max) return null;
  return Math.max(max - ocupacionActual.value, 0);
});

const estaInscrito = ref(false);
const procesandoInscripcion = ref(false);
const pagoOk = computed(() => route.query.pago === 'ok');
const pagoPendiente = ref(false);

const cursoLleno = computed(() => {
  if (!curso.value) return false;
  const max = curso.value.max_estudiantes || 100;
  return ocupacionActual.value >= max;
});

const colorEstado = computed(() => {
  if (cursoTerminado.value) return 'grey-7';
  if (cursoLleno.value && esCursoActivo.value) return 'red';

  switch (curso.value?.estado_curso) {
    case 'Activo':
      return 'positive';
    case 'Completo':
      return 'red';
    case 'Lista de espera':
      return 'grey-7';
    default:
      return 'orange';
  }
});
// AÑADE ESTO:
const textoEstado = computed(() => {
  if (cursoTerminado.value) return t('reservasCursos.finalizado');
  // Si está activo pero se llenó, lo marcamos como Completo
  if (cursoLleno.value && esCursoActivo.value) return t('reservasCursos.completo');

  switch (curso.value?.estado_curso) {
    case 'Activo':
      return t('reservasCursos.activo');
    case 'Completo':
      return t('reservasCursos.completo');
    case 'Lista de espera':
      return t('reservasCursos.espera');
    default:
      return curso.value?.estado_curso || t('reservasCursos.activo');
  }
});

const aceptaCondiciones = ref(false);
const aceptaCondicionesGuest = ref(false);
const dialogConfirm = ref(false);
const dialogGuestConfirm = ref(false);
const formGuest = ref({ nombre: '', email: '' });
const estaSuscrito = ref(false);
const formGuestValido = computed(
  () => !!formGuest.value.nombre && !!formGuest.value.email && aceptaCondicionesGuest.value,
);

const yaEnListaEspera = computed(() => {
  if (!curso.value) return false;
  const valor = user.value ? user.value.id : formGuest.value.email || '';
  return (curso.value.lista_espera || []).includes(valor);
});

// --- TRADUCCIÓN DÍAS ---
const diasSemanaMap: Record<string, Record<string, string>> = {
  lunes: { 'es-ES': 'Lunes', 'en-US': 'Monday' },
  martes: { 'es-ES': 'Martes', 'en-US': 'Tuesday' },
  miercoles: { 'es-ES': 'Miércoles', 'en-US': 'Wednesday' },
  miércoles: { 'es-ES': 'Miércoles', 'en-US': 'Wednesday' },
  jueves: { 'es-ES': 'Jueves', 'en-US': 'Thursday' },
  viernes: { 'es-ES': 'Viernes', 'en-US': 'Friday' },
  sabado: { 'es-ES': 'Sábado', 'en-US': 'Saturday' },
  sábado: { 'es-ES': 'Sábado', 'en-US': 'Saturday' },
  domingo: { 'es-ES': 'Domingo', 'en-US': 'Sunday' },
};

const traducirDia = (dia: string) => {
  if (!dia) return '';
  const key = dia.toLowerCase();
  const traducciones = diasSemanaMap[key];
  return traducciones?.[locale.value] ?? traducciones?.['es-ES'] ?? dia;
};

// --- FUNCIÓN DE HORA CORREGIDA (SOLUCIONADO EL ERROR TS) ---
// Ahora acepta 'string | undefined' explícitamente.
const convertirHorarioLocal = (horaMadridStr: string | undefined) => {
  if (!horaMadridStr) return '...';
  // Se usa la próxima fecha real del curso para aplicar el horario de verano correcto
  // En los cursos cerrados, la primera sesión del curso
  const fechaRef =
    sesionesCurso.value[0] ??
    proximaFechaDiaSemana(curso.value?.dias_semana?.[0] ?? '') ??
    hoyMadridISO();
  return rangoHoraLocal(fechaRef, horaMadridStr, duracionCurso.value);
};

// --- CARGAS DE DATOS ---
const cargarUsuario = async () => {
  const { data } = await supabase.auth.getUser();
  user.value = data.user;
};

const cargarCurso = async () => {
  cargando.value = true;
  try {
    const idNum = Number(route.params.id || route.query.id);
    if (isNaN(idNum)) throw new Error('ID no válido');

    const { data, error } = await supabase
      .from('cursos_grupales')
      .select('*')
      .eq('id', idNum)
      .maybeSingle();
    if (error) throw error;

    if (data) {
      curso.value = {
        ...data,
        dias_semana: Array.isArray(data.dias_semana) ? data.dias_semana : [],
        horarios_curso: Array.isArray(data.horarios_curso) ? data.horarios_curso : [],
        lista_espera: Array.isArray(data.lista_espera) ? data.lista_espera : [],
      };
      const { data: countData } = await supabase.rpc('get_curso_ocupacion', {
        curso_id_param: idNum,
      });
      ocupacionActual.value = countData || 0;
    }
  } catch {
    curso.value = null;
  } finally {
    cargando.value = false;
  }
};

const iniciarSuscripcion = async () => {
  if (!curso.value?.stripe_price_id)
    return $q.notify({ type: 'negative', message: t('reservasCursos.errorConfiguracion') });

  if (ocupacionActual.value >= (curso.value.max_estudiantes || 100)) {
    return $q.notify({ type: 'negative', message: t('reservasCursos.plazasAgotadas') });
  }
  await handleSubscribe(curso.value.stripe_price_id, curso.value.id.toString());
};

const comprobarSuscripcion = async () => {
  if (!user.value || !curso.value?.id) return;
  const { data } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', user.value.id)
    .eq('course_id', curso.value.id)
    .in('estado', ['active', 'trialing'])
    .maybeSingle();
  if (data) estaSuscrito.value = true;
};

// --- INSCRIPCIÓN A CURSO CERRADO ---
const comprobarInscripcion = async (): Promise<boolean> => {
  if (!user.value || !curso.value?.id) return false;
  const { data } = await supabase
    .from('inscripciones_curso')
    .select('id')
    .eq('user_id', user.value.id)
    .eq('curso_id', curso.value.id)
    .eq('estado', 'pagada')
    .limit(1)
    .maybeSingle();
  estaInscrito.value = !!data;
  return estaInscrito.value;
};

// Al volver de Stripe el webhook puede tardar unos segundos en crear la inscripción
const esperarInscripcion = async (intentos = 5, esperaMs = 2000) => {
  for (let i = 0; i < intentos; i++) {
    if (await comprobarInscripcion()) {
      pagoPendiente.value = false;
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, esperaMs));
  }
  pagoPendiente.value = !(await comprobarInscripcion());
};

const irALogin = () =>
  router.push({ path: rutaLogin, query: { redirect: route.fullPath } });

const estadoHttp = (err: unknown): number | undefined => {
  const contexto = (err as { context?: unknown } | null)?.context;
  return typeof Response !== 'undefined' && contexto instanceof Response
    ? contexto.status
    : undefined;
};

const inscribirse = async () => {
  if (!curso.value) return;
  if (!user.value) {
    await irALogin();
    return;
  }
  procesandoInscripcion.value = true;
  let redirigiendo = false;
  try {
    const { data, error } = await supabase.functions.invoke('checkout-curso', {
      body: {
        cursoId: curso.value.id,
        idioma: locale.value.startsWith('en') ? 'en' : 'es',
      },
    });
    if (error) {
      const estado = estadoHttp(error);
      if (estado === 401) {
        await irALogin();
        return;
      }
      if (estado === 409) {
        if (!(await comprobarInscripcion())) {
          $q.notify({ type: 'negative', message: t('reservasCursos.plazasAgotadas') });
        }
        return;
      }
      throw error;
    }
    const url = (data as { url?: string } | null)?.url;
    if (!url) throw new Error('Sin URL de pago');
    redirigiendo = true;
    window.location.href = url;
  } catch (err: unknown) {
    console.error('Error iniciando el pago del curso:', err);
    $q.notify({ type: 'negative', message: t('reservasCursos.errorCheckout') });
  } finally {
    // Si vamos a Stripe, el botón sigue cargando hasta que cambie la página
    if (!redirigiendo) procesandoInscripcion.value = false;
  }
};

// --- RESERVAS ---
const confirmarReservaGuest = () => {
  if (!formGuestValido.value)
    return $q.notify({ type: 'warning', message: t('reservasCursos.rellenaCampos') });
  dialogGuestConfirm.value = true;
};

const reservarGuest = async () => {
  if (!curso.value || !formGuest.value.email) return;
  dialogGuestConfirm.value = false;
  reservando.value = true;
  try {
    const { error } = await supabase.rpc('add_to_waitlist', {
      p_course_id: curso.value.id,
      p_email_or_id: formGuest.value.email,
    });
    if (error) throw error;
    $q.notify({ type: 'positive', message: t('reservasCursos.añadido') });
    await cargarCurso();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : t('errorDesconocido');
    $q.notify({ type: 'negative', message: t('reservasCursos.errorRegistrar', { mensaje: msg }) });
  } finally {
    reservando.value = false;
  }
};

const confirmarReservaAutenticado = () => {
  if (!aceptaCondiciones.value)
    return $q.notify({ type: 'warning', message: t('reservasCursos.aceptaCondiciones') });
  dialogConfirm.value = true;
};

const reservarAutenticado = async () => {
  if (!curso.value || !user.value) return;
  dialogConfirm.value = false;
  reservando.value = true;
  try {
    const { error } = await supabase.rpc('add_to_waitlist', {
      p_course_id: curso.value.id,
      p_email_or_id: user.value.id,
    });
    if (error) throw error;
    $q.notify({ type: 'positive', message: t('reservasCursos.anadido') });
    await cargarCurso();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : t('errorDesconocido');
    $q.notify({ type: 'negative', message: t('reservasCursos.errorRegistrar', { mensaje: msg }) });
  } finally {
    reservando.value = false;
  }
};

onMounted(async () => {
  zonaHorariaUsuario.value = zonaUsuario();
  await cargarUsuario();
  await cargarCurso();
  if (!autenticado.value) return;
  if (esCerrado.value) {
    if (pagoOk.value) await esperarInscripcion();
    else await comprobarInscripcion();
  } else {
    await comprobarSuscripcion();
  }
});
</script>

<style scoped>
.reservas-page {
  max-width: 1300px;
  margin: 0 auto;
}
</style>
