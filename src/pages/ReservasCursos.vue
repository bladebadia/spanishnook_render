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
      <div class="col-12 col-md-7">
        <q-card class="q-pa-md">
          <q-card-section>
            <div class="text-h5 text-weight-bold" style="color: #851319">
              {{ curso.nombre_curso }}
            </div>
            <div class="text-subtitle2 text-grey-7 q-mt-xs row items-center no-wrap">
              {{ t('reservasCursos.estado') }}
              <q-chip size="md" :color="colorEstado" text-color="white" dense>
                {{ t('reservasCursos.activo') }}
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
                          (Madrid: {{ curso.horarios_curso[0] }})
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
            <div v-if="estaSuscrito">
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
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { supabase } from 'src/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useSuscripciones } from 'src/composables/useSuscripciones';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const route = useRoute();
const { procesando, handleSubscribe } = useSuscripciones();
const { locale, t } = useI18n();

const zonaHorariaUsuario = Intl.DateTimeFormat().resolvedOptions().timeZone;

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

const cursoLleno = computed(() => {
  if (!curso.value) return false;
  const max = curso.value.max_estudiantes || 100;
  return ocupacionActual.value >= max;
});

const colorEstado = computed(() => {
  if (cursoLleno.value && esCursoActivo.value) return 'red';
  switch (curso.value?.estado_curso) {
    case 'Activo':
      return 'positive';
    case 'Completo':
      return 'red';
    default:
      return 'orange';
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

  try {
    const partes = horaMadridStr.split(':');

    if (partes.length < 2) return horaMadridStr;

    const h = Number(partes[0]);
    const m = Number(partes[1]);

    if (isNaN(h) || isNaN(m)) return horaMadridStr;

    // 1. Offset Madrid
    const now = new Date();
    const strEnMadrid = now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' });
    const fechaEnMadrid = new Date(strEnMadrid);

    // 2. Diff
    const diffMs = now.getTime() - fechaEnMadrid.getTime();

    // 3. Base
    const fechaBase = new Date();
    fechaBase.setHours(h, m, 0, 0);

    // 4. Inicio Real
    const fechaLocalInicio = new Date(fechaBase.getTime() + diffMs);

    // 5. Fin (+90min)
    const fechaLocalFin = new Date(fechaLocalInicio.getTime() + 90 * 60000);

    // 6. Formato
    const fmt = (date: Date) =>
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    return `${fmt(fechaLocalInicio)} - ${fmt(fechaLocalFin)}`;
  } catch (e) {
    console.error(e);
    return horaMadridStr;
  }
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
    return $q.notify({ type: 'negative', message: 'Error configuración' });

  if (ocupacionActual.value >= (curso.value.max_estudiantes || 100)) {
    return $q.notify({ type: 'negative', message: '¡Plazas agotadas!' });
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

// --- RESERVAS ---
const confirmarReservaGuest = () => {
  if (!formGuestValido.value) return $q.notify({ type: 'warning', message: 'Rellena los campos' });
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
    $q.notify({ type: 'positive', message: 'Apuntado a la lista de espera.' });
    await cargarCurso();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    $q.notify({ type: 'negative', message: 'Error al registrar: ' + msg });
  } finally {
    reservando.value = false;
  }
};

const confirmarReservaAutenticado = () => {
  if (!aceptaCondiciones.value)
    return $q.notify({ type: 'warning', message: 'Acepta las condiciones' });
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
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    $q.notify({ type: 'negative', message: 'Error al registrar: ' + msg });
  } finally {
    reservando.value = false;
  }
};

onMounted(async () => {
  await cargarUsuario();
  await cargarCurso();
  if (autenticado.value) await comprobarSuscripcion();
});
</script>

<style scoped>
.reservas-page {
  max-width: 1300px;
  margin: 0 auto;
}
</style>
